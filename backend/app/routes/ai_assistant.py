from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import requests

ai_bp = Blueprint("ai", __name__)

SYSTEM_PROMPT = """You are Sahayak AI, a friendly digital literacy assistant for DigiSahayak — 
a community empowerment platform in India. You help rural and semi-urban users learn digital skills.

You support THREE languages: English, Telugu (తెలుగు), and Hindi (हिंदी).
Always detect the user's language and respond in the SAME language they used.

Your expertise covers:
1. UPI payments, PhonePe, GPay, Paytm, BHIM
2. Cyber scam awareness — phishing, OTP fraud, fake KYC, lottery scams
3. Online government services — Aadhaar, DigiLocker, PAN, passport, ration card
4. Basic smartphone usage — WhatsApp, email, apps
5. Password safety and online privacy
6. Digital banking — NEFT, RTGS, IMPS, net banking

Rules:
- Keep answers simple, practical, and beginner-friendly
- Use numbered steps for processes
- Add warning emojis (⚠️) for scam/safety alerts
- Never ask for personal information like OTP, PIN, or Aadhaar number
- Be warm, patient, and encouraging — many users are elderly or first-time smartphone users
- If unsure, say so honestly and suggest calling the official helpline
"""


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()
    language = data.get("language", "en")  # en | te | hi
    history = data.get("history", [])  # [{role, content}]

    if not message:
        return jsonify({"error": "Message is required"}), 400

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"reply": _fallback_response(message, language)}), 200

    # Build messages with history
    messages = []
    for h in history[-6:]:  # last 6 exchanges
        messages.append({"role": h["role"], "content": h["content"]})

    lang_hint = {
        "te": "The user is communicating in Telugu. Respond entirely in Telugu.",
        "hi": "The user is communicating in Hindi. Respond entirely in Hindi.",
    }.get(language, "")

    user_content = f"{lang_hint}\n\n{message}" if lang_hint else message
    messages.append({"role": "user", "content": user_content})

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 600,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            },
            timeout=15,
        )
        resp.raise_for_status()
        reply = resp.json()["content"][0]["text"]
        return jsonify({"reply": reply})

    except requests.exceptions.Timeout:
        return jsonify({"reply": "I'm a bit slow right now. Please try again in a moment!"}), 200
    except Exception as e:
        return jsonify({"reply": _fallback_response(message, language)}), 200


def _fallback_response(message: str, language: str) -> str:
    """Offline keyword-based fallback when API is unavailable."""
    msg = message.lower()
    responses = {
        "en": {
            "upi": "UPI (Unified Payments Interface) lets you send money instantly using your mobile. Download PhonePe or GPay, link your bank account, set a UPI PIN, and you're ready. ⚠️ Never share your UPI PIN with anyone!",
            "scam": "🚨 Common scams: fake 'account blocked' calls, lottery winner messages, OTP requests. Rule #1: Banks NEVER ask for OTP or PIN. Hang up immediately on suspicious calls.",
            "password": "🔐 Strong password tips: use 8+ characters, mix UPPER+lower+numbers+symbols. Never use birthdays. Use different passwords for each account.",
            "aadhaar": "To update Aadhaar online, visit uidai.gov.in → My Aadhaar → Update. You'll need your registered mobile number for OTP verification.",
            "default": "Hello! I'm Sahayak AI. I can help with UPI payments, scam awareness, Aadhaar services, and digital safety. What would you like to know?",
        },
        "te": {
            "upi": "UPI అంటే మీ మొబైల్ ద్వారా వెంటనే డబ్బు పంపే వ్యవస్థ. PhonePe లేదా GPay డౌన్‌లోడ్ చేయండి. ⚠️ UPI PIN ఎవరికీ చెప్పకండి!",
            "scam": "🚨 మోసాల జాగ్రత్త: 'Account block' calls, lottery messages, OTP అడగడం — ఇవన్నీ మోసాలు. Bank ఎప్పుడూ OTP అడగదు!",
            "default": "నమస్కారం! నేను సహాయక్ AI. UPI, మోసాలు, Aadhaar గురించి అడగండి!",
        },
        "hi": {
            "upi": "UPI से आप मोबाइल से तुरंत पैसे भेज सकते हैं। PhonePe या GPay डाउनलोड करें। ⚠️ UPI PIN किसी को न बताएं!",
            "scam": "🚨 सावधान: 'खाता बंद होगा' कॉल, लॉटरी मैसेज, OTP मांगना — ये सब धोखा है। बैंक कभी OTP नहीं मांगता!",
            "default": "नमस्ते! मैं सहायक AI हूं। UPI, धोखाधड़ी, आधार के बारे में पूछें!",
        },
    }

    r = responses.get(language, responses["en"])
    for key in ["upi", "scam", "password", "aadhaar"]:
        if key in msg and key in r:
            return r[key]
    return r["default"]
