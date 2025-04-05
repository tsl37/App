"use strict";
const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("display", "none")
    .style("z-index", "9999");
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
    d3.select(".links").selectAll(".link")
        .attr("stroke", (d) => d.target?.message_stack && d.target.message_stack.hasOwnProperty(d.source.id)
        ? "green"
        : "black")
        .attr("stroke-width", (d) => d.target?.message_stack && d.target.message_stack.hasOwnProperty(d.source.id)
        ? 6
        : 2)
        .attr("marker-end", (d) => d.target?.message_stack && d.target.message_stack.hasOwnProperty(d.source.id)
        ? "url(#message-indicator)"
        : "url(#arrowhead)")
        .style("pointer-events", "none");
    d3.select(".links").selectAll(".hover-marker")
        .data(d3.select(".links").selectAll(".link").data())
        .join("circle")
        .attr("class", "hover-marker")
        .attr("r", 25)
        .attr("opacity", 0)
        .attr("pointer-events", "all")
        .on("mouseover", function (event, d) {
        const message = d.target?.message_stack?.[d.source.id];
        if (message !== undefined) {
            tooltip
                .style("display", "block")
                .html(`<pre style="margin:0;">${JSON.stringify(message, null, 2)}</pre>`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
        }
    })
        .on("mouseout", () => {
        tooltip.style("display", "none");
    });
    simulation.restart();
}
function refresh_graph() {
    console.log("Refreshing graph");
    updateGraph(global_context.distributed_system_states[global_context.current_step]);
}
