import React, { useState } from 'react';
import { User, Clock, Coffee, BookOpen } from 'lucide-react';

interface EmotionDetectionProps {
  onEmotionDetected: (emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated') => void;
}

export const EmotionDetection: React.FC<EmotionDetectionProps> = ({ onEmotionDetected }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');

  const moodOptions = [
    { value: 'happy', label: 'Happy & Ready to Learn! 😊', color: 'bg-green-100 text-green-800 hover:bg-green-200', emotion: 'happy' as const },
    { value: 'excited', label: 'Excited to Start! 🤩', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', emotion: 'excited' as const },
    { value: 'neutral', label: 'Neutral - Let\'s Begin 😐', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', emotion: 'neutral' as const },
    { value: 'tired', label: 'A bit Tired 😴', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', emotion: 'sad' as const },
    { value: 'confused', label: 'Confused about Topics 😕', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', emotion: 'sad' as const },
    { value: 'bored', label: 'Feeling Bored 😑', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', emotion: 'sad' as const },
  ];

  const handleMoodSelect = (option: typeof moodOptions[0]) => {
    setSelectedMood(option.value);
    setTimeout(() => {
      onEmotionDetected(option.emotion);
    }, 500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <User className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-800">Welcome to AI Tutor!</h2>
        </div>
        <p className="text-gray-600 text-lg">How are you feeling today? Let's personalize your learning experience!</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Select your current mood:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option)}
                className={`p-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${option.color} ${
                  selectedMood === option.value ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {selectedMood && (
          <div className="text-center mt-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Smart Learning Ahead!</h4>
              <p className="text-blue-700">
                Our AI will monitor your learning pace and suggest breaks when needed. 
                If you spend too much time on questions or seem idle, we'll check if you need some entertainment!
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Coffee className="w-6 h-6 text-purple-600" />
            <h4 className="text-lg font-semibold text-purple-800">Smart Break System</h4>
          </div>
          <ul className="text-purple-700 space-y-2">
            <li>• <strong>Question Timer:</strong> If you take too long on a question, we'll ask if you're bored</li>
            <li>• <strong>Idle Detection:</strong> No activity for 20 seconds? We'll check if you need a break</li>
            <li>• <strong>Entertainment Options:</strong> Comedy dialogues or fun games to refresh your mind</li>
            <li>• <strong>Seamless Return:</strong> Continue exactly where you left off after entertainment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};