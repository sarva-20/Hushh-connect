from __future__ import annotations

from typing import Dict, List, Optional

from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


VECTOR_PARAMS = {
    "stop_words": "english",
    "ngram_range": (1, 2),
    "max_features": 3000,
}


# -----------------------------------
# Global Stores
# -----------------------------------

user_description_vectors: Dict[str, csr_matrix] = {}
gig_description_vectors: Dict[str, csr_matrix] = {}
user_skill_vectors: Dict[str, csr_matrix] = {}
gig_skill_vectors: Dict[str, csr_matrix] = {}

_user_skill_matrix: Optional[csr_matrix] = None
_user_description_matrix: Optional[csr_matrix] = None
_gig_skill_matrix: Optional[csr_matrix] = None
_gig_description_matrix: Optional[csr_matrix] = None

_user_id_order: List[str] = []
_gig_id_order: List[str] = []

_vectorizer: Optional[TfidfVectorizer] = None


# -----------------------------------
# Helpers
# -----------------------------------

def _normalize_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _join_terms(terms: object) -> str:
    if not isinstance(terms, list):
        return ""
    return " ".join(_normalize_text(term) for term in terms if _normalize_text(term))


# -----------------------------------
# Core Rebuild Function
# -----------------------------------

def rebuild_vector_store(users: List[dict], gigs: List[dict]) -> None:
    global _vectorizer
    global _user_skill_matrix, _gig_skill_matrix
    global _user_description_matrix, _gig_description_matrix
    global _user_id_order, _gig_id_order

    user_description_vectors.clear()
    gig_description_vectors.clear()
    user_skill_vectors.clear()
    gig_skill_vectors.clear()

    _user_id_order = [_normalize_text(user.get("id")) for user in users]
    _gig_id_order = [_normalize_text(gig.get("id")) for gig in gigs]

    user_descriptions = [_normalize_text(user.get("description")) for user in users]
    gig_descriptions = [_normalize_text(gig.get("description")) for gig in gigs]

    user_skills = [_join_terms(user.get("skills", [])) for user in users]
    gig_skills = [_join_terms(gig.get("skill_tags", [])) for gig in gigs]

    combined_corpus = user_descriptions + gig_descriptions + user_skills + gig_skills

    corpus_for_fit = combined_corpus if any(text.strip() for text in combined_corpus) else ["placeholder"]

    _vectorizer = TfidfVectorizer(**VECTOR_PARAMS)
    _vectorizer.fit(corpus_for_fit)

    _user_description_matrix = _vectorizer.transform(user_descriptions)
    _gig_description_matrix = _vectorizer.transform(gig_descriptions)
    _user_skill_matrix = _vectorizer.transform(user_skills)
    _gig_skill_matrix = _vectorizer.transform(gig_skills)

    # Store row vectors individually for direct access
    for idx, user_id in enumerate(_user_id_order):
        if user_id:
            user_description_vectors[user_id] = _user_description_matrix[idx]
            user_skill_vectors[user_id] = _user_skill_matrix[idx]

    for idx, gig_id in enumerate(_gig_id_order):
        if gig_id:
            gig_description_vectors[gig_id] = _gig_description_matrix[idx]
            gig_skill_vectors[gig_id] = _gig_skill_matrix[idx]


# -----------------------------------
# Getters
# -----------------------------------

def is_vector_store_ready() -> bool:
    return _vectorizer is not None


def get_user_description_vector(user_id: str) -> Optional[csr_matrix]:
    return user_description_vectors.get(user_id)


def get_gig_description_vector(gig_id: str) -> Optional[csr_matrix]:
    return gig_description_vectors.get(gig_id)


def get_user_skill_vector(user_id: str) -> Optional[csr_matrix]:
    return user_skill_vectors.get(user_id)


def get_gig_skill_vector(gig_id: str) -> Optional[csr_matrix]:
    return gig_skill_vectors.get(gig_id)


def get_user_skill_matrix() -> Optional[csr_matrix]:
    return _user_skill_matrix


def get_gig_skill_matrix() -> Optional[csr_matrix]:
    return _gig_skill_matrix


def get_user_id_order() -> List[str]:
    return _user_id_order


def get_gig_id_order() -> List[str]:
    return _gig_id_order


# -----------------------------------
# Cosine Utility
# -----------------------------------

def cosine_sim(vec1: Optional[csr_matrix], vec2: Optional[csr_matrix]) -> float:
    if vec1 is None or vec2 is None:
        return 0.0
    return float(cosine_similarity(vec1, vec2)[0][0])