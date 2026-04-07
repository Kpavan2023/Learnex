import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, CheckCircle, XCircle, Clock, User, Code, Trophy, AlertCircle } from 'lucide-react';

interface InterviewProps {
  selectedLanguage: string;
  onComplete: (result: InterviewResult) => void;
}

interface InterviewResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  feedback: string[];
  answers: { question: string; answer: string; score: number }[];
}

interface Question {
  id: number;
  question: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  expectedKeywords: string[];
  category: string;
}

export const Interview: React.FC<InterviewProps> = ({ selectedLanguage, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'questions' | 'complete'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState<{ question: string; answer: string; score: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute per question
  const [startTime] = useState(Date.now());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Question banks for different languages
  const questionBanks: { [key: string]: Question[] } = {
    javascript: [
      { id: 1, question: "What is JavaScript and what are its main features?", difficulty: 'basic', expectedKeywords: ['dynamic', 'interpreted', 'prototype', 'event-driven'], category: 'Fundamentals' },
      { id: 2, question: "Explain the difference between var, let, and const.", difficulty: 'basic', expectedKeywords: ['scope', 'hoisting', 'block', 'reassignment'], category: 'Variables' },
      { id: 3, question: "What is a closure in JavaScript? Give an example.", difficulty: 'intermediate', expectedKeywords: ['closure', 'scope', 'function', 'lexical'], category: 'Functions' },
      { id: 4, question: "Explain event bubbling and event capturing.", difficulty: 'intermediate', expectedKeywords: ['bubbling', 'capturing', 'event', 'propagation'], category: 'DOM' },
      { id: 5, question: "What are Promises and how do they work?", difficulty: 'intermediate', expectedKeywords: ['promise', 'async', 'resolve', 'reject'], category: 'Async' },
      { id: 6, question: "Explain the concept of prototypal inheritance.", difficulty: 'advanced', expectedKeywords: ['prototype', 'inheritance', 'chain', 'object'], category: 'OOP' },
      { id: 7, question: "What is the difference between call, apply, and bind?", difficulty: 'advanced', expectedKeywords: ['call', 'apply', 'bind', 'context'], category: 'Functions' },
      { id: 8, question: "Explain async/await and how it differs from Promises.", difficulty: 'advanced', expectedKeywords: ['async', 'await', 'promise', 'synchronous'], category: 'Async' },
      { id: 9, question: "What is the Event Loop in JavaScript?", difficulty: 'advanced', expectedKeywords: ['event loop', 'callback', 'queue', 'stack'], category: 'Runtime' },
      { id: 10, question: "Explain memory management and garbage collection in JavaScript.", difficulty: 'advanced', expectedKeywords: ['memory', 'garbage', 'collection', 'reference'], category: 'Performance' }
    ],
    python: [
      { id: 1, question: "What is Python and what makes it popular?", difficulty: 'basic', expectedKeywords: ['interpreted', 'readable', 'versatile', 'libraries'], category: 'Fundamentals' },
      { id: 2, question: "Explain the difference between lists and tuples.", difficulty: 'basic', expectedKeywords: ['mutable', 'immutable', 'ordered', 'collection'], category: 'Data Types' },
      { id: 3, question: "What are decorators in Python?", difficulty: 'intermediate', expectedKeywords: ['decorator', 'function', 'wrapper', 'metadata'], category: 'Functions' },
      { id: 4, question: "Explain list comprehensions and their benefits.", difficulty: 'intermediate', expectedKeywords: ['comprehension', 'concise', 'readable', 'performance'], category: 'Data Structures' },
      { id: 5, question: "What is the difference between __str__ and __repr__?", difficulty: 'intermediate', expectedKeywords: ['string', 'representation', 'debugging', 'object'], category: 'OOP' },
      { id: 6, question: "Explain generators and yield keyword.", difficulty: 'advanced', expectedKeywords: ['generator', 'yield', 'iterator', 'memory'], category: 'Advanced' },
      { id: 7, question: "What is the Global Interpreter Lock (GIL)?", difficulty: 'advanced', expectedKeywords: ['GIL', 'threading', 'performance', 'bytecode'], category: 'Concurrency' },
      { id: 8, question: "Explain metaclasses in Python.", difficulty: 'advanced', expectedKeywords: ['metaclass', 'class', 'creation', 'type'], category: 'OOP' },
      { id: 9, question: "What are context managers and the with statement?", difficulty: 'advanced', expectedKeywords: ['context', 'manager', 'with', 'resource'], category: 'Resource Management' },
      { id: 10, question: "Explain Python's memory management and garbage collection.", difficulty: 'advanced', expectedKeywords: ['memory', 'reference', 'counting', 'garbage'], category: 'Performance' }
    ],
    java: [
      { id: 1, question: "What is Java and what are its key principles?", difficulty: 'basic', expectedKeywords: ['object-oriented', 'platform-independent', 'robust', 'secure'], category: 'Fundamentals' },
      { id: 2, question: "Explain the difference between JDK, JRE, and JVM.", difficulty: 'basic', expectedKeywords: ['JDK', 'JRE', 'JVM', 'compilation'], category: 'Environment' },
      { id: 3, question: "What is inheritance and how is it implemented in Java?", difficulty: 'intermediate', expectedKeywords: ['inheritance', 'extends', 'super', 'polymorphism'], category: 'OOP' },
      { id: 4, question: "Explain the difference between abstract classes and interfaces.", difficulty: 'intermediate', expectedKeywords: ['abstract', 'interface', 'implementation', 'multiple'], category: 'OOP' },
      { id: 5, question: "What are collections in Java? Explain ArrayList vs LinkedList.", difficulty: 'intermediate', expectedKeywords: ['collections', 'ArrayList', 'LinkedList', 'performance'], category: 'Data Structures' },
      { id: 6, question: "Explain multithreading and synchronization in Java.", difficulty: 'advanced', expectedKeywords: ['thread', 'synchronization', 'concurrent', 'lock'], category: 'Concurrency' },
      { id: 7, question: "What is the Java Memory Model?", difficulty: 'advanced', expectedKeywords: ['memory', 'heap', 'stack', 'garbage'], category: 'Memory' },
      { id: 8, question: "Explain design patterns you've used in Java.", difficulty: 'advanced', expectedKeywords: ['singleton', 'factory', 'observer', 'pattern'], category: 'Design Patterns' },
      { id: 9, question: "What are lambda expressions and streams in Java 8?", difficulty: 'advanced', expectedKeywords: ['lambda', 'stream', 'functional', 'filter'], category: 'Modern Java' },
      { id: 10, question: "Explain Spring Framework and dependency injection.", difficulty: 'advanced', expectedKeywords: ['Spring', 'dependency', 'injection', 'IoC'], category: 'Frameworks' }
    ],
    react: [
      { id: 1, question: "What is React and what problems does it solve?", difficulty: 'basic', expectedKeywords: ['component', 'virtual DOM', 'reusable', 'declarative'], category: 'Fundamentals' },
      { id: 2, question: "Explain the difference between functional and class components.", difficulty: 'basic', expectedKeywords: ['functional', 'class', 'hooks', 'lifecycle'], category: 'Components' },
      { id: 3, question: "What are React hooks and why were they introduced?", difficulty: 'intermediate', expectedKeywords: ['hooks', 'useState', 'useEffect', 'stateful'], category: 'Hooks' },
      { id: 4, question: "Explain the component lifecycle methods.", difficulty: 'intermediate', expectedKeywords: ['lifecycle', 'mounting', 'updating', 'unmounting'], category: 'Lifecycle' },
      { id: 5, question: "What is state management and how do you handle it?", difficulty: 'intermediate', expectedKeywords: ['state', 'props', 'Redux', 'context'], category: 'State Management' },
      { id: 6, question: "Explain React's reconciliation algorithm.", difficulty: 'advanced', expectedKeywords: ['reconciliation', 'virtual DOM', 'diffing', 'keys'], category: 'Performance' },
      { id: 7, question: "What are higher-order components (HOCs)?", difficulty: 'advanced', expectedKeywords: ['HOC', 'higher-order', 'component', 'reusability'], category: 'Patterns' },
      { id: 8, question: "Explain React performance optimization techniques.", difficulty: 'advanced', expectedKeywords: ['memo', 'useMemo', 'useCallback', 'optimization'], category: 'Performance' },
      { id: 9, question: "What is server-side rendering (SSR) in React?", difficulty: 'advanced', expectedKeywords: ['SSR', 'server-side', 'Next.js', 'hydration'], category: 'SSR' },
      { id: 10, question: "Explain React testing strategies and tools.", difficulty: 'advanced', expectedKeywords: ['testing', 'Jest', 'React Testing Library', 'unit'], category: 'Testing' }
    ]
  };

  useEffect(() => {
    // Initialize speech recognition and media recorder
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setRecordingError('Speech recognition failed. You can type your answer instead.');
        setIsListening(false);
      };
    }

    // Initialize media recorder for audio recording
    initializeMediaRecorder();

    // Set questions based on selected language
    const languageQuestions = questionBanks[selectedLanguage] || questionBanks.javascript;
    setQuestions(languageQuestions);
  }, [selectedLanguage]);

  useEffect(() => {
    if (currentPhase === 'questions' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentPhase === 'questions') {
      handleNextQuestion();
    }
  }, [timeLeft, currentPhase]);

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
        
        // Convert audio to text (simulated)
        setTimeout(() => {
          if (transcript) {
            // Use existing transcript from speech recognition
          } else {
            // Simulate transcription
            setTranscript("Audio recorded successfully. Please type your answer or try speech recognition.");
          }
        }, 1000);
      };
      
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Failed to initialize media recorder:', error);
      setRecordingError('Microphone access denied. Please type your answers.');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isRecording) {
      setTranscript('');
      setIsListening(true);
      setRecordingError('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const startRecording = () => {
    if (mediaRecorder && !isRecording && !isListening) {
      setIsRecording(true);
      setRecordingError('');
      setTranscript('');
      audioChunksRef.current = [];
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      setIsRecording(false);
      mediaRecorder.stop();
    }
  };

  const evaluateAnswer = (answer: string, question: Question): number => {
    if (!answer.trim()) return 0;
    
    const answerLower = answer.toLowerCase();
    let score = 0;
    let keywordMatches = 0;
    
    // Check for expected keywords
    question.expectedKeywords.forEach(keyword => {
      if (answerLower.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Base score on keyword matches
    const keywordScore = (keywordMatches / question.expectedKeywords.length) * 60;
    
    // Length and coherence bonus
    const lengthBonus = Math.min(answer.split(' ').length / 20, 1) * 20;
    
    // Difficulty multiplier
    const difficultyMultiplier = question.difficulty === 'basic' ? 1 : question.difficulty === 'intermediate' ? 1.1 : 1.2;
    
    score = Math.min((keywordScore + lengthBonus) * difficultyMultiplier, 100);
    
    return Math.round(score);
  };

  const handleNextQuestion = () => {
    if (currentPhase === 'intro') {
      // Save introduction
      setAnswers([{ question: 'Self Introduction', answer: transcript, score: transcript.length > 50 ? 80 : 60 }]);
      setCurrentPhase('questions');
      setTimeLeft(60);
      setTranscript('');
    } else if (currentQuestion < questions.length - 1) {
      // Evaluate current answer
      const currentQ = questions[currentQuestion];
      const score = evaluateAnswer(transcript, currentQ);
      
      setAnswers(prev => [...prev, {
        question: currentQ.question,
        answer: transcript,
        score: score
      }]);
      
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(60);
      setTranscript('');
    } else {
      // Complete interview
      const currentQ = questions[currentQuestion];
      const score = evaluateAnswer(transcript, currentQ);
      
      const finalAnswers = [...answers, {
        question: currentQ.question,
        answer: transcript,
        score: score
      }];
      
      completeInterview(finalAnswers);
    }
  };

  const completeInterview = (finalAnswers: { question: string; answer: string; score: number }[]) => {
    const totalScore = finalAnswers.reduce((sum, answer) => sum + answer.score, 0);
    const averageScore = totalScore / finalAnswers.length;
    const passed = averageScore >= 60;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    const feedback = [
      `Overall Performance: ${averageScore.toFixed(1)}%`,
      passed ? 'Congratulations! You passed the interview.' : 'You need more preparation. Keep learning!',
      `Strong areas: ${finalAnswers.filter(a => a.score >= 70).length} questions answered well`,
      `Areas for improvement: ${finalAnswers.filter(a => a.score < 60).length} questions need work`
    ];
    
    const result: InterviewResult = {
      score: Math.round(averageScore),
      totalQuestions: questions.length + 1, // +1 for introduction
      timeSpent,
      passed,
      feedback,
      answers: finalAnswers
    };
    
    setCurrentPhase('complete');
    
    setTimeout(() => {
      onComplete(result);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentPhase === 'complete') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Interview Complete!</h2>
        <p className="text-gray-600 mb-6">Processing your results...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  const currentQ = currentPhase === 'questions' ? questions[currentQuestion] : null;
  const progress = currentPhase === 'intro' ? 0 : ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Technical Interview
        </h2>
        <p className="text-gray-600">AI-powered interview with voice recognition</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {currentPhase === 'intro' ? 'Self Introduction' : `Question ${currentQuestion + 1} of ${questions.length}`}
          </span>
          <div className="flex items-center gap-2 text-red-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Interviewer Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">AI Interviewer</h3>
            <p className="text-sm text-gray-600">Technical Interview Assistant</p>
          </div>
        </div>
        
        {currentPhase === 'intro' ? (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-800">
              <strong>Self Introduction:</strong> Please introduce yourself and tell me about your experience with {selectedLanguage}. 
              Share your background, skills, and what interests you about this technology. You have 60 seconds.
            </p>
          </div>
        ) : currentQ ? (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
                {currentQ.difficulty}
              </span>
              <span className="text-sm text-gray-600">{currentQ.category}</span>
            </div>
            <p className="text-gray-800 font-medium">
              <strong>Question {currentQuestion + 1}:</strong> {currentQ.question}
            </p>
          </div>
        ) : null}
      </div>

      {/* Voice Input Section */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Your Response
          </h3>
          <div className="flex gap-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Record Audio
                </>
              )}
            </button>
            
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Stop Speech
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Speech to Text
                </>
              )}
            </button>
          </div>
        </div>
        
        {recordingError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{recordingError}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg p-4 min-h-24 border-2 border-dashed border-gray-300">
          {(isListening || isRecording) && (
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                {isRecording ? 'Recording Audio...' : 'Listening for Speech...'}
              </span>
            </div>
          )}
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isListening || isRecording ? 'Speak now...' : 'Type your answer here or use voice input...'}
            className="w-full min-h-20 p-2 border-0 resize-none focus:outline-none bg-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleNextQuestion}
          disabled={!transcript.trim()}
          className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          {currentPhase === 'intro' ? 'Start Technical Questions' : 
           currentQuestion === questions.length - 1 ? 'Complete Interview' : 'Next Question'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          💡 You can record audio, use speech-to-text, or type your answers. Provide detailed responses for better evaluation.
        </p>
      </div>
    </div>
  );
};