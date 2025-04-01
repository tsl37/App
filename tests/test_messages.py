import unittest
from dist_sys.distributed_system import DistributedSystem
from dist_sys.machine import Machine

class TestMessagePassing(unittest.TestCase):
    def test_message_passing_between_two_machines(self):
        # Define the shared code for both machines
        code = r"""
        let x = get_UID();
        let received_message = None;
        if (len(get_messages()) > 0) {
            received_message = get_messages()[0];
        }
        send_message(get_out_nbrs()[0], x);
        """

        # Create two machines with the shared code
        machine1 = Machine(1)
        machine2 = Machine(2)

        # Set up neighbors (unidirectional link from machine1 to machine2)
        machine1.neighbors = [machine2]
        machine2.neighbors = [machine1]

        # Create a distributed system with the two machines
        system = DistributedSystem([machine1, machine2],code = code)

        # Execute one step of the system
        system = system.next_step
        system = system.next_step

        # Verify that machine1 sent the message
        self.assertIn("x", machine1.memory)

        # Verify that machine2 received the message
        self.assertIn("received_message", machine2.memory)
        self.assertEqual(machine2.memory["received_message"], machine1.memory["x"])

if __name__ == '__main__':
    unittest.main()