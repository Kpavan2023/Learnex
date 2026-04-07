import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';

interface SnakeGameProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onBack }) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const BOARD_SIZE = 20;

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameRunning) return;

    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 });
        break;
    }
  }, [direction, gameRunning]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    generateFood();
  }, [generateFood]);

  const toggleGame = () => {
    setGameRunning(!gameRunning);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          Snake Game
        </h2>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="mb-6">
        {gameOver ? (
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-red-600">
            💀 Game Over! Final Score: {score}
          </div>
        ) : (
          <div className="flex justify-center gap-6 text-lg font-semibold">
            <span className="text-green-600">Score: {score}</span>
            <span className="text-blue-600">Length: {snake.length}</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div 
          className="grid gap-0 mx-auto bg-gray-800 p-2 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: '400px',
            height: '400px'
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;
            
            return (
              <div
                key={index}
                className={`w-full h-full ${
                  isFood 
                    ? 'bg-red-500' 
                    : isHead 
                    ? 'bg-green-400' 
                    : isSnake 
                    ? 'bg-green-600' 
                    : 'bg-gray-700'
                }`}
              >
                {isFood && <span className="text-xs">🍎</span>}
                {isHead && <span className="text-xs">👁️</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={toggleGame}
          disabled={gameOver}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            gameRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {gameRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {gameOver ? 'Game Over' : 'Start'}
            </>
          )}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>Use arrow keys to control the snake! 🐍</p>
        <p>Eat the apples 🍎 to grow and increase your score! 🏆</p>
        <p>Don't hit the walls or yourself!</p>
      </div>
    </div>
  );
};