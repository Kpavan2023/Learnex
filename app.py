from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from functools import wraps
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import random
import json
import os
import re
import PyPDF2
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///learning_platform.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Session configuration
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

db = SQLAlchemy(app)
mail = Mail(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'teacher' or 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(200), nullable=False)
    option_b = db.Column(db.String(200), nullable=False)
    option_c = db.Column(db.String(200), nullable=False)
    option_d = db.Column(db.String(200), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    difficulty = db.Column(db.String(10), nullable=False)  # 'easy', 'medium', 'hard'
    topic = db.Column(db.String(100), nullable=False)

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)  # 1, 2, or 3
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_spent = db.Column(db.Integer, nullable=False)  # in seconds
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentEngagement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    activity_duration = db.Column(db.Integer, nullable=False)  # in seconds
    inactivity_periods = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # nullable for anonymous users
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100), nullable=True)  # for tracking conversation sessions

class ResumeAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    extracted_skills = db.Column(db.Text)  # JSON string
    extracted_projects = db.Column(db.Text)  # JSON string
    generated_questions = db.Column(db.Text)  # JSON string
    resume_score = db.Column(db.Integer, nullable=False)  # 0-100
    skill_score = db.Column(db.Integer, nullable=False)  # 0-100
    experience_score = db.Column(db.Integer, nullable=False)  # 0-100
    education_score = db.Column(db.Integer, nullable=False)  # 0-100
    overall_feedback = db.Column(db.Text)
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

# Teacher Decorator
def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id') or session.get('user_type') != 'teacher':
            flash('Please login as a teacher to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Student Decorator
def student_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id') or session.get('user_type') != 'student':
            flash('Please login as a student to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Admin Decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Admin Routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Hardcoded admin credentials
        if username == 'admin' and password == 'admin123':
            session['admin_logged_in'] = True
            flash('Admin login successful', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials', 'danger')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Logged out successfully', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    # Get all users
    students = User.query.filter_by(user_type='student').all()
    teachers = User.query.filter_by(user_type='teacher').all()
    
    # Get statistics
    total_users = User.query.count()
    total_subjects = Subject.query.count()
    total_quizzes = Quiz.query.count()
    
    return render_template('admin/dashboard.html', 
                         student_count=len(students),
                         teacher_count=len(teachers),
                         total_users=total_users,
                         total_subjects=total_subjects,
                         total_quizzes=total_quizzes,
                         students=students,
                         teachers=teachers)

@app.route('/admin/delete_user/<int:user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    user_type = user.user_type
    username = user.username
    
    try:
        # Delete related records first
        if user.user_type == 'student':
            Quiz.query.filter_by(student_id=user.id).delete()
            StudentEngagement.query.filter_by(student_id=user.id).delete()
        elif user.user_type == 'teacher':
            # Get subjects taught by this teacher
            subjects = Subject.query.filter_by(teacher_id=user.id).all()
            for subject in subjects:
                # Delete questions for each subject
                Question.query.filter_by(subject_id=subject.id).delete()
                # Delete quizzes for each subject
                Quiz.query.filter_by(subject_id=subject.id).delete()
                # Delete assignments for each subject
                Assignment.query.filter_by(subject_id=subject.id).delete()
                # Delete the subject
                db.session.delete(subject)
        
        # Delete chat messages
        ChatMessage.query.filter_by(user_id=user.id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        flash(f'{user_type.capitalize()} "{username}" deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting user: {str(e)}', 'danger')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/view_user/<int:user_id>')
@admin_required
def view_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # Get user-specific data
    if user.user_type == 'student':
        quizzes = Quiz.query.filter_by(student_id=user.id).order_by(Quiz.completed_at.desc()).limit(10).all()
        engagement = StudentEngagement.query.filter_by(student_id=user.id).order_by(StudentEngagement.timestamp.desc()).limit(10).all()
        
        return render_template('admin/view_student.html', user=user, quizzes=quizzes, engagement=engagement)
    else:
        subjects = Subject.query.filter_by(teacher_id=user.id).all()
        return render_template('admin/view_teacher.html', user=user, subjects=subjects)

# Learning Resources with YouTube links
LEARNING_RESOURCES = {
    'Python': {
        'basic': [
            {'title': 'Python Tutorial for Beginners', 'url': 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 'duration': '6:14:07'},
            {'title': 'Python Crash Course', 'url': 'https://www.youtube.com/watch?v=JJmcL1N2KQs', 'duration': '4:26:52'},
            {'title': 'Learn Python - Full Course', 'url': 'https://www.youtube.com/watch?v=rfscVS0vtbw', 'duration': '4:26:52'}
        ],
        'intermediate': [
            {'title': 'Python OOP Tutorial', 'url': 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM', 'duration': '2:31:28'},
            {'title': 'Python Data Structures', 'url': 'https://www.youtube.com/watch?v=R-HLU9Fl5ug', 'duration': '1:54:23'},
            {'title': 'Python Functions Deep Dive', 'url': 'https://www.youtube.com/watch?v=9Os0o3wzS_I', 'duration': '2:12:11'}
        ],
        'advanced': [
            {'title': 'Advanced Python Concepts', 'url': 'https://www.youtube.com/watch?v=WiQqqB9MlkA', 'duration': '2:52:27'},
            {'title': 'Python Decorators', 'url': 'https://www.youtube.com/watch?v=FsAPt_9Bf3U', 'duration': '1:00:56'},
            {'title': 'Python Generators', 'url': 'https://www.youtube.com/watch?v=bD05uGo_sVI', 'duration': '34:24'}
        ]
    },
    'JavaScript': {
        'basic': [
            {'title': 'JavaScript Tutorial for Beginners', 'url': 'https://www.youtube.com/watch?v=PkZNo7MFNFg', 'duration': '3:26:41'},
            {'title': 'JavaScript Crash Course', 'url': 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 'duration': '1:40:11'},
            {'title': 'Learn JavaScript', 'url': 'https://www.youtube.com/watch?v=jS4aFq5-91M', 'duration': '8:56:26'}
        ],
        'intermediate': [
            {'title': 'JavaScript DOM Manipulation', 'url': 'https://www.youtube.com/watch?v=5fb2aPlgoys', 'duration': '2:26:27'},
            {'title': 'Async JavaScript', 'url': 'https://www.youtube.com/watch?v=PoRJizFvM7s', 'duration': '1:47:42'},
            {'title': 'JavaScript ES6+', 'url': 'https://www.youtube.com/watch?v=NCwa_xi0Uuc', 'duration': '2:21:37'}
        ],
        'advanced': [
            {'title': 'Advanced JavaScript Concepts', 'url': 'https://www.youtube.com/watch?v=Mus_vwhTCq0', 'duration': '3:25:23'},
            {'title': 'JavaScript Design Patterns', 'url': 'https://www.youtube.com/watch?v=kuirGzhGhyw', 'duration': '1:15:47'},
            {'title': 'JavaScript Performance', 'url': 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', 'duration': '1:42:15'}
        ]
    },
    'Java': {
        'basic': [
            {'title': 'Java Tutorial for Beginners', 'url': 'https://www.youtube.com/watch?v=eIrMbAQSU34', 'duration': '9:18:49'},
            {'title': 'Java Programming', 'url': 'https://www.youtube.com/watch?v=xk4_1vDrzzo', 'duration': '14:13:00'},
            {'title': 'Learn Java 8', 'url': 'https://www.youtube.com/watch?v=grEKMHGYyns', 'duration': '9:58:32'}
        ],
        'intermediate': [
            {'title': 'Java OOP Concepts', 'url': 'https://www.youtube.com/watch?v=6T_HgnjoYwM', 'duration': '2:19:33'},
            {'title': 'Java Collections Framework', 'url': 'https://www.youtube.com/watch?v=NyIxIEQckLs', 'duration': '2:52:27'},
            {'title': 'Java Exception Handling', 'url': 'https://www.youtube.com/watch?v=1XAfapkBQjk', 'duration': '1:23:45'}
        ],
        'advanced': [
            {'title': 'Advanced Java Programming', 'url': 'https://www.youtube.com/watch?v=Ae-r8hsbPUo', 'duration': '4:23:46'},
            {'title': 'Java Multithreading', 'url': 'https://www.youtube.com/watch?v=r_MbozD32eo', 'duration': '2:34:12'},
            {'title': 'Java Spring Framework', 'url': 'https://www.youtube.com/watch?v=VvGjZgqojMc', 'duration': '3:12:45'}
        ]
    }
}

# Assignment Questions
ASSIGNMENT_QUESTIONS = {
    'Python': {
        'basic': [
            {'title': 'Variables and Data Types', 'description': 'Create variables of different data types and perform basic operations.', 'type': 'code', 'points': 10, 'time_estimate': '30 min'},
            {'title': 'Control Structures', 'description': 'Write a program using if-else statements and loops.', 'type': 'code', 'points': 15, 'time_estimate': '45 min'},
            {'title': 'Functions', 'description': 'Create functions to solve basic mathematical problems.', 'type': 'code', 'points': 15, 'time_estimate': '45 min'},
            {'title': 'Lists and Strings', 'description': 'Manipulate lists and strings using built-in methods.', 'type': 'code', 'points': 10, 'time_estimate': '30 min'}
        ],
        'advanced': [
            {'title': 'Object-Oriented Programming', 'description': 'Design and implement classes with inheritance and polymorphism.', 'type': 'code', 'points': 25, 'time_estimate': '90 min'},
            {'title': 'File Handling', 'description': 'Read from and write to files, handle exceptions properly.', 'type': 'code', 'points': 20, 'time_estimate': '60 min'},
            {'title': 'Data Analysis Project', 'description': 'Use pandas and numpy to analyze a dataset and create visualizations.', 'type': 'text', 'points': 30, 'time_estimate': '120 min'},
            {'title': 'Web Scraping', 'description': 'Build a web scraper using requests and BeautifulSoup.', 'type': 'code', 'points': 25, 'time_estimate': '90 min'}
        ]
    },
    'JavaScript': {
        'basic': [
            {'title': 'Variables and Functions', 'description': 'Create variables and functions to perform basic calculations.', 'type': 'code', 'points': 10, 'time_estimate': '30 min'},
            {'title': 'DOM Manipulation', 'description': 'Use JavaScript to modify HTML elements and handle events.', 'type': 'code', 'points': 15, 'time_estimate': '45 min'},
            {'title': 'Arrays and Objects', 'description': 'Work with arrays and objects to store and manipulate data.', 'type': 'code', 'points': 15, 'time_estimate': '45 min'},
            {'title': 'Form Validation', 'description': 'Create a form with client-side validation using JavaScript.', 'type': 'code', 'points': 10, 'time_estimate': '30 min'}
        ],
        'advanced': [
            {'title': 'Asynchronous Programming', 'description': 'Implement promises, async/await, and fetch API calls.', 'type': 'code', 'points': 25, 'time_estimate': '90 min'},
            {'title': 'React Component', 'description': 'Build a React component with state management and props.', 'type': 'code', 'points': 20, 'time_estimate': '60 min'},
            {'title': 'API Integration', 'description': 'Create a web application that consumes a REST API.', 'type': 'text', 'points': 30, 'time_estimate': '120 min'},
            {'title': 'Testing', 'description': 'Write unit tests for JavaScript functions using Jest.', 'type': 'code', 'points': 25, 'time_estimate': '90 min'}
        ]
    }
}

# Mock data for questions (you can expand this)
SAMPLE_QUESTIONS = {
    'Python': [
        {
            'question': 'What is the correct way to create a list in Python?',
            'options': ['list = []', 'list = ()', 'list = {}', 'list = ""'],
            'correct': 0,
            'difficulty': 'easy',
            'topic': 'Data Structures'
        },
        {
            'question': 'Which keyword is used to define a function in Python?',
            'options': ['function', 'def', 'define', 'func'],
            'correct': 1,
            'difficulty': 'easy',
            'topic': 'Functions'
        },
        {
            'question': 'What is the output of print(2**3)?',
            'options': ['6', '8', '9', '23'],
            'correct': 1,
            'difficulty': 'medium',
            'topic': 'Operators'
        },
        {
            'question': 'Which of the following is used for exception handling in Python?',
            'options': ['try-catch', 'try-except', 'catch-throw', 'handle-error'],
            'correct': 1,
            'difficulty': 'medium',
            'topic': 'Exception Handling'
        },
        {
            'question': 'What is a decorator in Python?',
            'options': ['A design pattern', 'A function that modifies another function', 'A class method', 'A variable type'],
            'correct': 1,
            'difficulty': 'hard',
            'topic': 'Advanced Concepts'
        }
    ],
    'JavaScript': [
        {
            'question': 'How do you declare a variable in JavaScript?',
            'options': ['var x;', 'variable x;', 'declare x;', 'x variable;'],
            'correct': 0,
            'difficulty': 'easy',
            'topic': 'Variables'
        },
        {
            'question': 'Which method is used to add an element to the end of an array?',
            'options': ['add()', 'append()', 'push()', 'insert()'],
            'correct': 2,
            'difficulty': 'easy',
            'topic': 'Arrays'
        },
        {
            'question': 'What is the correct way to write a JavaScript array?',
            'options': ['var colors = "red", "green", "blue"', 'var colors = ["red", "green", "blue"]', 'var colors = (1:"red", 2:"green", 3:"blue")', 'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")'],
            'correct': 1,
            'difficulty': 'medium',
            'topic': 'Arrays'
        }
    ],
    'Java': [
        {
            'question': 'Which of the following is the correct way to declare a main method in Java?',
            'options': ['public static void main(String[] args)', 'static public void main(String[] args)', 'public void main(String[] args)', 'void main(String[] args)'],
            'correct': 0,
            'difficulty': 'easy',
            'topic': 'Methods'
        },
        {
            'question': 'What is the size of int in Java?',
            'options': ['16 bits', '32 bits', '64 bits', '8 bits'],
            'correct': 1,
            'difficulty': 'medium',
            'topic': 'Data Types'
        }
    ]
}

# Comedy content for breaks
COMEDY_CONTENT = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
    "Why do Java developers wear glasses? Because they can't C#! 🤓",
    "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺",
    "Why did the programmer quit his job? He didn't get arrays! 📊"
]

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('user_type')
        
        user = User.query.filter_by(username=username, user_type=user_type).first()
        
        if user and check_password_hash(user.password_hash, password):
            session.permanent = True
            session['user_id'] = user.id
            session['user_type'] = user_type
            session['username'] = username
            print(f"✅ Login successful: {username} ({user_type}) - Session: {dict(session)}")  # Debug
            return jsonify({'success': True, 'user_type': user_type})
        else:
            print(f"❌ Login failed: {username} ({user_type})")  # Debug
            return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    # Handle GET request with query parameter
    user_type = request.args.get('type', 'teacher')
    return render_template('login_portal.html', default_user_type=user_type)

@app.route('/logout')
def logout():
    print(f"🔓 Logging out - Session before: {dict(session)}")  # Debug
    session.clear()
    print(f"🔓 Session after logout: {dict(session)}")  # Debug
    return redirect(url_for('login'))

@app.route('/debug-session')
def debug_session():
    """Debug route to check session state"""
    return f"""
    <h1>Session Debug</h1>
    <p><strong>Session Data:</strong> {dict(session)}</p>
    <p><strong>User ID:</strong> {session.get('user_id', 'Not set')}</p>
    <p><strong>User Type:</strong> {session.get('user_type', 'Not set')}</p>
    <p><strong>Username:</strong> {session.get('username', 'Not set')}</p>
    <p><strong>Session Permanent:</strong> {session.get('_permanent', 'Not set')}</p>
    <a href="/login">Go to Login</a> | 
    <a href="/student/dashboard">Student Dashboard</a> | 
    <a href="/teacher/dashboard">Teacher Dashboard</a>
    """

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type')
    
    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'})
    
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    # Create new user
    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        user_type=user_type
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        print(f"✓ New {user_type} registered: {username}")
        return jsonify({'success': True, 'message': 'Registration successful! Please login.'})
    except Exception as e:
        db.session.rollback()
        print(f"❌ Registration error: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'})

@app.route('/teacher/dashboard')
def teacher_dashboard_auth():
    return render_template('teacher_dashboard.html')

@app.route('/student/dashboard')
def student_dashboard_auth():
    return render_template('student_dashboard.html')

@app.route('/teacher')
@teacher_required
def teacher_dashboard():
    return render_template('teacher_dashboard.html')

@app.route('/student')
@student_required
def student_dashboard():
    return render_template('student_dashboard.html')

@app.route('/student/dashboard')
def student_dashboard_redirect():
    return redirect(url_for('student_dashboard'))

@app.route('/student/resume_upload')
def resume_upload_page():
    return render_template('resume_upload.html')

# Teacher Routes
@app.route('/teacher/subjects')
def teacher_subjects():
    # Get subjects from the first teacher (demo mode)
    teacher = User.query.filter_by(user_type='teacher').first()
    if teacher:
        subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    else:
        subjects = []
    return render_template('teacher_subjects.html', subjects=subjects)

@app.route('/teacher/add_subject', methods=['POST'])
def add_subject():
    data = request.get_json()
    # Get first teacher for demo mode
    teacher = User.query.filter_by(user_type='teacher').first()
    if not teacher:
        return jsonify({'success': False, 'message': 'No teacher found'})
    
    subject = Subject(
        name=data.get('name'),
        description=data.get('description'),
        teacher_id=teacher.id
    )
    
    db.session.add(subject)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Subject added successfully'})

@app.route('/teacher/edit_subject/<int:subject_id>', methods=['POST'])
def edit_subject(subject_id):
    data = request.get_json()
    subject = Subject.query.get_or_404(subject_id)
    
    subject.name = data.get('name')
    subject.description = data.get('description')
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Subject updated successfully'})

@app.route('/teacher/delete_subject/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    
    db.session.delete(subject)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Subject deleted successfully'})

@app.route('/teacher/generate_question_paper', methods=['POST'])
def generate_question_paper():
    data = request.get_json()
    subject_name = data.get('subject')
    difficulty = data.get('difficulty', 'medium')
    num_questions = min(max(int(data.get('num_questions', 10)), 10), 30)  # Min 10, Max 30
    
    if subject_name in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[subject_name]
        if difficulty != 'all':
            questions = [q for q in questions if q['difficulty'] == difficulty]
        
        # Duplicate questions if needed to meet the requirement
        while len(questions) < num_questions:
            questions.extend(SAMPLE_QUESTIONS[subject_name])
        
        selected_questions = random.sample(questions, num_questions)
        
        # Remove correct answers for question paper
        question_paper = []
        for q in selected_questions:
            question_paper.append({
                'question': q['question'],
                'options': q['options'],
                'difficulty': q['difficulty'],
                'topic': q['topic']
                # Note: 'correct' answer is removed from question paper
            })
        
        return jsonify({'success': True, 'questions': question_paper})
    
    return jsonify({'success': False, 'message': 'Subject not found'})

@app.route('/teacher/student_performance')
def student_performance():
    # Get first teacher for demo mode (no login system)
    teacher = User.query.filter_by(user_type='teacher').first()
    if not teacher:
        return render_template('student_performance.html', 
                               performance_data=[], 
                               students_data=[], 
                               analytics_data={})
    
    # Get all quiz results for performance analysis
    quizzes = db.session.query(Quiz, User, Subject).join(User, Quiz.student_id == User.id).join(Subject, Quiz.subject_id == Subject.id).filter(Subject.teacher_id == teacher.id).all()
    
    performance_data = []
    for quiz, student, subject in quizzes:
        performance_data.append({
            'student_name': student.username,
            'subject': subject.name,
            'level': quiz.level,
            'score': quiz.score,
            'total_questions': quiz.total_questions,
            'percentage': round((quiz.score / quiz.total_questions) * 100, 2),
            'time_spent': quiz.time_spent,
            'completed_at': quiz.completed_at.strftime('%Y-%m-%d %H:%M'),
        })
    
    # Get all registered students with their counts
    students = User.query.filter_by(user_type='student').all()
    students_data = []
    for student in students:
        quiz_count = Quiz.query.filter_by(student_id=student.id).count()
        
        # Calculate average scores
        student_quizzes = Quiz.query.filter_by(student_id=student.id).all()
        avg_quiz_score = 0
        if student_quizzes:
            total_percentage = sum((q.score / q.total_questions) * 100 for q in student_quizzes)
            avg_quiz_score = round(total_percentage / len(student_quizzes), 2)
        
        students_data.append({
            'username': student.username,
            'email': student.email,
            'created_at': student.created_at,
            'quiz_count': quiz_count,
            'avg_quiz_score': avg_quiz_score
        })
    
    # Generate analytics data for charts
    analytics_data = {
        'student_comparison': [],
        'subject_performance': {},
        'performance_trends': [],
        'score_distributions': {
            'quiz': {'0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0}
        }
    }
    
    # Student comparison data
    for student_data in students_data:
        analytics_data['student_comparison'].append({
            'student': student_data['username'],
            'quiz_avg': student_data['avg_quiz_score']
        })
    
    # Subject performance data
    for perf in performance_data:
        subject = perf['subject']
        if subject not in analytics_data['subject_performance']:
            analytics_data['subject_performance'][subject] = {'quiz': []}
        analytics_data['subject_performance'][subject]['quiz'].append(perf['percentage'])
    
    # Score distribution data
    for perf in performance_data:
        percentage = perf['percentage']
        if percentage <= 20:
            analytics_data['score_distributions']['quiz']['0-20'] += 1
        elif percentage <= 40:
            analytics_data['score_distributions']['quiz']['21-40'] += 1
        elif percentage <= 60:
            analytics_data['score_distributions']['quiz']['41-60'] += 1
        elif percentage <= 80:
            analytics_data['score_distributions']['quiz']['61-80'] += 1
        else:
            analytics_data['score_distributions']['quiz']['81-100'] += 1
    
    # Performance trends
    analytics_data['performance_trends'] = performance_data
    
    return render_template('student_performance.html', 
                           performance_data=performance_data, 
                           students_data=students_data,
                           analytics_data=analytics_data)

@app.route('/teacher/predict_performance', methods=['POST'])
def predict_performance():
    # ML-powered teacher performance prediction
    
    data = request.get_json()
    hours_studied = data.get('hours_studied')
    attendance_percentage = data.get('attendance_percentage')
    previous_score = data.get('previous_score')
    
    if hours_studied is not None and attendance_percentage is not None and previous_score is not None:
        # Use ML model for prediction
        if ml_model:
            features = np.array([[hours_studied, attendance_percentage, previous_score]])
            predicted_score = ml_model.predict(features)[0]
            predicted_score = round(predicted_score, 2)
            
            # Generate recommendations based on prediction
            recommendations = []
            if predicted_score < 60:
                recommendations.extend([
                    "Focus on foundational concepts",
                    "Increase study hours gradually",
                    "Improve class attendance",
                    "Provide additional learning resources"
                ])
            elif predicted_score < 75:
                recommendations.extend([
                    "Good progress! Continue current study pattern",
                    "Focus on weak areas identified in assessments",
                    "Practice more challenging problems"
                ])
            else:
                recommendations.extend([
                    "Excellent performance predicted!",
                    "Challenge with advanced topics",
                    "Consider peer tutoring opportunities",
                    "Prepare for advanced certifications"
                ])
            
            return jsonify({
                'success': True,
                'predicted_score': predicted_score,
                'recommendations': recommendations,
                'model_used': 'ML Model'
            })
        else:
            return jsonify({'success': False, 'message': 'ML model not available'})
    
    # Fallback: use student data if no input provided
    student_id = data.get('student_id')
    if not student_id:
        student = User.query.filter_by(user_type='student').first()
        if student:
            student_id = student.id
        else:
            return jsonify({'success': False, 'message': 'No students found'})
    
    # Get student's quiz history for fallback prediction
    quizzes = Quiz.query.filter_by(student_id=student_id).all()
    
    if len(quizzes) < 1:
        return jsonify({
            'success': True,
            'predicted_score': round(random.uniform(65, 95), 2),
            'recommendations': [
                "Student shows potential in programming concepts",
                "Encourage more hands-on practice",
                "Focus on algorithmic thinking"
            ],
            'model_used': 'Demo Mode'
        })
    
    # Simple prediction based on recent performance
    recent_scores = [q.score / q.total_questions for q in quizzes[-5:]]
    avg_performance = sum(recent_scores) / len(recent_scores)
    predicted_score = avg_performance + random.uniform(-0.1, 0.1)
    predicted_score = max(0, min(1, predicted_score))
    
    recommendations = []
    if predicted_score < 0.6:
        recommendations.append("Focus on basic concepts")
        recommendations.append("Provide additional practice materials")
    elif predicted_score < 0.8:
        recommendations.append("Review medium difficulty topics")
        recommendations.append("Encourage more practice")
    else:
        recommendations.append("Challenge with advanced topics")
        recommendations.append("Consider leadership roles in group activities")
    
    return jsonify({
        'success': True,
        'predicted_score': round(predicted_score * 100, 2),
        'recommendations': recommendations,
        'model_used': 'Historical Data'
    })

@app.route('/teacher/topic_recommendations', methods=['POST'])
def topic_recommendations():
    # Mock teacher topic recommendations
    
    data = request.get_json()
    student_id = data.get('student_id')
    
    # If no student_id provided, use demo student
    if not student_id:
        student = User.query.filter_by(user_type='student').first()
        if student:
            student_id = student.id
    
    # Get student's quiz performance by topic
    quizzes = Quiz.query.filter_by(student_id=student_id).all() if student_id else []
    
    # Mock topic analysis (in real implementation, analyze by topic performance)
    weak_topics = ['Functions', 'Data Structures', 'Algorithms']
    strong_topics = ['Variables', 'Basic Syntax']
    
    recommendations = {
        'focus_topics': weak_topics,
        'strength_topics': strong_topics,
        'suggested_sequence': ['Review Variables', 'Practice Functions', 'Master Data Structures', 'Advanced Algorithms']
    }
    
    return jsonify({'success': True, 'recommendations': recommendations})

# Student Routes
@app.route('/student/subjects')
def student_subjects():
    subjects = Subject.query.all()
    return render_template('student_subjects.html', subjects=subjects)

@app.route('/student/learning_path/<int:subject_id>')
def learning_path(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    
    # Mock progress calculation (can be enhanced with actual user data)
    progress = random.randint(20, 80)
    recommended_level = 'basic'
    
    resources = LEARNING_RESOURCES.get(subject.name, {
        'basic': [{'title': 'Introduction to ' + subject.name, 'url': '#', 'duration': '1:00:00'}],
        'intermediate': [{'title': 'Intermediate ' + subject.name, 'url': '#', 'duration': '2:00:00'}],
        'advanced': [{'title': 'Advanced ' + subject.name, 'url': '#', 'duration': '3:00:00'}]
    })
    
    return render_template('learning_path.html', 
                         subject=subject, 
                         recommended_level=recommended_level, 
                         progress=progress,
                         resources=resources)

@app.route('/student/quiz/<int:subject_id>/<int:level>')
def quiz(subject_id, level):
    subject = Subject.query.get_or_404(subject_id)
    
    # Get questions based on level
    question_counts = {1: 10, 2: 20, 3: 30}
    num_questions = question_counts.get(level, 10)
    
    if subject.name in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[subject.name]
        
        # Filter questions by difficulty if specified
        if level == 1:
            # Easy level - mostly easy questions
            easy_questions = [q for q in questions if q['difficulty'] == 'easy']
            medium_questions = [q for q in questions if q['difficulty'] == 'medium']
            selected_questions = random.sample(easy_questions, min(len(easy_questions), num_questions - 2))
            if len(selected_questions) < num_questions:
                remaining = num_questions - len(selected_questions)
                selected_questions.extend(random.sample(medium_questions, min(len(medium_questions), remaining)))
        elif level == 2:
            # Medium level - mix of easy and medium
            easy_questions = [q for q in questions if q['difficulty'] == 'easy']
            medium_questions = [q for q in questions if q['difficulty'] == 'medium']
            selected_questions = random.sample(medium_questions, min(len(medium_questions), num_questions - 3))
            if len(selected_questions) < num_questions:
                remaining = num_questions - len(selected_questions)
                selected_questions.extend(random.sample(easy_questions, min(len(easy_questions), remaining)))
        else:
            # Hard level - mix of all difficulties with more hard questions
            hard_questions = [q for q in questions if q['difficulty'] == 'hard']
            medium_questions = [q for q in questions if q['difficulty'] == 'medium']
            easy_questions = [q for q in questions if q['difficulty'] == 'easy']
            
            selected_questions = []
            # Add hard questions first
            selected_questions.extend(random.sample(hard_questions, min(len(hard_questions), num_questions // 2)))
            # Add medium questions
            remaining = num_questions - len(selected_questions)
            selected_questions.extend(random.sample(medium_questions, min(len(medium_questions), remaining)))
            # Fill with easy questions if needed
            if len(selected_questions) < num_questions:
                remaining = num_questions - len(selected_questions)
                selected_questions.extend(random.sample(easy_questions, min(len(easy_questions), remaining)))
        
        # If still not enough questions, take remaining unique questions
        available_questions = [q for q in questions if q not in selected_questions]
        if len(selected_questions) < num_questions and available_questions:
            remaining = num_questions - len(selected_questions)
            selected_questions.extend(random.sample(available_questions, min(len(available_questions), remaining)))
        
        # Shuffle the final questions
        random.shuffle(selected_questions)
        
        # Store questions in session for accurate evaluation
        session['quiz_questions'] = selected_questions
        session['quiz_subject_id'] = subject_id
        session['quiz_level'] = level
        session['quiz_start_time'] = datetime.utcnow().isoformat()
        
    else:
        selected_questions = []
        session['quiz_questions'] = []
    
    return render_template('quiz.html', 
                         subject=subject, 
                         level=level, 
                         questions=selected_questions)

@app.route('/student/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    subject_id = data.get('subject_id')
    level = data.get('level')
    answers = data.get('answers')
    time_spent = data.get('time_spent')
    
    # Get the actual questions shown to the user from session
    quiz_questions = session.get('quiz_questions', [])
    
    if not quiz_questions:
        return jsonify({'success': False, 'message': 'Quiz session expired or invalid'})
    
    # Calculate score based on the actual questions shown
    score = 0
    correct_answers = []
    user_answers = []
    
    for i, user_answer in enumerate(answers):
        if i < len(quiz_questions):
            question = quiz_questions[i]
            correct_answer = question['correct']
            user_answers.append(user_answer)
            correct_answers.append(correct_answer)
            
            if user_answer == correct_answer:
                score += 1
    
    total_questions = len(quiz_questions)
    percentage = (score / total_questions) * 100 if total_questions > 0 else 0
    
    # Save quiz result to database
    student = User.query.filter_by(user_type='student').first()
    if student:
        quiz_result = Quiz(
            student_id=student.id,
            subject_id=subject_id,
            level=level,
            score=score,
            total_questions=total_questions,
            time_spent=time_spent
        )
        
        db.session.add(quiz_result)
        db.session.commit()
    
    # Clear quiz session
    session.pop('quiz_questions', None)
    session.pop('quiz_subject_id', None)
    session.pop('quiz_level', None)
    session.pop('quiz_start_time', None)
    
    return jsonify({
        'success': True,
        'score': score,
        'total_questions': total_questions,
        'percentage': round(percentage, 2),
        'passed': percentage >= 60,
        'correct_answers': correct_answers,
        'user_answers': user_answers
    })

# Assignment route - simplified to just show questions with points
@app.route('/student/assignments/<int:subject_id>')
def assignments(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    
    # Get assignment questions for this subject
    basic_questions = ASSIGNMENT_QUESTIONS.get(subject.name, {}).get('basic', [])
    advanced_questions = ASSIGNMENT_QUESTIONS.get(subject.name, {}).get('advanced', [])
    
    return render_template('assignments.html', 
                         subject=subject, 
                         basic_questions=basic_questions,
                         advanced_questions=advanced_questions)

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import numpy as np

# Load the trained ML model for student score prediction
try:
    ml_model = joblib.load('student_score_model.joblib')
    print("✓ ML model loaded successfully")
except FileNotFoundError:
    print("⚠ ML model not found. Please run train_model.py first")
    ml_model = None

# Sample data for training
training_data = {
    'attributes': [
        {'learning_score': 80, 'reading_score': 75, 'previous_exam_marks': 85, 'study_hours': 4, 'sleep_hours': 8, 'attendance_rate': 95, 'stress_level': 4},
        {'learning_score': 70, 'reading_score': 65, 'previous_exam_marks': 75, 'study_hours': 3, 'sleep_hours': 7, 'attendance_rate': 85, 'stress_level': 5},
        {'learning_score': 90, 'reading_score': 80, 'previous_exam_marks': 85, 'study_hours': 5, 'sleep_hours': 9, 'attendance_rate': 95, 'stress_level': 3},
        {'learning_score': 60, 'reading_score': 50, 'previous_exam_marks': 60, 'study_hours': 2, 'sleep_hours': 6, 'attendance_rate': 80, 'stress_level': 7},
        # Add more sample data as needed
    ],
    'scores': [88, 74, 92, 65]
}

# Train a simple model for student performance prediction
scaler = StandardScaler()
model = RandomForestRegressor(n_estimators=100, random_state=42)

X_train = scaler.fit_transform([[d['learning_score'], d['reading_score'], d['previous_exam_marks'], d['study_hours'], d['sleep_hours'], d['attendance_rate'], d['stress_level']] for d in training_data['attributes']])
y_train = training_data['scores']

model.fit(X_train, y_train)

# ML-powered performance prediction route
@app.route('/student/performance_prediction', methods=['GET', 'POST'])
def performance_prediction():
    if request.method == 'POST':
        print("📊 ML Prediction POST request received")
        hours_studied = float(request.form['hours_studied'])
        attendance_percentage = float(request.form['attendance_percentage'])
        previous_score = float(request.form['previous_score'])
        
        print(f"Input values - Hours: {hours_studied}, Attendance: {attendance_percentage}%, Previous: {previous_score}")

        # Make prediction if model is loaded
        if ml_model:
            features = np.array([[hours_studied, attendance_percentage, previous_score]])
            predicted_score = ml_model.predict(features)[0]
            predicted_score = round(predicted_score, 2)
            print(f"✅ ML Model prediction: {predicted_score}")
            return render_template('result.html', 
                                   predicted_score=predicted_score,
                                   hours_studied=hours_studied,
                                   attendance_percentage=attendance_percentage,
                                   previous_score=previous_score)
        else:
            print("❌ ML model is not available")
            return "ML model is not available. Please train the model first."
    return render_template('performance_prediction.html')

@app.route('/student/upload_resume', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'success': False, 'message': 'No file uploaded'})
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Read file content for analysis
            content = read_file_content(file)
            
            # Perform resume analysis
            analysis_result = analyze_resume(content)
            
            # Save analysis to database
            student = User.query.filter_by(user_type='student').first()
            if student:
                resume_analysis = ResumeAnalysis(
                    student_id=student.id,
                    filename=filename,
                    extracted_skills=json.dumps(analysis_result['skills']),
                    extracted_projects=json.dumps(analysis_result['projects']),
                    generated_questions=json.dumps(analysis_result['questions']),
                    resume_score=analysis_result['overall_score'],
                    skill_score=analysis_result['skill_score'],
                    experience_score=analysis_result['experience_score'],
                    education_score=analysis_result['education_score'],
                    overall_feedback=analysis_result['feedback']
                )
                
                db.session.add(resume_analysis)
                db.session.commit()
            
            return jsonify({
                'success': True,
                'extracted_skills': analysis_result['skills'],
                'extracted_projects': analysis_result['projects'],
                'questions': analysis_result['questions'],
                'resume_score': analysis_result['overall_score'],
                'skill_score': analysis_result['skill_score'],
                'experience_score': analysis_result['experience_score'],
                'education_score': analysis_result['education_score'],
                'feedback': analysis_result['feedback']
            })
        
        return jsonify({'success': False, 'message': 'Invalid file type'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error processing resume: {str(e)}'})

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_file_content(file):
    """Extract text content from uploaded file"""
    content = ""
    filename = file.filename.lower()
    
    if filename.endswith('.txt'):
        content = file.read().decode('utf-8')
    elif filename.endswith('.pdf'):
        # Simple PDF text extraction (basic implementation)
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                content += page.extract_text() + "\n"
        except:
            content = "PDF processing failed. Please upload a text file instead."
    elif filename.endswith('.doc') or filename.endswith('.docx'):
        # Simple DOC/DOCX text extraction (basic implementation)
        try:
            if filename.endswith('.docx'):
                import docx
                doc = docx.Document(file)
                content = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            else:
                content = "DOC files not fully supported. Please convert to DOCX or TXT."
        except:
            content = "Document processing failed. Please upload a text file instead."
    else:
        content = "Unsupported file format."
    
    return content

def analyze_resume(content):
    """Analyze resume content and extract skills, projects, and generate scoring"""
    
    # Define skill keywords for different technologies
    skill_keywords = {
        'Programming Languages': ['python', 'java', 'javascript', 'c++', 'c', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala'],
        'Web Technologies': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel', 'rails'],
        'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite', 'cassandra', 'elasticsearch'],
        'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'terraform', 'ansible'],
        'Data Science': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'data analysis', 'statistics'],
        'Mobile Development': ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin'],
        'Tools & Frameworks': ['git', 'github', 'gitlab', 'jira', 'slack', 'trello', 'vscode', 'intellij', 'eclipse']
    }
    
    # Extract skills
    extracted_skills = []
    content_lower = content.lower()
    
    for category, keywords in skill_keywords.items():
        found_skills = [skill for skill in keywords if skill in content_lower]
        extracted_skills.extend(found_skills)
    
    # Remove duplicates and limit to top skills
    extracted_skills = list(set(extracted_skills))[:15]
    
    # Extract projects (using existing function)
    extracted_projects = extract_projects(content)
    
    # Extract experience (using existing function)
    extracted_experience = extract_experience(content)
    
    # Calculate scores
    skill_score = min(100, len(extracted_skills) * 8)  # 8 points per skill, max 100
    
    # Experience score based on content length and keywords
    experience_keywords = ['years', 'year', 'experience', 'worked', 'developed', 'managed', 'led', 'architected']
    experience_count = sum(1 for keyword in experience_keywords if keyword in content_lower)
    experience_score = min(100, experience_count * 15 + min(50, len(content) // 100))
    
    # Education score based on education keywords
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'graduated', 'gpa', 'certification']
    education_count = sum(1 for keyword in education_keywords if keyword in content_lower)
    education_score = min(100, education_count * 20)
    
    # Overall score (weighted average)
    overall_score = int((skill_score * 0.4 + experience_score * 0.4 + education_score * 0.2))
    
    # Generate feedback
    feedback = generate_feedback(overall_score, skill_score, experience_score, education_score, extracted_skills)
    
    # Generate interview questions based on extracted skills, projects, and experience
    questions = generate_interview_questions(extracted_skills, extracted_projects, extracted_experience)
    
    return {
        'skills': extracted_skills,
        'projects': extracted_projects,
        'questions': questions,
        'overall_score': overall_score,
        'skill_score': skill_score,
        'experience_score': experience_score,
        'education_score': education_score,
        'feedback': feedback
    }

def generate_feedback(overall_score, skill_score, experience_score, education_score, skills):
    """Generate personalized feedback based on scores"""
    
    if overall_score >= 80:
        overall_feedback = "Excellent resume! Strong technical skills and experience."
    elif overall_score >= 60:
        overall_feedback = "Good resume with solid technical foundation. Consider adding more specific achievements."
    elif overall_score >= 40:
        overall_feedback = "Resume needs improvement. Focus on highlighting technical skills and project details."
    else:
        overall_feedback = "Resume requires significant improvement. Add more technical details and project experiences."
    
    suggestions = []
    
    if skill_score < 50:
        suggestions.append("Add more specific technical skills and technologies")
    if experience_score < 50:
        suggestions.append("Include more detailed project descriptions and achievements")
    if education_score < 50:
        suggestions.append("Highlight educational qualifications and certifications")
    if len(skills) < 5:
        suggestions.append("Consider learning and mentioning more in-demand technologies")
    
    feedback = f"{overall_feedback}\n\nSuggestions:\n" + "\n".join(f"- {suggestion}" for suggestion in suggestions)
    
    return feedback

def extract_skills(text):
    """Extract technical skills from resume text"""
    # Comprehensive list of technical skills
    skill_patterns = {
        'Programming Languages': [
            r'\bPython\b', r'\bJava\b', r'\bJavaScript\b', r'\bTypeScript\b', r'\bC\+\+\b', 
            r'\bC#\b', r'\bPHP\b', r'\bRuby\b', r'\bGo\b', r'\bRust\b', r'\bSwift\b',
            r'\bKotlin\b', r'\bScala\b', r'\bPerl\b', r'\bMATLAB\b', r'\bR\b', r'\bSQL\b'
        ],
        'Web Technologies': [
            r'\bHTML5?\b', r'\bCSS3?\b', r'\bReact\b', r'\bAngular\b', r'\bVue\.js\b', 
            r'\bNode\.js\b', r'\bExpress\.js\b', r'\bDjango\b', r'\bFlask\b', r'\bSpring\b',
            r'\bLaravel\b', r'\bRails\b', r'\bASP\.NET\b', r'\bBootstrap\b', r'\bjQuery\b'
        ],
        'Databases': [
            r'\bMySQL\b', r'\bPostgreSQL\b', r'\bMongoDB\b', r'\bRedis\b', r'\bSQLite\b',
            r'\bOracle\b', r'\bSQL Server\b', r'\bCassandra\b', r'\bElasticSearch\b', r'\bFirebase\b'
        ],
        'Cloud & DevOps': [
            r'\bAWS\b', r'\bAzure\b', r'\bGoogle Cloud\b', r'\bDocker\b', r'\bKubernetes\b',
            r'\bJenkins\b', r'\bGitLab\b', r'\bCI/CD\b', r'\bTerraform\b', r'\bAnsible\b',
            r'\bLinux\b', r'\bUbuntu\b', r'\bWindows Server\b'
        ],
        'Machine Learning': [
            r'\bMachine Learning\b', r'\bDeep Learning\b', r'\bTensorFlow\b', r'\bPyTorch\b',
            r'\bScikit-learn\b', r'\bKeras\b', r'\bNLP\b', r'\bComputer Vision\b', r'\bData Science\b',
            r'\bPandas\b', r'\bNumPy\b', r'\bMatplotlib\b', r'\bSeaborn\b', r'\bJupyter\b'
        ],
        'Tools & Others': [
            r'\bGit\b', r'\bGitHub\b', r'\bGitLab\b', r'\bVS Code\b', r'\bIntelliJ\b',
            r'\bEclipse\b', r'\bPostman\b', r'\bFigma\b', r'\bSlack\b', r'\bJira\b',
            r'\bAgile\b', r'\bScrum\b', r'\bREST API\b', r'\bGraphQL\b', r'\bMicroservices\b'
        ]
    }
    
    extracted_skills = []
    for category, patterns in skill_patterns.items():
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match not in extracted_skills:
                    extracted_skills.append(match)
    
    return extracted_skills[:15]  # Return top 15 skills

def extract_projects(text):
    """Extract project information from resume text"""
    project_patterns = [
        r'Project[s]?\s*[:\-]\s*([^\n]+)',
        r'Worked on\s+([^\n]+)',
        r'Developed\s+([^\n]+)',
        r'Built\s+([^\n]+)',
        r'Created\s+([^\n]+)',
        r'Implemented\s+([^\n]+)',
        r'Designed\s+([^\n]+)'
    ]
    
    projects = []
    for pattern in project_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean up the project name
            project = match.strip()
            if len(project) > 10 and len(project) < 100:  # Reasonable length
                if project not in projects:
                    projects.append(project)
    
    return projects[:5]  # Return top 5 projects

def extract_experience(text):
    """Extract work experience from resume text"""
    experience_patterns = [
        r'(\d+)\s*years?\s*(?:of\s*)?experience',
        r'experience\s*[:\-]\s*([^\n]+)',
        r'worked\s*(?:at|for)\s+([^\n,]+)',
        r'employed\s*(?:at|by)\s+([^\n,]+)'
    ]
    
    experience = []
    for pattern in experience_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            experience.append(match.strip())
    
    return experience[:3]  # Return top 3 experience entries

def extract_education(text):
    """Extract education information from resume text"""
    education_patterns = [
        r'(Bachelor|Master|PhD|B\.Tech|M\.Tech|B\.Sc|M\.Sc|B\.E|M\.E)[^\n]*',
        r'University\s*[:\-]\s*([^\n]+)',
        r'College\s*[:\-]\s*([^\n]+)',
        r'Degree\s*[:\-]\s*([^\n]+)'
    ]
    
    education = []
    for pattern in education_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            education.append(match.strip())
    
    return education[:3]  # Return top 3 education entries

def generate_interview_questions(skills, projects, experience):
    """Generate personalized interview questions based on extracted resume data"""
    questions = ["Tell me about yourself and your background."]
    
    # Questions based on skills
    if skills:
        top_skills = skills[:3]
        questions.append(f"I see you have experience with {', '.join(top_skills)}. Can you tell me about a project where you used these technologies?")
        
        for skill in top_skills[:2]:
            if 'Python' in skill or 'Java' in skill or 'JavaScript' in skill:
                questions.append(f"What's the most challenging problem you've solved using {skill}?")
            elif 'Machine Learning' in skill or 'Data Science' in skill:
                questions.append(f"Can you explain a machine learning project you've worked on? What was the business impact?")
            elif 'React' in skill or 'Angular' in skill or 'Vue' in skill:
                questions.append(f"How do you approach component design in {skill}?")
    
    # Questions based on projects
    if projects:
        project = projects[0]
        questions.append(f"Tell me about your project: {project}. What was your role and what challenges did you face?")
    
    # Questions based on experience
    if experience:
        questions.append(f"Can you elaborate on your experience: {experience[0]}?")
    
    # General questions
    questions.extend([
        "What are your strengths and areas for improvement?",
        "How do you stay updated with the latest technology trends?",
        "Describe a time when you had to work with a difficult team member.",
        "Where do you see yourself in the next 5 years?",
        "Why are you interested in this position/role?"
    ])
    
    return questions[:10]  # Return top 10 questions

@app.route('/student/games')
def games():
    return render_template('games.html')

@app.route('/student/submit_interview', methods=['POST'])
def submit_interview():
    data = request.get_json()
    subject_id = data.get('subject_id')
    answers = data.get('answers')
    
    # Simple scoring based on answer length and keywords
    total_score = 0
    feedback = []
    
    for i, answer in enumerate(answers):
        score = 0
        if len(answer.strip()) > 50:
            score += 3
        elif len(answer.strip()) > 20:
            score += 2
        else:
            score += 1
        
        # Check for technical keywords (basic keyword matching)
        keywords = ['python', 'javascript', 'java', 'programming', 'code', 'development', 'algorithm', 'data', 'function']
        keyword_count = sum(1 for keyword in keywords if keyword.lower() in answer.lower())
        score += min(keyword_count, 2)
        
        total_score += score
        
        if score < 3:
            feedback.append(f"Question {i+1}: Consider providing more detailed and technical answers.")
        elif score < 5:
            feedback.append(f"Question {i+1}: Good answer, but could include more technical details.")
        else:
            feedback.append(f"Question {i+1}: Excellent answer with good technical content.")
    
    # Save interview result to database
    try:
        # Get first student for demo mode (since no login system)
        student = User.query.filter_by(user_type='student').first()
        if student:
            interview_result = InterviewResult(
                student_id=student.id,
                subject_id=subject_id,
                questions_answers=json.dumps([{'question': f'Question {i+1}', 'answer': answer} for i, answer in enumerate(answers)]),
                score=total_score,
                feedback='\n'.join(feedback)
            )
            db.session.add(interview_result)
            db.session.commit()
            print(f"✅ Interview result saved: Student {student.username}, Subject {subject_id}, Score {total_score}")
        else:
            print("⚠️ No student found to save interview result")
    except Exception as e:
        print(f"❌ Error saving interview result: {e}")
    
    return jsonify({
        'success': True,
        'score': total_score,
        'max_score': len(answers) * 5,
        'feedback': feedback,
        'passed': total_score >= (len(answers) * 3)
    })

@app.route('/api/comedy_content')
def get_comedy_content():
    return jsonify({'content': random.choice(COMEDY_CONTENT)})

@app.route('/api/engagement_check', methods=['POST'])
def engagement_check():
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
            
        activity_type = data.get('activity_type', 'unknown')
        duration = data.get('duration', 0)
        inactivity_periods = data.get('inactivity_periods', 0)
        
        # Mock engagement tracking (no login system)
        print(f"Engagement tracked: {activity_type}, duration: {duration}, inactivity: {inactivity_periods}")
        
        # Suggest break if too many inactivity periods
        suggest_break = inactivity_periods > 3
        
        return jsonify({
            'success': True,
            'suggest_break': suggest_break,
            'message': 'Are you bored? Want to take a short game break or continue?' if suggest_break else None
        })
    except Exception as e:
        print(f"Error in engagement_check: {e}")
        return jsonify({'success': False, 'message': 'Server error'}), 500

# Chatbot Routes and Functions
def get_chatbot_response(user_message, user_id=None):
    """Generate chatbot response based on user message and database content"""
    
    # Convert message to lowercase for easier matching
    message_lower = user_message.lower()
    
    # Basic programming language definitions
    if 'what is python' in message_lower or 'define python' in message_lower:
        return """**Python** is a high-level, interpreted programming language known for:

• **Simple & Readable**: Clean syntax that's easy to learn
• **Versatile**: Used for web development, data science, AI, automation, and more
• **Large Community**: Extensive libraries and frameworks
• **Cross-platform**: Runs on Windows, Mac, and Linux
• **Popular Fields**: Machine learning, web development, data analysis, scripting

Python is great for beginners and powers applications like Instagram, YouTube, and Dropbox!"""
    
    if 'what is java' in message_lower or 'define java' in message_lower:
        return """**Java** is a powerful, object-oriented programming language known for:

• **Platform Independent**: "Write once, run anywhere" with JVM
• **Object-Oriented**: Everything is an object with strong OOP principles
• **Robust & Secure**: Built-in memory management and security features
• **Enterprise Focus**: Widely used in large-scale business applications
• **Popular Fields**: Enterprise software, Android apps, web backends, big data

Java powers Android apps, enterprise systems, and major platforms like LinkedIn and Amazon!"""
    
    if 'what is javascript' in message_lower or 'define javascript' in message_lower:
        return """**JavaScript** is a dynamic programming language essential for web development:

• **Web Language**: Runs in every web browser
• **Frontend & Backend**: With Node.js, it works on both sides
• **Interactive**: Makes websites dynamic and responsive
• **Huge Ecosystem**: React, Angular, Vue, and countless libraries
• **Popular Fields**: Web development, mobile apps, server-side programming

JavaScript is the language of the web - every modern website uses it!"""
    
    if 'what is c++' in message_lower or 'define c++' in message_lower:
        return """**C++** is a high-performance programming language known for:

• **Speed & Power**: Direct memory control and system-level programming
• **Object-Oriented**: Supports OOP with C-style efficiency
• **System Programming**: Operating systems, game engines, embedded systems
• **Performance Critical**: When speed matters most
• **Popular Fields**: Game development, system software, high-frequency trading

C++ powers game engines like Unreal, Windows OS, and performance-critical applications!"""
    
    if 'what is html' in message_lower or 'define html' in message_lower:
        return """**HTML** (HyperText Markup Language) is the foundation of web pages:

• **Structure**: Defines the structure and content of web pages
• **Markup Language**: Uses tags to organize content
• **Universal**: Every webpage uses HTML
• **Easy to Learn**: Simple syntax for beginners
• **Core Technology**: Works with CSS and JavaScript for complete web pages

HTML is like the skeleton of a webpage - it provides structure and meaning!"""
    
    if 'what is css' in message_lower or 'define css' in message_lower:
        return """**CSS** (Cascading Style Sheets) is the styling language for web pages:

• **Styling**: Controls colors, layouts, fonts, and animations
• **Design**: Makes websites visually appealing
• **Responsive**: Adapts designs for different screen sizes
• **Powerful**: Modern CSS can create complex animations and layouts
• **Essential**: Every modern website uses CSS for design

CSS is like the clothing and makeup of a webpage - it makes it look beautiful!"""
    
    # Programming concepts
    if 'what is programming' in message_lower or 'define programming' in message_lower:
        return """**Programming** is the process of creating instructions for computers:

• **Problem Solving**: Breaking down problems into logical steps
• **Coding**: Writing instructions in programming languages
• **Creativity**: Building software, apps, games, and solutions
• **Logic**: Using algorithms and data structures
• **Universal Skill**: Valuable in every industry today

Programming is like teaching a computer how to solve problems step by step!"""
    
    if 'what is algorithm' in message_lower or 'define algorithm' in message_lower:
        return """**Algorithm** is a step-by-step procedure for solving a problem:

• **Recipe**: Like a recipe for solving a specific problem
• **Steps**: Clear, unambiguous instructions
• **Efficiency**: Good algorithms solve problems quickly
• **Foundation**: Core concept in computer science
• **Examples**: Sorting, searching, pathfinding, and more

Algorithms are the heart of programming - they're the logic behind every program!"""
    
    if 'what is database' in message_lower or 'define database' in message_lower:
        return """**Database** is an organized collection of structured information:

• **Data Storage**: Efficiently stores and retrieves data
• **Organized**: Data is structured in tables with relationships
• **Secure**: Controls access and protects data
• **Scalable**: Handles growing amounts of data
• **Popular Types**: SQL (MySQL, PostgreSQL) and NoSQL (MongoDB)

Databases are like digital filing cabinets - they organize and protect important information!"""
    
    # Check for greetings
    greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
    if any(greeting in message_lower for greeting in greetings):
        return "Hello! I'm your AI learning assistant. I can help you with programming concepts, subjects, assignments, quizzes, and general learning topics. What would you like to know?"
    
    # Check for subject-related questions
    subjects = Subject.query.all()
    subject_names = [subject.name.lower() for subject in subjects]
    
    if any(subject in message_lower for subject in subject_names):
        # Find which subject the user is asking about
        asked_subject = None
        for subject in subjects:
            if subject.name.lower() in message_lower:
                asked_subject = subject
                break
        
        if asked_subject:
            # Get questions for this subject
            questions = Question.query.filter_by(subject_id=asked_subject.id).all()
            if questions:
                response = f"I found information about {asked_subject.name}! Here are some topics covered:\n"
                topics = set()
                for q in questions:
                    topics.add(q.topic)
                response += "\n".join([f"• {topic}" for topic in list(topics)[:5]])
                response += f"\n\nThere are {len(questions)} questions available covering these topics. Would you like to try a quiz on {asked_subject.name}?"
                return response
            else:
                return f"{asked_subject.name} is available in our system! You can access learning materials, assignments, and quizzes for this subject."
    
    # Check for quiz-related questions
    quiz_keywords = ['quiz', 'test', 'exam', 'assessment', 'practice']
    if any(keyword in message_lower for keyword in quiz_keywords):
        return "I can help you with quizzes! We have quizzes available for different subjects and difficulty levels. You can access them through the student dashboard under each subject. Quizzes have 10, 20, or 30 questions depending on the level."
    
    # Check for assignment-related questions
    assignment_keywords = ['assignment', 'homework', 'project', 'task']
    if any(keyword in message_lower for keyword in assignment_keywords):
        return "Assignments are available for each subject! They include both basic and advanced level tasks. You can download assignments and submit them for feedback. Check the assignments section under any subject to get started."
    
    # Check for interview-related questions
    interview_keywords = ['interview', 'mock interview', 'practice interview', 'job interview']
    if any(keyword in message_lower for keyword in interview_keywords):
        return "Mock interviews are available to help you practice! You can upload your resume and get personalized interview questions. The system will provide feedback on your responses. Try it out under the interview section for any subject."
    
    # Check for performance-related questions
    performance_keywords = ['performance', 'score', 'grade', 'result', 'progress']
    if any(keyword in message_lower for keyword in performance_keywords):
        if user_id:
            # Get user's quiz results
            quizzes = Quiz.query.filter_by(student_id=user_id).all()
            if quizzes:
                avg_score = sum(q.score / q.total_questions for q in quizzes) / len(quizzes) * 100
                response = f"Your current performance: You've completed {len(quizzes)} quizzes with an average score of {avg_score:.1f}%"
                
                # Get interview results
                interviews = InterviewResult.query.filter_by(student_id=user_id).all()
                if interviews:
                    avg_interview_score = sum(i.score for i in interviews) / len(interviews)
                    response += f" and {len(interviews)} interviews with an average score of {avg_interview_score:.1f}"
                
                response += ". Keep up the good work! Would you like specific study recommendations?"
                return response
            else:
                return "I don't see any completed quizzes or interviews yet. Start with a subject quiz to track your performance!"
        else:
            return "I can help you track your performance! Log in to see your quiz scores, interview results, and get personalized recommendations."
    
    # Check for learning resources
    resource_keywords = ['video', 'tutorial', 'learn', 'study', 'resource', 'material']
    if any(keyword in message_lower for keyword in resource_keywords):
        return "We have comprehensive learning resources! Each subject includes video tutorials at basic, intermediate, and advanced levels. You can find YouTube links and recommended study materials in the learning path section for each subject."
    
    # Check for help or general questions
    help_keywords = ['help', 'how to', 'what can you do', 'features']
    if any(keyword in message_lower for keyword in help_keywords):
        return """I'm your AI learning assistant! Here's what I can help you with:
        
• **Programming Languages**: Python, Java, JavaScript, C++, HTML, CSS, and more
• **Programming Concepts**: Algorithms, databases, programming fundamentals
• Answer questions about subjects and topics
• Provide information about quizzes and assignments
• Help with interview preparation
• Track your learning progress
• Suggest learning resources
• Explain concepts and provide study tips

Feel free to ask me anything about programming or your learning journey!"""
    
    # Default response for unrecognized questions
    fallback_responses = [
        "That's an interesting question! I'm still learning, but I can help you with subjects, quizzes, assignments, and learning resources. What specific topic would you like to explore?",
        "I'm here to help with your learning journey! Try asking me about specific subjects, quiz preparation, or available assignments.",
        "Great question! While I specialize in learning platform assistance, you can ask me about subjects, quizzes, interviews, or study resources.",
        "I'd love to help! I can provide information about our subjects, learning materials, quizzes, and track your progress. What would you like to know?"
    ]
    
    return random.choice(fallback_responses)

@app.route('/chatbot')
def chatbot_page():
    return render_template('chatbot.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """API endpoint for chatbot messages"""
    data = request.get_json()
    user_message = data.get('message', '')
    session_id = data.get('session_id', '')
    
    if not user_message.strip():
        return jsonify({'success': False, 'message': 'Please enter a message'})
    
    # Get user ID if logged in
    user_id = session.get('user_id') if 'user_id' in session else None
    
    # Generate chatbot response
    bot_response = get_chatbot_response(user_message, user_id)
    
    # Save conversation to database
    try:
        chat_message = ChatMessage(
            user_id=user_id,
            message=user_message,
            response=bot_response,
            session_id=session_id
        )
        db.session.add(chat_message)
        db.session.commit()
    except Exception as e:
        print(f"Error saving chat message: {e}")
        # Continue even if saving fails
    
    return jsonify({
        'success': True,
        'response': bot_response,
        'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route('/api/chat_history/<session_id>')
def chat_history(session_id):
    """Get chat history for a session"""
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp.asc()).all()
    
    history = []
    for msg in messages:
        history.append({
            'message': msg.message,
            'response': msg.response,
            'timestamp': msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({'success': True, 'history': history})

# Remove duplicate database initialization function

def init_database():
    """Initialize database with tables and sample data"""
    db.create_all()
    
    # Create sample users if they don't exist
    if not User.query.filter_by(username='teacher1').first():
        teacher = User(
            username='teacher1',
            email='teacher@example.com',
            password_hash=generate_password_hash('teacher123'),
            user_type='teacher'
        )
        db.session.add(teacher)
        db.session.commit()
        
        # Add sample subjects
        subjects = [
            Subject(name='Python', description='Learn Python programming', teacher_id=teacher.id),
            Subject(name='JavaScript', description='Learn JavaScript programming', teacher_id=teacher.id),
            Subject(name='Java', description='Learn Java programming', teacher_id=teacher.id)
        ]
        
        for subject in subjects:
            db.session.add(subject)
        
        db.session.commit()
        print("✓ Sample teacher and subjects created")
    
    # Create multiple student accounts
    student_accounts = [
        {'username': 'student1', 'email': 'student1@example.com', 'password': 'student123'},
        {'username': 'student2', 'email': 'student2@example.com', 'password': 'student123'},
        {'username': 'student3', 'email': 'student3@example.com', 'password': 'student123'},
        {'username': 'student4', 'email': 'student4@example.com', 'password': 'student123'},
        {'username': 'student5', 'email': 'student5@example.com', 'password': 'student123'}
    ]
    
    for account in student_accounts:
        if not User.query.filter_by(username=account['username']).first():
            student = User(
                username=account['username'],
                email=account['email'],
                password_hash=generate_password_hash(account['password']),
                user_type='student'
            )
            db.session.add(student)
    
    db.session.commit()
    print("✓ Sample students created")
    
    print("✓ Database initialized successfully")

if __name__ == '__main__':
    with app.app_context():
        try:
            init_database()
            print("\n🚀 Starting AI-Powered Smart Learning Platform...")
            print("📖 Demo Credentials:")
            print("   Teacher - Username: teacher1, Password: teacher123")
            print("   Student - Username: student1, Password: student123")
            print("\n🌐 Access the application at: http://localhost:5000")
            print("\n" + "="*60)
            
            app.run(debug=True, host='0.0.0.0', port=5000)
        except Exception as e:
            print(f"❌ Error starting application: {e}")
            print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
