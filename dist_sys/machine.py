import copy
from pprint import pprint

from dal.DALRunner import run
from dal.Interpreter import ExecutionContext, HaltException


class Machine:
    
    def __init__(self, UID, neighbors=None):
        self.UID = UID
        self.neighbors = neighbors if neighbors is not None else []
        self.outgoing_messages = {}
        self.incoming_messages = {}
        self.memory = {}
        
    @property 
    def dict(self):
        return {
            str(self.UID): {
                "state": self.memory,
                "neighbors": list(map(lambda x: str(x.UID), self.neighbors)),
                "messages" : self.incoming_messages
            }
        }

    def sendMessages(self):
        for node, message in self.outgoing_messages.items():
            list(filter(lambda x :x.UID == node,self.neighbors))[0].receiveMessage({self.UID : message})
        self.outgoing_messages = {}

    def clear(self):
        self.incoming_messages = {}

    def executeCode(self,code):
        context = ExecutionContext(
            UID=int(self.UID),
            out_nbrs=list(map(lambda x : int(x.UID),self.neighbors)),
            variables=dict(self.memory),
            incoming_messages=dict(self.incoming_messages)
            )

        context = run(code,context)
    
        self.memory = context.variables
        self.outgoing_messages = context.outgoing_messages
        
        if(context.halted == True):
            raise HaltException("Machine halted")

        

    def receiveMessage(self, message):
        self.incoming_messages.update(message)
