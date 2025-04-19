
const step_event = new Event("step");
let isStepping = false;
let stop_sim = false;
function step_backward() {
    if (isStepping) return;
    isStepping = true;
    var current_step = global_context.current_step;
    if (current_step > 0) {
        current_step--;
        global_context.current_step = current_step;
        document.dispatchEvent(step_event);
    }

    refresh_graph();
    isStepping = false;
}

function step_start() {
    if (isStepping) return;
    isStepping = true;
    var current_step = global_context.current_step;
    if (current_step > 0) {
        current_step = 0;
        global_context.current_step = current_step;
        document.dispatchEvent(step_event);
    }
    refresh_graph();
    isStepping = false;
}

async function stop_simulation(){
    stop_sim = true;
}

async function step_end() {
    if (isStepping) return;
    isStepping = true;

    if(global_context.current_step !== global_context.steps) {
        global_context.current_step = global_context.steps;
        refresh_graph();
        document.dispatchEvent(step_event);

    }

    var current_step = global_context.current_step;
    var distributed_system = global_context.distributed_system_states[current_step];
    if (!distributed_system) {
        console.error("No distributed system state found for this step.");
        isStepping = false;
        return ;
    }



    if (current_step === global_context.steps) {
        var i = 0;
        while(await get_next_step() )
        {
            if(stop_sim) {
                stop_sim = false;
                break;
            }
            refresh_graph();
            i++;
            console.log("Step: " + i);
            if (i > 100) {
                console.error("Infinite loop detected in step_end.");
                break;
            }
        }
       
    }
    else {
        current_step++;
        global_context.current_step = current_step;
        document.dispatchEvent(step_event);
    }
    refresh_graph();
    isStepping = false;
    return ;
}


async function get_next_step() {
    var distributed_system = global_context.distributed_system_states[global_context.steps];
    var current_step = global_context.steps;
    const code = codeEditor.getValue();
    distributed_system.code = code;
    var system = distributed_system_to_json(distributed_system);
    var data: { code: any; machines: any; step?: number } = { ...system };
    data.step = current_step;
    const payload = JSON.stringify(data);
    try {
        const data: any = await fetch_next_step(payload);

        if (!data) {
            console.error("Failed to fetch the next step.");
            isStepping = false;
            return false;
        }

        if (data.error) {
            BS_alert(data.error);
            isStepping = false;
            return false;
        }
        distributed_system = json_to_distributed_system({ code: code, machines: data["machines"] });
        current_step++;
        global_context.current_step = current_step;
        global_context.steps++;
        global_context.distributed_system_states[current_step] = distributed_system;
        document.dispatchEvent(step_event);

    } catch (error) {
        BS_alert("Error fetching next step" + error);
        isStepping = false;
        return false;
    }

    return true;
}

async function step_forward() {
    if (isStepping) return;
    isStepping = true;
   
    var current_step = global_context.current_step;
    var distributed_system = global_context.distributed_system_states[current_step];
    if (!distributed_system) {
        console.error("No distributed system state found for this step.");
        isStepping = false;
        return ;
    }

    if (current_step === global_context.steps) {
        await get_next_step();
        
    }
    else {
        current_step++;
        global_context.current_step = current_step;
        document.dispatchEvent(step_event);
    }
    refresh_graph();
    isStepping = false;
    return ;
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
    const system = new SynchronousNetwork(json.code);
    var machines: any = Object.entries(json.machines);


    machines.forEach((machine: any) => {

        const node = new Process(machine[0], machine[1].state, machine[1].messages);
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
    nodes.forEach((node: { id: any; state: any; messages: any; neighbors: any }) => {
        const machine = {
            id: node.id,
            neighbors: node.neighbors,
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

