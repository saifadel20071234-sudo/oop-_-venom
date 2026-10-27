"""
tests/test_api.py - Unit and Integration Tests for Flask API (Member 5)
========================================================================
Tests Health Check, Search API (IR Integration), Triage API (KB Integration),
Contacts API (Storage Integration), and Admin Authentication.
"""

import unittest
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app


class TestFlaskAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        app.config["TESTING"] = True

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "ok")

    def test_search_endpoint_with_ir(self):
        # Tests /api/search integrated with Member 1's IR engine
        response = self.client.post("/api/search", json={"query": "حروق الماء المغلي"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertGreater(data.get("count", 0), 0)
        self.assertIn("results", data)

    def test_triage_endpoint_with_kb(self):
        # Tests /api/triage integrated with Member 2's KB engine
        payload = {
            "facts": {
                "condition": "burn",
                "severity": "red",
                "large_blisters": True
            }
        }
        response = self.client.post("/api/triage", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data["data"].get("severity"), "red")

    def test_contacts_endpoint(self):
        response = self.client.get("/api/contacts")
        self.assertEqual(response.status_code, 200)

    def test_admin_requires_login(self):
        response = self.client.get("/admin")
        # Should redirect to /login
        self.assertEqual(response.status_code, 302)
        self.assertIn("/login", response.headers["Location"])


if __name__ == "__main__":
    unittest.main()
