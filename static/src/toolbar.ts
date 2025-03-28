var interval:  NodeJS.Timeout;

(document.getElementById('playSlider') as HTMLInputElement).checked = false;

document.addEventListener("step", function () {
    console.log("step event");
    set_step_label(global_context.current_step, global_context.steps);
});
function togglePlayPause(checkbox: HTMLInputElement) {

    const playSlider = document.getElementById('playSlider');
    if (playSlider) {
        if (checkbox.checked) {
            playSlider.innerHTML = '<i class="bi bi-pause-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
            interval = setInterval(step_forward, 1000);
        } else {
            playSlider.innerHTML = '<i class="bi bi-play-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
            clear_step_timeout();
        }
    }
}

function set_step_label(current: number, max: number) {
    var step_label = document.getElementById("stepLabel");
    if (step_label) {
        step_label.innerText =
            "Step: " + current.toString() + "/" + max.toString();
    }
}

function clear_step_timeout() {
    clearTimeout(interval);
}

function step_button(direction: string) {
    if (direction == "forward") {
        step_forward();
    }
    else {
        step_backward();
    }
}


function freeze_button() {
    freeze_animation();

}

function unfreeze_button() {
    unfreeze_animation();
}


async function start_simulation_button() {
    var graph_valid = graph_validity_check();
    var code_valid = await code_validity_check();

    if (graph_valid && code_valid) {
        var running_div = <HTMLElement>document.getElementById("running_div");
        var start_div = <HTMLElement>document.getElementById("start_div");
        running_div.hidden = false;
        start_div.hidden = true;
        set_step_label(0, 0);
        start_simulation();
    }
    else {
        BS_alert("Invalid graph or code.");
    }
}

function stop_simulation_button() {

    clean_simulation();
    var running_div = <HTMLElement>document.getElementById("running_div");
    var start_div = <HTMLElement>document.getElementById("start_div");
    running_div.hidden = true;
    start_div.hidden = false;


}

function BS_alert(message: string) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (alertPlaceholder) {
        alertPlaceholder.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show text-center" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}