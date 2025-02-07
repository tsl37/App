

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
            updateGraph(data);

        })
        .catch(error => {
            console.error('Error:', error);
        });
}

