const step_event = new Event("step");
let isStepping = false;

function step_backward() {
    if (isStepping) return;
    isStepping = true;
    var current_step = global_context.current_step;
    if (current_step > 0) {
        current_step--;
        global_context.current_step = current_step;
        updateGraph(global_context.distributed_system_states[current_step]);
        document.dispatchEvent(step_event);
    }
    isStepping = false;
}


async function step_forward() {
    if (isStepping) return;
    isStepping = true;

    var current_step = global_context.current_step;
    var distributed_system = global_context.distributed_system_states[current_step];
    if (!distributed_system) {
        console.error("No distributed system state found for this step.");
        isStepping = false;
        return;
    }

    if (current_step === global_context.steps) {
        const code = code_editor.getValue();
        distributed_system.code = code;
        const payload = JSON.stringify(distributed_system_to_json(distributed_system));
        try {
            const data: any = await fetch_next_step(payload);

            if (!data) {
                console.error("Failed to fetch the next step.");
                isStepping = false;
                return;
            }

            if (data.error) {
                BS_alert(data.error);
                isStepping = false;
                return;
            }
            distributed_system = json_to_distributed_system({ code: code, machines: data["machines"] });

            updateGraph(distributed_system);
            current_step++;
            global_context.current_step = current_step;
            global_context.steps++;
            global_context.distributed_system_states[current_step] = distributed_system;
            document.dispatchEvent(step_event);

        } catch (error) {
            BS_alert("Error fetching next step" + error);
            isStepping = false;
            return;
        }
    }
    else {
        current_step++;
        global_context.current_step = current_step;
        updateGraph(global_context.distributed_system_states[current_step]);
        document.dispatchEvent(step_event);
    }

    isStepping = false;
}


async function fetch_next_step(payload: string) {
    try {
        const response = await fetch('/execute_step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data as any;
    } catch (error) {
        console.error("Error fetching next step:", error);
        return null;
    }
}

function json_to_distributed_system(json: { code: any; machines: any; }) {
    const system = new Distributed_System(json.code);
    var machines: any = Object.entries(json.machines);


    machines.forEach((machine: any) => {

        const node = new Machine(machine[0], machine[1].state, machine[1].message_stack);
        system.graph.addNode(node);
    });


    machines.forEach((machine: any) => {
        machine[1].neighbors.forEach((neighborId: any) => {

            system.graph.addEdge(machine[0], neighborId);

        });
    });

    return system;
}


function distributed_system_to_json(system: { graph: { nodes: any; }; code: any; }) {
    const machines: any = {};

    const nodes = system.graph.nodes;
    nodes.forEach((node: { id: any; state: any; message_stack: any; neighbors: any }) => {
        const machine = {
            id: node.id,
            state: node.state,
            neighbors: node.neighbors,
            message_stack: node.message_stack
        };
        machines[node.id] = machine;
    });


    return {
        code: system.code,
        machines: machines
    };
}

function distributed_system_to_object(system: any) {

    return {
        code: system.code,
        machines: Object.fromEntries(system.graph.nodes)
    };
}

