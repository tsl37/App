function circle(numNodes) {
    let machines = {};
    console.log(numNodes);

    for (let i = 0; i < numNodes; i++) {

        machines[i] = {
            state: {},
            neighbors: [
                String((i - 1 + numNodes) % numNodes)
            ],
            message_stack: []
        };
    }

    node_editor.setValue(reverseGraph(machines));
}

function star(numNodes) {
    let machines = {};
    console.log("star");

    for (let i = 0; i < numNodes; i++) {
        machines[i] = {
            state: {},
            neighbors: [
                String(0)
            ],
            message_stack: []
        };
    }

    node_editor.setValue(reverseGraph(machines));
}

function full(numNodes) {
    let machines = {};

    for (let i = 0; i < numNodes; i++) {
        machines[i] = {
            state: {},
            neighbors: [
                ...Array.from({ length: numNodes }, (_, j) => j)
            ],
            message_stack: []
        };
    }

    node_editor.setValue(reverseGraph(machines));
}