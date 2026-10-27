"""
tests/test_ml_nlu.py - Unit tests for Member 3 (ML/NLU & Chatbot)
Author: Reda El-Qeblawy
"""
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from nlu.preprocessor_ml import preprocess_text
from nlu.language_detect import detect_language
from nlu.predictor import predict_condition, predict_with_confidence
from chatbot.guardrails import check_input, check_condition
from chatbot.dialog_manager import process_message
from contracts import nlu_parse, chatbot_reply


class TestMLNLU(unittest.TestCase):
    def test_text_preprocessing(self):
        cleaned = preprocess_text("I have a BURN on my hand!! https://example.com")
        self.assertNotIn("http", cleaned)
        self.assertNotIn("!", cleaned)
        self.assertIn("burn", cleaned)

    def test_language_detection(self):
        self.assertEqual(detect_language("I have a burn"), "en")
        self.assertEqual(detect_language("عندي حرق في إيدي"), "ar")
        self.assertEqual(detect_language(""), "unknown")

    def test_guardrails(self):
        valid, msg = check_input("")
        self.assertFalse(valid)
        valid, msg = check_input("Hi")
        self.assertFalse(valid)
        valid, msg = check_input("I have a severe burn on my arm")
        self.assertTrue(valid)

    def test_ml_prediction_english(self):
        cond = predict_condition("I have a burn on my hand")
        self.assertEqual(cond, "burn")

        cond = predict_condition("Someone is choking")
        self.assertEqual(cond, "choking")

    def test_ml_prediction_arabic(self):
        cond = predict_condition("عندي نزيف من الأنف")
        self.assertEqual(cond, "nosebleed")

        cond = predict_condition("عندي كسر في إيدي")
        self.assertEqual(cond, "fracture")

    def test_dialog_manager(self):
        res = process_message("I have a burn on my hand")
        self.assertEqual(res["condition"], "burn")
        self.assertIn("burn", res["message"].lower())

    def test_contracts_integration(self):
        parsed = nlu_parse("عندي كسر في رجلي")
        self.assertEqual(parsed["language"], "arabic")
        self.assertIsNotNone(parsed["condition"])

        reply = chatbot_reply(None, "Someone is choking and cannot breathe")
        self.assertEqual(reply["condition"], "choking")
        self.assertEqual(reply["severity"], "red")


if __name__ == "__main__":
    unittest.main()
