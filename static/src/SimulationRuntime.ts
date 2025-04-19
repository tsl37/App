class SimulationRuntime {
    running: boolean = false;
    steps: number = 0;
    current_step: number = 0;
    distributed_system_states: Array<SynchronousNetwork> = [];
    code: string = "";
    interval: NodeJS.Timeout | undefined;

    constructor() {
        this.reset();
    }

    startSimulation() {
        this.cleanSimulation();
        this.running = true;
        this.code = codeEditor.getValue();
    }

    cleanSimulation() {
        this.clearStepTimeout();
        this.steps = 0;
        this.current_step = 0;
        this.distributed_system_states = [get_system()];
        update();
        this.running = false;
    }

    reset() {
        this.running = false;
        this.steps = 0;
        this.current_step = 0;
        this.distributed_system_states = [];
        this.code = "";
    }

    togglePlayPause(checkbox: HTMLInputElement) {
        const playSlider = document.getElementById('playSlider');
        if (playSlider) {
            if (checkbox.checked) {
                playSlider.innerHTML = '<i class="bi bi-pause-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
                this.interval = setInterval(() => this.stepForward(), 1000);
            } else {
                playSlider.innerHTML = '<i class="bi bi-play-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
                this.clearStepTimeout();
            }
        }
    }

    setStepLabel(current: number, max: number) {
        var step_label = document.getElementById("stepLabel");
        if (step_label) {
            step_label.innerText =
                "Step: " + current.toString() + "/" + max.toString();
        }
    }

    clearStepTimeout() {
        if (this.interval) clearTimeout(this.interval);
    }

    stepButton(direction: string) {
        switch (direction) {
            case "forward":
                this.stepForward();
                break;
            case "backward":
                this.stepBackward();
                break;
            case "start":
                this.stepStart();
                break;
            case "end":
                this.stepEnd();
                break;
        }
    }

    freeze() {
        freeze_animation();
    }

    unfreeze() {
        unfreeze_animation();
    }

    async startSimulationButton() {
        stop_sim = false;
        var graph_valid = graph_validity_check();
        var code_valid = await codeEditor.checkValidity();

        if (graph_valid && code_valid['success']) {
            var running_div = <HTMLElement>document.getElementById("running_div");
            var start_div = <HTMLElement>document.getElementById("start_div");
            running_div.hidden = false;
            start_div.hidden = true;
            this.setStepLabel(0, 0);
            this.startSimulation();
        }
        else {
            BS_alert("Invalid graph or code." + code_valid['error']);
        }
    }

    stopSimulationButton() {
        stop_simulation();
        this.clearStepTimeout();
        this.cleanSimulation();
        var running_div = <HTMLElement>document.getElementById("running_div");
        var start_div = <HTMLElement>document.getElementById("start_div");
        running_div.hidden = true;
        start_div.hidden = false;
    }

    // Placeholder methods for stepping, to be implemented as needed
    stepForward() { step_forward(); }
    stepBackward() { step_backward(); }
    stepStart() { step_start(); }
    stepEnd() { step_end(); }
}

const global_context = new SimulationRuntime();


