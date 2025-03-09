

function graph_to_string(nodes: { [key: number]: number[] }) {

    var output = "";
    output += Object.keys(nodes).join("\n") + "\n";
    output += Object.entries(nodes).map((x) => x[1].map((y) => x[0].toString() + " " + y.toString()).join("\n")).join("\n")

    return output;

}


function randomise_button()
{
    node_editor.setValue(graph_to_string(randomiseUID(string_to_adj_list())));
}

function randomiseUID(nodes: { [key: number]: number[] },range: number = 100) {
    let originalKeys = Object.keys(nodes).map(Number); 
    let newKeys = new Set<number>();

  
    while (newKeys.size < originalKeys.length) {
        let randNum = Math.floor(Math.random() * range);
        newKeys.add(randNum);
    }

    let keyMapping = Object.fromEntries(originalKeys.map((key, index) => [key, Array.from(newKeys)[index]]));

   
    let newNodes: { [key: number]: number[] } = {};

    for (let oldKey of originalKeys) {
        newNodes[keyMapping[oldKey]] = nodes[oldKey].map(neighbor => keyMapping[neighbor]);
    }

    return newNodes;
}

function circle(numNodes: number) {
    let nodes: { [key: number]: number[] } = {};
    for (var i = 0; i < numNodes; i++) nodes[i] = [];

    for (let i = 0; i < numNodes; i++) {
        nodes[i].push((i - 1 + numNodes) % numNodes);

        if (!checkbox.checked) {
            nodes[((i - 1 + numNodes) % numNodes)].push(i);
        }
    }
    node_editor.setValue(graph_to_string(nodes));
}

function star(numNodes: number) {
    let nodes: { [key: number]: number[] } = {};

    for (let i = 0; i < numNodes; i++) nodes[i] = [];

    for (let i = 1; i < numNodes; i++) {
        nodes[0].push(i);
        nodes[i].push(0);
    }

    node_editor.setValue(graph_to_string(nodes));
}

function full(numNodes: number) {
    let nodes: { [key: number]: number[] } = {};

    for (let i = 0; i < numNodes; i++) {
        nodes[i] = [];

        for (let j = 0; j < numNodes; j++) {
            if (i !== j) {
                nodes[i].push(j);
            }
        }
    }

    node_editor.setValue(graph_to_string(nodes));
}

function random(numNodes: number, completeness: number = 0.75) {
    let nodes: { [key: number]: number[] } = {};

    for (let i = 0; i < numNodes; i++) nodes[i] = [];

    let edges = 0;
    let totalPossibleEdges = numNodes * (numNodes - 1);

   
    for (let i = 1; i < numNodes; i++) {
        let neighbor = Math.floor(Math.random() * i);
        nodes[i].push(neighbor);
        nodes[neighbor].push(i);
        edges++;
    }

   
    while (edges / totalPossibleEdges < completeness) {
        let node1 = Math.floor(Math.random() * numNodes);
        let node2 = Math.floor(Math.random() * numNodes);

        if (node1 !== node2 && !nodes[node1].includes(node2)) {
            nodes[node1].push(node2);
            edges++;
        }
    }

    node_editor.setValue(graph_to_string(nodes));
}
