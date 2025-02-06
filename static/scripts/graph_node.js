class Graph_Node {
  
}

class Graph {
    constructor() {
        this.nodes = [];
    }
    
    addNode(node) {
        this.nodes.push(node);
    }
    
    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
    }
    
    addEdge(node1, node2) {
        node1.addEdge(node2);
        node2.addEdge(node1);
    }
    
    removeEdge(node1, node2) {
        node1.removeEdge(node2);
        node2.removeEdge(node1);
    }
}