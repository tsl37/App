from pprint import pprint
from dist_sys.distributed_system import DistributedSystem
from dist_sys.machine import Machine




code = r"""
   let received_message = 0;
        if (len(get_messages()) > 0) {
            received_message = get_messages()[0];
        }

"""

machines = [Machine(0), Machine(1), Machine(2)]
system = DistributedSystem(machines,code)


for i in range (3):
    system = system.next_step


for machine in system.machines:
    pprint(machine.memory)
