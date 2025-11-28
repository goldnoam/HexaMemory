import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface Props {
  gameState: GameState;
  score: number;
  timeLeftPct: number; // 0 to 100
  onStart: () => void;
  onReset: () => void;
}

export const StatusDisplay: React.FC<Props> = ({ gameState, score, timeLeftPct, onStart, onReset }) => {
  const isPlaying = gameState === GameState.PLAYING_SEQUENCE || gameState === GameState.PLAYER_TURN;
  const isGameOver = gameState === GameState.GAME_OVER;
  
  const [animateScore, setAnimateScore] = useState(false);

  // Trigger animation when score increases
  useEffect(() => {
    if (score > 0) {
      setAnimateScore(true);
      const timer = setTimeout(() => setAnimateScore(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score]);

  // Determine timer color
  const timerColor = timeLeftPct > 50 ? '#10B981' : timeLeftPct > 20 ? '#F59E0B' : '#EF4444';

  return (
    <div 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                 w-36 h-36 bg-gray-200 dark:bg-gray-800 rounded-full 
                 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]
                 flex flex-col items-center justify-center z-10
                 border-4 border-gray-300 dark:border-gray-700"
      style={{ transformStyle: 'preserve-3d', transform: 'translate(-50%, -50%) translateZ(10px)' }}
    >
      {/* Timer Gauge Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          r="66" // Radius just inside the container
          fill="none"
          stroke={gameState === GameState.PLAYER_TURN ? timerColor : 'transparent'}
          strokeWidth="6"
          strokeDasharray="414" // 2 * PI * 66 ≈ 414
          strokeDashoffset={414 - (414 * timeLeftPct) / 100}
          strokeLinecap="round"
          className="transition-all duration-200 ease-linear"
        />
      </svg>

      <div className="text-center z-20">
        {!isPlaying && !isGameOver && (
          <button
            onClick={onStart}
            className="group flex flex-col items-center justify-center text-gray-700 dark:text-gray-200 hover:text-emerald-500 transition-colors"
          >
            <Play className="w-10 h-10 mb-1 fill-current" />
            <span className="text-xs font-arcade font-bold uppercase">Start</span>
          </button>
        )}

        {isPlaying && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 font-bold uppercase mb-1">Score</span>
            <span 
              className={`text-3xl font-arcade font-bold transition-all duration-200 
                ${animateScore ? 'animate-score-pop text-green-500 scale-125' : 'text-blue-600 dark:text-blue-400'}`}
            >
              {score}
            </span>
          </div>
        )}

        {isGameOver && (
          <button
            onClick={onReset}
            className="flex flex-col items-center justify-center text-red-500 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-8 h-8 mb-1" />
            <span className="text-xs font-arcade font-bold uppercase">Retry</span>
          </button>
        )}
      </div>

       {/* Status text overlay for game phases */}
       {gameState === GameState.PLAYING_SEQUENCE && (
         <div className="absolute -bottom-16 bg-black/70 text-white px-3 py-1 rounded text-xs font-bold font-arcade tracking-wider animate-bounce">
           WATCH
         </div>
       )}
       {gameState === GameState.PLAYER_TURN && (
         <div className="absolute -bottom-16 bg-blue-600/90 text-white px-3 py-1 rounded text-xs font-bold font-arcade tracking-wider">
           REPEAT
         </div>
       )}
    </div>
  );
};