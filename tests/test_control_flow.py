import unittest
from dal.DALRunner import run

class TestControlFlow(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_if_statement(self):
        code = """
        let x = 10;
        if (x > 5) { x = 20; }
        """
        memory = self.execute(code)
        self.assertEqual(memory["x"], 20)

    def test_while_loop(self):
        code = """
        let x = 0;
        while (x < 3) { x = x + 1; }
        """
        memory = self.execute(code)
        self.assertEqual(memory["x"], 3)

    def test_for_loop(self):
        code = """
        let sum = 0;
        for i in range(0, 3) { sum = sum + i; }
        """
        memory = self.execute(code)
        self.assertEqual(memory["sum"], 3)  # 0 + 1 + 2 = 3

if __name__ == '__main__':
    unittest.main()
