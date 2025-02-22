function circle(numNodes: number) {
    let machines: { [key: string]: { state: {}; neighbors: string[]; message_stack: never[]; } } = {};
    console.log(numNodes);

    for (let i = 0; i < numNodes; i++) {

        machines[String(i)] = {
            state: {},
            neighbors: [
                String((i - 1 + numNodes) % numNodes)
            ],
            message_stack: []
        };
    }

    node_editor.setValue(reverseGraph(machines));
}

function star(numNodes: number) {
    let machines:any = [];
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

function full(numNodes: number) {
    let machines:any = [];

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