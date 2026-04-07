import React, { useState, useEffect, useRef } from 'react';
import { Code, Play, Clock, Star, ExternalLink, BookOpen, Coffee, AlertCircle } from 'lucide-react';
import { learningResources } from '../data/mockData';
import { LearningResource } from '../types';

interface LearningPathProps {
  onLanguageSelect: (language: string) => void;
  selectedLanguage: string;
  onBoredomDetected?: () => void;
}

interface BoredomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
  reason: 'idle' | 'slow';
}

const BoredomModal: React.FC<BoredomModalProps> = ({ isOpen, onClose, onYes, onNo, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {reason === 'idle' ? 'Taking a break?' : 'Need some help?'}
          </h3>
          <p className="text-gray-600 mb-6">
            {reason === 'idle' 
              ? "I noticed you've been idle for a while. Are you feeling bored or need a refreshing break?"
              : "You've been on this topic for a while. Would you like some entertainment to refresh your mind?"
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onYes}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Yes, I need a break! 😴
            </button>
            <button
              onClick={onNo}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              No, I'm okay! 💪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LearningPath: React.FC<LearningPathProps> = ({ onLanguageSelect, selectedLanguage, onBoredomDetected }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview');
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showBoredomModal, setShowBoredomModal] = useState(false);
  const [boredomReason, setBoredomReason] = useState<'idle' | 'slow'>('idle');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [resourceStartTime, setResourceStartTime] = useState<number | null>(null);
  
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const slowLearningTimerRef = useRef<NodeJS.Timeout>();

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🚀', color: 'from-yellow-400 to-orange-500', description: 'The language of the web' },
    { id: 'python', name: 'Python', icon: '🐍', color: 'from-blue-400 to-green-500', description: 'Simple and powerful' },
    { id: 'react', name: 'React', icon: '⚛️', color: 'from-blue-400 to-cyan-500', description: 'Build dynamic UIs' },
    { id: 'java', name: 'Java', icon: '☕', color: 'from-red-400 to-orange-500', description: 'Enterprise development' },
    { id: 'html', name: 'HTML', icon: '🌐', color: 'from-orange-400 to-red-500', description: 'Structure of the web' },
    { id: 'css', name: 'CSS', icon: '🎨', color: 'from-pink-400 to-purple-500', description: 'Style and design' },
    { id: 'c', name: 'C', icon: '⚡', color: 'from-gray-400 to-blue-500', description: 'System programming' },
    { id: 'ml', name: 'Machine Learning', icon: '🤖', color: 'from-green-400 to-teal-500', description: 'AI and data science' },
    { id: 'dl', name: 'Deep Learning', icon: '🧠', color: 'from-purple-400 to-indigo-500', description: 'Neural networks' },
  ];

  const resourceNotes = {
    javascript: {
      basic: [
        "JavaScript is a dynamic, interpreted programming language",
        "Variables: let, const, var - use let/const for modern JS",
        "Data types: string, number, boolean, object, undefined, null, symbol",
        "Functions: function declaration vs expression vs arrow functions",
        "Scope: global, function, and block scope",
        "Hoisting: var and function declarations are hoisted"
      ],
      intermediate: [
        "Closures: functions that have access to outer scope variables",
        "Prototypes: JavaScript's inheritance mechanism",
        "Event handling: addEventListener, event bubbling/capturing",
        "Async programming: callbacks, promises, async/await",
        "DOM manipulation: querySelector, createElement, appendChild",
        "ES6+ features: destructuring, spread operator, template literals"
      ],
      advanced: [
        "Event loop: call stack, callback queue, microtask queue",
        "Memory management: garbage collection, memory leaks",
        "Design patterns: module, observer, singleton patterns",
        "Performance optimization: debouncing, throttling, lazy loading",
        "Advanced async: Promise.all, Promise.race, generators",
        "Module systems: CommonJS, ES modules, bundlers"
      ]
    },
    python: {
      basic: [
        "Python is interpreted, high-level, general-purpose language",
        "Variables: dynamic typing, no declaration needed",
        "Data structures: lists, tuples, dictionaries, sets",
        "Control flow: if/elif/else, for/while loops",
        "Functions: def keyword, parameters, return values",
        "Modules: import statements, creating modules"
      ],
      intermediate: [
        "Object-oriented programming: classes, inheritance, polymorphism",
        "Exception handling: try/except/finally blocks",
        "File I/O: reading/writing files, context managers",
        "List comprehensions: concise way to create lists",
        "Decorators: functions that modify other functions",
        "Lambda functions: anonymous functions for simple operations"
      ],
      advanced: [
        "Generators: yield keyword, memory-efficient iteration",
        "Context managers: with statement, __enter__/__exit__",
        "Metaclasses: classes that create classes",
        "Async programming: asyncio, async/await",
        "Memory management: garbage collection, weak references",
        "Performance: profiling, optimization techniques"
      ]
    }
  };

  // Activity tracking
  const trackActivity = () => {
    setLastActivity(Date.now());
    resetIdleTimer();
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setBoredomReason('idle');
      setShowBoredomModal(true);
    }, 20000); // 20 seconds
  };

  const resetSlowLearningTimer = () => {
    if (slowLearningTimerRef.current) {
      clearTimeout(slowLearningTimerRef.current);
    }
    slowLearningTimerRef.current = setTimeout(() => {
      setBoredomReason('slow');
      setShowBoredomModal(true);
    }, 180000); // 3 minutes on same resource
  };

  // Event listeners for activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (slowLearningTimerRef.current) clearTimeout(slowLearningTimerRef.current);
    };
  }, []);

  // Track resource viewing time
  useEffect(() => {
    if (selectedResource) {
      setResourceStartTime(Date.now());
      resetSlowLearningTimer();
    } else {
      if (slowLearningTimerRef.current) {
        clearTimeout(slowLearningTimerRef.current);
      }
    }
  }, [selectedResource]);

  const handleBoredomYes = () => {
    setShowBoredomModal(false);
    if (onBoredomDetected) {
      onBoredomDetected();
    }
  };

  const handleBoredomNo = () => {
    setShowBoredomModal(false);
    resetIdleTimer();
    if (selectedResource) {
      resetSlowLearningTimer();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openYouTubeVideo = (url: string) => {
    window.open(url, '_blank');
    trackActivity(); // Track as activity
  };

  const getNotesForResource = (resource: LearningResource) => {
    const langNotes = resourceNotes[selectedLanguage as keyof typeof resourceNotes];
    if (!langNotes) return [];
    
    return langNotes[resource.difficulty as keyof typeof langNotes] || [];
  };

  // Sort resources by difficulty (beginner -> intermediate -> advanced)
  const sortedResources = selectedLanguage ? 
    [...(learningResources[selectedLanguage] || [])].sort((a, b) => {
      const order = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      return order[a.difficulty as keyof typeof order] - order[b.difficulty as keyof typeof order];
    }) : [];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
      <BoredomModal
        isOpen={showBoredomModal}
        onClose={() => setShowBoredomModal(false)}
        onYes={handleBoredomYes}
        onNo={handleBoredomNo}
        reason={boredomReason}
      />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Learning Path</h2>
        <p className="text-gray-600">Choose your programming language and start your structured learning journey</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveTab('overview');
              trackActivity();
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('resources');
              trackActivity();
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'resources'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            Resources
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {languages.map((language) => (
            <div
              key={language.id}
              className={`bg-gradient-to-br ${language.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                selectedLanguage === language.id ? 'ring-4 ring-white ring-opacity-50' : ''
              }`}
              onClick={() => {
                onLanguageSelect(language.id);
                trackActivity();
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{language.icon}</div>
                <h3 className="text-xl font-bold mb-2">{language.name}</h3>
                <p className="text-white text-opacity-90 mb-4">{language.description}</p>
                <div className="flex items-center justify-center gap-2">
                  <Code className="w-5 h-5" />
                  <span className="font-medium">Start Learning</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && selectedLanguage && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resources List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {languages.find(l => l.id === selectedLanguage)?.name} Learning Path
              </h3>
              <p className="text-gray-600">Structured from Basic to Advanced - Follow the order for best results</p>
            </div>

            <div className="space-y-4">
              {sortedResources.map((resource: LearningResource, index) => (
                <div 
                  key={resource.id} 
                  className={`bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors ${
                    selectedResource?.id === resource.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-red-500 rounded-lg p-3 flex-shrink-0">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Step {index + 1}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-800">{resource.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                          {resource.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{resource.description}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{resource.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">Recommended</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            openYouTubeVideo(resource.youtubeUrl);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Watch Video
                        </button>
                        <button
                          onClick={() => {
                            setSelectedResource(resource);
                            setShowNotes(true);
                            trackActivity();
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          View Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Learning Notes
                </h3>
                
                {selectedResource ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{selectedResource.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedResource.difficulty)}`}>
                        {selectedResource.difficulty}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">Key Concepts:</h5>
                      <ul className="space-y-2">
                        {getNotesForResource(selectedResource).map((note, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Study Tip</span>
                      </div>
                      <p className="text-xs text-yellow-700">
                        Take your time to understand each concept. If you need a break, just let us know!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Select a resource to view detailed notes and key concepts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && !selectedLanguage && (
        <div className="text-center py-12">
          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Language First</h3>
          <p className="text-gray-500">Choose a programming language to see available resources and learning path</p>
        </div>
      )}
    </div>
  );
};