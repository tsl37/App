
from pprint import pprint
import time
from flaskwebgui import FlaskUI
from flask import Flask, jsonify, render_template, request
import Node as nd
from functools import reduce




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
    start_time = time.time()
    data = request.get_json()

    machines = create_machines_from_json(data)
    for machine in machines:
        pprint(machine.toDict())
    tmp = []

    machines = update_machine_states(machines)

    for machine in machines:
        tmp.append(machine.toDict())
    end_time = time.time()
    print(f"Execution time: {end_time - start_time} seconds")
    return jsonify(reduce(merge_dictionaries, tmp))


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
    #FlaskUI(app=app, server="flask",).run()
    
