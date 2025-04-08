class Machine extends Graph_Node {
    id: string;
    state: {};
    messages: [];
    constructor(id: string, state: {}, messages: []) {
        super(id);
        this.id =id;
        this.state = state;
        this.messages = messages;
    }
}