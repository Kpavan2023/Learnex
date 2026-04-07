# Learnex -- AI-Powered Smart Learning Platform

Learnex is an intelligent AI-based learning platform designed to provide
personalized learning experiences using Machine Learning, Natural
Language Processing, and performance analytics. The system adapts
learning paths based on student progress, predicts academic performance,
and provides interactive learning support.

------------------------------------------------------------------------

## Features

-   Personalized Learning Paths based on performance
-   AI-based Performance Prediction using Machine Learning
-   Resume Analysis with skill gap identification
-   Quiz & Assignment Management
-   Gamification for increased engagement
-   Admin dashboard for managing students and teachers
-   Analytics dashboard with visual insights
-   Chatbot for basic student queries

------------------------------------------------------------------------

## Tech Stack

### Backend

-   Python
-   Flask
-   Flask-Login (authentication)
-   Flask-RESTful APIs

### Machine Learning

-   Scikit-learn
-   NLP (NLTK / spaCy)
-   Joblib (model storage)

### Frontend

-   HTML
-   CSS
-   JavaScript
-   TypeScript (TSX)
-   TailwindCSS

### Database

-   SQLite
-   SQLAlchemy ORM

### Other Tools

-   Pandas
-   Matplotlib
-   Chart.js

------------------------------------------------------------------------

## System Architecture

User → Frontend → Flask Backend → ML Engine → Database

Modules: - Student Module - Teacher Module - Admin Module - Resume
Analysis Module - Gamification Module - Analytics Module - Chatbot
Module

------------------------------------------------------------------------

## Installation

### Clone repository

git clone https://github.com/yourusername/Learnex.git

### Backend setup

cd Learnex python -m venv venv venv`\Scripts`{=tex}`\activate`{=tex}

pip install -r requirements.txt

### Run Flask app

python app.py

### Frontend setup

npm install npm run dev

---

## 📁 Folder Structure

```plaintext
Learnex/
│
├── src/                        # Frontend (React + TypeScript + Tailwind)
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── templates/                  # Flask HTML templates
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── result.html
│
├── static/                     # Static files (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
│
├── instance/
│   └── learning_platform.db    # SQLite database
│
├── train_model.py              # ML training script
├── student_data.csv            # Dataset
├── student_score_model.joblib  # Trained ML model
│
├── app.py                      # Flask backend
│
├── package.json
├── requirements.txt
├── tailwind.config.js
├── vite.config.ts
│
├── .gitignore
└── README.md
```
------------------------------------------------------------------------

## Usage

1.  Register as student or teacher
2.  Login to dashboard
3.  Attempt quizzes
4.  Upload resume for analysis
5.  View performance analytics
6.  Receive personalized recommendations

------------------------------------------------------------------------

## Future Scope

-   Advanced Deep Learning models
-   Mobile application
-   LMS integration
-   Real-time analytics
-   Multilingual AI Tutor
-   Voice-based interaction

------------------------------------------------------------------------

## Author

Developed by **Pavan Kumar** and Team  

**Learnex** – Next Generation AI-Powered Learning Platform
