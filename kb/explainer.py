class Explainer: 
    def __init__(self, knowledge_base): 
        self.kb = knowledge_base
    def explain(self, result):
        severity = result.get("severity", "unknown")
        rules_fired = result.get("rules_fired", [])
        actions = result.get("actions", [])
        explanation = result.get(
            "explanation",
            "No explanation available."
    )

        messages = {
            "red": "High risk: emergency medical assistance may be needed.",
            "orange": "Moderate or uncertain risk: further assessment is needed.",
            "green": "Lower risk: follow the recommended first aid guidance.",
            "unknown": "The risk level could not be determined."
    }

        lines = [
            f"Severity: {severity}",
            messages.get(
                severity,
                "The risk level requires further assessment."
        ),
            f"Reason: {explanation}"
    ]

        if rules_fired:
            lines.append(
                "Rules applied: " + ", ".join(rules_fired)
        )
        else:
            lines.append("No specific rule was matched.")

        if actions:
            lines.append("Recommended actions:")
            for action in actions:
                lines.append(f"- {action}")

        return "\n".join(lines)