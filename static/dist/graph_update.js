"use strict";
function updateGraph(system) {
    const data = distributed_system_to_object(system).machines;
    console.log("Graph updating");
    nodes.forEach((node) => {
        if (data[node.id]) {
            node.state = data[node.id].state;
            node.message_stack = data[node.id].message_stack;
        }
    });
    const tempContainer = d3.select("body").append("div")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("top", "-9999px");
    d3.select(".nodes").selectAll(".node")
        .data(nodes)
        .select("foreignObject")
        .html((d) => {
        const cardHTML = generateNodeCardHTML(d);
        tempContainer.html(cardHTML);
        const tempNode = tempContainer.node();
        if (tempNode) {
            const cardWidth = tempNode.offsetWidth;
            const cardHeight = tempNode.offsetHeight;
            d.width = cardWidth;
            d.height = cardHeight;
        }
        return cardHTML;
    });
    tempContainer.remove();
    d3.selectAll(".node")
        .select("foreignObject")
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height);
    const avgNodeSize = d3.mean(nodes, (d) => Math.max(d.width, d.height)) || 100;
    const newLinkDistance = avgNodeSize;
    simulation.force("link").distance(newLinkDistance);
    if (newLinkDistance !== link_distance) {
        link_distance = newLinkDistance;
        simulation.restart().tick(500);
    }
    simulation.force("link").distance(newLinkDistance);
    simulation.force("collision").radius((d) => {
        return Math.max(d.width / 2, d.height / 2) + 10;
    });
    simulation.restart();
    console.log("Graph updated");
}
function refresh_graph() {
    console.log("Refreshing graph");
    updateGraph(global_context.distributed_system_states[global_context.current_step]);
}
