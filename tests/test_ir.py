"""
tests/test_ir.py - Unit Tests for Information Retrieval Engine
==============================================================
Tests preprocessing, inverted indexing, TF-IDF cosine similarity,
synonyms & spelling correction, and end-to-end search.
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ir.preprocessor import TextPreprocessor
from ir.inverted_index import InvertedIndex
from ir.tfidf import TfidfEngine
from ir.synonyms import SynonymSpellChecker
from ir.searcher import FirstAidSearcher


class TestIREngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.searcher = FirstAidSearcher(guides_dir="data/guides")

    def test_arabic_preprocessor(self):
        prep = TextPreprocessor()
        # Normalizes alef and removes tashkeel
        tokens = prep.preprocess("إِسْعَافُ الحُرُوقِ بِالمَاءِ")
        self.assertIn("حروق", tokens)
        self.assertIn("ماء", tokens)

    def test_english_preprocessor(self):
        prep = TextPreprocessor()
        tokens = prep.preprocess("Severe bleeding from wounds")
        self.assertIn("severe", tokens)
        self.assertIn("bleed", tokens)
        self.assertIn("wound", tokens)

    def test_inverted_index_building(self):
        index = self.searcher.index
        self.assertGreater(index.total_documents, 0)
        self.assertGreater(index.vocabulary_size, 50)
        # Check posting existence
        self.assertIn("burns.txt", index.documents)

    def test_synonyms_and_spell_correction(self):
        checker = SynonymSpellChecker()
        # Typo correction (buring is edit distance 2 from burn/burns)
        self.assertIn(checker.correct_word("buring"), ["burn", "burns"])
        self.assertEqual(checker.correct_word("اختناك"), "اختناق")
        # Synonym expansion
        expanded = checker.expand_and_correct(["اتحرقت"])
        self.assertIn("حرق", expanded)

    def test_search_burns(self):
        results = self.searcher.search("حروق بالماء الساخن", k=3)
        self.assertGreater(len(results), 0)
        # Check that a burns-related document is retrieved in top results
        has_burn_match = any("burn" in r["doc_id"].lower() or "حروق" in r["title"] for r in results)
        self.assertTrue(has_burn_match)
        self.assertGreater(results[0]["score"], 0.0)

    def test_search_choking(self):
        results = self.searcher.search("choking heimlich maneuver", k=3)
        self.assertGreater(len(results), 0)
        has_choking_match = any("choking" in r["doc_id"].lower() or "اختناق" in r["title"] for r in results)
        self.assertTrue(has_choking_match)

    def test_search_cuts_bleeding(self):
        results = self.searcher.search("نزيف دم مستمر", k=3)
        self.assertGreater(len(results), 0)
        has_bleeding_match = any("bleeding" in r["doc_id"].lower() or "نزيف" in r["title"] for r in results)
        self.assertTrue(has_bleeding_match)


if __name__ == "__main__":
    unittest.main()
