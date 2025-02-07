from lark import Lark, visitors, v_args, Token, Tree
from pprint import pprint

class ExecutionContext:

    def __init__(self, UID=0, variables={}, incoming_messages=[]):
        self.variables = variables
        self.UID = UID
        self.incoming_messages = incoming_messages
        self.outgoing_messages = {}

    def __str__(self):
        return str(self.variables)

    def set_var(self, name, value):
        self.variables[name] = value

    def get_var(self, name):
        if name in self.variables:
            return self.variables[name]
        raise ValueError(f"Undefined variable: {name}")

    def set_array(self, name, size):
        self.variables[name] = [0] * size

    def get_array_value(self, name, index):
        return self.variables[name][index]

    def set_array_value(self, name, index, value):
        self.variables[name][index] = value


class MyInterpreter(visitors.Interpreter):
    def __init__(self, context):
        super().__init__()
        self.call_stack = [context]
        self.debug = True

    def get_var(self, name):
        for context in reversed(self.call_stack):
            if name in context.variables:
                return context.variables[name]
        raise ValueError(f"Undefined variable: {name}")

    def set_var(self, name, value):
        for context in reversed(self.call_stack):
            if name in context.variables:
                context.set_var(name, value)
                return

        self.current_context().set_var(name, value)

    def start(self, tree):
        self.visit_children(tree)
        return self.current_context()

    def current_context(self):
        return self.call_stack[-1]

    def push_context(self):
        self.call_stack.append(ExecutionContext())

    def pop_context(self):
        self.call_stack.pop()

    def number(self, tree):
        value = int(tree.children[0].value)

        return value

    def length(self, tree):
        name = tree.children[0].value
        value = self.get_var(name)
        return len(value)

    def length_messages(self, tree):
        return len(self.call_stack[0].incoming_messages)

    def var(self, tree):
        name = tree.children[0].value
        value = self.get_var(name)

        return value

    def uid(self, tree):
        return self.call_stack[0].UID

    def send_message(self, tree):
        recipient = self.visit(tree.children[0])
        msg = self.visit(tree.children[1])
        self.call_stack[0].outgoing_messages.update({recipient: msg})

    def receive_message(self, tree):
        return self.call_stack[0].incoming_messages.pop()

    def declaration(self, tree):

        name = tree.children[0].value

        if len(tree.children) == 1:
            try:
                self.get_var(name)
            except:
                self.set_var(name, 0)

        elif len(tree.children) == 2 and tree.children[1].data == "array":

            size = self.visit(tree.children[1].children[0])

            self.current_context().set_array(name, size)

        elif len(tree.children) == 2:
            value = self.visit(tree.children[1])
            try:
                self.get_var(name)
            except:
                self.set_var(name, value)

    def assignment(self, tree):

        name = tree.children[0].value

        if len(tree.children) == 2:

            value = self.visit(tree.children[1])

            self.set_var(name, value)

        elif len(tree.children) == 3 and tree.children[1].data == "array":

            index = self.visit(tree.children[1].children[0])

            value = self.visit(tree.children[2])
            self.current_context().set_array_value(name, index, value)

    def array_access(self, tree):

        name = tree.children[0].value

        index = self.visit(tree.children[1])

        value = self.current_context().get_array_value(name, index)

        return value

    def add(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        return left + right

    def sub(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        return left - right

    def mul(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        return left * right

    def div(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        if right == 0:
            raise ZeroDivisionError("Division by zero")
        return left / right

    def equals(self, tree):

        return self.visit(tree.children[0]) == self.visit(tree.children[1])

    def lesser(self, tree):

        return self.visit(tree.children[0]) < self.visit(tree.children[1])

    def greater(self, tree):

        return self.visit(tree.children[0]) > self.visit(tree.children[1])

    def if_statement(self, tree):
        if self.visit(tree.children[0]):
            self.visit(tree.children[1])
        elif len(tree.children) == 3:
            self.visit(tree.children[2])

    def while_statement(self, tree):
        while self.visit(tree.children[0]):
            self.visit(tree.children[1])

    def block(self, tree):
        self.push_context()
        self.visit_children(tree)
        self.pop_context()

    def transform_token(self, token):
        if token.type == "NUMBER":
            return int(token.value)
        return token.value
