"""
nlu/test_classifier.py - Unit test runner for NLU condition classifier
"""
import sys
from pathlib import Path

PROJECT_PATH = Path(__file__).resolve().parent.parent
if str(PROJECT_PATH) not in sys.path:
    sys.path.insert(0, str(PROJECT_PATH))

from nlu.predictor import predict_condition


test_messages = [
    "I have a burn on my hand",
    "Someone is choking",
    "عندي نزيف من الأنف",
    "عندي كسر في إيدي"
]


for message in test_messages:
    result = predict_condition(message)
    print("User message:", message)
    print("Predicted condition:", result)
    print("-" * 40)
