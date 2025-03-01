
class Graph_Node {
    id: string;
    neighbors: string[];
    state: {}= {};
    message_stack: [] = [];

    constructor(id: string) {
        this.id = id;
        this.neighbors = [];
    }
    
    addEdge(node: string) {
        this.neighbors.push(node);
    }
    
    removeEdge(node: any) {
        this.neighbors = this.neighbors.filter((n: any) => n !== node);
    }
  
}

class Graph {
    nodes: Map<string, Graph_Node>;
    constructor() {
        this.nodes = new Map();
    }
    
    addNode(node:Graph_Node) {
        this.nodes.set(node.id, node);
    }
    
    removeNode(node: { id: string; }) {
        this.nodes.delete(node.id);
        this.nodes.forEach((n: { removeEdge: (arg0: any) => any; }) => n.removeEdge(node));
    }
    
    addEdge(node1:string, node2:string) {
        
        if(node1 === node2) {
            return;
        }

        const node = this.nodes.get(node1);
        if (node) {
            node.addEdge(node2);
        }
       
    }
    
    removeEdge(node1: { removeEdge: (arg0: any) => void; id: any; }, node2: { id: any; removeEdge: (arg0: any) => void; }) {
        node1.removeEdge(this.nodes.get(node2.id));
       
    }
}


