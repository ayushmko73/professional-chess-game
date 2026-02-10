import React, { useState, useMemo } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ChessBoardProps {
  game: Chess;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  lastMove?: Move | null;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ game, onMove, lastMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [hintSquares, setHintSquares] = useState<Square[]>([]);

  const board = useMemo(() => {
    const b = [];
    const rows = game.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const squareName = (String.fromCharCode(97 + j) + (8 - i)) as Square;
        b.push({
          square: squareName,
          piece: rows[i][j],
          color: (i + j) % 2 === 0 ? 'light' : 'dark',
        });
      }
    }
    return b;
  }, [game.fen()]);

  const handleSquareClick = (square: Square) => {
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setHintSquares([]);
      return;
    }

    const piece = game.get(square);
    
    // If clicking a new piece of current player's turn
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setHintSquares(moves.map(m => m.to));
      return;
    }

    // If clicking a hint square (destination)
    if (selectedSquare && hintSquares.includes(square)) {
      onMove({ from: selectedSquare, to: square, promotion: 'q' });
      setSelectedSquare(null);
      setHintSquares([]);
    } else {
      setSelectedSquare(null);
      setHintSquares([]);
    }
  };

  const getPieceIcon = (type: string, color: string) => {
    const suffix = color === 'w' ? 'l' : 'd';
    return `https://lichess1.org/assets/piece/cburnett/${color.toUpperCase()}${type.toUpperCase()}.svg`;
  };

  return (
    <div className="relative w-full max-w-[600px] bg-zinc-900 p-2 rounded-xl shadow-2xl border border-zinc-800">
      <div className="chess-grid w-full overflow-hidden rounded-md border border-zinc-800">
        {board.map(({ square, piece, color }) => {
          const isSelected = selectedSquare === square;
          const isHint = hintSquares.includes(square);
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

          return (
            <div
              key={square}
              onClick={() => handleSquareClick(square)}
              className={cn(
                "relative flex items-center justify-center cursor-pointer select-none transition-colors duration-200",
                color === 'light' ? 'bg-[#ebecd0]' : 'bg-[#779556]',
                isSelected && "bg-yellow-200/80",
                isLastMove && "bg-yellow-100/40"
              )}
            >
              {isHint && (
                <div className={cn(
                  "absolute z-10 rounded-full",
                  piece ? "w-full h-full border-[6px] border-black/10" : "w-4 h-4 bg-black/10"
                )} />
              )}
              
              <AnimatePresence mode="popLayout">
                {piece && (
                  <motion.img
                    key={`${square}-${piece.type}-${piece.color}`}
                    layoutId={`${piece.type}-${piece.color}-${square}`}
                    src={getPieceIcon(piece.type, piece.color)}
                    alt={`${piece.color} ${piece.type}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-5/6 h-5/6 z-20 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Rank and File Labels */}
              {square[0] === 'a' && (
                <span className={cn("absolute top-0.5 left-0.5 text-[10px] font-bold", color === 'light' ? 'text-[#779556]' : 'text-[#ebecd0]')}>
                  {square[1]}
                </span>
              )}
              {square[1] === '1' && (
                <span className={cn("absolute bottom-0.5 right-0.5 text-[10px] font-bold", color === 'light' ? 'text-[#779556]' : 'text-[#ebecd0]')}>
                  {square[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};