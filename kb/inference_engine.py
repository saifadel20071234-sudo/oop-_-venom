from typing import Dict, Any, Optional
from .special_cases import SpecialCasesHandler, special_cases_handler


class InferenceEngine: 
    def __init__(self, knowledge_base, special_cases: Optional[SpecialCasesHandler] = None): 
        self.kb = knowledge_base
        self.special_cases = special_cases or special_cases_handler

    def check_conditions(self, conditions: Dict[str, Any], facts: Dict[str, Any]) -> bool:
        if not conditions:
            return True

        if "AND" in conditions:
            return all(
                self.check_conditions(item, facts)
                for item in conditions["AND"]
            )

        if "OR" in conditions:
            return any(
                self.check_conditions(item, facts)
                for item in conditions["OR"]
            )

        if "NOT" in conditions:
            return not self.check_conditions(
                conditions["NOT"], facts
            )

        fact_name = conditions.get("fact")
        expected_value = conditions.get("equals")
        actual_value = facts.get(fact_name)

        return actual_value == expected_value

    def infer(self, facts: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes Forward Chaining inference:
        1. Checks for missing condition -> generates clarifying question
        2. Checks RED-FLAG priority -> immediate RED override
        3. Matches priority rules -> generates conclusion
        4. Applies Special Cases (Infant, Child, Elderly, Pregnant, Diabetic) modifiers
        """
        if context is None:
            context = {}

        condition = facts.get("condition")

        if not condition:
            base_result = {
                "severity": "orange",
                "rules_fired": [],
                "actions": [
                    "Identify the condition and assess the situation."
                ],
                "questions": ["What happened? What type of injury or emergency is it?"],
                "explanation": "More information is needed to identify the medical condition."
            }
            return self.special_cases.evaluate(facts, base_result)

        rules = self.kb.get_rules_by_condition(condition)
        red_flags = self.kb.get_red_flags(condition)

        # 1. Red-Flag Priority Override
        detected_flags = [flag for flag in red_flags if facts.get(flag) is True]
        if detected_flags:
            # Find red triage rule if exists to get rich clinical actions
            red_rule = next((r for r in rules if r.get("conclusion", {}).get("severity") == "red"), None)
            actions = red_rule.get("conclusion", {}).get("actions", []) if red_rule else [
                "Seek emergency medical assistance immediately (Call 123)."
            ]
            flags_str = ", ".join(detected_flags)
            base_result = {
                "severity": "red",
                "rules_fired": [f"RED_FLAG_{flag.upper()}" for flag in detected_flags],
                "actions": actions,
                "questions": [],
                "explanation": f"Red-flag emergency symptom detected: {flags_str}. Immediate hospital care required."
            }
            return self.special_cases.evaluate(facts, base_result)

        # 2. Match Rules
        matching_rules = [
            rule for rule in rules
            if self.check_conditions(rule.get("conditions", {}), facts)
        ]

        matching_rules.sort(
            key=lambda rule: rule.get("priority", 0),
            reverse=True
        )

        if not matching_rules:
            # Fallback if no full rule matched
            base_result = {
                "severity": "orange",
                "rules_fired": [],
                "actions": [
                    "Seek medical advice if symptoms are concerning."
                ],
                "questions": [
                    "Can you describe the symptoms, severity, or appearance in more detail?"
                ],
                "explanation": "No specific rule matched all the provided facts. Clinical assessment needed."
            }
            return self.special_cases.evaluate(facts, base_result)

        rule = matching_rules[0]
        conclusion = rule.get("conclusion", {})

        base_result = {
            "severity": conclusion.get("severity", "orange"),
            "rules_fired": [rule.get("id", "unknown")],
            "actions": conclusion.get("actions", []),
            "questions": [],
            "explanation": rule.get(
                "description",
                "The result was obtained from the knowledge base."
            )
        }

        # 3. Apply Special Cases modifiers (Infant, Child, Elderly, Pregnant, Diabetic)
        return self.special_cases.evaluate(facts, base_result)
