import json 
import csv 
from pathlib import Path
class KnowledgeBase: 
    def __init__(self): 
        self.data_dir = Path(__file__).resolve().parent.parent / "data"
        self.rules_file = self.data_dir / "rules.json"
        self.facts_file = self.data_dir / "facts.json"
        self.training_file = self.data_dir / "training_data.csv"

        self.rules = {}
        self.facts = {}
        self.training_data = []

        self.load_rules()
        self.load_facts()
        self.load_training_data()

    def load_rules(self):
        with open(self.rules_file, "r", encoding="utf-8") as file:
            data = json.load(file)

        self.rules = data.get("conditions", {})

    def load_facts(self):
        if self.facts_file.exists():
            with open(self.facts_file, "r", encoding="utf-8") as file:
                self.facts = json.load(file)
        else:
            self.facts = {}

    def load_training_data(self):
        if self.training_file.exists():
            with open(
                self.training_file,
                "r",
                encoding="utf-8-sig",
                newline=""
        ) as file:
                reader = csv.DictReader(file)
                self.training_data = list(reader)
        else:
            self.training_data = []

    def get_rules_by_condition(self, condition):
        condition_data = self.rules.get(condition, {})
        return condition_data.get("rules", [])

    def get_red_flags(self, condition):
        condition_data = self.rules.get(condition, {})
        return condition_data.get("red_flags", [])

    def get_all_rules(self):
        return self.rules

    def get_fact(self, name, default=None):
        return self.facts.get(name, default)

    def get_training_data(self):
        return self.training_data

    def reload_if_changed(self):
        self.load_rules()
        self.load_facts()
        self.load_training_data()