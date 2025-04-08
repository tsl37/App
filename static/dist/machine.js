"use strict";
class Machine extends Graph_Node {
    id;
    state;
    messages;
    constructor(id, state, messages) {
        super(id);
        this.id = id;
        this.state = state;
        this.messages = messages;
    }
}
