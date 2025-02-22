class Machine extends Graph_Node {
    id: string;
    state: {};
    message_stack: [];
    constructor(id: string, state: {}, message_stack: []) {
        super(id);
        this.id =id;
        this.state = state;
        this.message_stack = message_stack;
    }
}