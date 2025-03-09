"use strict";
const checkbox = document.getElementById('directedCheckbox');
if (checkbox) {
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget?.checked) {
            const directedLabel = document.getElementById('directedLabel');
            if (directedLabel) {
                directedLabel.innerHTML = "Directed";
            }
        }
        else {
            const directedLabel = document.getElementById('directedLabel');
            if (directedLabel) {
                directedLabel.innerHTML = "Undirected";
            }
        }
    });
}
var node_editor = ace.edit("node-editor");
node_editor.setTheme("ace/theme/monokai");
node_editor.getSession().on('change', function () {
    update();
});
function createGraph(inputEdges) {
    let machines = {};
    let distributed_system = new Distributed_System("");
    inputEdges.forEach((edge) => {
        if (edge.length == 1) {
            const node = new Machine(edge[0], {}, []);
            distributed_system.graph.addNode(node);
        }
        else if (edge.length == 2) {
            distributed_system.graph.addEdge(edge[0], edge[1]);
            if (!checkbox.checked) {
                distributed_system.graph.addEdge(edge[1], edge[0]);
            }
        }
    });
    return distributed_system;
}
function string_to_adj_list() {
    var nodes = {};
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
    edges.sort((a, b) => a.length - b.length);
    edges.forEach((edge) => {
        if (edge.length == 1) {
            nodes[edge[0]] = [];
        }
        else if (edge.length == 2) {
            nodes[edge[0]].push(edge[1]);
        }
    });
    return nodes;
}
function update() {
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
    var system = createGraph(edges);
    global_context.distributed_system_states[0] = system;
    clean_graph();
    drawGraph(system);
}
