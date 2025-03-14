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
    is_valid() {
        if (this.nodes.size === 0) {
            return false;
        }
        console.log(this.nodes);
        const visited = new Set();
        const dfs = (nodeId) => {
            console.log(nodeId);
            if (visited.has(nodeId))
                return;
            visited.add(nodeId);
            const node = this.nodes.get(nodeId);
            if (node) {
                node.neighbors.forEach(neighbor => {
                    dfs(neighbor);
                });
            }
        };
        const startNode = this.nodes.keys().next().value;
        console.log(this.nodes.keys().next().value);
        if (startNode !== undefined) {
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
        return isConnected;
    }
    removeEdge(node1, node2) {
        node1.removeEdge(this.nodes.get(node2.id));
    }
}
