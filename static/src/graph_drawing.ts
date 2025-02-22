let container = d3.select("#graph-container");
let nodes: any;
let machines = {};
let simulation:any;
let link_distance = 50;

function drawGraph(data: { [x: string]: {
    
    state: any;
    message_stack: any; neighbors: any; 
}; }) {
    console.log("drawGraph");
    console.log(data);
    const svg = d3.select("svg");
    const width = parseInt(svg.style("width"));
    const height = parseInt(svg.style("height"));
    machines = data;

    nodes = Object.keys(data).map(machine => ({
        id: machine,
        state: data[machine].state,
        message_stack: data[machine].message_stack,
        x: width / 2,
        y: height / 2
    }));
    console.log("nodes");
    console.log(nodes);

    const links: any = [];
    Object.keys(data).forEach(machine => {
        data[machine].neighbors.forEach((neighbor: any) => {
            links.push({ source: machine, target: neighbor.toString() });
        });
    });
    console.log("links");
    console.log(links);

    svg.selectAll("*").remove();

    const zoomGroup = svg.append("g").attr("id", "zoomGroup");

    const zoom :any= d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform);
        });

    svg.call(zoom);

    const nodeCount = nodes.length;
    simulation = d3.forceSimulation(nodes);

    const nodeGroup = zoomGroup.append("g").attr("class", "nodes");

    const node = nodeGroup.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(drag(simulation) as any);

    const tempContainer = d3.select("body").append("div")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("top", "-9999px");

    const foreignObject = node.append("foreignObject")
        .attr("width", 100)
        .attr("height", 100)
        .html((d: any) => {
            const cardHTML = `
                <div class="card bootstrap-card node-card">
                    <div class="card-body">
                        <h5 class="card-title">${d.id}</h5>
                        <div class="card-text">
                            ${Object.entries(d.state).map(([key, value]) => `
                                <div><strong>${key}:</strong> ${JSON.stringify(value, null, '\t')}</div>
                            `).join('')}
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
                console.log(d.width, d.height);
                return cardHTML;
            }
            return "";
        });

    tempContainer.remove();

    node.each(function (d:any) {
        d.width = d.width || 150;
        d.height = d.height || 100;
    });

    zoomGroup.append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "black");

    const link = zoomGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("marker-end", "url(#arrowhead)");

    const avgNodeSize = d3.mean(nodes,( d:any) => Math.max(d.width, d.height)) || 100;
    link_distance = avgNodeSize;
    const baseLinkDistance = link_distance;
    const baseRepulsion = -5000;
    const distanceScalingFactor = Math.log(nodeCount + 1);
    const repulsionScalingFactor = 1 / Math.sqrt(nodeCount);

    simulation.force("link", d3.forceLink(links)
        .id((d:any) => d.id)
        .distance(baseLinkDistance * distanceScalingFactor))
        .force("charge", d3.forceManyBody()
            .strength(baseRepulsion * repulsionScalingFactor))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alpha(1)
        .force("collision", d3.forceCollide().radius((d:any) => {
            return Math.max(d.width / 2, d.height / 2) + 10;
        }));

    simulation.on("tick", () => {
        node.attr("transform", (d :any) => `translate(${d.x - d.width / 2},${d.y - d.height / 2})`);

        link.each(function (d:any) {
            const sourceNode = nodes[d.source.index];
            const targetNode = nodes[d.target.index];

            const getIntersection = (x1: number, y1: number, x2: number, y2: number, boxWidth: number, boxHeight: number) => {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const absDX = Math.abs(dx);
                const absDY = Math.abs(dy);

                let offsetX = 0;
                let offsetY = 0;

                if (absDX * boxHeight > absDY * boxWidth) {
                    offsetX = dx > 0 ? boxWidth / 2 : -boxWidth / 2;
                    offsetY = (offsetX * dy) / dx;
                } else {
                    offsetY = dy > 0 ? boxHeight / 2 : -boxHeight / 2;
                    offsetX = (offsetY * dx) / dy;
                }

                offsetX = Math.max(-boxWidth / 2, Math.min(boxWidth / 2, offsetX));
                offsetY = Math.max(-boxHeight / 2, Math.min(boxHeight / 2, offsetY));

                return { offsetX, offsetY };
            };

            const sourceOffset = getIntersection(
                sourceNode.x,
                sourceNode.y,
                targetNode.x,
                targetNode.y,
                sourceNode.width,
                sourceNode.height
            );
            const targetOffset = getIntersection(
                targetNode.x,
                targetNode.y,
                sourceNode.x,
                sourceNode.y,
                targetNode.width,
                targetNode.height
            );

            d3.select(this)
                .attr("x1", sourceNode.x + sourceOffset.offsetX)
                .attr("y1", sourceNode.y + sourceOffset.offsetY)
                .attr("x2", targetNode.x + targetOffset.offsetX)
                .attr("y2", targetNode.y + targetOffset.offsetY);
        });
    });

    function drag(simulation: any) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}