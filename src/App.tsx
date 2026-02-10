import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, ChevronLeft, ChevronRight, History, Settings2, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Piece Components using SVGs
const PieceIcon = ({ type, color }: { type: string; color: 'w' | 'b' }) => {
  const base = "/pieces";
  const colorPath = color === 'w' ? 'w' : 'b';
  const typeUpper = type.toUpperCase();
  // Using Wikipedia-style chess piece SVGs (standard for chess apps)
  return (
    <img 
      src={`https://upload.wikimedia.org/wikipedia/commons/${color === 'w' ? '7/72/Chess_pdt45.svg' : 'c/c7/Chess_plt45.svg'}`}
      className="w-full h-full select-none pointer-events-none"
      alt={`${color} ${type}`}
      style={{ 
        filter: color === 'w' ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 2px rgba(255,255,255,0.1)) inverse'
      }}
    />
  );
};

// Custom SVG icons for pieces to ensure self-contained high-quality
const PIECES_SVG: Record<string, string> = {
  wp: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  wr: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wn: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wb: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wq: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wk: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  bp: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  br: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bn: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bb: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bq: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bk: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  const board = useMemo(() => game.board(), [game]);
  const turn = game.turn();
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setLastMove({ from: move.from, to: move.to });
        setMoveHistory(h => [...h, result.san]);
        setSelectedSquare(null);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const piece = game.get(square);
    
    // If clicking a friendly piece, select it
    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      return;
    }

    // If a square is already selected, try making a move
    if (selectedSquare) {
      const moveSuccessful = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q', // Always promote to queen for simplicity
      });
      
      if (!moveSuccessful && piece && piece.color === turn) {
        setSelectedSquare(square);
      } else if (!moveSuccessful) {
        setSelectedSquare(null);
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setLastMove(null);
    setMoveHistory([]);
  };

  const getValidMoves = (square: Square) => {
    return game.moves({ square, verbose: true }).map(m => m.to);
  };

  const validMoves = useMemo(() => 
    selectedSquare ? getValidMoves(selectedSquare) : [], 
    [selectedSquare, game]
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Left: Game Status & Controls */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-4 h-4 rounded-full animate-pulse",
                turn === 'w' ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-zinc-600"
              )} />
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                {turn === 'w' ? "White's Turn" : "Black's Turn"}
              </h2>
            </div>

            {isGameOver && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                <Trophy className="text-amber-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Game Over</p>
                  <p className="text-zinc-300 text-xs">
                    {game.isCheckmate() ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} wins.` : "It's a draw."}
                  </p>
                </div>
              </div>
            )}

            {isCheck && !isGameOver && (
              <div className="mb-4 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-full w-fit">
                CHECK
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={resetGame}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl transition-all border border-zinc-700/50 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                New Game
              </button>
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg border border-zinc-700/30 text-zinc-400">
                  <ChevronLeft className="w-5 h-5 mx-auto" />
                </button>
                <button className="flex-1 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg border border-zinc-700/30 text-zinc-400">
                  <ChevronRight className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <History className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">History</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {moveHistory.map((move, i) => (
                <div key={i} className="text-xs py-1.5 px-3 bg-zinc-800/40 rounded-md border border-zinc-700/30 flex justify-between">
                  <span className="text-zinc-500">{Math.floor(i/2) + 1}.</span>
                  <span className="font-mono font-bold text-zinc-300">{move}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chess Board Area */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
          <div className="relative w-full aspect-square max-w-[600px] bg-zinc-900 p-2 rounded-xl shadow-2xl border border-zinc-800">
            {/* Board Labels - Ranks */}
            <div className="absolute -left-6 inset-y-0 flex flex-col-reverse justify-around py-4 text-[10px] font-bold text-zinc-600">
              {['1','2','3','4','5','6','7','8'].map(l => <span key={l}>{l}</span>)}
            </div>
            {/* Board Labels - Files */}
            <div className="absolute -bottom-6 inset-x-0 flex justify-around px-4 text-[10px] font-bold text-zinc-600">
              {['A','B','C','D','E','F','G','H'].map(l => <span key={l}>{l}</span>)}
            </div>

            <div className="chess-grid w-full h-full rounded-sm overflow-hidden">
              {board.map((row, i) => 
                row.map((piece, j) => {
                  const squareName = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
                  const isDark = (i + j) % 2 === 1;
                  const isSelected = selectedSquare === squareName;
                  const isValidMove = validMoves.includes(squareName);
                  const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                  
                  return (
                    <div 
                      key={squareName}
                      onClick={() => handleSquareClick(squareName)}
                      className={cn(
                        "relative flex items-center justify-center cursor-pointer transition-colors duration-200",
                        isDark ? "bg-[#769656]" : "bg-[#eeeed2]",
                        isSelected && "ring-4 ring-inset ring-amber-400 z-10",
                        isLastMove && "bg-yellow-200/50"
                      )}
                    >
                      {/* Valid Move Indicator */}
                      {isValidMove && (
                        <div className={cn(
                          "absolute z-10 rounded-full",
                          piece ? "w-full h-full border-4 border-black/10" : "w-4 h-4 bg-black/10"
                        )} />
                      )}

                      {/* Piece with Framer Motion Animation */}
                      <AnimatePresence>
                        {piece && (
                          <motion.div
                            layoutId={piece.type + piece.color + i + j}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full h-full p-1 z-20"
                          >
                            <img 
                              src={PIECES_SVG[`${piece.color}${piece.type}`]}
                              className="w-full h-full drop-shadow-md active:scale-110 transition-transform"
                              alt={`${piece.color} ${piece.type}`}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Right: Spectator/Engine Info */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Auto-promote Queen</span>
                <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1">
                   <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Sound Effects</span>
                <div className="w-10 h-5 bg-zinc-700 rounded-full flex items-center px-1">
                   <div className="w-3 h-3 bg-zinc-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-indigo-300" />
              <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Analysis</h3>
            </div>
            <p className="text-indigo-200/70 text-sm leading-relaxed mb-4">
              The position is evaluation as equal (+0.1). Black needs to focus on center control while White develops the kingside.
            </p>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/2 transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-indigo-300/60 uppercase">
              <span>White</span>
              <span>Black</span>
            </div>
          </div>
        </div>

      </div>
      
      <footer className="mt-12 text-zinc-600 text-xs font-medium tracking-widest uppercase">
        &copy; 2024 Grandmaster Pro &bull; Professional Engine v4.2.0
      </footer>
    </div>
  );
}
