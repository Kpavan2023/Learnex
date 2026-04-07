import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Trophy, RotateCcw } from 'lucide-react';

interface NumberPuzzleProps {
  onBack: () => void;
}

export const NumberPuzzle: React.FC<NumberPuzzleProps> = ({ onBack }) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(8);
  const [moves, setMoves] = useState(0);
  const [isWin, setIsWin] = useState(false);

  const initializePuzzle = () => {
    const initialTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    setTiles(initialTiles);
    setEmptyIndex(8);
    setMoves(0);
    setIsWin(false);
  };

  const shufflePuzzle = () => {
    let shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    
    // Perform random valid moves to ensure solvability
    let currentEmpty = 8;
    for (let i = 0; i < 100; i++) {
      const validMoves = getValidMoves(currentEmpty);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap empty space with the selected tile
      [shuffled[currentEmpty], shuffled[randomMove]] = [shuffled[randomMove], shuffled[currentEmpty]];
      currentEmpty = randomMove;
    }
    
    setTiles(shuffled);
    setEmptyIndex(currentEmpty);
    setMoves(0);
    setIsWin(false);
  };

  const getValidMoves = (emptyPos: number) => {
    const validMoves = [];
    const row = Math.floor(emptyPos / 3);
    const col = emptyPos % 3;

    // Up
    if (row > 0) validMoves.push(emptyPos - 3);
    // Down
    if (row < 2) validMoves.push(emptyPos + 3);
    // Left
    if (col > 0) validMoves.push(emptyPos - 1);
    // Right
    if (col < 2) validMoves.push(emptyPos + 1);

    return validMoves;
  };

  const handleTileClick = (index: number) => {
    if (isWin) return;

    const validMoves = getValidMoves(emptyIndex);
    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      
      setTiles(newTiles);
      setEmptyIndex(index);
      setMoves(prev => prev + 1);
      
      // Check for win
      const isComplete = newTiles.slice(0, 8).every((tile, i) => tile === i + 1);
      if (isComplete) {
        setIsWin(true);
      }
    }
  };

  useEffect(() => {
    initializePuzzle();
  }, []);

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
          <span className="text-2xl">🔢</span>
          Number Puzzle
        </h2>
        <button
          onClick={shufflePuzzle}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      <div className="mb-6">
        {isWin ? (
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
            <Trophy className="w-8 h-8" />
            Puzzle Solved in {moves} moves! 🎉
          </div>
        ) : (
          <div className="text-xl font-semibold text-gray-700">
            Moves: {moves}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            className={`w-20 h-20 rounded-lg text-2xl font-bold transition-all duration-200 ${
              tile === 0
                ? 'bg-gray-200 cursor-default'
                : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105'
            } ${getValidMoves(emptyIndex).includes(index) && tile !== 0 ? 'ring-2 ring-yellow-400' : ''}`}
            disabled={tile === 0}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Arrange the numbers 1-8 in order!</p>
        <p>Click on tiles adjacent to the empty space to move them. 🧩</p>
      </div>

      <button
        onClick={initializePuzzle}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mx-auto"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to Solved
      </button>
    </div>
  );
};