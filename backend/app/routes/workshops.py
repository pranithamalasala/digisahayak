from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Workshop, WorkshopRegistration
from datetime import datetime

workshops_bp = Blueprint("workshops", __name__)


@workshops_bp.route("/", methods=["GET"])
@jwt_required()
def get_workshops():
    user_id = int(get_jwt_identity())
    workshops = Workshop.query.filter(
        Workshop.is_active == True,
        Workshop.date >= datetime.utcnow()
    ).order_by(Workshop.date).all()

    registered_ids = {
        r.workshop_id for r in
        WorkshopRegistration.query.filter_by(user_id=user_id).all()
    }

    result = []
    for w in workshops:
        d = w.to_dict()
        d["is_registered"] = w.id in registered_ids
        result.append(d)
    return jsonify(result)


@workshops_bp.route("/<int:workshop_id>/register", methods=["POST"])
@jwt_required()
def register_workshop(workshop_id):
    user_id = int(get_jwt_identity())
    workshop = Workshop.query.get_or_404(workshop_id)

    if len(workshop.registrations) >= workshop.max_seats:
        return jsonify({"error": "Workshop is full"}), 400

    existing = WorkshopRegistration.query.filter_by(
        user_id=user_id, workshop_id=workshop_id
    ).first()
    if existing:
        return jsonify({"error": "Already registered"}), 409

    reg = WorkshopRegistration(user_id=user_id, workshop_id=workshop_id)
    db.session.add(reg)
    db.session.commit()
    return jsonify({"message": "Successfully registered!", "workshop": workshop.to_dict()})


@workshops_bp.route("/<int:workshop_id>/unregister", methods=["DELETE"])
@jwt_required()
def unregister_workshop(workshop_id):
    user_id = int(get_jwt_identity())
    reg = WorkshopRegistration.query.filter_by(
        user_id=user_id, workshop_id=workshop_id
    ).first_or_404()
    db.session.delete(reg)
    db.session.commit()
    return jsonify({"message": "Unregistered successfully"})


@workshops_bp.route("/", methods=["POST"])
@jwt_required()
def create_workshop():
    from app.models import User
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    workshop = Workshop(
        title=data["title"],
        description=data.get("description"),
        date=datetime.fromisoformat(data["date"]),
        location=data["location"],
        max_seats=data.get("max_seats", 30),
    )
    db.session.add(workshop)
    db.session.commit()
    return jsonify(workshop.to_dict()), 201
