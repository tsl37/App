grammar = """
start: statement+

?statement: declaration | assignment | if_statement | while_statement | expression | send_message

declaration.1: "int" NAME ("=" expression)? ";" | "int" NAME array ";"    // Variable & array declaration

assignment: NAME "=" expression ";" | NAME array "=" expression ";"

if_statement: "if" "(" expression ")" "{" block"}" ("else" "{" block"}")?

block: statement+  // Block of statements

uid.10: "UID" 

array: "[" expression "]"

length.10: "msgs.length" -> length_messages| NAME".length" 

send_message.10:expression"->"expression ";"

comparison: expression "==" expression -> equals |  expression "<" expression -> lesser |  expression ">" expression -> greater

while_statement: "while" "(" expression ")" "{"block"}"

?expression: term | expression "+" expression -> add | expression "-" expression -> sub | comparison | uid | length | "<-msgs" -> receive_message

?term: factor | term "*" factor -> mul | term "/" factor -> div

?factor: NUMBER -> number | NAME -> var | NAME "[" expression "]" -> array_access | "(" expression ")"

%import common.CNAME -> NAME

%import common.NUMBER

%import common.WS

%ignore WS

"""
