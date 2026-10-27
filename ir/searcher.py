"""
ir/searcher.py - High-Level Medical Information Retrieval Search Engine
========================================================================
Integrates Preprocessor, Inverted Index, TF-IDF Ranking, Synonym Expansion,
and Snippet Extraction with matched keyword highlighting.
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ir.preprocessor import TextPreprocessor
from ir.inverted_index import InvertedIndex
from ir.tfidf import TfidfEngine
from ir.synonyms import SynonymSpellChecker


class FirstAidSearcher:
    """
    Main Searcher component for the Information Retrieval Engine.
    Executes end-to-end query processing, document retrieval, ranking, and snippet formatting.
    """

    def __init__(self, guides_dir: str = "data/guides", cache_file: str = "index_cache/inverted_index.json"):
        self.guides_dir = guides_dir
        self.cache_file = cache_file

        self.preprocessor = TextPreprocessor()
        self.spell_checker = SynonymSpellChecker()
        self.index = InvertedIndex(self.preprocessor)

        # Build index or load from cache
        self.initialize_index()
        self.tfidf_engine = TfidfEngine(self.index)

    def initialize_index(self) -> None:
        """Load cached index if exists; otherwise build from guides directory."""
        if os.path.exists(self.cache_file):
            success = self.index.load(self.cache_file)
            if success and self.index.total_documents > 0:
                return

        # Build from scratch and save
        self.rebuild_index()

    def rebuild_index(self) -> int:
        """Scan directory, rebuild inverted index, recompute TF-IDF model, and save cache."""
        count = self.index.build_from_directory(self.guides_dir)
        self.index.save(self.cache_file)
        if hasattr(self, 'tfidf_engine'):
            self.tfidf_engine = TfidfEngine(self.index)
        return count

    def generate_snippet(self, raw_text: str, query_tokens: List[str], max_chars: int = 220) -> str:
        """
        Extract a relevant snippet of the document containing the query terms,
        highlighting the matching terms using <b>...</b> tags.
        """
        if not raw_text:
            return ""

        sentences = re.split(r'(?<=[.!?\n])\s+', raw_text)
        best_sentence = ""
        max_matches = 0

        # Find sentence with highest term overlap
        for sentence in sentences:
            s_clean = sentence.strip()
            if not s_clean:
                continue

            matches = sum(1 for token in query_tokens if re.search(r'\b' + re.escape(token), s_clean, re.IGNORECASE))
            if matches > max_matches:
                max_matches = matches
                best_sentence = s_clean

        if not best_sentence:
            best_sentence = sentences[0] if sentences else raw_text[:max_chars]

        # Truncate if sentence is very long
        if len(best_sentence) > max_chars:
            best_sentence = best_sentence[:max_chars].rsplit(' ', 1)[0] + "..."

        # Highlight query terms
        highlighted = best_sentence
        for token in set(query_tokens):
            if len(token) > 2:
                # Highlight matching word patterns
                pattern = re.compile(rf'(\b[\w]*{re.escape(token)}[\w]*\b)', re.IGNORECASE)
                highlighted = pattern.sub(r'<b>\1</b>', highlighted)

        return f"...{highlighted}..."

    def search(self, query: str, k: int = 3, use_synonyms: bool = True) -> List[Dict[str, Any]]:
        """
        Search for top-k relevant documents matching the user query.
        
        Args:
            query: Free text question or symptoms.
            k: Maximum number of results to return.
            use_synonyms: Whether to apply typo correction and synonym expansion.
            
        Returns:
            List of ranked document dictionaries conforming to contracts.py.
        """
        if not query or not query.strip():
            return []

        # 1. Preprocess query
        raw_tokens = self.preprocessor.preprocess(query)
        if not raw_tokens:
            return []

        # 2. Synonym expansion & typo correction
        query_tokens = self.spell_checker.expand_and_correct(raw_tokens) if use_synonyms else raw_tokens

        # 3. Compute Cosine Similarity ranking
        ranked_scores = self.tfidf_engine.cosine_similarity(query_tokens)

        # 4. Format top-k results
        results: List[Dict[str, Any]] = []
        for doc_id, score in ranked_scores[:k]:
            doc_meta = self.index.get_document(doc_id)
            if not doc_meta:
                continue

            snippet = self.generate_snippet(doc_meta.get("raw_text", ""), raw_tokens)

            results.append({
                "doc_id": doc_id,
                "title": doc_meta.get("title", doc_id),
                "score": score,
                "snippet": snippet,
                "source": doc_meta.get("source", "Medical First Aid Guide"),
                "url": doc_meta.get("url", "")
            })

        return results


# Global singleton instance for easy module-level access
_searcher_instance: Optional[FirstAidSearcher] = None


def get_searcher() -> FirstAidSearcher:
    """Singleton getter for FirstAidSearcher."""
    global _searcher_instance
    if _searcher_instance is None:
        _searcher_instance = FirstAidSearcher()
    return _searcher_instance


def search(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """Module-level search function conforming to contracts.py."""
    return get_searcher().search(query=query, k=k)


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    searcher = FirstAidSearcher()

    queries = [
        "اتحرقت بمية سخنة في ايدي وطلعت فقاعات",
        "how to perform heimlich maneuver on choking victim?",
        "صاحبي بينزف دم كتير من رجله",
        "buring sensation with water"  # typo test!
    ]

    for q in queries:
        print(f"\n==========================================")
        print(f"Query: '{q}'")
        res = searcher.search(q, k=2)
        for i, r in enumerate(res, 1):
            print(f"  [{i}] Title  : {r['title']} (Score: {r['score']})")
            print(f"      Source : {r['source']}")
            print(f"      Snippet: {r['snippet']}")
