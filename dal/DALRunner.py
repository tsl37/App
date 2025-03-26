import os
from lark import Lark
from dal.Interpreter import DALInterpreter, ExecutionContext
tree_cache = {}
parser = None 
with open(os.path.join("dal", "grammar.lark"), "r") as f:
    parser = Lark(f)

def run(code,context = None):
    
    context =context if context != None else ExecutionContext()
    if(tree_cache.get(code) is None):
        tree_cache[code] = parser.parse(code)
    tree = tree_cache[code]
        
    interpreter = DALInterpreter(context=context)
    
    context = interpreter.visit(tree)
    return context

def top_level_variables(code):
    if(tree_cache.get(code) is None):
        tree_cache[code] = parser.parse(code)
        
    tree = tree_cache[code]
    variables = []
    for child in tree.children:
        try:
            if(child.data == "declaration"):
                variables.append(child.children[0].children[0].value)
        except:
            pass
    
    return variables

def check_syntax(code):
    if(tree_cache.get(code) is None):
        tree_cache[code] = parser.parse(code)
        
    tree = tree_cache[code]