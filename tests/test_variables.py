import unittest
from dal.DALRunner import run

class TestVariableHandling(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_variable_assignment(self):
        code = "let x = 10;"
        memory = self.execute(code)
        self.assertEqual(memory["x"], 10)

    def test_variable_reassignment(self):
        code = """
        let x = 10;
        x = 20;
        """
        memory = self.execute(code)
        self.assertEqual(memory["x"], 20)

if __name__ == '__main__':
    unittest.main()
