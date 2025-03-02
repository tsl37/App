from pprint import pprint
from lark import Lark
from Interpreter import ExecutionContext, MyInterpreter

from grammar import grammar

parser = Lark(grammar)

trees = {}

class Node:
    state = 0
    neighbors = []
    memory = {}
    outgoing_messages = {}
    incoming_messages = []
    UID = 0
    id = 0

    def __init__(self, UID, code, neighbors=[]):
        self.UID = UID
        self.neighbors = neighbors
        self.code = code

    def toDict(self):
        return {
            str(self.UID): {
                "state": self.memory,
                "neighbors": list(map(lambda x: str(x.UID), self.neighbors)),
                "message_stack" : self.incoming_messages
            }
        }

    def sendMessages(self):
        for node, message in self.outgoing_messages.items():
            
            print(f"sending from {self.UID}")
            print(message)
            self.neighbors[node].receiveMessage(message)
            print("to")
            pprint(self.neighbors[node].UID)
            pprint(self.neighbors[node].incoming_messages)
            
        
        self.outgoing_messages = {}

    def clear(self):
        self.incoming_messages = []

    def executeCode(self):
        if(trees.get(self.code) is None):
            trees[self.code] = parser.parse(self.code)
        tree = trees[self.code]
        
        context = ExecutionContext(
            UID=self.UID,
            variables=dict(self.memory),
            incoming_messages=self.incoming_messages
        )
        interpreter = MyInterpreter(context=context)
        
        context = interpreter.visit(tree)
        self.memory = dict(context.variables)
        self.outgoing_messages = dict(context.outgoing_messages)

    def receiveMessage(self, message):
        self.incoming_messages.append(message)
