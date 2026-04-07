import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Target, Trophy, RotateCcw } from 'lucide-react';

interface DragBallProps {
  onBack: () => void;
}

export const DragBall: React.FC<DragBallProps> = ({ onBack }) => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [targetPosition, setTargetPosition] = useState({ x: 300, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const generateNewTarget = () => {
    const newX = Math.random() * 350 + 25;
    const newY = Math.random() * 250 + 25;
    setTargetPosition({ x: newX, y: newY });
    setIsWin(false);
  };

  const checkWin = (ballPos: { x: number; y: number }) => {
    const distance = Math.sqrt(
      Math.pow(ballPos.x - targetPosition.x, 2) + Math.pow(ballPos.y - targetPosition.y, 2)
    );
    
    if (distance < 30) {
      setIsWin(true);
      setScore(prev => prev + 1);
      setTimeout(() => {
        generateNewTarget();
      }, 1500);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const newX = Math.max(15, Math.min(385, e.clientX - rect.left - 15));
    const newY = Math.max(15, Math.min(285, e.clientY - rect.top - 15));
    
    const newPosition = { x: newX, y: newY };
    setBallPosition(newPosition);
    checkWin(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetGame = () => {
    setBallPosition({ x: 50, y: 50 });
    setScore(0);
    setIsWin(false);
    generateNewTarget();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const newX = Math.max(15, Math.min(385, e.clientX - rect.left - 15));
      const newY = Math.max(15, Math.min(285, e.clientY - rect.top - 15));
      
      const newPosition = { x: newX, y: newY };
      setBallPosition(newPosition);
      checkWin(newPosition);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, targetPosition]);

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
          <Target className="w-6 h-6 text-green-500" />
          Drag the Ball
        </h2>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-center gap-4 text-lg font-semibold">
          <span className="text-blue-600">Score: {score}</span>
          {isWin && (
            <div className="flex items-center gap-2 text-green-600">
              <Trophy className="w-5 h-5" />
              Target Hit! 🎯
            </div>
          )}
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="relative w-full max-w-md mx-auto h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl border-2 border-gray-300 overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Target */}
        <div
          className="absolute w-12 h-12 bg-red-500 rounded-full border-4 border-red-600 flex items-center justify-center animate-pulse"
          style={{
            left: targetPosition.x - 24,
            top: targetPosition.y - 24,
          }}
        >
          <Target className="w-6 h-6 text-white" />
        </div>

        {/* Ball */}
        <div
          className={`absolute w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-yellow-600 cursor-grab shadow-lg transition-all duration-100 ${
            isDragging ? 'cursor-grabbing scale-110' : ''
          } ${isWin ? 'animate-bounce' : ''}`}
          style={{
            left: ballPosition.x - 16,
            top: ballPosition.y - 16,
          }}
          onMouseDown={handleMouseDown}
        >
          ⚽
        </div>

        {/* Win Effect */}
        {isWin && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-xl">
            <div className="text-4xl animate-bounce">🎉</div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>Drag the ball ⚽ to the target 🎯 to score points!</p>
        <p>Try to hit as many targets as possible! 🏆</p>
      </div>
    </div>
  );
};