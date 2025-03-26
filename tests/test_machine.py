import unittest
from dal.DALRunner import run

class TestNode(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_execute_code(self):
        code = """
        let x = 42;
        """
        memory = self.execute(code)
        self.assertEqual(memory["x"], 42)

if __name__ == '__main__':
    unittest.main()