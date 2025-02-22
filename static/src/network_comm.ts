

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

function fetch_next_step(payload: string) {

    
    fetch('/execute_step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
        .then(response => response.json())
        .then(data  => {
            return data;

        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}

function json_to_distributed_system(json: { code: any; machines: any; }) {
    const system = new Distributed_System(json.code);
    const nodes = new Map();

    json.machines.forEach((machine: { id: string; state: {};neighbors:[any]; message_stack: []; }) => {
        const node = new Machine(machine.id, machine.state, machine.message_stack);
        nodes.set(machine.id, node);
        system.graph.addNode(machine.id);
    });

    json.machines.forEach((machine: { id: any; neighbors: any[]; }) => {
        const node = nodes.get(machine.id);
        machine.neighbors.forEach((neighborId: any) => {
            const neighborNode = nodes.get(neighborId);
            if (neighborNode) {
                system.graph.addEdge(node, neighborNode);
            }
        });
    });

    return system;
}


function distributed_system_to_json(system: { graph: { nodes: any; }; code: any; }) {
    const machines: { id: any; state: any; neighbors: any[]; message_stack: any; }[] = [];
    const nodes = system.graph.nodes;
    nodes.forEach((node: { id: any; state: any; message_stack: any; }) => {
        const machine = {
            id: node.id,
            state: node.state,
            neighbors: [],
            message_stack: node.message_stack
        };
        machines.push(machine);
    });

    nodes.forEach((node: { id: any; neighbors: any[]; }) => {
        const machine = machines.find(machine => machine.id === node.id);
        node.neighbors.forEach((neighbor: { id: any; }) => {
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

function distributed_system_to_object  (system: any) {
    console.log(system.graph.nodes);
    return {
        code: system.code,
        machines: Object.fromEntries(system.graph.nodes)
    };
}

