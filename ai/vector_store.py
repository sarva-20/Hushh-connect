from __future__ import annotations

from typing import Dict, Iterable, List, Optional

from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------------------------
# Vectorizer Configurations
# ---------------------------

DESCRIPTION_PARAMS = {
    "stop_words": "english",
    "ngram_range": (1, 2),
    "max_features": 3000,
}

SKILL_PARAMS = {
    "stop_words": "english",
    "ngram_range": (1, 2),
    "max_features": 1000,  # smaller vocab for short skill keywords
}


# ---------------------------
# In-Memory Vector Stores
# ---------------------------

user_description_vectors: Dict[str, csr_matrix] = {}
gig_description_vectors: Dict[str, csr_matrix] = {}
user_skill_vectors: Dict[str, csr_matrix] = {}
gig_skill_vectors: Dict[str, csr_matrix] = {}


# ---------------------------
# Global Vectorizers
# ---------------------------

_description_vectorizer: Optional[TfidfVectorizer] = None
_skill_vectorizer: Optional[TfidfVectorizer] = None


# ---------------------------
# Utility Helpers
# ---------------------------

def _normalize_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip().lower()
    return str(value).strip().lower()


def _join_terms(terms: object) -> str:
    if not isinstance(terms, Iterable) or isinstance(terms, (str, bytes)):
        return ""

    normalized = [_normalize_text(term) for term in terms]
    return " ".join(term for term in normalized if term)


# ---------------------------
# Rebuild Vector Store
# ---------------------------

def rebuild_vector_store(users: List[dict], gigs: List[dict]) -> None:
    """
    Rebuild TF-IDF vectors for:
        - user descriptions
        - gig descriptions
        - user skills
        - gig skills

    Must be triggered when:
        - new gig created
        - user updates description
        - user updates skills
        - new user signs up
    """

    global _description_vectorizer, _skill_vectorizer

    # Clear previous vectors
    user_description_vectors.clear()
    gig_description_vectors.clear()
    user_skill_vectors.clear()
    gig_skill_vectors.clear()

    # Extract IDs
    user_ids = [_normalize_text(user.get("id")) for user in users]
    gig_ids = [_normalize_text(gig.get("id")) for gig in gigs]

    # Extract text fields
    user_descriptions = [_normalize_text(user.get("description")) for user in users]
    gig_descriptions = [_normalize_text(gig.get("description")) for gig in gigs]

    user_skills = [_join_terms(user.get("skills", [])) for user in users]
    gig_skills = [_join_terms(gig.get("skill_tags", [])) for gig in gigs]

    # ---------------------------
    # Description Vectorizer
    # ---------------------------

    description_corpus = user_descriptions + gig_descriptions
    if not any(text.strip() for text in description_corpus):
        description_corpus = ["placeholder"]

    _description_vectorizer = TfidfVectorizer(**DESCRIPTION_PARAMS)
    _description_vectorizer.fit(description_corpus)

    user_desc_matrix = _description_vectorizer.transform(user_descriptions)
    gig_desc_matrix = _description_vectorizer.transform(gig_descriptions)

    # ---------------------------
    # Skill Vectorizer
    # ---------------------------

    skill_corpus = user_skills + gig_skills
    if not any(text.strip() for text in skill_corpus):
        skill_corpus = ["placeholder"]

    _skill_vectorizer = TfidfVectorizer(**SKILL_PARAMS)
    _skill_vectorizer.fit(skill_corpus)

    user_skill_matrix = _skill_vectorizer.transform(user_skills)
    gig_skill_matrix = _skill_vectorizer.transform(gig_skills)

    # ---------------------------
    # Store Sparse Vectors
    # ---------------------------

    for idx, user_id in enumerate(user_ids):
        if user_id:
            user_description_vectors[user_id] = user_desc_matrix[idx]
            user_skill_vectors[user_id] = user_skill_matrix[idx]

    for idx, gig_id in enumerate(gig_ids):
        if gig_id:
            gig_description_vectors[gig_id] = gig_desc_matrix[idx]
            gig_skill_vectors[gig_id] = gig_skill_matrix[idx]


# ---------------------------
# Vector Accessors
# ---------------------------

def get_user_description_vector(user_id: str) -> Optional[csr_matrix]:
    return user_description_vectors.get(user_id)


def get_gig_description_vector(gig_id: str) -> Optional[csr_matrix]:
    return gig_description_vectors.get(gig_id)


def get_user_skill_vector(user_id: str) -> Optional[csr_matrix]:
    return user_skill_vectors.get(user_id)


def get_gig_skill_vector(gig_id: str) -> Optional[csr_matrix]:
    return gig_skill_vectors.get(gig_id)


# ---------------------------
# Cosine Similarity
# ---------------------------

def cosine_sim(vec1: Optional[csr_matrix], vec2: Optional[csr_matrix]) -> float:
    if vec1 is None or vec2 is None:
        return 0.0
    return float(cosine_similarity(vec1, vec2)[0][0])


# ---------------------------
# Readiness Check
# ---------------------------

def is_vector_store_ready() -> bool:
    return _description_vectorizer is not None and _skill_vectorizer is not None