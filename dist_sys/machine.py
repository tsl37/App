from pprint import pprint

from dal.DALRunner import run
from dal.Interpreter import ExecutionContext


class Machine:
    
    def __init__(self, UID, code, neighbors=None):
        self.UID = UID
        self.neighbors = neighbors if neighbors is not None else []
        self.code = code
        self.outgoing_messages = {}
        self.incoming_messages = []
        self.memory = {}
        
        
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
            self.neighbors[node].receiveMessage(message)
        self.outgoing_messages = {}

    def clear(self):
        self.incoming_messages = []

    def executeCode(self,code):
        context = ExecutionContext(
            UID=self.UID,
            variables=dict(self.memory),
            incoming_messages=self.incoming_messages
            )
        context = run(code,context)
        self.memory = context.variables
        self.outgoing_messages = context.outgoing_messages

        

    def receiveMessage(self, message):
        self.incoming_messages.append(message)
