"""
Comprehensive Unit Tests for Member 2: Knowledge Base & Inference Engine
System: First Aid Knowledge Base & Triage System
Covers:
1. KnowledgeBase loading (rules.json, facts.json)
2. RuleValidator verification
3. Forward Chaining and Priority Matching
4. Red-Flag Priority Override (Critical Emergency)
5. Special Cases Handler (Infants, Children, Elderly, Pregnant, Diabetics)
6. Decision Explainer
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from kb.knowledge_base import KnowledgeBase
from kb.inference_engine import InferenceEngine
from kb.validator import RuleValidator
from kb.explainer import Explainer
from kb.special_cases import SpecialCasesHandler, special_cases_handler


class TestKnowledgeBase(unittest.TestCase):
    """Verifies that knowledge base files load accurately."""

    def setUp(self):
        self.kb = KnowledgeBase()

    def test_rules_loaded(self):
        self.assertIsNotNone(self.kb.rules)
        self.assertGreaterEqual(len(self.kb.rules), 16, "Must cover at least 16 conditions")
        self.assertIn("burn", self.kb.rules)
        self.assertIn("choking", self.kb.rules)
        self.assertIn("cpr", self.kb.rules)
        self.assertIn("poisoning", self.kb.rules)

    def test_facts_loaded(self):
        self.assertIsNotNone(self.kb.facts)
        self.assertIn("severity_levels", self.kb.facts)
        self.assertIn("conditions_list", self.kb.facts)
        self.assertIn("age_groups", self.kb.facts)
        self.assertIn("body_locations_high_risk", self.kb.facts)

    def test_get_red_flags(self):
        burn_red_flags = self.kb.get_red_flags("burn")
        self.assertIsInstance(burn_red_flags, list)
        self.assertIn("large_blisters", burn_red_flags)
        self.assertIn("third_degree", burn_red_flags)

    def test_get_rules_by_condition(self):
        choking_rules = self.kb.get_rules_by_condition("choking")
        self.assertIsInstance(choking_rules, list)
        self.assertGreaterEqual(len(choking_rules), 1)


class TestRuleValidator(unittest.TestCase):
    """Verifies that rule validation functions correctly."""

    def setUp(self):
        self.validator = RuleValidator()
        self.kb = KnowledgeBase()

    def test_rules_file_is_valid(self):
        # Validate current active rules file
        with open(self.kb.rules_file, "r", encoding="utf-8") as f:
            import json
            data = json.load(f)
        errors = self.validator.validate_rules_file(data)
        self.assertEqual(errors, [], f"Active rules.json must have 0 validation errors: {errors}")

    def test_invalid_rule_detected(self):
        bad_rule = {
            "id": "INVALID_001",
            "description": "Missing conclusion and conditions"
        }
        errors = self.validator.validate_rule(bad_rule)
        self.assertGreater(len(errors), 0, "Validator must reject invalid rules lacking required fields")


class TestInferenceEngine(unittest.TestCase):
    """Verifies forward chaining and rule matching."""

    def setUp(self):
        self.kb = KnowledgeBase()
        self.engine = InferenceEngine(self.kb)

    def test_severe_burn_red(self):
        facts = {"condition": "burn", "severity": "red"}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red")
        self.assertIn("RULE_BURN_01", result["rules_fired"])
        self.assertGreater(len(result["actions"]), 0)

    def test_minor_burn_green(self):
        facts = {"condition": "burn", "severity": "green"}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "green")
        self.assertIn("RULE_BURN_03", result["rules_fired"])

    def test_cpr_cardiac_arrest(self):
        facts = {"condition": "cpr", "severity": "red"}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red")
        self.assertIn("RULE_CPR_01", result["rules_fired"])

    def test_missing_condition_asks_question(self):
        facts = {}
        result = self.engine.infer(facts)
        self.assertGreater(len(result["questions"]), 0, "Must ask clarifying questions when condition is missing")
        self.assertEqual(result["severity"], "orange")


class TestRedFlagPriority(unittest.TestCase):
    """Verifies that Red-Flag Priority overrides all other facts."""

    def setUp(self):
        self.kb = KnowledgeBase()
        self.engine = InferenceEngine(self.kb)

    def test_burn_red_flag_override(self):
        # Even if someone claims it's green, a red flag forces severity = red!
        facts = {"condition": "burn", "severity": "green", "large_blisters": True}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red", "Red flag MUST override severity to red")
        self.assertTrue(any("RED_FLAG" in r for r in result["rules_fired"]))

    def test_poisoning_wheat_pill_override(self):
        facts = {"condition": "poisoning", "wheat_pill": True}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red")
        self.assertTrue(any("WHEAT_PILL" in r for r in result["rules_fired"]))

    def test_choking_cannot_breathe_override(self):
        facts = {"condition": "choking", "cannot_breathe": True}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red")


class TestSpecialCases(unittest.TestCase):
    """Verifies special demographic and health conditions."""

    def setUp(self):
        self.kb = KnowledgeBase()
        self.engine = InferenceEngine(self.kb)

    def test_infant_burn_escalation(self):
        # Any burn in an infant (< 1 year) must be escalated to RED immediately
        facts = {"condition": "burn", "severity": "green", "age_group": "infant"}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red", "Infant burns must escalate to red")
        self.assertIn("SPECIAL_INFANT_BURN_RED", result["rules_fired"])

    def test_infant_choking_no_heimlich(self):
        facts = {"condition": "choking", "age_group": "infant"}
        result = self.engine.infer(facts)
        # Verify specific action warning against abdominal thrusts
        action_text = " ".join(result["actions"])
        self.assertIn("حظر مناورة هيمليك", action_text)
        self.assertIn("SPECIAL_INFANT_CHOKING_RED", result["rules_fired"])

    def test_child_burn_threshold(self):
        facts = {"condition": "burn", "severity": "green", "age_group": "child"}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "orange", "Child burn threshold must escalate from green")
        self.assertIn("SPECIAL_CHILD_BURN_THRESHOLD", result["rules_fired"])

    def test_elderly_fracture_risk(self):
        facts = {"condition": "fracture", "severity": "green", "age": 75}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "orange", "Elderly fracture must escalate due to osteoporosis")
        self.assertIn("SPECIAL_ELDERLY_FRACTURE_RISK", result["rules_fired"])

    def test_pregnant_choking_chest_thrusts(self):
        facts = {"condition": "choking", "severity": "red", "pregnant": True}
        result = self.engine.infer(facts)
        self.assertIn("SPECIAL_PREGNANT_CHOKING", result["rules_fired"])
        action_text = " ".join(result["actions"])
        self.assertIn("Chest Thrusts", action_text)

    def test_pregnant_positioning(self):
        facts = {"condition": "fainting", "pregnant": True}
        result = self.engine.infer(facts)
        self.assertIn("SPECIAL_PREGNANT_POSITIONING", result["rules_fired"])
        action_text = " ".join(result["actions"])
        self.assertIn("الجانب الأيسر", action_text)

    def test_diabetic_fainting_hypoglycemia(self):
        facts = {"condition": "fainting", "diabetic": True}
        result = self.engine.infer(facts)
        self.assertEqual(result["severity"], "red", "Diabetic syncope must be treated as critical hypoglycemia")
        self.assertIn("SPECIAL_DIABETIC_HYPO_OVERRIDE", result["rules_fired"])


class TestExplainer(unittest.TestCase):
    """Verifies that explanation strings are well formatted."""

    def setUp(self):
        self.kb = KnowledgeBase()
        self.engine = InferenceEngine(self.kb)
        self.explainer = Explainer(self.kb)

    def test_explanation_formatting(self):
        facts = {"condition": "burn", "severity": "red"}
        result = self.engine.infer(facts)
        explanation = self.explainer.explain(result)
        self.assertIn("Severity: red", explanation)
        self.assertIn("Reason:", explanation)
        self.assertIn("Recommended actions:", explanation)


if __name__ == "__main__":
    unittest.main(verbosity=2)
