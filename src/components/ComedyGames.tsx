import React, { useState } from 'react';
import { Gamepad2, ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import { TicTacToe } from './games/TicTacToe';
import { DragBall } from './games/DragBall';
import { NumberPuzzle } from './games/NumberPuzzle';
import { MemoryGame } from './games/MemoryGame';
import { SnakeGame } from './games/SnakeGame';

interface ComedyGamesProps {
  onComplete: () => void;
}

export const ComedyGames: React.FC<ComedyGamesProps> = ({ onComplete }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      description: 'Classic 3x3 grid game',
      icon: '⭕',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'drag-ball',
      name: 'Drag the Ball',
      description: 'Move the ball to the target',
      icon: '⚽',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'number-puzzle',
      name: 'Number Puzzle',
      description: 'Arrange numbers in order',
      icon: '🔢',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'memory-game',
      name: 'Memory Match',
      description: 'Match the card pairs',
      icon: '🃏',
      color: 'from-pink-400 to-pink-600'
    },
    {
      id: 'snake-game',
      name: 'Snake Game',
      description: 'Classic snake adventure',
      icon: '🐍',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const renderGame = () => {
    switch (selectedGame) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={() => setSelectedGame(null)} />;
      case 'drag-ball':
        return <DragBall onBack={() => setSelectedGame(null)} />;
      case 'number-puzzle':
        return <NumberPuzzle onBack={() => setSelectedGame(null)} />;
      case 'memory-game':
        return <MemoryGame onBack={() => setSelectedGame(null)} />;
      case 'snake-game':
        return <SnakeGame onBack={() => setSelectedGame(null)} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        {renderGame()}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gamepad2 className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">Fun Games! 🎮</h2>
        </div>
        <p className="text-gray-600">Choose a game to boost your mood and have some fun!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`bg-gradient-to-br ${game.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-white text-opacity-90 mb-4">{game.description}</p>
              <div className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                <span className="font-medium">Play Now</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onComplete}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Skip Games & Continue Learning
        </button>
        <div className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5" />
          Have Fun Playing!
        </div>
      </div>
    </div>
  );
};