from pprint import pprint
from lark import Lark, visitors, Token, Tree
from Node import Node
from Interpreter import ExecutionContext, MyInterpreter
from grammar import grammar

parser = Lark(grammar)

code = r"""
int x = 12;
int z = UID;
int arr [7];
z = arr.length;
arr[0] = 120;
arr[1] = 13;
int w;
arr[2] = arr[0] + arr[1];
if(UID == 13)
{
   0->69; 
   x = 70;
}

if(x > 0)
{
    x = x-1;
    int y = 10;
}
if(msgs.length >0)
{
    w = <-msgs;
}

int xyz = UID;
"""


node = Node(12, "")
node.code = code


node2 = Node(13, "")
node2.code = code

node3 = Node(69, "")
node3.code = code

node.neighbors.append(node2)
node2.neighbors.append(node)

node.executeCode()
node.clear()
node.sendMessages()

node2.executeCode()
node2.clear()
node2.sendMessages()

node.executeCode()
node.clear()
node.sendMessages()

node2.executeCode()
node2.clear()
node2.sendMessages()


print("\nFinal memory state:")
pprint(node.memory)
pprint(node.UID)

pprint(node2.memory)
pprint(node2.UID)
