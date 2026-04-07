import React from 'react';
import { Trophy, CheckCircle, XCircle, Clock, User, BarChart, Award } from 'lucide-react';

interface InterviewResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  feedback: string[];
  answers: { question: string; answer: string; score: number }[];
}

interface InterviewResultsProps {
  result: InterviewResult;
  selectedLanguage: string;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({ result, selectedLanguage }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          result.passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {result.passed ? (
            <Trophy className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {result.passed ? 'Interview Passed! 🎉' : 'Interview Complete'}
        </h2>
        <p className="text-gray-600">
          {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Technical Interview Results
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl p-6 text-center ${getScoreBg(result.score)}`}>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <div className="text-gray-700 font-medium">Overall Score</div>
        </div>
        
        <div className="bg-blue-100 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {result.answers.filter(a => a.score >= 60).length}
          </div>
          <div className="text-gray-700 font-medium">Questions Passed</div>
        </div>
        
        <div className="bg-purple-100 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {formatTime(result.timeSpent)}
          </div>
          <div className="text-gray-700 font-medium">Total Time</div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Interview Feedback
        </h3>
        <div className="space-y-3">
          {result.feedback.map((feedback, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Question-by-Question Analysis
        </h3>
        
        {result.answers.map((answer, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">
                {index === 0 ? 'Self Introduction' : `Question ${index}`}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(answer.score)} ${getScoreColor(answer.score)}`}>
                  {answer.score}%
                </span>
                {answer.score >= 60 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 font-medium mb-2">Question:</p>
              <p className="text-gray-600 bg-white rounded-lg p-3">
                {answer.question}
              </p>
            </div>
            
            <div>
              <p className="text-gray-700 font-medium mb-2">Your Answer:</p>
              <p className="text-gray-600 bg-white rounded-lg p-3">
                {answer.answer || 'No response recorded'}
              </p>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    answer.score >= 80 ? 'bg-green-500' : 
                    answer.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${answer.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">Recommendations</h3>
        <div className="space-y-2 text-blue-700">
          {result.passed ? (
            <>
              <p>• Excellent performance! You're ready for {selectedLanguage} roles.</p>
              <p>• Consider exploring advanced topics and frameworks.</p>
              <p>• Practice system design and architecture questions.</p>
            </>
          ) : (
            <>
              <p>• Focus on fundamental concepts and practice more coding problems.</p>
              <p>• Review the topics where you scored below 60%.</p>
              <p>• Take more practice interviews to improve confidence.</p>
              <p>• Study the learning materials and retake the interview.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};