import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Trophy,
  Settings,
  User
} from 'lucide-react';
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [status, setStatus] = useState<string>('White to move');
  const [gameEnded, setGameEnded] = useState(false);
  const moveHistoryRef = useRef<HTMLDivElement>(null);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(prev => [...prev, result]);
        updateStatus();
      }
    } catch (e) {
      // Invalid move
    }
  }, [game]);

  const updateStatus = useCallback(() => {
    let status = '';
    const turn = game.turn() === 'w' ? 'White' : 'Black';

    if (game.isCheckmate()) {
      status = `Game Over - Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
      setGameEnded(true);
    } else if (game.isDraw()) {
      status = 'Game Over - Draw';
      setGameEnded(true);
    } else {
      status = `${turn} to move`;
      if (game.inCheck()) status += ' (Check!)';
    }
    setStatus(status);
  }, [game]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setGameEnded(false);
    setStatus('White to move');
  };

  const undoMove = () => {
    game.undo();
    setGame(new Chess(game.fen()));
    setMoveHistory(prev => prev.slice(0, -1));
    updateStatus();
  };

  useEffect(() => {
    if (moveHistoryRef.current) {
      moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 lg:p-8 selection:bg-indigo-500/30">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar / Info Panel */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="font-bold text-lg">Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <p className={cn("text-sm font-medium", gameEnded ? "text-emerald-400" : "text-zinc-400")}>
                  {status}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={resetGame}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-[0.98] font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </button>
                <button 
                  onClick={undoMove}
                  disabled={moveHistory.length === 0}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Undo Move
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-zinc-500" />
              <h3 className="font-semibold">Settings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>PVP Mode</span>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Show Hints</span>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Board Area */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Black</p>
                <p className="font-bold">Grandmaster Bot</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xl">
              10:00
            </div>
          </div>

          <ChessBoard 
            game={game} 
            onMove={makeMove} 
            lastMove={moveHistory[moveHistory.length - 1]} 
          />

          <div className="w-full flex justify-between items-center mt-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">White</p>
                <p className="font-bold">You (Player)</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xl text-indigo-400">
              09:42
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3 order-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-[650px] flex flex-col shadow-xl">
            <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold">Move History</h2>
            </div>
            
            <div 
              ref={moveHistoryRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700"
            >
              {moveHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2">
                   <History className="w-8 h-8 opacity-20" />
                   <p className="text-sm">No moves yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800 group hover:border-indigo-500/50 transition-colors">
                        <span className="text-xs font-bold text-zinc-600">{i + 1}.</span>
                        <span className="text-sm font-medium">{moveHistory[i * 2]?.san}</span>
                      </div>
                      {moveHistory[i * 2 + 1] && (
                        <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800 group hover:border-indigo-500/50 transition-colors">
                           <span className="text-xs font-bold text-zinc-600 invisible">{i + 1}.</span>
                           <span className="text-sm font-medium">{moveHistory[i * 2 + 1].san}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex gap-2">
              <button className="flex-1 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;