import unittest
from dal.DALRunner import run

class TestMessagePassing(unittest.TestCase):
    def execute(self, code):
        return run(code).variables

    def test_message_handling(self):
        code = """
        let x = UID;
        if (msgs.length > 0) {
            x = <-msgs;
        }
        0 -> x;
        """
        memory = self.execute(code)
        self.assertIn("x", memory)

if __name__ == '__main__':
    unittest.main()