import unittest
from dal.DALRunner import run

class TestFunctions(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_builtin_function_print(self):
        code = """
        print("Hello, world!");
        """
        # This test doesn't modify variables, so it checks for execution without errors.
        self.execute(code)

    def test_builtin_function_max(self):
        code = """
        let x = max(3, 10, 5);
        """
        memory = self.execute(code)
        self.assertEqual(memory["x"], 10)

if __name__ == '__main__':
    unittest.main()
