"use strict";
function fetchAndUpdateGraph() {
    fetch('/update_state')
        .then(response => response.json())
        .then(data => updateGraph(data));
}
function step() {
    const code = editor.getValue();
    const payload = JSON.stringify({ code: code, machines: machines });
    const data = fetch_next_step(payload);
    updateGraph(data);
}
function fetch_next_step(payload) {
    fetch('/execute_step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
        .then(response => response.json())
        .then(data => {
        return data;
    })
        .catch(error => {
        console.error('Error:', error);
        return false;
    });
}
function json_to_distributed_system(json) {
    const system = new Distributed_System(json.code);
    const nodes = new Map();
    json.machines.forEach((machine) => {
        const node = new Machine(machine.id, machine.state, machine.message_stack);
        nodes.set(machine.id, node);
        system.graph.addNode(machine.id);
    });
    json.machines.forEach((machine) => {
        const node = nodes.get(machine.id);
        machine.neighbors.forEach((neighborId) => {
            const neighborNode = nodes.get(neighborId);
            if (neighborNode) {
                system.graph.addEdge(node, neighborNode);
            }
        });
    });
    return system;
}
function distributed_system_to_json(system) {
    const machines = [];
    const nodes = system.graph.nodes;
    nodes.forEach((node) => {
        const machine = {
            id: node.id,
            state: node.state,
            neighbors: [],
            message_stack: node.message_stack
        };
        machines.push(machine);
    });
    nodes.forEach((node) => {
        const machine = machines.find(machine => machine.id === node.id);
        node.neighbors.forEach((neighbor) => {
            if (machine) {
                machine.neighbors.push(neighbor.id);
            }
        });
    });
    return {
        code: system.code,
        machines: machines
    };
}
function distributed_system_to_object(system) {
    console.log(system.graph.nodes);
    return {
        code: system.code,
        machines: Object.fromEntries(system.graph.nodes)
    };
}
