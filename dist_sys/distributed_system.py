



from functools import reduce
from pprint import pprint

from flask import jsonify

from dal.Interpreter import HaltException
from dist_sys.machine import Machine

previous = None 

class DistributedSystem():
    def __init__(self,machines= None,code=None):
        self.machines = machines if machines != None else[]
        self.code = code if code != None else ""
        
    @property    
    def next_step(self):
        machines = self.machines
        code = self.code
        
        for machine in machines:    
             machine.executeCode(code)
             machine.clear()

        for machine in machines:
            machine.sendMessages()
            

            
        return DistributedSystem(machines,code)
            
            
    def from_json(json_data):
        machines_dict = {}
        code = json_data["code"]
        machines_json = json_data["machines"]
     
        for UID, machine_data in machines_json.items():
            UID = int(UID)
            
           
            machine = Machine(UID)
            state = machine_data.get("state", {})
            machine.memory = state
            messages = dict( machine_data.get("messages", {}))
            machine.incoming_messages =  {int(k):(v) for k,v in messages.items()} 
            
            machines_dict[UID] = machine
          
            
        
        for UID, machine_data in machines_json.items():
            neighbor_ids = list(set(machine_data.get("neighbors", [])))
            machines_dict[int(UID)].neighbors = [
                machines_dict[int(n_id)] for n_id in neighbor_ids
            ]

        machines = list(machines_dict.values())
       
        return DistributedSystem(machines,code)
    
    @property
    def dict(self):
        
        def merge_dictionaries(d1, d2):
            merged_dict = d1.copy()
            merged_dict.update(d2)
            return merged_dict
        
        tmp = []
        for machine in self.machines:
            tmp.append(machine.dict)
        dict ={ }
        dict["machines"] = reduce(merge_dictionaries, tmp)
        dict["success"] = True
        previous = dict.copy()
        return dict
        
        
            
    
    
        