"use strict";
function circle(numNodes) {
    let machines = {};
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
function star(numNodes) {
    let machines = [];
    machines[0] = {
        state: {},
        neighbors: [
            ...Array.from({ length: numNodes - 1 }, (_, j) => j + 1)
        ],
        message_stack: []
    };
    for (let i = 1; i < numNodes; i++) {
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
    let machines = [];
    for (let i = 0; i < numNodes; i++) {
        machines[i] = {
            state: {},
            neighbors: [
                ...Array.from({ length: numNodes }, (_, j) => j).filter(j => j !== i)
            ],
            message_stack: []
        };
    }
    node_editor.setValue(reverseGraph(machines));
}
