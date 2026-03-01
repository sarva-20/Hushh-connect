from typing import List, Dict, Any
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# -----------------------------
# LLM Client Initialization
# -----------------------------

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

if not NVIDIA_API_KEY:
    raise ValueError("NVIDIA_API_KEY not set in environment variables.")

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY,
)

MODEL_NAME = "meta/llama-3.3-70b-instruct"


# -----------------------------
# Helper: Safe LLM Call
# -----------------------------

def _call_llm(messages: List[Dict[str, str]], temperature: float = 0.4) -> str:
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=temperature,
            top_p=0.7,
            max_tokens=700,
            stream=False,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        return f"LLM_ERROR: {str(e)}"


# -----------------------------
# Gig Enhancement
# -----------------------------

def enhance_gig_post(title: str, raw_description: str, skills: List[str]) -> Dict[str, Any]:

    prompt = f"""
You are an assistant that rewrites student gig posts professionally.

Rewrite the following into a clean, structured gig description.
Include:
- Clear overview
- Deliverables
- Required skills
- Expected outcome

Title: {title}
Raw Description: {raw_description}
Skills: {", ".join(skills)}

Return only the final improved description.
"""

    response = _call_llm(
        [
            {"role": "system", "content": "You are a professional gig writing assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )

    return {
        "enhanced_description": response
    }


# -----------------------------
# Price Suggestion
# -----------------------------

def suggest_price(title: str, description: str, skills: List[str]) -> Dict[str, Any]:

    prompt = f"""
You are an assistant that suggests fair student gig pricing in INR.

Analyze the gig and return ONLY valid JSON in this format:

{{
  "pricing_options": [
    {{
      "label": "Budget",
      "price": number,
      "reasoning": "short explanation"
    }},
    {{
      "label": "Standard",
      "price": number,
      "reasoning": "short explanation"
    }},
    {{
      "label": "Premium",
      "price": number,
      "reasoning": "short explanation"
    }}
  ]
}}

Guidelines:
- Prices must be realistic for Indian college students.
- Budget = lower range.
- Standard = fair typical rate.
- Premium = higher quality/fast delivery.

Title: {title}
Description: {description}
Skills: {", ".join(skills)}
"""

    response = _call_llm(
        [
            {"role": "system", "content": "You are a pricing assistant for student micro-gigs."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    try:
        parsed = json.loads(response)

        MIN_PRICE = 200
        MAX_PRICE = 5000

        for option in parsed.get("pricing_options", []):
            price = float(option.get("price", 500))
            price = max(MIN_PRICE, min(price, MAX_PRICE))
            option["price"] = price

        return parsed

    except Exception:
        # Safe fallback
        return {
            "pricing_options": [
                {
                    "label": "Budget",
                    "price": 400,
                    "reasoning": "Basic implementation."
                },
                {
                    "label": "Standard",
                    "price": 800,
                    "reasoning": "Balanced quality and delivery."
                },
                {
                    "label": "Premium",
                    "price": 1500,
                    "reasoning": "Advanced implementation with faster turnaround."
                }
            ]
        }