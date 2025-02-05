let container = d3.select("#graph-container");
let nodes = [];
let machines = {};

function drawGraph(data) {
    const svg = d3.select("svg");
    const width = parseInt(svg.style("width"));
    const height = parseInt(svg.style("height"));
    machines = data;

  
    const oldPositions = {};
    nodes.forEach(node => {
        oldPositions[node.id] = { x: node.x, y: node.y };
    });

    nodes = Object.keys(data).map(machine => ({
        id: machine,
        state: data[machine].state,
        message_stack: data[machine].message_stack,
        x: oldPositions[machine] ? oldPositions[machine].x : width / 2,  
        y: oldPositions[machine] ? oldPositions[machine].y : height / 2  
    }));

    const links = [];
    Object.keys(data).forEach(machine => {
        data[machine].neighbors.forEach(neighbor => {
            links.push({ source: machine, target: neighbor });
        });
    });

    svg.selectAll("*").remove();
    container.selectAll(".node").remove();
    const nodeCount = nodes.length;

    
    const baseLinkDistance = 50;
    const baseRepulsion = -5000;
    const distanceScalingFactor = Math.log(nodeCount + 1);
    const repulsionScalingFactor = 1 / Math.sqrt(nodeCount);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(baseLinkDistance * distanceScalingFactor))
        .force("charge", d3.forceManyBody()
            .strength(baseRepulsion * repulsionScalingFactor))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alpha(1)
        .force("collision", d3.forceCollide().radius(d => {
            return Math.max(d.width / 2, d.height / 2) + 10;
        }));

    svg.append("defs")
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

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("marker-end", "url(#arrowhead)");

    const node = container.selectAll(".node")
        .data(nodes)
        .enter().append("div")
        .attr("class", "node")
        .style("border-radius", "10px")
        .html(d => `
            <div class="card bootstrap-card node-card">
                <div class="card-body">
                    <h5 class="card-title">${d.id}</h5>
                    <div class="card-text">
                        ${Object.entries(d.state).map(([key, value]) => `
                            <div><strong>${key}:</strong> ${JSON.stringify(value, null, '\t')}</div>
                        `).join('')}
                    </div>
                    <p class="card-text">${JSON.stringify(d.message_stack, null, 2)}</p>
                </div>
            </div>
        `).call(drag(simulation));

    node.each(function (d) {
        const element = d3.select(this).node();
        d.width = element.offsetWidth;
        d.height = element.offsetHeight;
    });

    simulation.force("collision", d3.forceCollide().radius(d => {
        return Math.max(d.width / 2, d.height / 2) + 10;
    }));

    simulation.on("tick", () => {
        node.style("transform", d => `translate(${d.x - d.width / 2}px, ${d.y - d.height / 2}px)`);

        link.each(function (d) {
            const sourceNode = nodes[d.source.index];
            const targetNode = nodes[d.target.index];

            const getIntersection = (x1, y1, x2, y2, boxWidth, boxHeight) => {
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

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}


function updateGraph(data) {
    console.log(data)

    nodes.forEach(node => {
        const newState = JSON.stringify(data[node.id].state, null, 2);
        console.log(newState);
        node.state = newState;
    });


    container.selectAll(".node")
        .data(nodes)
        .select(".card-text")
        .text(d => d.state);
}


function fetchAndUpdateGraph() {
    fetch('/update_state')
        .then(response => response.json())
        .then(data => updateGraph(data));
}


function step() {

    const code = editor.getValue();

    const payload = JSON.stringify({ code: code, machines: machines });
    console.log(payload);

    fetch('/execute_step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
        .then(response => response.json())
        .then(data => {
            drawGraph(data);

        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function circle(numNodes) {
    let machines = {};

    for (let i = 0; i < numNodes; i++) {

        machines[i] = {
            state: {},
            neighbors: [
                String((i - 1 + numNodes) % numNodes)
            ],
            message_stack: []
        };
    }

    return machines;
}

