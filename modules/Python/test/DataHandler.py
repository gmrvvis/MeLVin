import unittest
from ..DataHandler import DataHandler
import pandas as pd
import numpy as np


class DataHandlerTest(unittest.TestCase):

    def __init__(self, data, schema):
        super().__init__()
        self.data = data
        self.schema = schema

    def setUp(self):
        pass

    def test_getColumnIndex(self):
        data = pd.DataFrame(np.random.randint(0, 10, size=(10, 3)), columns=list('ABC'))
        dh = DataHandler(data, None)
        self.assertEqual(dh.getColumnIndex('A'), 1)
        self.assertEqual(dh.getColumnIndex('B'), 2)
        self.assertEqual(dh.getColumnIndex('C'), 3)
        self.assertEqual(dh.getColumnIndex(0), 0)


if __name__ == '__main__':
    unittest.main()
