"""
Integration test script for the Single Unified Server.
Verifies all frontend pages, admin dashboard, shortcuts, and APIs.
"""
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app


class TestUnifiedServer(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_frontend_home(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        text = res.get_data(as_text=True)
        self.assertIn("VENOM", text)
        self.assertIn("admin-quick-btn", text)
        self.assertIn("/admin", text)

    def test_frontend_pages(self):
        for page in ["chat.html", "triage.html", "contacts.html", "learn.html"]:
            res = self.client.get(f"/pages/{page}")
            self.assertEqual(res.status_code, 200, f"Failed on /pages/{page}")
            text = res.get_data(as_text=True)
            self.assertIn("admin-quick-btn", text, f"Missing admin-quick-btn in /pages/{page}")
            self.assertIn("/admin", text, f"Missing /admin in /pages/{page}")

    def test_frontend_page_alias(self):
        # Extensionless alias
        res = self.client.get("/chat")
        self.assertEqual(res.status_code, 200)
        self.assertIn("المساعد", res.get_data(as_text=True))

    def test_frontend_assets(self):
        res = self.client.get("/css/main.css")
        self.assertEqual(res.status_code, 200)
        self.assertIn(".admin-quick-btn", res.get_data(as_text=True))

    def test_admin_assets(self):
        res = self.client.get("/static/css/admin.css")
        self.assertEqual(res.status_code, 200)
        self.assertIn(".site-shortcut-pill", res.get_data(as_text=True))

    def test_login_page_has_return_shortcut(self):
        res = self.client.get("/login")
        self.assertEqual(res.status_code, 200)
        text = res.get_data(as_text=True)
        self.assertIn("العودة للموقع الرئيسي", text)
        self.assertIn("VENOM", text)

    def test_admin_requires_login(self):
        res = self.client.get("/admin")
        self.assertEqual(res.status_code, 302)
        self.assertIn("/login", res.headers.get("Location", ""))

    def test_admin_dashboard_with_login_has_shortcuts(self):
        with self.client.session_transaction() as sess:
            sess["logged_in"] = True

        res = self.client.get("/admin")
        self.assertEqual(res.status_code, 200)
        text = res.get_data(as_text=True)
        self.assertIn("العودة للموقع الرئيسي", text)
        self.assertIn("عرض الموقع", text)
        self.assertIn('href="/"', text)

    def test_api_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["status"], "ok")

    def test_api_search_ir(self):
        res = self.client.post("/api/search", json={"query": "حروق"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["count"], 0)

    def test_api_triage_kb(self):
        res = self.client.post("/api/triage", json={"facts": {"injury_type": "burn", "degree": 2}})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_api_clinics(self):
        res = self.client.get("/api/clinics")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("clinics", data)

    def test_api_contacts(self):
        res = self.client.get("/api/contacts")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_api_ml_predict(self):
        res = self.client.post("/api/predict", json={"text": "I have a burn on my hand"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["condition"], "burn")

    def test_api_chatbot(self):
        res = self.client.post("/api/chat", json={"message": "someone is choking"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["condition"], "choking")


if __name__ == "__main__":
    unittest.main()
