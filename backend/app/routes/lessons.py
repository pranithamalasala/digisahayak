from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Lesson, Progress
from datetime import datetime

lessons_bp = Blueprint("lessons", __name__)


@lessons_bp.route("/<int:lesson_id>", methods=["GET"])
@jwt_required()
def get_lesson(lesson_id):
    user_id = int(get_jwt_identity())
    lesson = Lesson.query.get_or_404(lesson_id)
    data = lesson.to_dict()

    prog = Progress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    data["completed"] = prog.completed if prog else False
    return jsonify(data)


@lessons_bp.route("/<int:lesson_id>/complete", methods=["POST"])
@jwt_required()
def complete_lesson(lesson_id):
    user_id = int(get_jwt_identity())
    lesson = Lesson.query.get_or_404(lesson_id)

    prog = Progress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not prog:
        prog = Progress(user_id=user_id, lesson_id=lesson_id)
        db.session.add(prog)

    prog.completed = True
    prog.completed_at = datetime.utcnow()
    db.session.commit()

    # Check if entire course is now complete → issue certificate
    course = lesson.course
    total = len(course.lessons)
    done = Progress.query.filter_by(user_id=user_id, completed=True)\
        .filter(Progress.lesson_id.in_([l.id for l in course.lessons])).count()

    cert_issued = False
    if done == total:
        from app.models import Certificate
        existing = Certificate.query.filter_by(user_id=user_id, course_id=course.id).first()
        if not existing:
            cert = Certificate(
                user_id=user_id,
                course_id=course.id,
                certificate_number=Certificate.generate_number(course.id)
            )
            db.session.add(cert)
            db.session.commit()
            cert_issued = True

    return jsonify({
        "message": "Lesson marked complete",
        "progress": round(done / total * 100) if total else 0,
        "certificate_issued": cert_issued
    })


@lessons_bp.route("/", methods=["POST"])
@jwt_required()
def create_lesson():
    from app.models import User
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    lesson = Lesson(
        course_id=data["course_id"],
        title=data["title"],
        content=data.get("content"),
        video_url=data.get("video_url"),
        duration_minutes=data.get("duration_minutes", 10),
        order_index=data.get("order_index", 0),
    )
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson.to_dict()), 201
