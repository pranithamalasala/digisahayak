from app import db
from datetime import datetime
import bcrypt
import uuid


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="learner")  # learner | admin
    language = db.Column(db.String(10), default="en")
    phone = db.Column(db.String(20))
    village = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    # Relationships
    progress = db.relationship("Progress", backref="user", lazy=True)
    certificates = db.relationship("Certificate", backref="user", lazy=True)
    quiz_attempts = db.relationship("QuizAttempt", backref="user", lazy=True)
    posts = db.relationship("DiscussionPost", backref="user", lazy=True)
    workshop_registrations = db.relationship("WorkshopRegistration", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "language": self.language,
            "phone": self.phone,
            "village": self.village,
            "is_active": self.is_active,
            "email_verified": self.email_verified,
            "created_at": self.created_at.isoformat(),
        }


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    emoji = db.Column(db.String(10), default="📚")
    difficulty = db.Column(db.String(20), default="beginner")
    is_published = db.Column(db.Boolean, default=True)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lessons = db.relationship("Lesson", backref="course", lazy=True, order_by="Lesson.order_index")
    certificates = db.relationship("Certificate", backref="course", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "emoji": self.emoji,
            "difficulty": self.difficulty,
            "lesson_count": len(self.lessons),
            "is_published": self.is_published,
        }


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    duration_minutes = db.Column(db.Integer, default=10)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    quiz_questions = db.relationship("QuizQuestion", backref="lesson", lazy=True)
    progress_records = db.relationship("Progress", backref="lesson", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "content": self.content,
            "video_url": self.video_url,
            "image_url": self.image_url,
            "duration_minutes": self.duration_minutes,
            "order_index": self.order_index,
        }


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(300), nullable=False)
    option_b = db.Column(db.String(300), nullable=False)
    option_c = db.Column(db.String(300))
    option_d = db.Column(db.String(300))
    correct_answer = db.Column(db.String(1), nullable=False)  # A/B/C/D
    explanation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "options": {
                "A": self.option_a,
                "B": self.option_b,
                "C": self.option_c,
                "D": self.option_d,
            },
        }

    def to_dict_with_answer(self):
        d = self.to_dict()
        d["correct_answer"] = self.correct_answer
        d["explanation"] = self.explanation
        return d


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0.0)
    passed = db.Column(db.Boolean, default=False)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": round(self.percentage, 1),
            "passed": self.passed,
            "attempted_at": self.attempted_at.isoformat(),
        }


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)

    __table_args__ = (db.UniqueConstraint("user_id", "lesson_id"),)

    def to_dict(self):
        return {
            "id": self.id,
            "lesson_id": self.lesson_id,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class Certificate(db.Model):
    __tablename__ = "certificates"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    certificate_number = db.Column(db.String(50), unique=True, nullable=False)
    issued_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "certificate_number": self.certificate_number,
            "issued_date": self.issued_date.isoformat(),
            "user_name": self.user.name if self.user else "",
            "course_title": self.course.title if self.course else "",
        }

    @staticmethod
    def generate_number(course_id):
        uid = str(uuid.uuid4())[:8].upper()
        return f"DLC-{course_id:02d}-{uid}"


class Workshop(db.Model):
    __tablename__ = "workshops"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    max_seats = db.Column(db.Integer, default=30)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    registrations = db.relationship("WorkshopRegistration", backref="workshop", lazy=True)

    def to_dict(self):
        enrolled = len(self.registrations)
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat(),
            "location": self.location,
            "max_seats": self.max_seats,
            "enrolled": enrolled,
            "available": self.max_seats - enrolled,
        }


class WorkshopRegistration(db.Model):
    __tablename__ = "workshop_registrations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey("workshops.id"), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    attended = db.Column(db.Boolean, default=False)

    __table_args__ = (db.UniqueConstraint("user_id", "workshop_id"),)


class DiscussionPost(db.Model):
    __tablename__ = "discussion_posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default="general")
    is_resolved = db.Column(db.Boolean, default=False)
    upvotes = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    replies = db.relationship("DiscussionReply", backref="post", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "is_resolved": self.is_resolved,
            "upvotes": self.upvotes,
            "reply_count": len(self.replies),
            "author": self.user.name if self.user else "Unknown",
            "created_at": self.created_at.isoformat(),
        }


class DiscussionReply(db.Model):
    __tablename__ = "discussion_replies"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("discussion_posts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "is_accepted": self.is_accepted,
            "author": self.user.name if self.user else "Unknown",
            "created_at": self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text)
    type = db.Column(db.String(50), default="info")  # info|success|warning
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }
