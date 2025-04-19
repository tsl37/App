class GraphVisualizer {
    private container: any;
    private nodes: any[] = [];
    private machines: any = {};
    private simulation: any;
    private link_distance: number = 50;
    private frozen: boolean = false;
    private tooltip: any;

    constructor() {
        this.container = d3.select("#graph-container");
        this.tooltip = d3.select("body").append("div")
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
    }

    freezeAnimation() {
        if (this.simulation) {
            this.frozen = true;
            this.nodes.forEach((node: any) => {
                node.fx = node.x;
                node.fy = node.y;
            });
        }
    }

    unfreezeAnimation() {
        this.frozen = false;
        this.nodes.forEach((node: any) => {
            node.fx = null;
            node.fy = null;
        });
        if (this.simulation) {
            this.simulation.alpha(0.3);
            this.simulation.restart();
        }
    }

    generateNodeCardHTML(d: any) {
        const variablesHTML = Object.entries(d.state)
            .filter(([key]) => pinned_variables.includes(key))
            .map(([key, value]) => `
                <div><strong>${key}:</strong> ${JSON.stringify(value, null, '\t')}</div>
            `).join('');

        return `
            <div class="card bootstrap-card node-card">
                <div class="card-body">
                    <h5 class="card-title">${d.id}</h5>
                    <h6 class="card-header" style="cursor:pointer;">
                        Variables 
                    </h6>
                    <div id="variables-${d.id}" class="card-text">
                        ${variablesHTML}
                    </div>
                </div>
            </div>
        `;
    }

    getIntersection(x1: number, y1: number, x2: number, y2: number, boxWidth: number, boxHeight: number) {
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
    }

    createNodes(system: SynchronousNetwork, width: number, height: number) {
        const data = distributed_system_to_object(system).machines;
        return Object.keys(data).map(machine => ({
            id: machine,
            state: data[machine].state,
            messages: data[machine].messages,
            x: width / 2,
            y: height / 2
        }));
    }

    addNodeCards(nodeGroup: any, nodes: any) {
        const self = this;
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
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const node = nodeGroup.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(drag(this.simulation) as any);

        const tempContainer = d3.select("body").append("div")
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("top", "-9999px");

        node.append("foreignObject")
            .attr("width", 200)
            .attr("height", 200)
            .html(function (d: any) {
                const cardHTML = self.generateNodeCardHTML(d);
                tempContainer.html(cardHTML);
                const tempNode = tempContainer.node() as HTMLElement;
                if (tempNode) {
                    const cardWidth = tempNode.offsetWidth;
                    const cardHeight = tempNode.offsetHeight;
                    d.width = cardWidth;
                    d.height = cardHeight;
                    return cardHTML;
                }
                return "";
            });

        tempContainer.remove();

        node.each(function (d: any) {
            d.width = d.width || 250;
            d.height = d.height || 200;
        });

        d3.selectAll(".node")
            .select("foreignObject")
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height);

        return node as any;
    }

    addLinks(zoomGroup: any, data: any, node: any, width: number, height: number, nodeCount: number) {
        const links: any = [];
        Object.keys(data).forEach(machine => {
            data[machine].neighbors.forEach((neighbor: any) => {
                links.push({ source: machine, target: neighbor.toString(), x: 0, y: 0 });
            });
        });

        const link = zoomGroup.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("marker-end", "url(#arrowhead)");

        const avgNodeSize = d3.mean(this.nodes, (d: any) => Math.max(d.width, d.height)) || 100;
        this.link_distance = avgNodeSize / 2;
        const baseLinkDistance = this.link_distance;
        const baseRepulsion = -1000;
        const distanceScalingFactor = Math.log(nodeCount + 1);
        const repulsionScalingFactor = 1;

        this.simulation.force("link", d3.forceLink(links)
            .id((d: any) => d.id)
            .distance(baseLinkDistance * distanceScalingFactor))
            .force("charge", d3.forceManyBody()
                .strength(baseRepulsion * repulsionScalingFactor))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .alpha(1)
            .force("collision", d3.forceCollide().radius((d: any) => {
                return Math.max(d.width / 2, d.height / 2) + 10;
            }));

        this.simulation.on("tick", () => {
            node.attr("transform", (d: any) => `translate(${d.x - d.width / 2},${d.y - d.height / 2})`);

            link.each(((d: any, i: number, nodesArr: any[]) => {
                const sourceNode = this.nodes[d.source.index];
                const targetNode = this.nodes[d.target.index];
                const shifted = this.shiftLine(
                    sourceNode.x,
                    sourceNode.y,
                    targetNode.x,
                    targetNode.y,
                    10
                );

                const sourceOffset = this.getIntersection(
                    shifted.x1,
                    shifted.y1,
                    shifted.x2,
                    shifted.y2,
                    sourceNode.width,
                    sourceNode.height
                );
                const targetOffset = this.getIntersection(
                    shifted.x2,
                    shifted.y2,
                    shifted.x1,
                    shifted.y1,
                    targetNode.width,
                    targetNode.height
                );
                d.x1 = (shifted.x1 + sourceOffset.offsetX);
                d.y1 = (shifted.y1 + sourceOffset.offsetY);
                d.x2 = (shifted.x2 + targetOffset.offsetX);
                d.y2 = (shifted.y2 + targetOffset.offsetY);

                d3.select(nodesArr[i])
                    .attr("x1", d.x1)
                    .attr("y1", d.y1)
                    .attr("x2", d.x2)
                    .attr("y2", d.y2);
            }));

            d3.selectAll(".hover-marker")
                .attr("cx", (d: any) => {
                    const dx = d.x2 - d.x1;
                    const dy = d.y2 - d.y1;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const offsetX = (dx / distance) * 20;
                    return d.x2 - offsetX;
                })
                .attr("cy", (d: any) => {
                    const dx = d.x2 - d.x1;
                    const dy = d.y2 - d.y1;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const offsetY = (dy / distance) * 20;
                    return d.y2 - offsetY;
                });
        });
    }

    shiftLine(x1: number, y1: number, x2: number, y2: number, d: number) {
        let dir_x = x2 - x1;
        let dir_y = y2 - y1;

        let normal_x = -dir_y;
        let normal_y = dir_x;

        let magnitude = Math.sqrt(normal_x * normal_x + normal_y * normal_y);
        if (magnitude === 0) magnitude = 1;
        normal_x /= magnitude;
        normal_y /= magnitude;

        let x1_new = x1 + d * normal_x;
        let y1_new = y1 + d * normal_y;
        let x2_new = x2 + d * normal_x;
        let y2_new = y2 + d * normal_y;

        return { x1: x1_new, y1: y1_new, x2: x2_new, y2: y2_new };
    }

    createZoomGroup(svg: any) {
        const zoomGroup = svg.append("g").attr("id", "zoomGroup");
        const zoom: any = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform);
            });

        svg.call(zoom);
        d3.select("svg").on("dblclick.zoom", null);
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

        zoomGroup.select("defs")
            .append("marker")
            .attr("id", "message-indicator")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "green");

        return zoomGroup;
    }

    drawGraph(system: SynchronousNetwork) {
        const svg = d3.select("svg");
        svg.selectAll("*").remove();
        const width = parseInt(svg.style("width"));
        const height = parseInt(svg.style("height"));

        const zoomGroup = this.createZoomGroup(svg);

        const data = distributed_system_to_object(system).machines;
        this.nodes = this.createNodes(system, width, height);
        this.simulation = d3.forceSimulation(this.nodes);

        const nodeGroup = zoomGroup.append("g").attr("class", "nodes");
        const node = this.addNodeCards(nodeGroup, this.nodes);
        this.addLinks(zoomGroup, data, node, width, height, this.nodes.length);

        this.simulation.alpha(1).tick(2000);
    }

    cleanGraph() {
        const svg = d3.select("svg");
        svg.selectAll("*").remove();

        this.nodes = [];
        this.machines = {};
        this.simulation = null;
        this.link_distance = 50;
    }

    updateGraph(system: SynchronousNetwork) {
        const data = distributed_system_to_object(system).machines;
        console.log("Graph updating");
        this.nodes.forEach((node: { id: string | number; state: any; messages: any; }) => {
            if (data[node.id]) {
                node.state = data[node.id].state;
                node.messages = data[node.id].messages;
            }
        });

        const tempContainer = d3.select("body").append("div")
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("top", "-9999px");

        d3.select(".nodes").selectAll(".node")
            .data(this.nodes)
            .select("foreignObject")
            .html((d: any) => {
                const cardHTML = this.generateNodeCardHTML(d);

                tempContainer.html(cardHTML);
                const tempNode = tempContainer.node() as HTMLElement;
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
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height);

        const avgNodeSize = d3.mean(this.nodes, (d: any) => Math.max(d.width, d.height)) || 100;
        const newLinkDistance = avgNodeSize;
        this.simulation.force("link").distance(newLinkDistance);

        if (newLinkDistance !== this.link_distance) {
            this.link_distance = newLinkDistance;
            this.simulation.restart().tick(500);
        }

        this.simulation.force("link").distance(newLinkDistance);
        this.simulation.force("collision").radius((d: any) => {
            return Math.max(d.width / 2, d.height / 2) + 10;
        });

        d3.select(".links").selectAll(".link")
            .attr("stroke", (d: any) =>
                d.target?.messages && d.target.messages.hasOwnProperty(d.source.id)
                    ? "green"
                    : "black"
            )
            .attr("stroke-width", (d: any) =>
                d.target?.messages && d.target.messages.hasOwnProperty(d.source.id)
                    ? 6
                    : 2
            )
            .attr("marker-end", (d: any) =>
                d.target?.messages && d.target.messages.hasOwnProperty(d.source.id)
                    ? "url(#message-indicator)"
                    : "url(#arrowhead)"
            )
            .style("pointer-events", "none");

        d3.select(".links").selectAll(".hover-marker")
            .data(d3.select(".links").selectAll(".link").data())
            .join("circle")
            .attr("class", "hover-marker")
            .attr("r", 25)
            .attr("opacity", 0)
            .attr("pointer-events", "all")
            .on("mouseover", (event: MouseEvent, d: any) => {
                const message = d.target?.messages?.[d.source.id];
                if (message !== undefined) {
                    this.tooltip
                        .style("display", "block")
                        .html(`<pre style="margin:0;">${JSON.stringify(message, null, 2)}</pre>`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                }
            })
            .on("mouseout", () => {
                this.tooltip.style("display", "none");
            });

        this.simulation.restart();
    }

    refreshGraph() {
        console.log("Refreshing graph");
        this.updateGraph(global_context.distributed_system_states[global_context.current_step]);
    }
}


const graphDrawing = new GraphVisualizer();

function freeze_animation() { graphDrawing.freezeAnimation(); }
function unfreeze_animation() { graphDrawing.unfreezeAnimation(); }
function drawGraph(system: SynchronousNetwork) { graphDrawing.drawGraph(system); }
function clean_graph() { graphDrawing.cleanGraph(); }
function refresh_graph() { graphDrawing.refreshGraph(); }

