import unittest
import crawl

class MyTest(unittest.TestCase):
    def test_insert_item_dynamo(self):
        res = crawl.recordingStateToDynamoDB("Test Case", "2099")
        stats_code = res['ResponseMetadata']['HTTPStatusCode']
        self.assertEqual(stats_code, 200)
    
    def test_remove_item_dynamo(self):
        res = crawl.removeStateToDynamoDB("Test Case", "2099")
        stats_code = res['ResponseMetadata']['HTTPStatusCode']
        self.assertEqual(stats_code, 200)

if __name__ == '__main__':
    unittest.main()