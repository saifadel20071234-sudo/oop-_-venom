"""
ir/tfidf.py - TF-IDF Vector Space Model & Cosine Similarity (From Scratch)
==========================================================================
Computes Term Frequency (TF), Inverse Document Frequency (IDF),
document and query vectors, and Cosine Similarity without any external ML libraries.
"""

import math
import os
import sys
from typing import Dict, List, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ir.inverted_index import InvertedIndex


class TfidfEngine:
    """
    Computes TF-IDF representations and Cosine Similarity over an InvertedIndex.
    
    Formulas:
        TF(t, d)  = count(t, d) / total_tokens_in_doc(d)
        IDF(t)    = log10( (1 + N) / (1 + DF(t)) ) + 1   (Smooth IDF)
        TF-IDF    = TF(t, d) * IDF(t)
        CosineSim = (V_q . V_d) / ( ||V_q|| * ||V_d|| )
    """

    def __init__(self, index: InvertedIndex):
        self.index = index
        # Cache for IDFs: term -> idf value
        self.idf_cache: Dict[str, float] = {}
        # Precomputed document vector norms: doc_id -> Euclidean norm
        self.doc_vector_norms: Dict[str, float] = {}
        # Precomputed document TF-IDF weights: doc_id -> {term: tfidf}
        self.doc_weights: Dict[str, Dict[str, float]] = {}

        self.recompute_model()

    def compute_idf(self, term: str) -> float:
        """
        Compute Inverse Document Frequency (IDF) for a term using Smooth IDF.
        IDF(t) = log10( (1 + N) / (1 + DF(t)) ) + 1.0
        """
        N = self.index.total_documents
        if N == 0:
            return 0.0

        postings = self.index.get_postings(term)
        df = len(postings)

        # Smooth IDF formulation (standard in Lucene / Information Retrieval)
        idf = math.log10((1.0 + N) / (1.0 + df)) + 1.0
        return idf

    def recompute_model(self) -> None:
        """Precompute IDFs for all vocabulary terms and TF-IDF vectors for all documents."""
        self.idf_cache.clear()
        self.doc_weights.clear()
        self.doc_vector_norms.clear()

        # 1. Compute IDFs for all unique terms
        for term in self.index.index.keys():
            self.idf_cache[term] = self.compute_idf(term)

        # 2. Compute TF-IDF weights for each document
        for doc_id, doc_meta in self.index.documents.items():
            doc_len = self.index.doc_token_counts.get(doc_id, 1)
            if doc_len == 0:
                doc_len = 1

            self.doc_weights[doc_id] = {}
            sum_sq = 0.0

            # Iterate over terms present in this document
            for term, postings in self.index.index.items():
                if doc_id in postings:
                    raw_tf = postings[doc_id]["tf"]
                    # Normalized TF
                    tf = raw_tf / doc_len
                    idf = self.idf_cache.get(term, 1.0)
                    weight = tf * idf

                    self.doc_weights[doc_id][term] = weight
                    sum_sq += weight * weight

            # Euclidean norm ||V_d||
            self.doc_vector_norms[doc_id] = math.sqrt(sum_sq)

    def compute_query_vector(self, query_tokens: List[str]) -> Tuple[Dict[str, float], float]:
        """
        Compute TF-IDF vector and Euclidean norm for a tokenized query.
        Returns (query_weights_dict, query_norm).
        """
        if not query_tokens:
            return {}, 0.0

        # Query TF (raw count / total query length)
        q_len = len(query_tokens)
        counts: Dict[str, int] = {}
        for token in query_tokens:
            counts[token] = counts.get(token, 0) + 1

        query_weights: Dict[str, float] = {}
        sum_sq = 0.0

        for token, raw_count in counts.items():
            tf = raw_count / q_len
            idf = self.idf_cache.get(token, self.compute_idf(token))
            weight = tf * idf
            query_weights[token] = weight
            sum_sq += weight * weight

        query_norm = math.sqrt(sum_sq)
        return query_weights, query_norm

    def cosine_similarity(self, query_tokens: List[str]) -> List[Tuple[str, float]]:
        """
        Calculate Cosine Similarity between the query vector and all document vectors.
        Returns list of (doc_id, score) sorted descending by score.
        """
        q_weights, q_norm = self.compute_query_vector(query_tokens)
        if q_norm == 0.0:
            return []

        scores: List[Tuple[str, float]] = []

        for doc_id, doc_norm in self.doc_vector_norms.items():
            if doc_norm == 0.0:
                continue

            # Dot product (V_q . V_d)
            dot_product = 0.0
            d_weights = self.doc_weights.get(doc_id, {})

            for token, q_weight in q_weights.items():
                if token in d_weights:
                    dot_product += q_weight * d_weights[token]

            if dot_product > 0.0:
                cosine_sim = dot_product / (q_norm * doc_norm)
                scores.append((doc_id, round(cosine_sim, 4)))

        # Sort descending by similarity score
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    idx = InvertedIndex()
    idx.build_from_directory("data/guides")

    engine = TfidfEngine(idx)

    print("=== Testing Cosine Similarity on English Query ===")
    q1 = idx.preprocessor.preprocess("how to stop bleeding from cuts?")
    print("Query Tokens:", q1)
    results1 = engine.cosine_similarity(q1)
    print("Ranked Results:", results1)

    print("\n=== Testing Cosine Similarity on Arabic Query ===")
    q2 = idx.preprocessor.preprocess("علاج الحروق بالماء البارد")
    print("Query Tokens:", q2)
    results2 = engine.cosine_similarity(q2)
    print("Ranked Results:", results2)
