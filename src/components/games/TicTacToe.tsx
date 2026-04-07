import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Users } from 'lucide-react';

interface TicTacToeProps {
  onBack: () => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (squares: (string | null)[]) => {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(combination);
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const isDraw = !winner && board.every(square => square !== null);

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
          <Users className="w-6 h-6 text-blue-500" />
          Tic Tac Toe
        </h2>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="mb-6">
        {winner ? (
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
            <Trophy className="w-8 h-8" />
            Player {winner} Wins! 🎉
          </div>
        ) : isDraw ? (
          <div className="text-2xl font-bold text-yellow-600">It's a Draw! 🤝</div>
        ) : (
          <div className="text-xl font-semibold text-gray-700">
            Player {isXNext ? 'X' : 'O'}'s Turn
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
        {board.map((square, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 bg-white border-2 border-gray-300 rounded-lg text-3xl font-bold transition-all duration-200 hover:bg-gray-50 ${
              winningLine.includes(index) ? 'bg-green-100 border-green-400' : ''
            } ${square === 'X' ? 'text-blue-600' : 'text-red-600'}`}
          >
            {square}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Click on any empty square to make your move!</p>
        <p>Get three in a row to win! 🏆</p>
      </div>
    </div>
  );
};