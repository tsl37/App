function updateGraph(system: Distributed_System) {
    console.log("Updating graph");
    console.log(system);
    const data = distributed_system_to_object(system).machines;
    
    nodes.forEach((node: { id: string | number; state: any; message_stack: any; }) => {
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
        .html((d:any) => {
            const cardHTML = `
                <div class="card bootstrap-card node-card">
                    <div class="card-body">
                        <h5 class="card-title">${d.id}</h5>
                        <div class="card-text">
                            ${Object.entries(d.state).map(([key, value]) => `
                                <div><strong>${key}:</strong> ${JSON.stringify(value, null, 2)}</div>
                            `).join('')}
                            <p><strong>Messages:</strong> ${JSON.stringify(d.message_stack, null, 2)}</p>
                        </div>
                    </div>
                </div>
            `;

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
        .attr("width", (d:any) => d.width)
        .attr("height", (d:any)=> d.height);


    const avgNodeSize = d3.mean(nodes, (d:any) => Math.max(d.width, d.height))|| 100;
    const newLinkDistance = avgNodeSize;
    simulation.force("link").distance(newLinkDistance);


    if (newLinkDistance !== link_distance) {
        link_distance = newLinkDistance;
        simulation.alpha(1).restart();
    }
}
