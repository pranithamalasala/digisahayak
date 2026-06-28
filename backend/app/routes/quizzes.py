from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import QuizQuestion, QuizAttempt, Course
import random

quizzes_bp = Blueprint("quizzes", __name__)


@quizzes_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_quiz(course_id):
    Course.query.get_or_404(course_id)
    questions = QuizQuestion.query.filter_by(course_id=course_id).all()
    if not questions:
        return jsonify({"error": "No questions found for this course"}), 404

    random.shuffle(questions)
    return jsonify([q.to_dict() for q in questions[:10]])  # max 10


@quizzes_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_quiz():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    course_id = data.get("course_id")
    answers = data.get("answers", {})  # {question_id: "A"}

    if not course_id or not answers:
        return jsonify({"error": "course_id and answers required"}), 400

    results = []
    score = 0
    for qid_str, user_ans in answers.items():
        q = QuizQuestion.query.get(int(qid_str))
        if not q:
            continue
        correct = q.correct_answer == user_ans.upper()
        if correct:
            score += 1
        results.append({
            "question_id": q.id,
            "question": q.question,
            "your_answer": user_ans,
            "correct_answer": q.correct_answer,
            "correct": correct,
            "explanation": q.explanation,
        })

    total = len(results)
    pct = round(score / total * 100, 1) if total else 0
    passed = pct >= 60

    attempt = QuizAttempt(
        user_id=user_id,
        course_id=course_id,
        score=score,
        total_questions=total,
        percentage=pct,
        passed=passed,
    )
    db.session.add(attempt)
    db.session.commit()

    return jsonify({
        "score": score,
        "total": total,
        "percentage": pct,
        "passed": passed,
        "results": results,
    })


@quizzes_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    attempts = QuizAttempt.query.filter_by(user_id=user_id)\
        .order_by(QuizAttempt.attempted_at.desc()).limit(20).all()
    return jsonify([a.to_dict() for a in attempts])


@quizzes_bp.route("/question", methods=["POST"])
@jwt_required()
def add_question():
    from app.models import User
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    q = QuizQuestion(
        lesson_id=data["lesson_id"],
        course_id=data["course_id"],
        question=data["question"],
        option_a=data["option_a"],
        option_b=data["option_b"],
        option_c=data.get("option_c"),
        option_d=data.get("option_d"),
        correct_answer=data["correct_answer"].upper(),
        explanation=data.get("explanation"),
    )
    db.session.add(q)
    db.session.commit()
    return jsonify(q.to_dict_with_answer()), 201
