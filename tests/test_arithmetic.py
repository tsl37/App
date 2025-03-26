import unittest
from dal.DALRunner import run

class TestArithmeticOperations(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_basic_addition(self):
        code = "let x = 2 + 3;"
        memory = self.execute(code)
        self.assertEqual(memory["x"], 5)

    def test_multiplication(self):
        code = "let x = 4 * 5;"
        memory = self.execute(code)
        self.assertEqual(memory["x"], 20)

    def test_parentheses_precedence(self):
        code = "let x = (2 + 3) * 4;"
        memory = self.execute(code)
        self.assertEqual(memory["x"], 20)

    def test_string_concatenation(self):
        code = 'let x = "hello " + "world";'
        memory = self.execute(code)
        self.assertEqual(memory["x"], "hello world")

    def test_string_multiplication(self):
        code = 'let x = ("hello " + "world") * 2;'
        memory = self.execute(code)
        self.assertEqual(memory["x"], "hello worldhello world")

if __name__ == '__main__':
    unittest.main()
