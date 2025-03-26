import glob
import os
from pprint import pprint
import time
from flaskwebgui import FlaskUI
from flask import Flask, jsonify, render_template, request
from dal.DALRunner import check_syntax, top_level_variables
from dist_sys.distributed_system import DistributedSystem
import dist_sys.machine as nd
from functools import reduce
from lark import tree

app = Flask(__name__)
ui = FlaskUI(app)

@app.route("/execute_step", methods=["POST"])
def execute_step():
    try:
        data = request.get_json()
        DS = DistributedSystem.from_json(data).next_step
        return jsonify(DS.dict)
    except Exception as e:
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
    filename = os.path.join("static", "example_code", filename)
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
    
    for file in glob.glob(os.path.join("static", "example_code", "*.dal")):
        files.append(os.path.split(file)[1])
        
    print(files)
    return render_template("index.html", files=files)


if __name__ == "__main__":
    app.run(debug=True)
    #FlaskUI(app=app, server="flask",).run()

