from pprint import pprint
from lark import Lark, visitors, Token, Tree
from dist_sys.distributed_system import DistributedSystem
from dist_sys.machine import Machine




code = r"""
let x = "hello" + 5;
"""

machines = [Machine(0,code), Machine(1,code), Machine(2,code)]
system = DistributedSystem(machines,code)


for i in range (3):
    system = system.next_step


for machine in system.machines:
    print(machine.memory)
