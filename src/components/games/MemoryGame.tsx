import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Trophy, RotateCcw } from 'lucide-react';

interface MemoryGameProps {
  onBack: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWin, setIsWin] = useState(false);

  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];

  const initializeGame = () => {
    const gameCards: Card[] = [];
    emojis.forEach((emoji, index) => {
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWin(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || isWin) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === 8) {
              setIsWin(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
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
          <Brain className="w-6 h-6 text-pink-500" />
          Memory Match
        </h2>
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </div>

      <div className="mb-6">
        {isWin ? (
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
            <Trophy className="w-8 h-8" />
            All Pairs Found in {moves} moves! 🎉
          </div>
        ) : (
          <div className="flex justify-center gap-6 text-lg font-semibold">
            <span className="text-blue-600">Moves: {moves}</span>
            <span className="text-green-600">Matches: {matches}/8</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 rounded-lg text-2xl font-bold transition-all duration-300 ${
              card.isFlipped || card.isMatched
                ? 'bg-white border-2 border-pink-300 transform scale-105'
                : 'bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 shadow-lg hover:shadow-xl'
            } ${card.isMatched ? 'opacity-75' : ''}`}
            disabled={card.isFlipped || card.isMatched || flippedCards.length === 2}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '🃏'}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <p>Find all matching pairs by flipping two cards at a time!</p>
        <p>Remember the positions and match them all! 🧠</p>
      </div>
    </div>
  );
};