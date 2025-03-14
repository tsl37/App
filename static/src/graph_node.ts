
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

    is_valid() {

        if(this.nodes.size === 0) {
            return false;
        }
        console.log(this.nodes);
        const visited = new Set<string>();

        const dfs = (nodeId: string) => {
            console.log(nodeId);
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const node = this.nodes.get(nodeId);
            if (node) {
                node.neighbors.forEach(neighbor => {
                    dfs(neighbor);
                });
            }
        };

       
        const startNode = this.nodes.keys().next().value;
        console.log( this.nodes.keys().next().value);
        if (startNode  !== undefined) {
            console.log(startNode);
            dfs(startNode);
        }

       
        const isConnected = this.nodes.size === visited.size;
        console.log(isConnected);
        
       
        let hasDuplicateEdges = false;
        this.nodes.forEach(node => {
            const uniqueNeighbors = new Set(node.neighbors);
            if (uniqueNeighbors.size !== node.neighbors.length) {
                hasDuplicateEdges = true;
            }
        });

        return isConnected ;

    }
    
    removeEdge(node1: { removeEdge: (arg0: any) => void; id: any; }, node2: { id: any; removeEdge: (arg0: any) => void; }) {
        node1.removeEdge(this.nodes.get(node2.id));
       
    }
}


