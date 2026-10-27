class RuleValidator: 
    def validate_rule(self, rule): 
        errors = []
    
        if not isinstance(rule, dict):
            return ["Rule must be a JSON object."]

        required_fields = [
            "id",
            "description",
            "conditions",
            "conclusion",
            "priority",
            "source"
    ]

        for field in required_fields:
            if field not in rule:
                errors.append(
                    f"Missing required field: {field}"
            )

        if "conditions" in rule:
            if not self._valid_conditions(rule["conditions"]):
                errors.append(
                    "Conditions must contain AND, OR, NOT, "
                    "or a fact with equals."
            )

        conclusion = rule.get("conclusion")

        if not isinstance(conclusion, dict):
            errors.append("Conclusion must be an object.")
        else:
            if conclusion.get("severity") not in [
                "red", "orange", "green"
        ]:
                errors.append(
                    "Severity must be red, orange, or green."
            )

            if not isinstance(conclusion.get("actions"), list):
                errors.append("Actions must be a list.")

        if not isinstance(rule.get("priority"), int):
            errors.append("Priority must be an integer.")

        return errors

    def _valid_conditions(self, conditions):
        if not isinstance(conditions, dict):
            return False

        for operator in ("AND", "OR"):
            if operator in conditions:
                items = conditions[operator]

                return (
                    isinstance(items, list)
                    and len(items) > 0
                    and all(
                        self._valid_conditions(item)
                        for item in items
                )
            )

        if "NOT" in conditions:
            return self._valid_conditions(conditions["NOT"])

        return (
            isinstance(conditions.get("fact"), str)
            and "equals" in conditions
    )

    def validate_rules_file(self, data):
        errors = []

        if not isinstance(data, dict):
            return ["Rules data must be an object."]

        conditions = data.get("conditions")

        if not isinstance(conditions, dict):
            return ["Missing or invalid conditions object."]

        seen_ids = set()

        for condition_name, condition_data in conditions.items():
            if not isinstance(condition_data, dict):
                errors.append(
                    f"{condition_name}: condition must be an object."
            )
                continue

            rules = condition_data.get("rules", [])

            if not isinstance(rules, list):
                errors.append(
                    f"{condition_name}: rules must be a list."
            )
                continue

            for rule in rules:
                rule_errors = self.validate_rule(rule)

                for error in rule_errors:
                    errors.append(
                        f"{condition_name}: {error}"
                )

                if isinstance(rule, dict):
                    rule_id = rule.get("id")

                    if rule_id:
                        if rule_id in seen_ids:
                            errors.append(
                                f"Duplicate rule ID: {rule_id}"
                        )
                        seen_ids.add(rule_id)

        return errors