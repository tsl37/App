"use strict";
class Graph_Node {
    id;
    neighbors;
    state = {};
    message_stack = [];
    constructor(id) {
        this.id = id;
        this.neighbors = [];
    }
    addEdge(node) {
        this.neighbors.push(node);
    }
    removeEdge(node) {
        this.neighbors = this.neighbors.filter((n) => n !== node);
    }
}
class Graph {
    nodes;
    constructor() {
        this.nodes = new Map();
    }
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    removeNode(node) {
        this.nodes.delete(node.id);
        this.nodes.forEach((n) => n.removeEdge(node));
    }
    addEdge(node1, node2) {
        if (node1 === node2) {
            return;
        }
        const node = this.nodes.get(node1);
        if (node) {
            node.addEdge(node2);
        }
    }
    removeEdge(node1, node2) {
        node1.removeEdge(this.nodes.get(node2.id));
    }
}
