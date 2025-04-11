from random import choice, randint, randrange
from lark import Lark, visitors, v_args, Token, Tree
from lark.exceptions import VisitError
from pprint import pprint

class BreakException(Exception):
    pass

class ContinueException(Exception):
    pass

class ReturnException(Exception):
    def __init__(self, value=None):
        self.value = value
        
class InterpretError(Exception):
    def __init__(self, message):
        super().__init__(message)
        
class HaltException(Exception):
    """Exception to signal halting the interpreter."""
    pass

allowed_functions = {
    "range": range,
    "max": max,
    "min": min,
    "sorted": sorted,
    "len" : len,
    "pow" : pow,
    "int" : int,
    "float" : float,
    "str" : str,
    "abs" : abs,
    "sum" : sum,
    "list" : list,
    "tuple" : tuple,
    "set" : set,
    "dict" : dict,
    "type" : type,
    "randrange" :randrange,
    "randint" : randint,
    "choice" : choice
}


class ExecutionContext:
    def __init__(self, UID = None,out_nbrs = None, variables=None, incoming_messages=None,system=None):
        self.system = system
        self.variables = variables if variables != None else {}
        self.UID = UID
        self.incoming_messages = incoming_messages if incoming_messages != None else {}
        self.outgoing_messages = {}
        self.halted = False
        self.functions = allowed_functions.copy()
        self.out_nbrs = out_nbrs
        self.functions.update({ "send_message": self.send_message,
                               "get_messages": self.get_messages,
                               "get_uid":self.get_uid,
                               "get_out_nbrs":self.get_out_nbrs,
                               "halt":self.halt,
                               "diam":self.diam,
                               "size":self.size,})

    def __str__(self):
        return str(self.variables)

    def halt(self):
        raise HaltException()
        
    
    def diam(self):
        if self.system != None:
            return self.system.diameter
        else:
            raise ValueError("System not defined in context")
        
    def size(self):
        if self.system != None:
            return self.system.size
        else:
            raise ValueError("System not defined in context")
    
    def set_var(self, name, value):
        self.variables[name] = value

    def get_var(self, name):
        if name in self.variables:
            return self.variables[name]
        else:
            raise ValueError(f"Undefined variable: {name}")

    def set_array(self, name, size):
        self.variables[name] = [0] * size

    def get_indexed_value(self, name, index):
        return self.variables[name][index]

    def set_array_value(self, name, index, value):
        self.variables[name][index] = value

    def get_uid(self):
        return self.UID

    def send_message(self,dest,msg):
        dest = int(dest)
        if dest not in self.out_nbrs:
            raise ValueError(f"Cannot send message to {dest}. Not a neighbor.")
        self.outgoing_messages.update({dest: msg})

    def get_messages(self):
        return self.incoming_messages
    
    def get_out_nbrs(self):
        return self.out_nbrs
    
class DALInterpreter(visitors.Interpreter):
    def __init__(self, context):
        super().__init__()
        self.call_stack = [context]
        self.debug = True

    @property
    def global_context(self):
        return self.call_stack[0]

    def get_var(self, name):
        for context in reversed(self.call_stack):
            if name in context.variables:
                return context.variables[name]
        raise ValueError(f"Undefined variable: {name}")

    def set_var(self, name, value):
        for context in reversed(self.call_stack):
            if name in context.variables:
                context.set_var(name, value)
                return
        self.current_context().set_var(name, value)

    def start(self, tree):
        try:
            self.visit_children(tree)
        except HaltException:
            self.global_context.halted = True
            pass
        except ContinueException:
            pass
        except Exception as e:
            raise e
        return self.global_context

    def current_context(self):
        return self.call_stack[-1]


    def break_statement(self, tree):
        raise BreakException()

    def continue_statement(self, tree):
        raise ContinueException()
    
    def return_statement(self, tree):
        
        if len(tree.children ) == 1:
            value = self.visit(tree.children[0])
            raise ReturnException(value)
        else:
            raise ReturnException()  
    
    def and_expression(self, tree):

        return self.visit(tree.children[0]) and self.visit(tree.children[1])
    
    def or_expression(self, tree):
        return self.visit(tree.children[0]) or self.visit(tree.children[1])
    
       
    def push_context(self):
        self.call_stack.append(ExecutionContext())

    def pop_context(self):
        self.call_stack.pop()

    def access(self, tree):
        name = self.visit(tree.children[0])
        value = self.get_var(name)
        return value

    def assignment(self, tree):
        target = tree.children[0]
        value = self.visit(tree.children[1])  

        if target.data == "indexed_target": 
            name, index = self.visit(target)
            collection = self.get_var(name) 
            collection[index] = value  
        else:
            name = self.visit(target)
            self.set_var(name, value)

    def declaration(self, tree):
        name = self.visit(tree.children[0])
        value = self.visit(tree.children[1])
        try:
            self.get_var(name)
        except:
            self.set_var(name, value)

    def grouped_expr(self, tree):
        return self.visit(tree.children[0])

    def indexed_access(self, tree):
        var = self.visit(tree.children[0])
        index = self.visit(tree.children[1])
        value = var[index]

        return value

    def primary(self, tree):
        return self.visit(tree.children[0])

    def target(self, tree):
        return tree.children[0].value

    def string(self, tree):
        return tree.children[0].value[1:-1]

    def equals(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        return left == right

    def lesser(self, tree):

        return self.visit(tree.children[0]) < self.visit(tree.children[1])

    def greater(self, tree):

        return self.visit(tree.children[0]) > self.visit(tree.children[1])

    def if_statement(self, tree):
        if self.visit(tree.children[0]):
            self.visit(tree.children[1])
        elif len(tree.children) == 3:
            self.visit(tree.children[2])

    def for_statement(self, tree):
        target = self.visit(tree.children[0])
        iterable = self.visit(tree.children[1])
        block = tree.children[2]
        
        for value in iterable:
            self.set_var(target, value)
            try:
                self.visit(block)
            except BreakException:
                self.pop_context()
                break
            except ContinueException:
                self.pop_context()
                continue
            except Exception as e:
                self.pop_context()
                raise e


    def while_statement(self, tree):
        condition = tree.children[0]
        block = tree.children[1]

        while self.visit(condition):
            try:
                self.visit(block)
            except BreakException:
                self.pop_context()
                break
            except ContinueException:
                self.pop_context()
                continue
            except Exception as e:
                self.pop_context()
                raise e
    
    def halt(self, tree):
        self.current_context().halt = True

    def block(self, tree):
        self.push_context()
        self.visit_children(tree)
        self.pop_context()

    def true(self, tree):
        return True

    def false(self, tree):
        return False

    def tuple(self, tree):
        return tuple(self.visit(child) for child in tree.children)

    def indexed_target(self, tree):
        name = tree.children[0].value  
        index = self.visit(tree.children[1])  
        return name, index

    def function_call(self, tree):
        name = self.visit(tree.children[0])
        args = [self.visit(child) for child in tree.children[1:]]
        if name in self.global_context.functions:
            return self.global_context.functions[name](*args)
        else:
            raise ValueError(f"Undefined function: {name}")

    def number(self, tree):
        try:
            return int(tree.children[0].value)
        except:
            return float(tree.children[0].value)

    def literal(self, tree):
        return self.visit(tree.children[0])

    def factor(self, tree):
        return self.visit(tree.children[0])

    def single_term(self, tree):
        return self.visit(tree.children[0])

    def single_factor(self, tree):
        return self.visit(tree.children[0])

    def binary_operation(self, left, right, operator):
        left = self.visit(left)
        right = self.visit(right)
        return operator(left, right)

    def multiplication(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x * y
        )

    def division(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x / y
        )

    def addition(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x + y
        )

    def subtraction(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x - y
        )

    def modulo(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x % y
        )

    def integer_division(self, tree):
        return self.binary_operation(
            tree.children[0], tree.children[1], lambda x, y: x // y
        )

    def literal(self, tree):
        return self.visit(tree.children[0])

    def negation(self, tree):
        return -self.visit(tree.children[0])

    def function_definition(self, tree):
        name = self.visit(tree.children[0])
        params = []
        body = None
        if( len(tree.children) == 3):
            params = self.visit_children(tree.children[1])
            body = tree.children[2]
        else:
            body = tree.children[1]
            
        self.global_context.functions.update ({name : lambda *args: self.call_function(name, params, args, body)})
        
    def call_function(self, name, params, args, body):
        if len(params) != len(args):
            raise ValueError(f"Function {name} takes {len(params)} arguments, but {len(args)} were given.")
        try:
            for param, arg in zip(params, args):
                self.set_var(param, arg)
            self.visit(body)
        except ReturnException as e:
            self.pop_context()
            return e.value
        except Exception as e:
            raise e

        return None 
    
    def none(self, tree):
        return None
    
    def not_equals(self, tree):
        left = self.visit(tree.children[0])
        right = self.visit(tree.children[1])
        return left != right
    
    def inverse(self, tree):
        return not self.visit(tree.children[0])
    
    def dictionary(self, tree):
        items = self.visit_children(tree)
        return {key: value for key, value in items}

    def dict_item(self, tree):
        key = self.visit(tree.children[0])
        value = self.visit(tree.children[1])
        return key, value

    def visit(self, tree):
        try:
            return super().visit(tree)
        except (ReturnException, BreakException, ContinueException,InterpretError, HaltException) as e:
            raise e
        except Exception as e:
            if isinstance(tree, Tree) and hasattr(tree, 'meta') and tree.meta:
                position = f"Process with UID {self.global_context.get_uid()} at line {tree.meta.line}, column {tree.meta.column}"
                raise InterpretError(f" {type(e).__name__}  {str(e)} occured in {position}") 
            raise InterpretError(f"{type(e).__name__}  {str(e)}")








