const checkbox:any = document.getElementById('directedCheckbox');

if (checkbox) {
    checkbox.checked = true;
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
    if(!global_context.running) update()
});

function createGraph(inputEdges: any[]) {
    let machines: any= {};
    let distributed_system = new Distributed_System("");
  
    inputEdges.forEach((edge: any) => {
        
        if (edge.length == 1) {
            if(isNaN(edge[0])) return new Distributed_System("");
           const node = new Machine(edge[0], {}, []);
           distributed_system.graph.addNode(node);

        }
        else if (edge.length == 2) {
            if(isNaN(edge[0]) || isNaN(edge[1])) return new Distributed_System("");
            distributed_system.graph.addEdge(edge[0], edge[1]);
          
            if (!checkbox.checked) {
                distributed_system.graph.addEdge(edge[1], edge[0]);
            }
        }

    });
   
    return distributed_system;
}

function string_to_adj_list()
{
    var nodes: { [key: number]: number[] } = {};
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
    edges.sort((a,b)=>a.length-b.length);
    edges.forEach((edge: any) => {
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
   
    clean_graph();
    drawGraph(get_system());
}
function graph_validity_check()
{
    return get_system().graph.is_valid() ;
}

function get_system()
{
    var val = node_editor.getSession().getValue().trim();
    var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));

    var system = createGraph(edges);

    return  system
}


function set_node_editor(graph: { [key: number]: number[] }) {
    node_editor.setValue(graph_to_string(graph));
}


function full_button()
{
    var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
    var graph = full(count);
    set_node_editor(graph);
}

function star_button()
{
    var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
    var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
    var graph = star(count,directed);
    set_node_editor(graph);
}

function circle_button()
{
    var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
    var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
    var graph = circle(count,directed);
    set_node_editor(graph);

}

function random_button()
{
    var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
    var completeness = parseFloat((<HTMLInputElement>document.getElementById("completeInput")).value);
    var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
    var graph =random(count, completeness,directed);
    set_node_editor(graph);
}


function graph_to_string(nodes: { [key: number]: number[] }) {

    var output = "";
    output += Object.keys(nodes).join("\n") + "\n";
    output += Object.entries(nodes).map((x) => x[1].map((y) => x[0].toString() + " " + y.toString()).join("\n")).join("\n")

    return output;

}


function randomise_button() {
    if(node_editor.getValue().trim() == "") return;
    node_editor.setValue(graph_to_string(randomiseUID(string_to_adj_list())));
}


function randomiseUID(nodes: { [key: number]: number[] }, range: number = 100) {
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

