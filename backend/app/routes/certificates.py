from flask import Blueprint, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Certificate, Course, User
from io import BytesIO
from datetime import datetime

certificates_bp = Blueprint("certificates", __name__)


@certificates_bp.route("/", methods=["GET"])
@jwt_required()
def get_certificates():
    user_id = int(get_jwt_identity())
    certs = Certificate.query.filter_by(user_id=user_id)\
        .order_by(Certificate.issued_date.desc()).all()
    return jsonify([c.to_dict() for c in certs])


@certificates_bp.route("/<int:cert_id>/download", methods=["GET"])
@jwt_required()
def download_certificate(cert_id):
    user_id = int(get_jwt_identity())
    cert = Certificate.query.get_or_404(cert_id)

    if cert.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    pdf_bytes = generate_certificate_pdf(cert)
    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = (
        f'attachment; filename="certificate-{cert.certificate_number}.pdf"'
    )
    return response


@certificates_bp.route("/verify/<string:cert_number>", methods=["GET"])
def verify_certificate(cert_number):
    cert = Certificate.query.filter_by(certificate_number=cert_number).first()
    if not cert:
        return jsonify({"valid": False, "message": "Certificate not found"}), 404
    return jsonify({
        "valid": True,
        "certificate_number": cert.certificate_number,
        "user_name": cert.user.name,
        "course_title": cert.course.title,
        "issued_date": cert.issued_date.strftime("%B %d, %Y"),
    })


def generate_certificate_pdf(cert: Certificate) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.pdfgen import canvas

        buf = BytesIO()
        w, h = landscape(A4)
        c = canvas.Canvas(buf, pagesize=(w, h))

        # Background gradient feel
        c.setFillColorRGB(0.06, 0.32, 0.20)
        c.rect(0, 0, w, h, fill=True, stroke=False)

        # White inner box
        margin = 30
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(margin, margin, w - 2*margin, h - 2*margin, 16, fill=True, stroke=False)

        # Green top banner
        c.setFillColorRGB(0.06, 0.32, 0.20)
        c.rect(margin, h - margin - 80, w - 2*margin, 80, fill=True, stroke=False)

        # Banner text
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(w/2, h - margin - 45, "DigiSahayak – Digital Literacy for Community Empowerment")
        c.setFont("Helvetica", 13)
        c.drawCentredString(w/2, h - margin - 65, "Certificate of Completion")

        # Seal circle
        c.setFillColorRGB(0.08, 0.40, 0.60)
        c.circle(margin + 70, margin + 70, 50, fill=True, stroke=False)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(margin + 70, margin + 75, "VERIFIED")
        c.drawCentredString(margin + 70, margin + 63, "DIGITAL")
        c.drawCentredString(margin + 70, margin + 51, "CERTIFICATE")

        # Body
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica", 14)
        c.drawCentredString(w/2, h - margin - 130, "This is to certify that")

        c.setFillColorRGB(0.06, 0.32, 0.20)
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(w/2, h - margin - 180, cert.user.name)

        # Underline
        name_w = c.stringWidth(cert.user.name, "Helvetica-Bold", 36)
        c.setStrokeColorRGB(0.06, 0.32, 0.20)
        c.setLineWidth(2)
        c.line(w/2 - name_w/2, h - margin - 185, w/2 + name_w/2, h - margin - 185)

        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica", 14)
        c.drawCentredString(w/2, h - margin - 220, "has successfully completed the course")

        c.setFillColorRGB(0.08, 0.40, 0.60)
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(w/2, h - margin - 265, cert.course.title)

        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica", 12)
        c.drawCentredString(w/2, h - margin - 300, "offered by DigiSahayak Community Empowerment Platform")

        # Bottom info
        issued = cert.issued_date.strftime("%B %d, %Y")
        c.setFont("Helvetica-Bold", 11)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        c.drawString(margin + 100, margin + 50, f"Date of Issue: {issued}")
        c.drawString(margin + 100, margin + 32, f"Certificate ID: {cert.certificate_number}")

        c.setFont("Helvetica", 10)
        c.setFillColorRGB(0.5, 0.5, 0.5)
        c.drawRightString(w - margin - 20, margin + 20,
                          "Verify at: digisahayak.in/verify/" + cert.certificate_number)

        c.save()
        buf.seek(0)
        return buf.read()

    except ImportError:
        # Fallback minimal PDF
        buf = BytesIO()
        buf.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n")
        buf.seek(0)
        return buf.read()
