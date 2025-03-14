"use strict";
let global_context = {
    running: false,
    steps: 0,
    current_step: 0,
    distributed_system_states: Array(),
    code: ""
};
function start_simulation() {
    clean_simulation();
    global_context.running = true;
    global_context.code = code_editor.getValue();
}
function clean_simulation() {
    clear_step_timeout();
    global_context.steps = 0;
    global_context.current_step = 0;
    global_context.distributed_system_states = [get_system()];
    update();
    global_context.running = false;
}
