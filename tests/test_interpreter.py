import unittest
from lark import Lark
from dal.DALRunner import run
from dal.Interpreter import ExecutionContext, DALInterpreter


class TestInterpreter(unittest.TestCase):
    def setUp(self):
        pass

    def execute(self, code):
        return run(code).variables

    def test_combined_operations(self):
        code = """
        let x = 10;
        let y = 5;
        let z = (x + y) * 2;
        """
        memory = self.execute(code)
        self.assertEqual(memory["z"], 30)

if __name__ == '__main__':
    unittest.main()
