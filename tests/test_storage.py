"""
tests/test_storage.py - Unit Tests for Storage Manager (Member 4)
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from storage.storage import StorageManager


class TestStorageManager(unittest.TestCase):

    def setUp(self):
        self.sm = StorageManager()

    def test_load_contacts(self):
        contacts = self.sm.load_contacts()
        self.assertIsInstance(contacts, list)
        self.assertGreater(len(contacts), 0)

    def test_load_clinics(self):
        clinics = self.sm.load_clinics()
        self.assertIsInstance(clinics, list)
        self.assertGreater(len(clinics), 0)

    def test_load_rules(self):
        rules = self.sm.load_rules()
        self.assertIsInstance(rules, dict)
        self.assertIn("rules", rules)

    def test_load_training_data(self):
        data = self.sm.load_training_data()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 100)

    def test_list_guides(self):
        guides = self.sm.list_guides()
        self.assertIsInstance(guides, list)
        self.assertGreater(len(guides), 10)


if __name__ == "__main__":
    unittest.main()
