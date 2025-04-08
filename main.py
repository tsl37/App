import glob
import os
from pprint import pprint
import sys
import threading
import traceback

from flask import Flask, jsonify, render_template, request
from dal.DALRunner import check_syntax, top_level_variables
from dal.Interpreter import HaltException
from dist_sys.distributed_system import DistributedSystem
import dist_sys.machine as nd
from functools import reduce

import webview

from werkzeug.serving import make_server

distributed_systems = {}

def get_resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

app = Flask(__name__)

@app.route("/execute_step", methods=["POST"])
def execute_step():
    output = {}
    try:
        data = request.get_json()
        ds = None
        step = data["step"]
        if step == 0:
            ds = DistributedSystem.from_json(data)
        else:
            ds = distributed_systems[step-1]
        
        DS = ds.next_step
        distributed_systems[step] = (DS)
        
        return jsonify(DS.dict)

    except HaltException as e:
        return jsonify({"error":"Halt() function called.", "success":True})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e), "success": False})
    
    
    

@app.route("/variable_names", methods=["POST"])
def variable_names():
    data = request.get_json()
    code = data["code"]
    return jsonify(top_level_variables(code))

@app.route("/syntax_check", methods=["POST"])
def syntax_check():
    data = request.get_json()
    code = data["code"]
    try:
        check_syntax(code)
        response = {
            "success": True
        }
    except Exception as e:
     
        response = {
            "success": False,
            "error": str(e)
        }
    
    return jsonify(response)


@app.route("/get_file", methods=["POST"])
def get_file():
    data = request.get_json()
    filename = data["file"]
    filename = get_resource_path(os.path.join("static", "example_code", filename))
    try:
        with open(filename, "r") as file:
            response = {
                "file": file.read()
            }
    except Exception as e:
        response = {
            "error": str(e)
        }
    
    return jsonify(response)


@app.route("/")
def index():
    files = []
    example_code_path = get_resource_path(os.path.join("static", "example_code"))
    
    for file in glob.glob(os.path.join(example_code_path, "*.dal")):
        files.append(os.path.split(file)[1])
        
    return render_template("index.html", files=files)

class ServerThread(threading.Thread):
    def __init__(self, app):
        threading.Thread.__init__(self)
        self.server = make_server('localhost', 5000, app)
        self.ctx = app.app_context()
        self.ctx.push()

    def run(self):
        self.server.serve_forever()

    def shutdown(self):
        self.server.shutdown()

server = None
window = None

def on_closed():
    """Handle window close event"""
    print("Closing application...")
    if server:
        server.shutdown()
    sys.exit(0)

def start_flask(ready_event):
    try:
        global server
        server = ServerThread(app)
        server.start()
        ready_event.set()
    except Exception as e:
        print(f"Backend startup failed: {str(e)}")

if __name__ == "__main__": 
    
    backend_ready = threading.Event()

    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=start_flask, args=(backend_ready,))
    flask_thread.daemon = True
    flask_thread.start()

    # Wait for backend initialization to complete
    print("Waiting for backend setup to complete...")
    backend_ready.wait()
    print("Backend initialized. Starting UI...")
    
    base_path = get_resource_path("")  # Use the same path resolution function
    print(f"Base path: {base_path}")

    # Create a PyWebView window with close handler
    window = webview.create_window(
        "Distibuted System Simulator", 
        "localhost:5000",
        fullscreen=False,
        width=1200,
        height=800,
        resizable=True,
        min_size=(800, 600),
        maximized=True 
    )
    window.events.closed += on_closed
    #webview.start()
    app.run(debug=True, use_reloader=False)  # Start Flask app without reloader


