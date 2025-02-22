const checkbox:any = document.getElementById('directedCheckbox');


if (checkbox) {
    checkbox.addEventListener('change', (event:any) => {
    if (event.currentTarget?.checked) {
        const directedLabel = document.getElementById('directedLabel');
        if (directedLabel) {
            directedLabel.innerHTML = "Directed";
        }
    } else {
        const directedLabel = document.getElementById('directedLabel');
        if (directedLabel) {
            directedLabel.innerHTML = "Undirected";
        }
    }});
}


var node_editor = ace.edit("node-editor");
node_editor.setTheme("ace/theme/monokai");

node_editor.getSession().on('change', function () {
    update()
});

function createGraph(inputEdges: any[]) {
    let machines: any= {};
    let distributed_system = new Distributed_System("");
    console.log("inputEdges");
    console.log(inputEdges);
    inputEdges.forEach((edge: any) => {
        
        if (edge.length == 1) {
           distributed_system.graph.addNode(edge[0]);

        }
        else if (edge.length == 2) {
            distributed_system.graph.addEdge(edge[0], edge[1]);
          
            if (!checkbox.checked) {
                distributed_system.graph.addEdge(edge[1], edge[0]);
            }
        }

    });
    console.log("distributed_system");
    console.log(distributed_system);
    machines = distributed_system_to_object(distributed_system).machines;
    console.log("machines");
    console.log(machines);
    return machines;
}

function update() {
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
    
        var graph = createGraph(edges);
        drawGraph(graph);
  
}

function reverseGraph(machines: { [key: string]: { state: {}; neighbors: string[]; message_stack: never[]; } }) {
    var nodes = Object.keys(machines);
    var edges: any[][] = [];
    nodes.forEach(node => {
        machines[node].neighbors.forEach((neighbor: any) => {
            edges.push([neighbor, node]);
        });
    });
    console.log(nodes);
    console.log(edges);
    return nodes.join('\n') + "\n" + edges.map(x => x.join(' ')).join('\n');

}
