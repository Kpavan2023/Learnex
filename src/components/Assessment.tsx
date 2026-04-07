import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Award, BarChart, Trophy, Target, Star } from 'lucide-react';
import { assessmentQuestions } from '../data/mockData';
import { Question, AssessmentResult } from '../types';

interface AssessmentProps {
  onComplete: (result: AssessmentResult) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes per level
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [levelResults, setLevelResults] = useState<{level: number, score: number, passed: boolean}[]>([]);
  const [levelQuestions, setLevelQuestions] = useState<Question[]>([]);

  // Level configuration
  const levelConfig = {
    1: { name: 'Beginner', questions: 10, difficulty: 'easy', color: 'from-green-400 to-green-600', icon: Target },
    2: { name: 'Intermediate', questions: 20, difficulty: 'medium', color: 'from-yellow-400 to-orange-500', icon: Star },
    3: { name: 'Advanced', questions: 30, difficulty: 'hard', color: 'from-red-400 to-purple-600', icon: Trophy }
  };

  useEffect(() => {
    initializeLevel(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishLevel();
    }
  }, [timeLeft, showResult]);

  const initializeLevel = (level: number) => {
    const config = levelConfig[level as keyof typeof levelConfig];
    const filteredQuestions = assessmentQuestions
      .filter(q => q.difficulty === config.difficulty)
      .slice(0, config.questions);
    
    setLevelQuestions(filteredQuestions);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(1800); // 30 minutes per level
    setSelectedAnswer(null);
  };

  const finishLevel = () => {
    const score = calculateLevelScore();
    const passed = score >= 50; // 50% required to pass each level
    
    const levelResult = {
      level: currentLevel,
      score,
      passed
    };
    
    const newLevelResults = [...levelResults, levelResult];
    setLevelResults(newLevelResults);

    if (passed && currentLevel < 3) {
      // Move to next level
      setCurrentLevel(currentLevel + 1);
    } else {
      // Complete assessment
      completeAssessment(newLevelResults);
    }
  };

  const calculateLevelScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === levelQuestions[index]?.correct) {
        correct++;
      }
    });
    return Math.round((correct / levelQuestions.length) * 100);
  };

  const completeAssessment = (results: {level: number, score: number, passed: boolean}[]) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const totalQuestions = results.reduce((sum, result) => {
      const config = levelConfig[result.level as keyof typeof levelConfig];
      return sum + (result.passed ? config.questions : 0);
    }, 0);
    
    const overallScore = results.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : 0;
    
    const categoryScores = calculateCategoryScores();
    
    const finalResult: AssessmentResult = {
      score: overallScore,
      totalQuestions,
      timeSpent,
      categoryScores,
      levelResults: results
    };
    
    setShowResult(true);
    onComplete(finalResult);
  };

  const calculateCategoryScores = () => {
    const categories: { [key: string]: { correct: number; total: number } } = {};
    
    levelQuestions.forEach((question, index) => {
      if (!categories[question.category]) {
        categories[question.category] = { correct: 0, total: 0 };
      }
      categories[question.category].total++;
      if (answers[index] === question.correct) {
        categories[question.category].correct++;
      }
    });
    
    const categoryScores: { [key: string]: number } = {};
    Object.keys(categories).forEach(category => {
      categoryScores[category] = Math.round(
        (categories[category].correct / categories[category].total) * 100
      );
    });
    
    return categoryScores;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      
      if (currentQuestion < levelQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        finishLevel();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showResult) {
    const overallScore = levelResults.length > 0 
      ? Math.round(levelResults.reduce((sum, result) => sum + result.score, 0) / levelResults.length)
      : 0;
    
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600">Multi-Level Assessment Results</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{overallScore}%</div>
            <div className="text-gray-700 font-medium">Overall Score</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{levelResults.filter(r => r.passed).length}/3</div>
            <div className="text-gray-700 font-medium">Levels Passed</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Level-by-Level Results
          </h3>
          
          {Object.entries(levelConfig).map(([level, config]) => {
            const levelNum = parseInt(level);
            const result = levelResults.find(r => r.level === levelNum);
            const IconComponent = config.icon;
            
            return (
              <div key={level} className={`bg-gradient-to-r ${config.color} rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-8 h-8" />
                    <div>
                      <h4 className="text-xl font-bold">Level {level}: {config.name}</h4>
                      <p className="text-white text-opacity-90">{config.questions} Questions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {result ? (
                      <>
                        <div className="text-2xl font-bold">{result.score}%</div>
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                          <span>{result.passed ? 'PASSED' : 'FAILED'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-white text-opacity-70">Not Attempted</div>
                    )}
                  </div>
                </div>
                
                {result && (
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Assessment Summary</h3>
          <div className="space-y-2 text-gray-700">
            <p>• <strong>Levels Completed:</strong> {levelResults.length}/3</p>
            <p>• <strong>Overall Performance:</strong> {overallScore >= 70 ? 'Excellent' : overallScore >= 50 ? 'Good' : 'Needs Improvement'}</p>
            <p>• <strong>Recommendation:</strong> {
              levelResults.length === 3 && levelResults.every(r => r.passed) 
                ? 'Outstanding! You have mastered all difficulty levels.'
                : levelResults.length >= 2 && levelResults.slice(0, 2).every(r => r.passed)
                ? 'Great progress! Consider reviewing advanced topics.'
                : 'Focus on fundamentals and practice more before attempting higher levels.'
            }</p>
          </div>
        </div>
      </div>
    );
  }

  const config = levelConfig[currentLevel as keyof typeof levelConfig];
  const question = levelQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / levelQuestions.length) * 100;
  const IconComponent = config.icon;

  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-r ${config.color} p-3 rounded-xl`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Level {currentLevel}: {config.name}</h2>
              <p className="text-gray-600">{config.questions} Questions • {config.difficulty} difficulty</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {levelQuestions.length}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Level Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((level) => {
            const levelConfig = levelConfig[level as keyof typeof levelConfig];
            const levelResult = levelResults.find(r => r.level === level);
            const isActive = level === currentLevel;
            const isPassed = levelResult?.passed;
            const isFailed = levelResult && !levelResult.passed;
            
            return (
              <div key={level} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  isActive ? `bg-gradient-to-r ${levelConfig.color} text-white` :
                  isPassed ? 'bg-green-500 text-white' :
                  isFailed ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isPassed ? <CheckCircle className="w-5 h-5" /> :
                   isFailed ? <XCircle className="w-5 h-5" /> :
                   level}
                </div>
                {level < 3 && (
                  <div className={`w-8 h-1 mx-2 ${
                    level < currentLevel || (levelResults.find(r => r.level === level)?.passed) 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {question.category}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
            {question.question}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                selectedAnswer === index
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg transform scale-105`
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  selectedAnswer === index
                    ? 'bg-white text-gray-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Level {currentLevel} Progress: {answers.length} of {levelQuestions.length} questions answered
        </div>
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={`bg-gradient-to-r ${config.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {currentQuestion === levelQuestions.length - 1 ? 'Complete Level' : 'Next Question'}
          <CheckCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};