import { Question, LearningResource } from '../types';

export const comedyDialogues = [
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺",
  "Why do Java developers wear glasses? Because they don't C# 👓",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
  "Why did the programmer quit his job? He didn't get arrays! 📊",
  "What's a programmer's favorite hangout place? Foo Bar! 🍻",
  "Why do programmers hate nature? It has too many bugs! 🌿",
  "What do you call a programmer from Finland? Nerdic! 🇫🇮",
  "Why did the developer break up with CSS? It wasn't responsive! 💔",
  "What's the object-oriented way to become wealthy? Inheritance! 💰"
];

export const assessmentQuestions: Question[] = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Management Language"],
    correct: 0,
    difficulty: "easy",
    category: "Web Development"
  },
  {
    id: 2,
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["string", "boolean", "float", "undefined"],
    correct: 2,
    difficulty: "easy",
    category: "JavaScript"
  },
  {
    id: 3,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    difficulty: "medium",
    category: "Algorithms"
  },
  {
    id: 4,
    question: "Which CSS property is used to change the text color?",
    options: ["color", "text-color", "font-color", "text-style"],
    correct: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 5,
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Advanced Programming Interface", "Application Program Interface", "Advanced Program Interface"],
    correct: 0,
    difficulty: "easy",
    category: "Programming Concepts"
  },
  {
    id: 6,
    question: "Which of the following is a Python web framework?",
    options: ["Angular", "React", "Django", "Vue"],
    correct: 2,
    difficulty: "medium",
    category: "Python"
  },
  {
    id: 7,
    question: "What is the default port for HTTP?",
    options: ["80", "443", "8080", "3000"],
    correct: 0,
    difficulty: "easy",
    category: "Web Development"
  },
  {
    id: 8,
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correct: 1,
    difficulty: "medium",
    category: "Data Structures"
  },
  {
    id: 9,
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
    correct: 1,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 10,
    question: "Which of the following is NOT a programming paradigm?",
    options: ["Object-Oriented", "Functional", "Procedural", "Circular"],
    correct: 3,
    difficulty: "medium",
    category: "Programming Concepts"
  },
  {
    id: 11,
    question: "What is the correct syntax for creating a function in JavaScript?",
    options: ["function = myFunction() {}", "function myFunction() {}", "create myFunction() {}", "def myFunction() {}"],
    correct: 1,
    difficulty: "easy",
    category: "JavaScript"
  },
  {
    id: 12,
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
    correct: 2,
    difficulty: "medium",
    category: "Databases"
  },
  {
    id: 13,
    question: "What does JSON stand for?",
    options: ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Oriented Notation", "Java Syntax Object Notation"],
    correct: 0,
    difficulty: "easy",
    category: "Web Development"
  },
  {
    id: 14,
    question: "Which sorting algorithm has the best average time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
    correct: 2,
    difficulty: "hard",
    category: "Algorithms"
  },
  {
    id: 15,
    question: "What is the purpose of the 'this' keyword in JavaScript?",
    options: ["To refer to the current object", "To create a new object", "To delete an object", "To copy an object"],
    correct: 0,
    difficulty: "medium",
    category: "JavaScript"
  },
  {
    id: 16,
    question: "Which HTTP method is used to update a resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correct: 2,
    difficulty: "medium",
    category: "Web Development"
  },
  {
    id: 17,
    question: "What is the Big O notation for linear search?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct: 2,
    difficulty: "medium",
    category: "Algorithms"
  },
  {
    id: 18,
    question: "Which CSS property is used to make text bold?",
    options: ["font-weight", "text-bold", "font-style", "text-weight"],
    correct: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 19,
    question: "What is a closure in JavaScript?",
    options: ["A way to close a function", "A function that has access to outer scope", "A method to end a loop", "A way to close a browser"],
    correct: 1,
    difficulty: "hard",
    category: "JavaScript"
  },
  {
    id: 20,
    question: "Which of the following is a version control system?",
    options: ["Git", "HTML", "CSS", "JavaScript"],
    correct: 0,
    difficulty: "easy",
    category: "Tools"
  },
  {
    id: 21,
    question: "What does DOM stand for?",
    options: ["Document Object Model", "Data Object Model", "Document Oriented Model", "Dynamic Object Model"],
    correct: 0,
    difficulty: "easy",
    category: "Web Development"
  },
  {
    id: 22,
    question: "Which principle suggests that a class should have only one reason to change?",
    options: ["Open/Closed Principle", "Single Responsibility Principle", "Liskov Substitution Principle", "Interface Segregation Principle"],
    correct: 1,
    difficulty: "hard",
    category: "Programming Concepts"
  },
  {
    id: 23,
    question: "What is the correct way to declare a variable in Python?",
    options: ["var x = 5", "let x = 5", "x = 5", "int x = 5"],
    correct: 2,
    difficulty: "easy",
    category: "Python"
  },
  {
    id: 24,
    question: "Which of the following is NOT a HTTP status code?",
    options: ["200", "404", "500", "600"],
    correct: 3,
    difficulty: "medium",
    category: "Web Development"
  },
  {
    id: 25,
    question: "What is the time complexity of accessing an element in an array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct: 0,
    difficulty: "easy",
    category: "Data Structures"
  },
  {
    id: 26,
    question: "Which CSS selector has the highest specificity?",
    options: ["Class selector", "ID selector", "Element selector", "Universal selector"],
    correct: 1,
    difficulty: "medium",
    category: "CSS"
  },
  {
    id: 27,
    question: "What is recursion in programming?",
    options: ["A loop that never ends", "A function that calls itself", "A way to repeat code", "A method to optimize code"],
    correct: 1,
    difficulty: "medium",
    category: "Programming Concepts"
  },
  {
    id: 28,
    question: "Which of the following is a JavaScript framework?",
    options: ["Django", "Flask", "React", "Laravel"],
    correct: 2,
    difficulty: "easy",
    category: "JavaScript"
  },
  {
    id: 29,
    question: "What is the purpose of a database index?",
    options: ["To store data", "To speed up queries", "To backup data", "To encrypt data"],
    correct: 1,
    difficulty: "medium",
    category: "Databases"
  },
  {
    id: 30,
    question: "Which design pattern ensures only one instance of a class exists?",
    options: ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Strategy Pattern"],
    correct: 2,
    difficulty: "hard",
    category: "Programming Concepts"
  }
];

export const learningResources: { [key: string]: LearningResource[] } = {
  javascript: [
    {
      id: "js1",
      title: "JavaScript Basics for Beginners",
      description: "Learn the fundamentals of JavaScript programming",
      youtubeUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      difficulty: "beginner",
      duration: "3h 26m"
    },
    {
      id: "js2",
      title: "Advanced JavaScript Concepts",
      description: "Master closures, prototypes, and async programming",
      youtubeUrl: "https://www.youtube.com/watch?v=hQVTIJBZook",
      difficulty: "advanced",
      duration: "2h 15m"
    },
    {
      id: "js3",
      title: "JavaScript ES6+ Features",
      description: "Modern JavaScript features and best practices",
      youtubeUrl: "https://www.youtube.com/watch?v=nZ1DMMsyVyI",
      difficulty: "intermediate",
      duration: "1h 45m"
    }
  ],
  python: [
    {
      id: "py1",
      title: "Python Full Course for Beginners",
      description: "Complete Python programming tutorial",
      youtubeUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      difficulty: "beginner",
      duration: "4h 26m"
    },
    {
      id: "py2",
      title: "Python Data Structures",
      description: "Learn lists, dictionaries, sets, and tuples",
      youtubeUrl: "https://www.youtube.com/watch?v=R-HLU9Fl5ug",
      difficulty: "intermediate",
      duration: "2h 30m"
    },
    {
      id: "py3",
      title: "Python Web Development with Django",
      description: "Build web applications using Django framework",
      youtubeUrl: "https://www.youtube.com/watch?v=F5mRW0jo-U4",
      difficulty: "advanced",
      duration: "3h 45m"
    }
  ],
  react: [
    {
      id: "react1",
      title: "React JS Course for Beginners",
      description: "Learn React fundamentals and build projects",
      youtubeUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      difficulty: "beginner",
      duration: "5h 15m"
    },
    {
      id: "react2",
      title: "React Hooks Deep Dive",
      description: "Master useState, useEffect, and custom hooks",
      youtubeUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
      difficulty: "intermediate",
      duration: "2h 45m"
    },
    {
      id: "react3",
      title: "React Performance Optimization",
      description: "Learn React.memo, useMemo, and useCallback",
      youtubeUrl: "https://www.youtube.com/watch?v=uojLJFt9SzY",
      difficulty: "advanced",
      duration: "1h 30m"
    }
  ],
  java: [
    {
      id: "java1",
      title: "Java Programming for Beginners",
      description: "Complete Java tutorial from basics to OOP",
      youtubeUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34",
      difficulty: "beginner",
      duration: "9h 0m"
    },
    {
      id: "java2",
      title: "Java Data Structures and Algorithms",
      description: "Master DSA concepts with Java implementation",
      youtubeUrl: "https://www.youtube.com/watch?v=CBYHwZcbD-s",
      difficulty: "intermediate",
      duration: "4h 30m"
    },
    {
      id: "java3",
      title: "Spring Boot Full Course",
      description: "Build enterprise applications with Spring Boot",
      youtubeUrl: "https://www.youtube.com/watch?v=9SGDpanrc8U",
      difficulty: "advanced",
      duration: "6h 15m"
    }
  ],
  html: [
    {
      id: "html1",
      title: "HTML Full Course for Beginners",
      description: "Learn HTML from scratch with practical examples",
      youtubeUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
      difficulty: "beginner",
      duration: "4h 0m"
    },
    {
      id: "html2",
      title: "HTML5 Semantic Elements",
      description: "Modern HTML5 features and best practices",
      youtubeUrl: "https://www.youtube.com/watch?v=kGW8Al_cga4",
      difficulty: "intermediate",
      duration: "2h 15m"
    },
    {
      id: "html3",
      title: "HTML Forms and Validation",
      description: "Advanced form handling and validation techniques",
      youtubeUrl: "https://www.youtube.com/watch?v=fNcJuPIZ2WE",
      difficulty: "intermediate",
      duration: "1h 45m"
    }
  ],
  css: [
    {
      id: "css1",
      title: "CSS Complete Course",
      description: "Master CSS styling from basics to advanced",
      youtubeUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
      difficulty: "beginner",
      duration: "7h 30m"
    },
    {
      id: "css2",
      title: "CSS Flexbox and Grid",
      description: "Modern layout techniques with Flexbox and Grid",
      youtubeUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
      difficulty: "intermediate",
      duration: "3h 20m"
    },
    {
      id: "css3",
      title: "CSS Animations and Transitions",
      description: "Create stunning animations and micro-interactions",
      youtubeUrl: "https://www.youtube.com/watch?v=zHUpx90NerM",
      difficulty: "advanced",
      duration: "2h 45m"
    }
  ],
  c: [
    {
      id: "c1",
      title: "C Programming for Beginners",
      description: "Learn C programming fundamentals and syntax",
      youtubeUrl: "https://www.youtube.com/watch?v=KJgsSFOSQv0",
      difficulty: "beginner",
      duration: "4h 0m"
    },
    {
      id: "c2",
      title: "C Pointers and Memory Management",
      description: "Master pointers, arrays, and dynamic memory",
      youtubeUrl: "https://www.youtube.com/watch?v=zuegQmMdy8M",
      difficulty: "intermediate",
      duration: "3h 15m"
    },
    {
      id: "c3",
      title: "C Data Structures Implementation",
      description: "Implement linked lists, stacks, and queues in C",
      youtubeUrl: "https://www.youtube.com/watch?v=B31LgI4Y4DQ",
      difficulty: "advanced",
      duration: "5h 30m"
    }
  ],
  ml: [
    {
      id: "ml1",
      title: "Machine Learning Full Course",
      description: "Complete ML course with Python and scikit-learn",
      youtubeUrl: "https://www.youtube.com/watch?v=NWONeJKn6kc",
      difficulty: "beginner",
      duration: "10h 0m"
    },
    {
      id: "ml2",
      title: "Machine Learning Algorithms Explained",
      description: "Deep dive into ML algorithms and mathematics",
      youtubeUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
      difficulty: "intermediate",
      duration: "6h 45m"
    },
    {
      id: "ml3",
      title: "MLOps and Model Deployment",
      description: "Deploy ML models to production environments",
      youtubeUrl: "https://www.youtube.com/watch?v=NH6XxYBgGHo",
      difficulty: "advanced",
      duration: "4h 20m"
    }
  ],
  dl: [
    {
      id: "dl1",
      title: "Deep Learning with TensorFlow",
      description: "Neural networks and deep learning fundamentals",
      youtubeUrl: "https://www.youtube.com/watch?v=tPYj3fFJGjk",
      difficulty: "beginner",
      duration: "7h 0m"
    },
    {
      id: "dl2",
      title: "Convolutional Neural Networks",
      description: "CNN for computer vision and image processing",
      youtubeUrl: "https://www.youtube.com/watch?v=YRhxdVk_sIs",
      difficulty: "intermediate",
      duration: "4h 30m"
    },
    {
      id: "dl3",
      title: "Advanced Deep Learning with PyTorch",
      description: "GANs, RNNs, and transformer architectures",
      youtubeUrl: "https://www.youtube.com/watch?v=c36lUUr864M",
      difficulty: "advanced",
      duration: "8h 15m"
    }
  ]
};