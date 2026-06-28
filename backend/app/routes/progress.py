from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Progress, Course, QuizAttempt, Certificate, WorkshopRegistration

progress_bp = Blueprint("progress", __name__)


@progress_bp.route("/", methods=["GET"])
@jwt_required()
def get_progress():
    user_id = int(get_jwt_identity())

    courses = Course.query.filter_by(is_published=True).all()
    course_progress = []
    for course in courses:
        total = len(course.lessons)
        if total == 0:
            continue
        done = Progress.query.filter_by(user_id=user_id, completed=True)\
            .filter(Progress.lesson_id.in_([l.id for l in course.lessons])).count()
        course_progress.append({
            "course_id": course.id,
            "course_title": course.title,
            "emoji": course.emoji,
            "total_lessons": total,
            "completed_lessons": done,
            "percentage": round(done / total * 100),
        })

    quiz_attempts = QuizAttempt.query.filter_by(user_id=user_id)\
        .order_by(QuizAttempt.attempted_at.desc()).all()

    certificates = Certificate.query.filter_by(user_id=user_id).all()

    avg_score = 0
    if quiz_attempts:
        avg_score = round(sum(a.percentage for a in quiz_attempts) / len(quiz_attempts), 1)

    return jsonify({
        "courses": course_progress,
        "total_certificates": len(certificates),
        "quiz_attempts": len(quiz_attempts),
        "average_score": avg_score,
        "recent_quizzes": [a.to_dict() for a in quiz_attempts[:5]],
    })
