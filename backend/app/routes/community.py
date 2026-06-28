from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import DiscussionPost, DiscussionReply

community_bp = Blueprint("community", __name__)


@community_bp.route("/posts", methods=["GET"])
@jwt_required()
def get_posts():
    page = request.args.get("page", 1, type=int)
    category = request.args.get("category")
    search = request.args.get("search", "")
    resolved = request.args.get("resolved")

    q = DiscussionPost.query.filter_by(is_active=True)
    if category:
        q = q.filter_by(category=category)
    if search:
        q = q.filter(DiscussionPost.title.ilike(f"%{search}%"))
    if resolved is not None:
        q = q.filter_by(is_resolved=(resolved == "true"))

    posts = q.order_by(DiscussionPost.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return jsonify({
        "posts": [p.to_dict() for p in posts.items],
        "total": posts.total,
        "pages": posts.pages,
        "current_page": page,
    })


@community_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data.get("title") or not data.get("content"):
        return jsonify({"error": "Title and content required"}), 400

    post = DiscussionPost(
        user_id=user_id,
        title=data["title"].strip(),
        content=data["content"].strip(),
        category=data.get("category", "general"),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@community_bp.route("/posts/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    post = DiscussionPost.query.get_or_404(post_id)
    data = post.to_dict()
    data["replies"] = [r.to_dict() for r in post.replies]
    return jsonify(data)


@community_bp.route("/posts/<int:post_id>/reply", methods=["POST"])
@jwt_required()
def add_reply(post_id):
    user_id = int(get_jwt_identity())
    post = DiscussionPost.query.get_or_404(post_id)
    data = request.get_json()

    if not data.get("content"):
        return jsonify({"error": "Content required"}), 400

    reply = DiscussionReply(
        post_id=post_id,
        user_id=user_id,
        content=data["content"].strip(),
    )
    db.session.add(reply)
    db.session.commit()
    return jsonify(reply.to_dict()), 201


@community_bp.route("/posts/<int:post_id>/resolve", methods=["PUT"])
@jwt_required()
def resolve_post(post_id):
    user_id = int(get_jwt_identity())
    post = DiscussionPost.query.get_or_404(post_id)

    if post.user_id != user_id:
        from app.models import User
        user = User.query.get(user_id)
        if user.role != "admin":
            return jsonify({"error": "Unauthorized"}), 403

    post.is_resolved = True
    db.session.commit()
    return jsonify({"message": "Post marked as resolved"})


@community_bp.route("/posts/<int:post_id>/upvote", methods=["POST"])
@jwt_required()
def upvote_post(post_id):
    post = DiscussionPost.query.get_or_404(post_id)
    post.upvotes += 1
    db.session.commit()
    return jsonify({"upvotes": post.upvotes})
