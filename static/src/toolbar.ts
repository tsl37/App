var interval:  NodeJS.Timeout;



(document.getElementById('playSlider') as HTMLInputElement).checked = false;

document.addEventListener("step", function () {
    console.log("step event");
    global_context.setStepLabel(global_context.current_step, global_context.steps);
});

function togglePlayPause(checkbox: HTMLInputElement) {
    global_context.togglePlayPause(checkbox);
}

function set_step_label(current: number, max: number) {
    global_context.setStepLabel(current, max);
}

function clear_step_timeout() {
    global_context.clearStepTimeout();
}

function step_button(direction: string) {
    global_context.stepButton(direction);
}

function freeze_button() {
    global_context.freeze();
}

function unfreeze_button() {
    global_context.unfreeze();
}

async function start_simulation_button() {
    await global_context.startSimulationButton();
}

function stop_simulation_button() {
    global_context.stopSimulationButton();
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