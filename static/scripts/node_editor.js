const checkbox = document.getElementById('directedCheckbox');

checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        document.getElementById('directedLabel').innerHTML = "Directed";
    } else {
        document.getElementById('directedLabel').innerHTML = "Undirected";
    }
})

var node_editor = ace.edit("node-editor");
node_editor.setTheme("ace/theme/monokai");

node_editor.getSession().on('change', function () {
    update()
});

function createGraph(inputEdges) {
    let machines = {};

    inputEdges.forEach(edge => {

        if (edge.length == 1) {
            machines[edge[0]] = {
                id: edge[0],
                state: {},
                neighbors: [],
                message_stack: []
            };

        }
        else if (edge.length == 2) {
            node1 = edge[0];
            node2 = edge[1];
            machines[node1].neighbors.push(String(node2));
            if (!checkbox.checked) {
                machines[node2].neighbors.push(String(node1));
            }
        }

    });

    return machines;
}

function update() {
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
    try {
        var graph = createGraph(edges);
        drawGraph(graph);
    } catch (e) {
        console.log(e);
        console.log(edges);
    }
}

function reverseGraph(machines) {
    var nodes = Object.keys(machines);
    var edges = [];
    nodes.forEach(node => {
        machines[node].neighbors.forEach(neighbor => {
            edges.push([neighbor, node]);
        });
    });
    console.log(nodes);
    console.log(edges);
    return nodes.join('\n') + "\n" + edges.map(x => x.join(' ')).join('\n');

}