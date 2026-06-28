"""
Run this once to populate the database with sample data.
Usage: flask shell < seed.py   OR   python seed.py
"""
from app import create_app, db
from app.models import (
    User, Course, Lesson, QuizQuestion,
    Workshop, DiscussionPost, DiscussionReply
)
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Tables created.")

    # ── Admin User ────────────────────────────────────────────────
    admin = User(name="Admin DigiSahayak", email="admin@digisahayak.in",
                 role="admin", email_verified=True)
    admin.set_password("Admin@1234")
    db.session.add(admin)

    # ── Sample Learners ───────────────────────────────────────────
    learners = [
        ("Ravi Kumar", "ravi@example.com", "Nellore"),
        ("Priya Lakshmi", "priya@example.com", "Guntur"),
        ("Suresh Babu", "suresh@example.com", "Vijayawada"),
        ("Radha Krishnan", "radha@example.com", "Tirupati"),
    ]
    for name, email, village in learners:
        u = User(name=name, email=email, village=village, email_verified=True)
        u.set_password("Password@123")
        db.session.add(u)

    # ── Courses ───────────────────────────────────────────────────
    courses_data = [
        ("Digital Basics", "Learn smartphone, internet, and email skills from scratch.",
         "basics", "📱", "beginner", 1),
        ("Cyber Safety", "Stay safe online — passwords, scams, and privacy protection.",
         "safety", "🔒", "beginner", 2),
        ("Digital Payments", "Master UPI, online banking, QR codes, and fraud prevention.",
         "finance", "💳", "intermediate", 3),
        ("Government Services", "Access Aadhaar, DigiLocker, and government portals online.",
         "services", "🏛️", "beginner", 4),
    ]
    course_objs = []
    for title, desc, cat, emoji, diff, order in courses_data:
        c = Course(title=title, description=desc, category=cat,
                   emoji=emoji, difficulty=diff, order_index=order)
        db.session.add(c)
        course_objs.append(c)
    db.session.flush()

    # ── Lessons ───────────────────────────────────────────────────
    lessons_data = {
        0: [  # Digital Basics
            ("Smartphone Navigation", """<h2>Getting Started with Your Smartphone</h2>
<p>A smartphone is a powerful tool. Let's learn the basics:</p>
<ul>
  <li><strong>Home Button</strong> – Takes you to the main screen</li>
  <li><strong>Back Button</strong> – Goes to the previous screen</li>
  <li><strong>Volume Buttons</strong> – Control sound</li>
  <li><strong>Power Button</strong> – Turns screen on/off</li>
</ul>
<h3>Gestures</h3>
<p>Swipe up to unlock, tap to open apps, pinch to zoom in/out.</p>""", 10, 1),
            ("Internet Browsing", """<h2>Browsing the Internet Safely</h2>
<p>Use Google Chrome or Mozilla Firefox to browse. Always look for <strong>https://</strong> in the address bar — the 's' means secure!</p>
<ul>
  <li>Type the website address in the top bar</li>
  <li>Use Google search: go to google.com and type your question</li>
  <li>Avoid clicking on flashing ads that say "You Won!"</li>
</ul>""", 12, 2),
            ("Email Creation", """<h2>Creating Your Gmail Account</h2>
<ol>
  <li>Go to gmail.com</li>
  <li>Click "Create Account"</li>
  <li>Enter your name, choose an email address</li>
  <li>Set a strong password (see Cyber Safety module!)</li>
  <li>Add your mobile number for recovery</li>
</ol>
<p>⚠️ Never share your email password with anyone.</p>""", 15, 3),
            ("Installing Mobile Apps", """<h2>Installing Apps Safely</h2>
<p>Use only <strong>Google Play Store</strong> (Android) or <strong>App Store</strong> (iPhone).</p>
<ol>
  <li>Open Play Store</li>
  <li>Search for the app name</li>
  <li>Tap "Install"</li>
  <li>Check reviews and the publisher name before installing</li>
</ol>
<p>⚠️ Never install apps from unknown websites (APK files).</p>""", 10, 4),
        ],
        1: [  # Cyber Safety
            ("Password Security", """<h2>Creating Strong Passwords</h2>
<p>Your password is your digital lock. Make it strong!</p>
<h3>✅ Good Password Rules:</h3>
<ul>
  <li>At least 8 characters long</li>
  <li>Mix of UPPERCASE + lowercase + numbers + symbols</li>
  <li>Not your name, birthday, or "password"</li>
</ul>
<h3>Example:</h3>
<p><code>MyD0g$N@me!2024</code> — Strong ✅</p>
<p><code>ravi1990</code> — Weak ❌</p>""", 12, 1),
            ("Phishing Detection", """<h2>What is Phishing?</h2>
<p>Phishing is when criminals send fake messages pretending to be your bank or government.</p>
<h3>🚨 Warning Signs:</h3>
<ul>
  <li>Urgent language: "Your account will be BLOCKED in 24 hours!"</li>
  <li>Asks for OTP, PIN, or password</li>
  <li>Link looks slightly wrong: "sbi-banking.fake.com"</li>
  <li>Poor grammar and spelling</li>
</ul>
<p><strong>Rule: Real banks NEVER ask for OTP or PIN!</strong></p>""", 15, 2),
            ("Scam Awareness", """<h2>Common Online Scams in India</h2>
<h3>1. KYC Update Scam</h3>
<p>You receive a call: "Update your KYC or your account will close." They ask for OTP. ❌ SCAM!</p>
<h3>2. Lottery Scam</h3>
<p>"You won ₹50 lakh! Pay ₹500 processing fee." ❌ SCAM!</p>
<h3>3. Job Offer Scam</h3>
<p>"Work from home, earn ₹50,000/month, pay ₹2,000 registration." ❌ SCAM!</p>
<p><strong>If in doubt, call the bank's official number: 1800-XXX-XXXX</strong></p>""", 15, 3),
            ("Privacy Protection", """<h2>Protecting Your Privacy Online</h2>
<ul>
  <li>Don't share your Aadhaar number on social media</li>
  <li>Check app permissions — does a flashlight app need your contacts?</li>
  <li>Use a VPN on public Wi-Fi</li>
  <li>Enable two-factor authentication (2FA) on all accounts</li>
  <li>Regularly review which apps have access to your data</li>
</ul>""", 10, 4),
            ("Safe Social Media", """<h2>Using Social Media Safely</h2>
<ul>
  <li>Set your profile to <strong>Private</strong></li>
  <li>Don't accept friend requests from strangers</li>
  <li>Never share your location publicly</li>
  <li>Think before posting — once online, it's permanent</li>
  <li>Report and block abusive accounts</li>
</ul>""", 12, 5),
        ],
        2: [  # Digital Payments
            ("What is UPI?", """<h2>Understanding UPI</h2>
<p>UPI (Unified Payments Interface) was launched by NPCI in 2016. It lets you send and receive money 24/7 instantly using just a mobile number or UPI ID.</p>
<h3>Popular UPI Apps:</h3>
<ul>
  <li>📱 PhonePe</li>
  <li>📱 Google Pay (GPay)</li>
  <li>📱 Paytm</li>
  <li>📱 BHIM (Government official app)</li>
</ul>""", 15, 1),
            ("Online Banking", """<h2>Internet Banking Basics</h2>
<ol>
  <li>Visit your bank's official website (e.g., sbi.co.in)</li>
  <li>Register for net banking at your branch</li>
  <li>Use your customer ID and password to login</li>
  <li>Always logout after use</li>
  <li>Never use public computers for banking</li>
</ol>
<p>⚠️ Bookmark your bank's URL. Never click links from emails/SMS.</p>""", 15, 2),
            ("QR Code Payments", """<h2>Paying with QR Codes</h2>
<ol>
  <li>Open your UPI app (PhonePe, GPay)</li>
  <li>Tap "Scan QR Code"</li>
  <li>Point camera at the merchant's QR code</li>
  <li>Enter amount and verify merchant name</li>
  <li>Enter UPI PIN and confirm</li>
</ol>
<p>⚠️ You NEVER need to enter PIN to RECEIVE money. Only to SEND.</p>""", 12, 3),
            ("Secure Transactions", """<h2>Safe Online Payment Rules</h2>
<ul>
  <li>✅ Always verify the UPI ID before paying</li>
  <li>✅ Check the amount carefully</li>
  <li>✅ Use only trusted payment apps</li>
  <li>❌ Never share UPI PIN or OTP</li>
  <li>❌ Never scan QR codes sent by unknown people</li>
  <li>❌ Don't pay "advance" for jobs or lottery prizes</li>
</ul>""", 10, 4),
            ("Fraud Prevention", """<h2>How to Report UPI Fraud</h2>
<p>If you've been scammed:</p>
<ol>
  <li>Call your bank immediately: 1800-XXX-XXXX (toll-free)</li>
  <li>File complaint on cybercrime.gov.in</li>
  <li>Call National Cybercrime Helpline: <strong>1930</strong></li>
  <li>Keep all transaction IDs and screenshots as evidence</li>
</ol>""", 10, 5),
        ],
        3: [  # Government Services
            ("Government Portals Guide", """<h2>Important Government Websites</h2>
<ul>
  <li><strong>uidai.gov.in</strong> — Aadhaar services</li>
  <li><strong>digilocker.gov.in</strong> — Digital documents wallet</li>
  <li><strong>incometax.gov.in</strong> — Tax filing</li>
  <li><strong>passportindia.gov.in</strong> — Passport services</li>
  <li><strong>services.india.gov.in</strong> — All government services</li>
</ul>
<p>Always verify URLs end in <strong>.gov.in</strong> for genuine government sites.</p>""", 12, 1),
            ("Applying for Certificates", """<h2>Getting Certificates Online</h2>
<h3>Birth/Death/Caste Certificates:</h3>
<ol>
  <li>Visit your state's e-district portal</li>
  <li>Register with Aadhaar or mobile number</li>
  <li>Fill the application form</li>
  <li>Upload required documents</li>
  <li>Pay fee online (if applicable)</li>
  <li>Download the digitally signed certificate</li>
</ol>""", 15, 2),
            ("DigiLocker & Documents", """<h2>Using DigiLocker</h2>
<p>DigiLocker stores your documents digitally — Aadhaar, PAN, driving license, marksheets, all in one place!</p>
<ol>
  <li>Visit digilocker.gov.in or download the app</li>
  <li>Sign up with Aadhaar-linked mobile number</li>
  <li>Your documents auto-populate from government databases</li>
  <li>Share documents digitally instead of photocopies</li>
</ol>""", 12, 3),
            ("Public Service Access", """<h2>Accessing Public Services Online</h2>
<ul>
  <li><strong>Ration Card</strong> — nfsa.gov.in</li>
  <li><strong>Pension Status</strong> — State pension portals</li>
  <li><strong>PM Kisan</strong> — pmkisan.gov.in</li>
  <li><strong>Health Services</strong> — nha.gov.in (Ayushman Bharat)</li>
  <li><strong>Employment</strong> — ncs.gov.in</li>
</ul>""", 10, 4),
        ],
    }

    lesson_objs = []
    for course_idx, lessons in lessons_data.items():
        for title, content, duration, order in lessons:
            l = Lesson(
                course_id=course_objs[course_idx].id,
                title=title,
                content=content,
                duration_minutes=duration,
                order_index=order,
            )
            db.session.add(l)
            lesson_objs.append((course_objs[course_idx].id, l))
    db.session.flush()

    # ── Quiz Questions ─────────────────────────────────────────────
    quiz_data = [
        # (course_id, lesson_title_keyword, question, A, B, C, D, correct, explanation)
        (2, "Password", "Which is the strongest password?",
         "ravi1990", "MyD0g$N@me!2024", "password123", "12345678", "B",
         "A strong password mixes uppercase, lowercase, numbers, and symbols."),
        (2, "Phishing", "What is phishing?",
         "A type of fishing sport", "Fake messages to steal information",
         "A computer virus", "A payment method", "B",
         "Phishing is when criminals send fake messages pretending to be banks or officials."),
        (2, "Scam", "You receive 'You won ₹50 lakh lottery!' message. What do you do?",
         "Call back immediately", "Pay the processing fee", "Ignore and delete it", "Share with friends", "C",
         "Lottery scam messages should be ignored and deleted. Never pay money to claim a 'prize'."),
        (2, "Phishing", "OTP should be shared with:",
         "Bank customer care (on call)", "Your family member", "Nobody ever", "The person who sent it", "C",
         "OTP is strictly personal. Banks and government agencies never ask for OTP."),
        (1, "Internet", "What does 'https://' mean in a website address?",
         "The site is fast", "The connection is secure", "The site has images", "The site is popular", "B",
         "HTTPS means the website uses encryption to protect your data."),
        (1, "Smartphone", "Which app store should you use to install apps safely?",
         "Any website", "WhatsApp", "Google Play Store or App Store", "Email attachments", "C",
         "Only use official app stores — Google Play Store (Android) or App Store (iPhone)."),
        (3, "UPI", "UPI stands for:",
         "Unified Payments Interface", "Universal Phone Interface",
         "United Payment Inc.", "Unique Pin Identity", "A",
         "UPI = Unified Payments Interface, India's real-time payment system by NPCI."),
        (3, "QR", "When do you enter your UPI PIN?",
         "To receive money", "To check balance only", "To send money", "When downloading the app", "C",
         "UPI PIN is entered only when SENDING money. You never need PIN to receive."),
        (3, "Fraud", "If you are cheated online, you should call:",
         "The person who cheated you", "1930 (National Cybercrime Helpline)",
         "Your friend", "Nobody, it's your loss", "B",
         "1930 is India's National Cybercrime Helpline. Report fraud immediately."),
        (4, "Portals", "Which domain ending confirms a genuine government website?",
         ".com", ".org", ".gov.in", ".net", "C",
         "Official Indian government websites end in .gov.in"),
    ]

    lesson_map = {l.title: l for _, l in lesson_objs}

    for course_idx, keyword, question, a, b, c, d, correct, explain in quiz_data:
        # Find matching lesson
        matching_lesson = None
        for cid, l in lesson_objs:
            if cid == course_objs[course_idx - 1].id and keyword.lower() in l.title.lower():
                matching_lesson = l
                break
        if not matching_lesson:
            matching_lesson = lesson_objs[0][1]

        q = QuizQuestion(
            lesson_id=matching_lesson.id,
            course_id=course_objs[course_idx - 1].id,
            question=question,
            option_a=a, option_b=b, option_c=c, option_d=d,
            correct_answer=correct,
            explanation=explain,
        )
        db.session.add(q)

    # ── Workshops ─────────────────────────────────────────────────
    workshops = [
        ("Mobile Banking Workshop", "Hands-on UPI and net banking training",
         datetime.utcnow() + timedelta(days=2), "Community Hall, Vijayawada", 20),
        ("Cyber Safety Awareness Camp", "Learn to identify scams and stay safe online",
         datetime.utcnow() + timedelta(days=9), "Gram Panchayat Office, Guntur", 40),
        ("DigiLocker & Aadhaar Training", "Access government services digitally",
         datetime.utcnow() + timedelta(days=16), "Public Library, Tirupati", 25),
        ("WhatsApp & Email Basics", "For first-time smartphone users",
         datetime.utcnow() + timedelta(days=23), "Village Center, Nellore", 30),
    ]
    for title, desc, date, loc, seats in workshops:
        w = Workshop(title=title, description=desc, date=date, location=loc, max_seats=seats)
        db.session.add(w)

    # ── Discussion Posts ───────────────────────────────────────────
    db.session.flush()
    learner = User.query.filter_by(email="ravi@example.com").first()
    priya = User.query.filter_by(email="priya@example.com").first()

    posts = [
        (learner.id, "How do I create a Gmail account safely?",
         "I am a first-time user. What steps should I follow to create Gmail without getting scammed?",
         "basics", False),
        (priya.id, "What is the difference between UPI and NEFT?",
         "I need to send money to another bank. Which is faster and safer?",
         "finance", True),
        (learner.id, "I received a suspicious link on WhatsApp",
         "A message says I won a prize and to click a link. Is this safe?",
         "safety", False),
    ]
    for uid, title, content, cat, resolved in posts:
        p = DiscussionPost(
            user_id=uid, title=title, content=content,
            category=cat, is_resolved=resolved, upvotes=5
        )
        db.session.add(p)

    db.session.commit()
    print("✅ Seed data loaded successfully!")
    print(f"   Admin login: admin@digisahayak.in / Admin@1234")
    print(f"   User login:  ravi@example.com / Password@123")
    print(f"   Courses: {Course.query.count()}")
    print(f"   Lessons: {Lesson.query.count()}")
    print(f"   Quiz Qs: {QuizQuestion.query.count()}")
    print(f"   Workshops: {Workshop.query.count()}")
