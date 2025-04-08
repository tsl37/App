import os
import sys
from lark import Lark, ParseTree
from dal.Interpreter import DALInterpreter, ExecutionContext

def get_resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

tree_cache = {}
parser = None

grammar_path = get_resource_path(os.path.join("static", "grammar", "grammar.lark"))
with open(grammar_path, "r") as f:
    parser = Lark(f,parser = 'earley',propagate_positions = True,debug = True)

def run(code,context = None):
    
    context =context if context != None else ExecutionContext(0,[])
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