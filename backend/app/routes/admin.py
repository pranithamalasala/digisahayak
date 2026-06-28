from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import (
    User, Course, QuizAttempt, Certificate,
    Workshop, WorkshopRegistration, DiscussionPost
)
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    total_users = User.query.filter_by(role="learner").count()
    active_users = User.query.filter_by(role="learner", is_active=True).count()
    total_certs = Certificate.query.count()
    total_workshops = Workshop.query.count()
    quiz_attempts = QuizAttempt.query.count()
    passed_attempts = QuizAttempt.query.filter_by(passed=True).count()

    avg_score = db.session.query(
        db.func.avg(QuizAttempt.percentage)
    ).scalar() or 0

    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "total_certificates": total_certs,
        "total_workshops": total_workshops,
        "quiz_attempts": quiz_attempts,
        "pass_rate": round(passed_attempts / quiz_attempts * 100, 1) if quiz_attempts else 0,
        "average_score": round(avg_score, 1),
    })


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "")

    q = User.query.filter_by(role="learner")
    if search:
        q = q.filter(
            db.or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )
    users = q.order_by(User.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        "users": [u.to_dict() for u in users.items],
        "total": users.total,
        "pages": users.pages,
    })


@admin_bp.route("/users/<int:user_id>/toggle", methods=["PUT"])
@admin_required
def toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    status = "activated" if user.is_active else "deactivated"
    return jsonify({"message": f"User {status}", "is_active": user.is_active})


@admin_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_post(post_id):
    post = DiscussionPost.query.get_or_404(post_id)
    post.is_active = False
    db.session.commit()
    return jsonify({"message": "Post removed"})
