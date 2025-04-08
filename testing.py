from pprint import pprint
from dist_sys.distributed_system import DistributedSystem
from dist_sys.machine import Machine




code = r"""
let x = 1;
def main(hello,x)
{
    x = 0;
    if(True)
    {
         return True;
    }
   
}
halt();
let y = main(0,0);
"""

machines = [Machine(0), Machine(1), Machine(2)]
system = DistributedSystem(machines,code)



for machine in system.machines:
    pprint(machine.memory)
    
