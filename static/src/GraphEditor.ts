class GraphEditor {
    private editor: any;
    private checkbox: HTMLInputElement | null;

    constructor() {
        this.editor = ace.edit("node-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.checkbox = document.getElementById('directedCheckbox') as HTMLInputElement | null;

        if (this.checkbox) {
            this.checkbox.checked = true;
            this.checkbox.addEventListener('change', (event: any) => {
                const directedLabel = document.getElementById('directedLabel');
                if (event.currentTarget?.checked) {
                    if (directedLabel) directedLabel.innerHTML = "Directed";
                } else {
                    if (directedLabel) directedLabel.innerHTML = "Undirected";
                }
            });
        }

        this.editor.getSession().on('change', () => {
            if (!global_context.running) this.update();
        });
    }

    getValue() {
        return this.editor.getSession().getValue();
    }

    setValue(val: string) {
        this.editor.setValue(val);
    }

    createGraph(inputEdges: any[]) {
        let distributed_system = new SynchronousNetwork("");
        inputEdges.forEach((edge: any) => {
            if (edge.length == 1) {
                if (isNaN(edge[0])) return new SynchronousNetwork("");
                const node = new Process(edge[0], {}, []);
                distributed_system.graph.addNode(node);
            } else if (edge.length == 2) {
                if (isNaN(edge[0]) || isNaN(edge[1])) return new SynchronousNetwork("");
                distributed_system.graph.addEdge(edge[0], edge[1]);
                if (this.checkbox && !this.checkbox.checked) {
                    distributed_system.graph.addEdge(edge[1], edge[0]);
                }
            }
        });
        return distributed_system;
    }

    stringToAdjList() {
        var nodes: { [key: number]: number[] } = {};
        var val = this.getValue().trim();
        var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
        edges.sort((a, b) => a.length - b.length);
        edges.forEach((edge: any) => {
            if (edge.length == 1) {
                nodes[edge[0]] = [];
            } else if (edge.length == 2) {
                nodes[edge[0]].push(edge[1]);
            }
        });
        return nodes;
    }

    update() {
        clean_graph();
        drawGraph(this.get_system());
    }

    graphValidityCheck() {
        return this.get_system().graph.is_valid();
    }

    get_system() {
        var val = this.getValue().trim();
        var edges = val.split('\n').map(x => x.split(' ').map(x => parseInt(x)));
        var system = this.createGraph(edges);
        return system;
    }

    setNodeEditor(graph: { [key: number]: number[] }) {
        this.setValue(this.graphToString(graph));
    }

    fullButton() {
        var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
        var graph = full(count);
        this.setNodeEditor(graph);
    }

    starButton() {
        var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
        var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
        var graph = star(count, directed);
        this.setNodeEditor(graph);
    }

    circleButton() {
        var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
        var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
        var graph = circle(count, directed);
        this.setNodeEditor(graph);
    }

    randomButton() {
        var count = parseInt((<HTMLInputElement>document.getElementById("nodeInput")).value);
        var completeness = parseFloat((<HTMLInputElement>document.getElementById("completeInput")).value);
        var directed = (<HTMLInputElement>document.getElementById("directedCheckbox")).checked;
        var graph = random(count, completeness, directed);
        this.setNodeEditor(graph);
    }

    graphToString(nodes: { [key: number]: number[] }) {
        var output = "";
        output += Object.keys(nodes).join("\n") + "\n";
        output += Object.entries(nodes).map((x) => x[1].map((y) => x[0].toString() + " " + y.toString()).join("\n")).join("\n")
        return output;
    }

    randomiseButton() {
        if (this.getValue().trim() == "") return;
        this.setValue(this.graphToString(this.randomiseUID(this.stringToAdjList())));
    }

    randomiseUID(nodes: { [key: number]: number[] }, range: number = 100) {
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
}

const nodeEditor = new GraphEditor();

function update() {
    nodeEditor.update();
}

function graph_validity_check() {
    return nodeEditor.graphValidityCheck();
}

function get_system() {
    return nodeEditor.get_system();
}

function set_node_editor(graph: { [key: number]: number[] }) {
    nodeEditor.setNodeEditor(graph);
}

function full_button() {
    nodeEditor.fullButton();
}

function star_button() {
    nodeEditor.starButton();
}

function circle_button() {
    nodeEditor.circleButton();
}

function random_button() {
    nodeEditor.randomButton();
}

function randomise_button() {
    nodeEditor.randomiseButton();
}

