
from pprint import pprint
import time
from flaskwebgui import FlaskUI
from flask import Flask, jsonify, render_template, request
import Node as nd
from functools import reduce
from Node import trees,parser
from lark import tree

def merge_dictionaries(d1, d2):
    merged_dict = d1.copy()
    merged_dict.update(d2)
    return merged_dict


def create_machines_from_json(json_data):
    machines_dict = {}
    print("data")
    pprint(json_data)

    code = json_data["code"]
    machines_json = json_data["machines"]

    for UID, node_data in machines_json.items():
        UID = int(UID)
        state = node_data.get("state", {})
        neighbors = node_data.get("neighbors", [])
        machine = nd.Node(UID, code)
        machine.memory = state
        machine.incoming_messages = node_data.get("message_stack", [])
        machines_dict[UID] = machine

    for UID, node_data in machines_json.items():
        neighbor_ids = node_data.get("neighbors", [])
        machines_dict[int(UID)].neighbors = [
            machines_dict[int(n_id)] for n_id in neighbor_ids
        ]

    return list(machines_dict.values())

app = Flask(__name__)
ui = FlaskUI(app)

def update_machine_states(machines):
    for machine in machines:
        machine.executeCode()
        machine.clear()

    for machine in machines:
        machine.sendMessages()
    return machines


@app.route("/execute_step", methods=["POST"])
def execute_step():
    try:
        data = request.get_json()

        machines = create_machines_from_json(data)
        
        tmp = []

        machines = update_machine_states(machines)

        for machine in machines:
            tmp.append(machine.toDict())
        
        response ={ }
        response["machines"] = reduce(merge_dictionaries, tmp)
        response["success"] = True
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e), "success": False})
    
    

@app.route("/variable_names", methods=["POST"])
def variable_names():
    data = request.get_json()
    code = data["code"]
    
    if(trees.get(code) is None):
        trees[code] = parser.parse(code)
        
    tree = trees[code]
    tokens = []
    for child in tree.children:
        try:
            if(child.data == "declaration"):
                tokens.append(child.children[0])
        except:
            pass
   
    print(tokens)
    return jsonify(tokens)

@app.route("/syntax_check", methods=["POST"])
def syntax_check():
    data = request.get_json()
    code = data["code"]
    
    try:
        trees[code] = parser.parse(code)
        response = {
            "success": True
        }
    except Exception as e:
        response = {
            "success": False,
            "error": str(e)
        }
    
    
    return jsonify(response)


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
    #FlaskUI(app=app, server="flask",).run()
    
