function circle(numNodes: number,directed:boolean) {
    let nodes: { [key: number]: number[] } = {};
    for (var i = 0; i < numNodes; i++) nodes[i] = [];

    for (let i = 0; i < numNodes; i++) {
        nodes[i].push((i - 1 + numNodes) % numNodes);

        if (!directed) {
            nodes[((i - 1 + numNodes) % numNodes)].push(i);
        }
    }
    return nodes;
}

function star(numNodes: number,directed:boolean) {
    let nodes: { [key: number]: number[] } = {};

    for (let i = 0; i < numNodes; i++) nodes[i] = [];

    for (let i = 1; i < numNodes; i++) {
        nodes[0].push(i);
        if (!directed) {
            nodes[i].push(0);
        }
       
    }

    return nodes;
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

   return  nodes;
}

function random(numNodes: number, completeness: number,directed:boolean)  {
    let nodes: { [key: number]: number[] } = {};

    for (let i = 0; i < numNodes; i++) nodes[i] = [];

    for (let i = 1; i < numNodes; i++) {
        let neighbor = Math.floor(Math.random() * i);
        nodes[i].push(neighbor);
        nodes[neighbor].push(i);
       
    }

    let extraEdges = 0 ;
    let totalPossibleExtraEdges = numNodes * (numNodes - 1) - (2 * (numNodes - 1));
    while (extraEdges / totalPossibleExtraEdges < completeness) {
        let node1 = Math.floor(Math.random() * numNodes);
        let node2 = Math.floor(Math.random() * numNodes);

        if (node1 !== node2 && !nodes[node1].includes(node2)) {
            nodes[node1].push(node2);
            extraEdges++;
            if (!directed) {
                nodes[node2].push(node1);
                extraEdges++;
            }
        }
    }

   return nodes;
}


