"use strict";
var interval;
document.getElementById('playSlider').checked = false;
document.addEventListener("step", function () {
    console.log("step event");
    set_step_label(global_context.current_step, global_context.steps);
});
function togglePlayPause(checkbox) {
    const playSlider = document.getElementById('playSlider');
    if (playSlider) {
        if (checkbox.checked) {
            playSlider.innerHTML = '<i class="bi bi-pause-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
            interval = setInterval(step_forward, 1000);
        }
        else {
            playSlider.innerHTML = '<i class="bi bi-play-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
            clear_step_timeout();
        }
    }
}
function set_step_label(current, max) {
    var step_label = document.getElementById("stepLabel");
    if (step_label) {
        step_label.innerText =
            "Step: " + current.toString() + "/" + max.toString();
    }
}
function clear_step_timeout() {
    clearTimeout(interval);
}
function step_button(direction) {
    if (direction == "forward") {
        step_forward();
        return;
    }
    if (direction == "backward") {
        step_backward();
        return;
    }
    if (direction == "start") {
        step_start();
        return;
    }
    if (direction == "end") {
        step_end();
        return;
    }
}
function freeze_button() {
    freeze_animation();
}
function unfreeze_button() {
    unfreeze_animation();
}
async function start_simulation_button() {
    stop_sim = false;
    var graph_valid = graph_validity_check();
    var code_valid = await code_validity_check();
    if (graph_valid && code_valid['success']) {
        var running_div = document.getElementById("running_div");
        var start_div = document.getElementById("start_div");
        running_div.hidden = false;
        start_div.hidden = true;
        set_step_label(0, 0);
        start_simulation();
    }
    else {
        BS_alert("Invalid graph or code." + code_valid['error']);
    }
}
function stop_simulation_button() {
    stop_simulation();
    clear_step_timeout();
    clean_simulation();
    var running_div = document.getElementById("running_div");
    var start_div = document.getElementById("start_div");
    running_div.hidden = true;
    start_div.hidden = false;
}
function BS_alert(message) {
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
