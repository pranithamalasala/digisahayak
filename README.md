# 🌱 DigiSahayak — Digital Literacy for Community Empowerment

> A full-stack web platform empowering rural and underserved communities in India to learn digital skills, cyber safety, UPI payments, and government services — with a **multilingual AI assistant (English / Telugu / Hindi)**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Flask (Python 3.10+) |
| Database | PostgreSQL 15 |
| Auth | JWT (flask-jwt-extended) |
| AI Assistant | Claude API (Anthropic) |
| Charts | Recharts |
| PDF Certs | ReportLab |
| Icons | Lucide React |

---

## 📁 Folder Structure

```
digisahayak/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models/
│   │   │   └── __init__.py      # All SQLAlchemy models
│   │   └── routes/
│   │       ├── auth.py          # Register, login, profile
│   │       ├── courses.py       # Course CRUD
│   │       ├── lessons.py       # Lesson view + complete
│   │       ├── quizzes.py       # Quiz get/submit/history
│   │       ├── progress.py      # User progress overview
│   │       ├── certificates.py  # Issue + PDF download
│   │       ├── community.py     # Forum posts + replies
│   │       ├── workshops.py     # Events + registration
│   │       ├── admin.py         # Admin dashboard + user mgmt
│   │       └── ai_assistant.py  # 🤖 Multilingual AI chat
│   ├── seed.py                  # Sample data loader
│   ├── run.py                   # Entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── AppLayout.jsx    # Sidebar + Sahayak AI chatbot
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── CourseDetailPage.jsx
    │   │   ├── LessonPage.jsx
    │   │   ├── QuizPage.jsx
    │   │   ├── CertificatesPage.jsx
    │   │   ├── CommunityPage.jsx
    │   │   ├── WorkshopsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── AdminPage.jsx
    │   ├── store/
    │   │   └── authStore.js         # Zustand auth state
    │   ├── utils/
    │   │   └── api.js               # Axios client + all API calls
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

---

### 1. Clone & Setup Backend

```bash
cd digisahayak/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, JWT_SECRET_KEY, ANTHROPIC_API_KEY
```

### 2. Setup PostgreSQL Database

```sql
-- In psql:
CREATE DATABASE digisahayak;
CREATE USER digisahayak_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE digisahayak TO digisahayak_user;
```

Update your `.env`:
```
DATABASE_URL=postgresql://digisahayak_user:yourpassword@localhost:5432/digisahayak
```

### 3. Initialize DB + Load Seed Data

```bash
# Create tables and load sample data
python seed.py
```

Output:
```
✅ Seed data loaded successfully!
   Admin login: admin@digisahayak.in / Admin@1234
   User login:  ravi@example.com / Password@123
   Courses: 4 | Lessons: 18 | Quiz Qs: 10 | Workshops: 4
```

### 4. Run Backend

```bash
python run.py
# API running at: http://localhost:5000
```

---

### 5. Setup Frontend

```bash
cd digisahayak/frontend

npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

npm run dev
# App running at: http://localhost:5173
```

---

## 🤖 AI Assistant Setup (Sahayak AI)

The AI chatbot uses **Claude API** (Anthropic) for multilingual responses.

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to backend `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

**Without API key:** The chatbot falls back to a keyword-based offline response system that still works for common questions.

**Supported languages:** English, Telugu (తెలుగు), Hindi (हिंदी)

**Topics covered:**
- UPI payments & mobile banking
- Scam detection & cyber safety
- Aadhaar & government services
- Password security
- Smartphone basics

---

## 🗄️ Database Schema (Key Tables)

```
users           — id, name, email, password_hash, role, language, village
courses         — id, title, description, category, emoji, difficulty
lessons         — id, course_id, title, content, video_url, order_index
quiz_questions  — id, lesson_id, course_id, question, options A-D, correct_answer
quiz_attempts   — id, user_id, course_id, score, percentage, passed
progress        — id, user_id, lesson_id, completed, completed_at
certificates    — id, user_id, course_id, certificate_number, issued_date
workshops       — id, title, date, location, max_seats
workshop_regs   — id, user_id, workshop_id, attended
discussion_posts  — id, user_id, title, content, category, is_resolved
discussion_replies — id, post_id, user_id, content, is_accepted
notifications   — id, user_id, title, message, type, is_read
```

---

## 🔗 API Endpoints

```
POST   /api/auth/register         Register new user
POST   /api/auth/login            Login → JWT token
GET    /api/auth/me               Get current user
PUT    /api/auth/profile          Update profile

GET    /api/courses/              List all courses with progress
GET    /api/courses/:id           Course detail with lessons

GET    /api/lessons/:id           Single lesson
POST   /api/lessons/:id/complete  Mark lesson complete (→ auto-cert)

GET    /api/quizzes/course/:id    Get quiz questions
POST   /api/quizzes/submit        Submit answers → score + feedback
GET    /api/quizzes/history       Past quiz attempts

GET    /api/progress/             Full progress overview

GET    /api/certificates/         My certificates
GET    /api/certificates/:id/download  Download PDF
GET    /api/certificates/verify/:num   Verify (public)

GET    /api/community/posts       Forum posts (filter/search/paginate)
POST   /api/community/posts       Create post
POST   /api/community/posts/:id/reply  Add reply

GET    /api/workshops/            Upcoming workshops
POST   /api/workshops/:id/register  Register for workshop

POST   /api/ai/chat               🤖 Sahayak AI chat

GET    /api/admin/dashboard       Admin stats
GET    /api/admin/users           User list
PUT    /api/admin/users/:id/toggle  Block/unblock user
```

---

## 🎯 Features at a Glance

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| 4 Learning Modules (18 lessons) | ✅ |
| MCQ Quiz System with instant feedback | ✅ |
| Auto PDF Certificate Generation | ✅ |
| Community Forum (Q&A) | ✅ |
| Workshop Registration | ✅ |
| UPI Payment Simulator | ✅ (in prototype) |
| Password Strength Checker | ✅ (in prototype) |
| **Sahayak AI (EN/TE/HI)** | ✅ **Standout Feature** |
| Admin Dashboard + Analytics | ✅ |
| Dark/Light Mode | ✅ |
| Mobile Responsive | ✅ |
| Role-based Access (Admin/Learner) | ✅ |

---

## 🚀 Deployment

### Backend — Render / Railway

```bash
# Procfile (create in backend/)
web: gunicorn run:app

# Set environment variables in dashboard:
DATABASE_URL=postgresql://...
SECRET_KEY=...
JWT_SECRET_KEY=...
ANTHROPIC_API_KEY=...
FRONTEND_URL=https://yourdomain.vercel.app
```

### Frontend — Vercel

```bash
# In Vercel dashboard:
# Build Command: npm run build
# Output Directory: dist

# Environment variable:
VITE_API_URL=https://your-backend.onrender.com/api
```

### Or Docker Compose

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: digisahayak
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [db]
    env_file: ./backend/.env

  frontend:
    build: ./frontend
    ports: ["5173:5173"]

volumes:
  pgdata:
```

---

## 📊 Sample Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Learner | ravi@example.com | Password@123 |
| Admin | admin@digisahayak.in | Admin@1234 |

---

## 🎓 Academic Project Notes

This project demonstrates:
- **Full-stack architecture** — Flask REST API + React SPA
- **JWT authentication** with role-based access control
- **Database design** — 12 relational tables with proper foreign keys
- **AI integration** — Production Claude API with multilingual support + offline fallback
- **PDF generation** — Dynamic certificate creation with ReportLab
- **Responsive design** — Mobile-first Tailwind CSS
- **State management** — Zustand for client-side auth state
- **Community feature** — Forum with upvoting, resolution tracking
- **Real-world impact** — Targets digital divide in rural India

---

Built with ❤️ for rural communities · DigiSahayak 2025
