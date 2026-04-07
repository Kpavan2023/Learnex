from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import random
import json
import os
import re
from dotenv import load_dotenv
import io

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///learning_platform.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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

class InterviewResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    questions_answers = db.Column(db.Text, nullable=False)  # JSON string
    score = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.Text)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentEngagement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    activity_duration = db.Column(db.Integer, nullable=False)  # in seconds
    inactivity_periods = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

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

# Learning Resources with YouTube Videos
LEARNING_RESOURCES = {
    'Python': {
        'basic': [{
            'title': 'Python Basics for Beginners',
            'url': 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
            'duration': '4:26:52'
        }, {
            'title': 'Python Variables and Data Types',
            'url': 'https://www.youtube.com/watch?v=cQT33yu9pY8',
            'duration': '25:30'
        }],
        'intermediate': [{
            'title': 'Python Functions and Classes',
            'url': 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
            'duration': '2:30:15'
        }, {
            'title': 'Python File Handling',
            'url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM',
            'duration': '45:20'
        }],
        'advanced': [{
            'title': 'Advanced Python Programming',
            'url': 'https://www.youtube.com/watch?v=WGJJIrtnfpk',
            'duration': '3:15:42'
        }, {
            'title': 'Python Decorators and Generators',
            'url': 'https://www.youtube.com/watch?v=tmeKsb2Fras',
            'duration': '1:25:10'
        }]
    },
    'Java': {
        'basic': [{
            'title': 'Java Programming for Beginners',
            'url': 'https://www.youtube.com/watch?v=eIrMbAQSU34',
            'duration': '12:22:30'
        }],
        'intermediate': [{
            'title': 'Java OOP Concepts',
            'url': 'https://www.youtube.com/watch?v=BSVKUk58K6U',
            'duration': '2:45:15'
        }],
        'advanced': [{
            'title': 'Advanced Java Programming',
            'url': 'https://www.youtube.com/watch?v=grEKMHGYyns',
            'duration': '4:10:30'
        }]
    }
}

# Enhanced Sample Questions Data with 30+ questions per subject
SAMPLE_QUESTIONS = {
    'Python': [
        # Easy Questions (10)
        {'question': 'What is the correct way to create a list in Python?', 'options': ['list = []', 'list = ()', 'list = {}', 'list = ""'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Data Structures'},
        {'question': 'Which keyword is used to define a function in Python?', 'options': ['function', 'def', 'define', 'func'], 'correct': 1, 'difficulty': 'easy', 'topic': 'Functions'},
        {'question': 'How do you print "Hello World" in Python?', 'options': ['echo "Hello World"', 'print("Hello World")', 'printf("Hello World")', 'console.log("Hello World")'], 'correct': 1, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'Which of these is a Python data type?', 'options': ['int', 'varchar', 'boolean', 'double'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Data Types'},
        {'question': 'What is the correct file extension for Python files?', 'options': ['.py', '.python', '.pt', '.pyt'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'How do you create a comment in Python?', 'options': ['// comment', '/* comment */', '# comment', '<!-- comment -->'], 'correct': 2, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'Which operator is used for string concatenation in Python?', 'options': ['+', '&', '.', '||'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Operators'},
        {'question': 'What does len() function do?', 'options': ['Returns length of string/list', 'Returns last element', 'Returns first element', 'Returns type'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Built-in Functions'},
        {'question': 'How do you get user input in Python?', 'options': ['input()', 'get()', 'read()', 'scan()'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Input/Output'},
        {'question': 'Which of these is used for conditional statements?', 'options': ['if', 'when', 'condition', 'check'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Control Flow'},
        
        # Medium Questions (10)
        {'question': 'What is the output of print(2**3)?', 'options': ['6', '8', '9', '23'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Operators'},
        {'question': 'Which of the following is used for exception handling in Python?', 'options': ['try-catch', 'try-except', 'catch-throw', 'handle-error'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Exception Handling'},
        {'question': 'What is list comprehension?', 'options': ['A way to create lists', 'A way to compress lists', 'A way to sort lists', 'A way to delete lists'], 'correct': 0, 'difficulty': 'medium', 'topic': 'Data Structures'},
        {'question': 'What does the "self" parameter represent in Python classes?', 'options': ['Current instance', 'Class name', 'Method name', 'Module name'], 'correct': 0, 'difficulty': 'medium', 'topic': 'OOP'},
        {'question': 'Which method is used to add an element to the end of a list?', 'options': ['add()', 'append()', 'insert()', 'push()'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Data Structures'},
        {'question': 'What is the difference between "==" and "is" operators?', 'options': ['No difference', '== checks value, is checks identity', 'is checks value, == checks identity', 'Both check identity'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Operators'},
        {'question': 'How do you open a file in Python?', 'options': ['open()', 'file()', 'read()', 'load()'], 'correct': 0, 'difficulty': 'medium', 'topic': 'File Handling'},
        {'question': 'What is a lambda function?', 'options': ['Anonymous function', 'Named function', 'Class method', 'Built-in function'], 'correct': 0, 'difficulty': 'medium', 'topic': 'Functions'},
        {'question': 'Which module is used for regular expressions?', 'options': ['regex', 're', 'regexp', 'regx'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Modules'},
        {'question': 'What does the "global" keyword do?', 'options': ['Creates global variable', 'Accesses global variable', 'Deletes global variable', 'Lists global variables'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Scope'},
        
        # Hard Questions (10)
        {'question': 'What is a decorator in Python?', 'options': ['A design pattern', 'A function that modifies another function', 'A class method', 'A variable type'], 'correct': 1, 'difficulty': 'hard', 'topic': 'Advanced Concepts'},
        {'question': 'What is the difference between deep copy and shallow copy?', 'options': ['No difference', 'Deep copy copies references, shallow copy copies values', 'Shallow copy copies references, deep copy copies values', 'Both copy references'], 'correct': 2, 'difficulty': 'hard', 'topic': 'Memory Management'},
        {'question': 'What is a generator in Python?', 'options': ['A function that returns iterator', 'A class constructor', 'A module importer', 'A variable type'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Advanced Concepts'},
        {'question': 'What is the purpose of __init__ method?', 'options': ['Initialize object', 'Destroy object', 'Copy object', 'Compare objects'], 'correct': 0, 'difficulty': 'hard', 'topic': 'OOP'},
        {'question': 'What is metaclass in Python?', 'options': ['Class of a class', 'Parent class', 'Child class', 'Abstract class'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Advanced OOP'},
        {'question': 'What is the GIL in Python?', 'options': ['Global Interpreter Lock', 'General Import Library', 'Global Interface Layer', 'General Input Lock'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Threading'},
        {'question': 'What is monkey patching?', 'options': ['Dynamic modification of classes/modules', 'Bug fixing', 'Code optimization', 'Memory management'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Advanced Concepts'},
        {'question': 'What is the difference between @staticmethod and @classmethod?', 'options': ['No difference', 'staticmethod takes cls, classmethod takes self', 'staticmethod takes no special args, classmethod takes cls', 'Both take self'], 'correct': 2, 'difficulty': 'hard', 'topic': 'OOP'},
        {'question': 'What is context manager in Python?', 'options': ['Object that defines with statement behavior', 'Memory manager', 'Process manager', 'Thread manager'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Advanced Concepts'},
        {'question': 'What is the purpose of __slots__?', 'options': ['Restrict attributes and save memory', 'Create methods', 'Handle exceptions', 'Import modules'], 'correct': 0, 'difficulty': 'hard', 'topic': 'Memory Management'}
    ],
    'Java': [
        # Easy Questions
        {'question': 'Which of the following is the correct way to declare a main method in Java?', 'options': ['public static void main(String[] args)', 'static public void main(String[] args)', 'public void main(String[] args)', 'void main(String[] args)'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Methods'},
        {'question': 'What is the size of int in Java?', 'options': ['16 bits', '32 bits', '64 bits', '8 bits'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Data Types'},
        {'question': 'Which keyword is used to create a class in Java?', 'options': ['class', 'Class', 'new', 'create'], 'correct': 0, 'difficulty': 'easy', 'topic': 'OOP'},
        {'question': 'What is the correct file extension for Java files?', 'options': ['.java', '.jav', '.j', '.class'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'Which operator is used for string concatenation in Java?', 'options': ['+', '&', '.', '||'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Operators'},
        {'question': 'How do you print in Java?', 'options': ['System.out.println()', 'print()', 'console.log()', 'echo'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'Which keyword is used for inheritance in Java?', 'options': ['extends', 'inherits', 'implements', 'super'], 'correct': 0, 'difficulty': 'easy', 'topic': 'OOP'},
        {'question': 'What is the default value of int in Java?', 'options': ['0', '1', 'null', 'undefined'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Data Types'},
        {'question': 'Which access modifier provides the widest accessibility?', 'options': ['public', 'private', 'protected', 'default'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Access Modifiers'},
        {'question': 'What is used to create objects in Java?', 'options': ['new', 'create', 'object', 'make'], 'correct': 0, 'difficulty': 'easy', 'topic': 'OOP'}
    ],
    'JavaScript': [
        # Easy Questions
        {'question': 'How do you declare a variable in JavaScript?', 'options': ['var x;', 'variable x;', 'declare x;', 'x variable;'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Variables'},
        {'question': 'Which method is used to add an element to the end of an array?', 'options': ['add()', 'append()', 'push()', 'insert()'], 'correct': 2, 'difficulty': 'easy', 'topic': 'Arrays'},
        {'question': 'What is the correct way to write a JavaScript array?', 'options': ['var colors = "red", "green", "blue"', 'var colors = ["red", "green", "blue"]', 'var colors = (1:"red", 2:"green", 3:"blue")', 'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")'], 'correct': 1, 'difficulty': 'medium', 'topic': 'Arrays'},
        {'question': 'How do you write a comment in JavaScript?', 'options': ['// comment', '# comment', '/* comment', '<!-- comment -->'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Basic Syntax'},
        {'question': 'Which function is used to parse a string to integer?', 'options': ['parseInt()', 'parseInteger()', 'int()', 'toInt()'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Built-in Functions'},
        {'question': 'What is the correct way to create a function?', 'options': ['function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'function = myFunction() {}'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Functions'},
        {'question': 'Which operator is used for strict equality?', 'options': ['==', '===', '=', '!='], 'correct': 1, 'difficulty': 'easy', 'topic': 'Operators'},
        {'question': 'How do you get the length of a string?', 'options': ['string.length', 'length(string)', 'string.size()', 'sizeof(string)'], 'correct': 0, 'difficulty': 'easy', 'topic': 'String Methods'},
        {'question': 'What does DOM stand for?', 'options': ['Document Object Model', 'Data Object Management', 'Dynamic Object Model', 'Document Oriented Model'], 'correct': 0, 'difficulty': 'easy', 'topic': 'DOM'},
        {'question': 'Which method removes the last element from an array?', 'options': ['pop()', 'remove()', 'delete()', 'shift()'], 'correct': 0, 'difficulty': 'easy', 'topic': 'Arrays'}
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

@app.route('/teacher')
def teacher_dashboard():
    return render_template('teacher_dashboard.html')

@app.route('/student')
def student_dashboard():
    return render_template('student_dashboard.html')

# Teacher Routes
@app.route('/teacher/subjects')
def teacher_subjects():
    teacher = User.query.filter_by(user_type='teacher').first()
    if teacher:
        subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    else:
        subjects = []
    return render_template('teacher_subjects.html', subjects=subjects)

@app.route('/teacher/add_subject', methods=['POST'])
def add_subject():
    data = request.get_json()
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

@app.route('/teacher/generate_question_paper', methods=['POST'])
def generate_question_paper():
    data = request.get_json()
    subject_name = data.get('subject')
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 10)
    
    if subject_name in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[subject_name]
        if difficulty != 'all':
            questions = [q for q in questions if q['difficulty'] == difficulty]
        
        selected_questions = random.sample(questions, min(len(questions), num_questions))
        return jsonify({'success': True, 'questions': selected_questions})
    
    return jsonify({'success': False, 'message': 'Subject not found'})

@app.route('/teacher/student_performance')
def student_performance():
    # Get all quiz results for performance analysis
    teacher = User.query.filter_by(user_type='teacher').first()
    if teacher:
        quizzes = db.session.query(Quiz, User, Subject).join(User, Quiz.student_id == User.id).join(Subject, Quiz.subject_id == Subject.id).filter(Subject.teacher_id == teacher.id).all()
    else:
        quizzes = []
    
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
            'completed_at': quiz.completed_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return render_template('student_performance.html', performance_data=performance_data)

@app.route('/teacher/predict_performance', methods=['POST'])
def predict_performance():
    data = request.get_json()
    learning_score = float(data.get('learning_score', 75))
    reading_score = float(data.get('reading_score', 80))
    lunch_quality = data.get('lunch_quality', 'standard')  # free, reduced, standard
    previous_exam_marks = float(data.get('previous_exam_marks', 70))
    study_hours = float(data.get('study_hours', 4))
    
    # Simple prediction logic based on weighted attributes
    base_score = (learning_score * 0.3 + reading_score * 0.25 + previous_exam_marks * 0.3 + study_hours * 2.5)
    
    # Adjust for lunch quality (socioeconomic factor)
    if lunch_quality == 'free':
        base_score *= 0.95
    elif lunch_quality == 'reduced':
        base_score *= 0.97
    else:
        base_score *= 1.0
    
    # Add some randomness to make it more realistic
    import random
    predicted_score = max(0, min(100, base_score + random.uniform(-5, 5)))
    
    # Generate recommendations based on predicted score
    recommendations = []
    if predicted_score < 50:
        recommendations = [
            "Focus on fundamental concepts",
            "Increase study hours to at least 6 hours daily",
            "Provide additional tutoring support",
            "Consider remedial classes"
        ]
    elif predicted_score < 70:
        recommendations = [
            "Review weak topics regularly",
            "Practice more mock tests",
            "Improve reading comprehension",
            "Maintain consistent study schedule"
        ]
    elif predicted_score < 85:
        recommendations = [
            "Focus on advanced problem-solving",
            "Challenge with higher difficulty questions",
            "Prepare for competitive exams",
            "Consider leadership roles in study groups"
        ]
    else:
        recommendations = [
            "Excellent performance predicted!",
            "Focus on research projects",
            "Mentor other students",
            "Prepare for advanced certifications"
        ]
    
    return jsonify({
        'success': True,
        'predicted_score': round(predicted_score, 2),
        'performance_level': 'Excellent' if predicted_score >= 85 else 'Good' if predicted_score >= 70 else 'Average' if predicted_score >= 50 else 'Needs Improvement',
        'recommendations': recommendations,
        'factors': {
            'learning_score': learning_score,
            'reading_score': reading_score,
            'lunch_quality': lunch_quality,
            'previous_exam_marks': previous_exam_marks,
            'study_hours': study_hours
        }
    })

@app.route('/teacher/interview_results')
def teacher_interview_results():
    # Get interview results for teacher's subjects
    teacher = User.query.filter_by(user_type='teacher').first()
    if teacher:
        results = db.session.query(InterviewResult, User, Subject).join(User, InterviewResult.student_id == User.id).join(Subject, InterviewResult.subject_id == Subject.id).filter(Subject.teacher_id == teacher.id).all()
    else:
        results = []
    
    interview_data = []
    for result, student, subject in results:
        interview_data.append({
            'student_name': student.username,
            'subject': subject.name,
            'score': result.score,
            'feedback': result.feedback,
            'completed_at': result.completed_at.strftime('%Y-%m-%d %H:%M'),
            'questions_answers': json.loads(result.questions_answers)
        })
    
    return render_template('teacher_interview_results.html', interview_data=interview_data)

# Student Routes
@app.route('/student/subjects')
def student_subjects():
    subjects = Subject.query.all()
    return render_template('student_subjects.html', subjects=subjects)

@app.route('/student/learning_path/<int:subject_id>')
def learning_path(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    
    # Get learning resources for this subject
    resources = LEARNING_RESOURCES.get(subject.name, {
        'basic': [{'title': f'{subject.name} Basics', 'url': '#', 'duration': '30:00'}],
        'intermediate': [{'title': f'{subject.name} Intermediate', 'url': '#', 'duration': '45:00'}],
        'advanced': [{'title': f'{subject.name} Advanced', 'url': '#', 'duration': '60:00'}]
    })
    
    # Get student's quiz history for this subject to determine progress
    student = User.query.filter_by(user_type='student').first()
    progress = 0
    recommended_level = 'basic'
    
    if student:
        quizzes = Quiz.query.filter_by(student_id=student.id, subject_id=subject_id).all()
        if quizzes:
            avg_score = sum(q.score / q.total_questions for q in quizzes) / len(quizzes)
            progress = avg_score * 100
            
            if avg_score >= 0.8:
                recommended_level = 'advanced'
            elif avg_score >= 0.6:
                recommended_level = 'intermediate'
    
    return render_template('learning_path.html', 
                         subject=subject, 
                         resources=resources,
                         progress=progress,
                         recommended_level=recommended_level)

@app.route('/student/assignments/<int:subject_id>')
def assignments(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    assignments = Assignment.query.filter_by(subject_id=subject_id).all()
    
    return render_template('assignments.html', subject=subject, assignments=assignments)

@app.route('/student/quiz/<int:subject_id>/<int:level>')
def quiz(subject_id, level):
    subject = Subject.query.get_or_404(subject_id)
    
    # Get questions based on level
    question_counts = {1: 10, 2: 20, 3: 30}
    num_questions = question_counts.get(level, 10)
    
    if subject.name in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[subject.name]
        selected_questions = random.sample(questions, min(len(questions), num_questions))
    else:
        selected_questions = []
    
    return render_template('quiz.html', subject=subject, level=level, questions=selected_questions)

@app.route('/student/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    subject_id = data.get('subject_id')
    level = data.get('level')
    answers = data.get('answers')
    time_spent = data.get('time_spent')
    
    # Calculate score
    subject = Subject.query.get(subject_id)
    if subject.name in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[subject.name]
        score = 0
        for i, answer in enumerate(answers):
            if i < len(questions) and answer == questions[i]['correct']:
                score += 1
        
        total_questions = len(answers)
        percentage = (score / total_questions) * 100
        
        # Save quiz result (using first student for demo)
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
        
        # Send email if failed (below 60%)
        if percentage < 60:
            try:
                if student:
                    msg = Message(
                        'Quiz Result - Needs Improvement',
                        sender=app.config['MAIL_USERNAME'],
                        recipients=[student.email]
                    )
                    msg.body = f'''
                    Dear Student,
                    
                    You have completed the {subject.name} Level {level} quiz with a score of {score}/{total_questions} ({percentage:.1f}%).
                    
                    This score indicates that you might benefit from additional study in this subject. We recommend:
                    1. Reviewing the learning materials
                    2. Taking practice quizzes
                    3. Seeking help from your instructor
                    
                    Keep up the good work and don't give up!
                    
                    Best regards,
                    AI Learning Platform Team
                    '''
                    mail.send(msg)
            except Exception as e:
                print(f"Email sending failed: {e}")
        
        return jsonify({
            'success': True,
            'score': score,
            'total_questions': total_questions,
            'percentage': percentage,
            'passed': percentage >= 60
        })
    
    return jsonify({'success': False, 'message': 'Subject not found'})

@app.route('/student/interview/<int:subject_id>')
def interview(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    
    # Generate interview questions based on subject
    interview_questions = {
        'Python': [
            "Tell me about yourself and your experience with Python.",
            "What are the key features of Python?",
            "Explain the difference between lists and tuples.",
            "How do you handle exceptions in Python?",
            "What is a decorator and how would you use it?"
        ],
        'JavaScript': [
            "Tell me about yourself and your JavaScript experience.",
            "What is the difference between let, const, and var?",
            "Explain closures in JavaScript.",
            "What is event bubbling?",
            "How do you handle asynchronous operations in JavaScript?"
        ],
        'Java': [
            "Tell me about yourself and your Java experience.",
            "What are the main principles of OOP?",
            "Explain the difference between abstract classes and interfaces.",
            "What is the Java Virtual Machine?",
            "How does garbage collection work in Java?"
        ]
    }
    
    questions = interview_questions.get(subject.name, [
        "Tell me about yourself.",
        "What interests you about this subject?",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in 5 years?",
        "Why should we choose you?"
    ])
    
    return render_template('interview.html', subject=subject, questions=questions)

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
    
    # Save interview result (using first student for demo)
    student = User.query.filter_by(user_type='student').first()
    if student:
        interview_result = InterviewResult(
            student_id=student.id,
            subject_id=subject_id,
            questions_answers=json.dumps(answers),
            score=total_score,
            feedback='\n'.join(feedback)
        )
        
        db.session.add(interview_result)
        db.session.commit()
    
    return jsonify({
        'success': True,
        'score': total_score,
        'max_score': len(answers) * 5,
        'feedback': feedback,
        'passed': total_score >= (len(answers) * 3)
    })

@app.route('/student/games')
def games():
    return render_template('games.html')

@app.route('/student/resume_upload')
def resume_upload():
    return render_template('resume_upload.html')

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
            import PyPDF2
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
    
    # Extract projects (simple pattern matching)
    project_patterns = [
        r'project[s]?:\s*(.+?)(?:\n|$)',
        r'experience[:\s]*(.+?)(?:\n\n|\n[A-Z]|\Z)',
        r'worked on[:\s]*(.+?)(?:\n\n|\n[A-Z]|\Z)',
        r'developed[:\s]*(.+?)(?:\n\n|\n[A-Z]|\Z)'
    ]
    
    extracted_projects = []
    for pattern in project_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            if len(match.strip()) > 10:
                extracted_projects.append(match.strip()[:100] + "..." if len(match.strip()) > 100 else match.strip())
    
    extracted_projects = extracted_projects[:5]  # Limit to top 5 projects
    
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
    
    # Generate interview questions based on extracted skills
    questions = generate_interview_questions(extracted_skills)
    
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

def generate_interview_questions(skills):
    """Generate interview questions based on extracted skills"""
    
    base_questions = [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and weaknesses?",
        "Why are you interested in this role/position?",
        "Where do you see yourself in 5 years?",
        "Describe a challenging project you worked on."
    ]
    
    skill_questions = {
        'python': "What is your experience with Python and what frameworks have you used?",
        'java': "Explain your experience with Java and enterprise applications.",
        'javascript': "What JavaScript frameworks and libraries are you familiar with?",
        'react': "Describe your experience with React and state management.",
        'nodejs': "How have you used Node.js in backend development?",
        'sql': "What databases have you worked with and what's your experience level?",
        'aws': "Describe your experience with AWS services and cloud architecture.",
        'docker': "How have you used Docker in your development workflow?",
        'git': "What's your experience with version control and Git workflows?",
        'machine learning': "What machine learning projects have you worked on?"
    }
    
    # Add skill-specific questions based on extracted skills
    questions = base_questions.copy()
    for skill in skills[:5]:  # Limit to top 5 skills
        if skill in skill_questions:
            questions.append(skill_questions[skill])
    
    return questions[:10]  # Return maximum 10 questions

@app.route('/api/comedy_content')
def get_comedy_content():
    return jsonify({'content': random.choice(COMEDY_CONTENT)})

@app.route('/api/engagement_check', methods=['POST'])
def engagement_check():
    data = request.get_json()
    activity_type = data.get('activity_type')
    duration = data.get('duration')
    inactivity_periods = data.get('inactivity_periods', 0)
    
    # Save engagement data (using first student for demo)
    student = User.query.filter_by(user_type='student').first()
    if student:
        engagement = StudentEngagement(
            student_id=student.id,
            activity_type=activity_type,
            activity_duration=duration,
            inactivity_periods=inactivity_periods
        )
        
        db.session.add(engagement)
        db.session.commit()
    
    # Suggest break if too many inactivity periods
    suggest_break = inactivity_periods > 3
    
    return jsonify({
        'success': True,
        'suggest_break': suggest_break,
        'message': 'Are you bored? Want to take a short game break or continue?' if suggest_break else None
    })

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
            Subject(name='Python', description='Learn Python programming from basics to advanced', teacher_id=teacher.id),
            Subject(name='Java', description='Master Java programming and OOP concepts', teacher_id=teacher.id),
            Subject(name='Machine Learning', description='Understand ML algorithms and applications', teacher_id=teacher.id),
            Subject(name='Deep Learning', description='Neural networks and deep learning techniques', teacher_id=teacher.id),
            Subject(name='Data Science', description='Data analysis, visualization and statistics', teacher_id=teacher.id),
            Subject(name='Cyber Security', description='Network security and ethical hacking', teacher_id=teacher.id),
            Subject(name='HTML', description='HyperText Markup Language fundamentals', teacher_id=teacher.id),
            Subject(name='CSS', description='Cascading Style Sheets for web design', teacher_id=teacher.id),
            Subject(name='JavaScript', description='Dynamic web programming with JavaScript', teacher_id=teacher.id),
            Subject(name='C', description='System programming with C language', teacher_id=teacher.id),
            Subject(name='C++', description='Object-oriented programming with C++', teacher_id=teacher.id)
        ]
        
        for subject in subjects:
            db.session.add(subject)
        
        db.session.commit()
        print("✓ Sample teacher and subjects created")
    
    if not User.query.filter_by(username='student1').first():
        student = User(
            username='student1',
            email='student@example.com',
            password_hash=generate_password_hash('student123'),
            user_type='student'
        )
        db.session.add(student)
        db.session.commit()
        print("✓ Sample student created")
    
    print("✓ Database initialized successfully")

if __name__ == '__main__':
    with app.app_context():
        try:
            init_database()
            print("\n🚀 Starting AI-Powered Smart Learning Platform...")
            print("📚 Direct Access - No Login Required!")
            print("   🎓 Teacher Dashboard: http://localhost:5000/teacher")
            print("   👨‍🎓 Student Dashboard: http://localhost:5000/student")
            print("\n🌐 Main Page: http://localhost:5000")
            print("\n" + "="*60)
            
            app.run(debug=True, host='0.0.0.0', port=5000)
        except Exception as e:
            print(f"❌ Error starting application: {e}")
            print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
