from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Course, Lesson, Progress

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/", methods=["GET"])
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    courses = Course.query.filter_by(is_published=True).order_by(Course.order_index).all()

    result = []
    for course in courses:
        course_dict = course.to_dict()
        total = len(course.lessons)
        if total > 0:
            done = Progress.query.filter_by(user_id=user_id, completed=True)\
                .filter(Progress.lesson_id.in_([l.id for l in course.lessons])).count()
            course_dict["progress"] = round(done / total * 100)
            course_dict["completed_lessons"] = done
        else:
            course_dict["progress"] = 0
            course_dict["completed_lessons"] = 0
        result.append(course_dict)

    return jsonify(result)


@courses_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def get_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get_or_404(course_id)
    data = course.to_dict()
    data["lessons"] = [l.to_dict() for l in course.lessons]

    completed_ids = {
        p.lesson_id for p in
        Progress.query.filter_by(user_id=user_id, completed=True).all()
    }
    for lesson in data["lessons"]:
        lesson["completed"] = lesson["id"] in completed_ids

    total = len(data["lessons"])
    done = len([l for l in data["lessons"] if l["completed"]])
    data["progress"] = round(done / total * 100) if total else 0
    return jsonify(data)


@courses_bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    from app.models import User
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    course = Course(
        title=data["title"],
        description=data.get("description"),
        category=data.get("category"),
        emoji=data.get("emoji", "📚"),
        difficulty=data.get("difficulty", "beginner"),
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@courses_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def update_course(course_id):
    from app.models import User
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    course = Course.query.get_or_404(course_id)
    data = request.get_json()

    for field in ["title", "description", "category", "emoji", "difficulty", "is_published"]:
        if field in data:
            setattr(course, field, data[field])

    db.session.commit()
    return jsonify(course.to_dict())
