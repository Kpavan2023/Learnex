import React, { useState } from 'react';
import { EmotionDetection } from './components/EmotionDetection';
import { ComedyDialogues } from './components/ComedyDialogues';
import { LearningPath } from './components/LearningPath';
import { ResumeUpload } from './components/ResumeUpload';
import { Assessment } from './components/Assessment';
import { ScoreVisualization } from './components/ScoreVisualization';
import { Chatbot } from './components/Chatbot';
import { Interview } from './components/Interview';
import { InterviewResults } from './components/InterviewResults';
import { Brain, Menu, X, Home, BookOpen, FileText, Award, MessageSquare, BarChart, Smile, User } from 'lucide-react';
import { AssessmentResult, InterviewResult } from './types';

type AppState = 'emotion' | 'comedy' | 'learning' | 'resume' | 'assessment' | 'visualization' | 'chatbot' | 'interview' | 'interview-results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('emotion');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { id: 'emotion', label: 'Emotion Detection', icon: Smile },
    { id: 'learning', label: 'Learning Path', icon: BookOpen },
    { id: 'resume', label: 'Resume Upload', icon: FileText },
    { id: 'assessment', label: 'Assessment', icon: Award },
    { id: 'visualization', label: 'Score Analysis', icon: BarChart },
    { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare },
    { id: 'interview', label: 'AI Interview', icon: User },
  ];

  const handleEmotionDetected = (emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated') => {
    if (emotion === 'sad') {
      setCurrentState('comedy');
    } else {
      setCurrentState('learning');
    }
  };

  const handleBoredomDetected = () => {
    setCurrentState('comedy');
  };

  const handleComedyComplete = () => {
    setCurrentState('learning');
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setCurrentState('visualization');
  };

  const handleInterviewComplete = (result: InterviewResult) => {
    setInterviewResult(result);
    setCurrentState('interview-results');
  };
  const renderCurrentComponent = () => {
    switch (currentState) {
      case 'emotion':
        return <EmotionDetection onEmotionDetected={handleEmotionDetected} />;
      case 'comedy':
        return <ComedyDialogues onComplete={handleComedyComplete} />;
      case 'learning':
        return <LearningPath onLanguageSelect={handleLanguageSelect} selectedLanguage={selectedLanguage} onBoredomDetected={handleBoredomDetected} />;
      case 'resume':
        return <ResumeUpload onAnalysisComplete={() => setCurrentState('assessment')} />;
      case 'assessment':
        return <Assessment onComplete={handleAssessmentComplete} />;
      case 'visualization':
        return assessmentResult ? <ScoreVisualization result={assessmentResult} /> : <div>No results available</div>;
      case 'chatbot':
        return <Chatbot />;
      case 'interview':
        return selectedLanguage ? (
          <Interview selectedLanguage={selectedLanguage} onComplete={handleInterviewComplete} />
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Language First</h3>
            <p className="text-gray-500">Choose a programming language from the Learning Path to start the interview</p>
          </div>
        );
      case 'interview-results':
        return interviewResult && selectedLanguage ? (
          <InterviewResults result={interviewResult} selectedLanguage={selectedLanguage} />
        ) : (
          <div>No interview results available</div>
        );
      default:
        return <EmotionDetection onEmotionDetected={handleEmotionDetected} />;
    }
  };

  const getActiveNavItem = () => {
    return navigation.find(item => item.id === currentState);
  };

  const activeItem = getActiveNavItem();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Tutor</h1>
                <p className="text-sm text-gray-600">Personalized Learning Experience</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentState(item.id as AppState)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentState === item.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentState(item.id as AppState);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      currentState === item.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {activeItem && <activeItem.icon className="w-6 h-6 text-blue-600" />}
            <h2 className="text-xl font-semibold text-gray-800">
              {activeItem?.label || 'AI Tutor'}
            </h2>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {renderCurrentComponent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AI Tutor</span>
          </div>
          <p className="text-gray-400">
            Empowering learners with AI-driven personalized education
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;