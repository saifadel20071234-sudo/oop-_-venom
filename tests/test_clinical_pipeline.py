"""
tests/test_clinical_pipeline.py - Integration tests for the Unified AI Pipeline
Verifies end-to-end integration:
- ML Model condition prediction
- IR Search over 78 guides
- KB Triage Rules
- Rich Response schema
- Real clinics data
"""
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app
from services.clinical_pipeline import process_clinical_query, CONDITION_CATALOG


class TestClinicalPipeline(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        app.config["TESTING"] = True

    def test_pipeline_direct_burn(self):
        res = process_clinical_query("عندي حرق بمية مغلية في إيدي")
        self.assertEqual(res["condition"], "burn")
        self.assertIn("حروق", res["category"])
        self.assertGreater(len(res["steps"]), 0)
        self.assertGreater(len(res["do_list"]), 0)
        self.assertGreater(len(res["dont_list"]), 0)
        self.assertIn("source", res)
        self.assertIn("severity", res)

    def test_pipeline_direct_choking_red(self):
        res = process_clinical_query("واحد بيشرق ومش قادر يتنفس وبيزرق")
        self.assertEqual(res["condition"], "choking")
        self.assertEqual(res["severity"], "red")
        self.assertIn("اختناق", res["category"])

    def test_pipeline_direct_poisoning_red(self):
        res = process_clinical_query("طفل شرب كلور ومادة تنظيف")
        self.assertEqual(res["condition"], "poisoning")
        self.assertEqual(res["severity"], "red")

    def test_api_chat_endpoint(self):
        response = self.client.post("/api/chat", json={"message": "عندي نزيف من الأنف مش بيوقف"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("condition"), "nosebleed")
        self.assertIn("steps", data)
        self.assertIn("do_list", data)
        self.assertIn("dont_list", data)

    def test_api_triage_questionnaire_endpoint(self):
        payload = {
            "category": "burns",
            "symptoms": ["احمرار وألم خفيف بالجلد", "حرق بمية سخنة"]
        }
        response = self.client.post("/api/triage", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("severity", data)
        self.assertIn("steps", data)
        self.assertIn("do_list", data)
        self.assertIn("dont_list", data)

    def test_api_clinics_real_count(self):
        response = self.client.get("/api/clinics")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreaterEqual(data.get("count", 0), 300)

    def test_pipeline_english_burn(self):
        res = process_clinical_query("I burned my hand with boiling water")
        self.assertEqual(res["condition"], "burn")
        self.assertEqual(res["language"], "english")
        self.assertIn("Burn", res["title"])
        self.assertGreater(len(res["steps"]), 0)
        self.assertGreater(len(res["do_list"]), 0)
        self.assertGreater(len(res["dont_list"]), 0)

    def test_pipeline_english_hypertension_emergency(self):
        res = process_clinical_query("my blood pressure is 180 and I feel chest pain")
        self.assertEqual(res["language"], "english")
        self.assertEqual(res["severity"], "red")
        self.assertIn("Hypertensive", res["title"])

    def test_api_chat_english_endpoint(self):
        response = self.client.post("/api/chat", json={"message": "someone is choking on food"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("condition"), "choking")
        self.assertEqual(data.get("language"), "english")
        self.assertEqual(data.get("severity"), "red")


if __name__ == "__main__":
    unittest.main()
