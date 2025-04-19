class SynchronousNetwork {
    graph: Graph;
    code: string;

    constructor(code: string) {
        this.graph = new Graph();
        this.code = code;
    }
}

class Graph_Node {
    id: string;
    neighbors: string[];
    state: {} = {};
    messages: {} = {};

    constructor(id: string) {
        this.id = id;
        this.neighbors = [];
    }

    addEdge(node: string) {
        this.neighbors.push(node);
    }

    removeEdge(node: string) {
        this.neighbors = this.neighbors.filter((n: string) => n !== node);
    }
}

class Graph {
    nodes: Map<string, Graph_Node>;

    constructor() {
        this.nodes = new Map();
    }

    addNode(node: Graph_Node) {
        this.nodes.set(node.id, node);
    }

    removeNode(node: Graph_Node) {
        this.nodes.delete(node.id);
        this.nodes.forEach(n => n.removeEdge(node.id));
    }

    addEdge(node1: string, node2: string) {
        if (node1 === node2) return;
        const node = this.nodes.get(node1);
        if (node) {
            node.addEdge(node2);
        }
    }

    removeEdge(node1: string, node2: string) {
        const n1 = this.nodes.get(node1);
        if (n1) {
            n1.removeEdge(node2);
        }
    }

    is_valid() {
        if (this.nodes.size === 0) return false;

        const visited = new Set<string>();
        const dfs = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const node = this.nodes.get(nodeId);
            if (node) {
                node.neighbors.forEach(neighbor => dfs(neighbor));
            }
        };

        const startNode = this.nodes.keys().next().value;
        if (startNode !== undefined) {
            dfs(startNode);
        }

        const isConnected = this.nodes.size === visited.size;

        let hasDuplicateEdges = false;
        this.nodes.forEach(node => {
            const uniqueNeighbors = new Set(node.neighbors);
            if (uniqueNeighbors.size !== node.neighbors.length) {
                hasDuplicateEdges = true;
            }
        });

        return isConnected;
    }
}

class Process extends Graph_Node {
    declare id: string;
    declare state: {};
    declare messages: [];
    constructor(id: string, state: {}, messages: []) {
        super(id);
        this.id = id;
        this.state = state;
        this.messages = messages;
    }
}