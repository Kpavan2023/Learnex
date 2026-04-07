import React, { useState, useEffect } from 'react';
import { Laugh, Clock, SkipForward, MessageSquare, Gamepad2 } from 'lucide-react';
import { comedyDialogues } from '../data/mockData';
import { ComedyGames } from './ComedyGames';

interface ComedyDialoguesProps {
  onComplete: () => void;
}

export const ComedyDialogues: React.FC<ComedyDialoguesProps> = ({ onComplete }) => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(true);
  const [comedyMode, setComedyMode] = useState<'dialogues' | 'games'>('dialogues');

  useEffect(() => {
    if (!isPlaying || comedyMode === 'games') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onComplete, comedyMode]);

  useEffect(() => {
    if (!isPlaying || comedyMode === 'games') return;

    const dialogueTimer = setInterval(() => {
      setCurrentDialogue(prev => (prev + 1) % comedyDialogues.length);
    }, 3000);

    return () => clearInterval(dialogueTimer);
  }, [isPlaying, comedyMode]);

  const handleSkip = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handleModeChange = (mode: 'dialogues' | 'games') => {
    setComedyMode(mode);
    if (mode === 'games') {
      setIsPlaying(false); // Stop the timer when switching to games
    }
  };

  if (comedyMode === 'games') {
    return <ComedyGames onComplete={onComplete} />;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Laugh className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Comedy Break! 😄</h2>
        </div>
        <p className="text-gray-600">Let's brighten your mood with some entertainment!</p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => handleModeChange('dialogues')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              comedyMode === 'dialogues'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comedy Dialogues
          </button>
          <button
            onClick={() => handleModeChange('games')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              comedyMode === 'games'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Fun Games
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">😂</div>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            {comedyDialogues[currentDialogue]}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Time remaining: {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-600">Playing</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSkip}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <SkipForward className="w-5 h-5" />
          Skip Comedy
        </button>
        <div className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Laugh className="w-5 h-5" />
          Enjoying the Show
        </div>
      </div>
    </div>
  );
};