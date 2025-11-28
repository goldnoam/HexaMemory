import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameSection } from './GameSection';
import { StatusDisplay } from './StatusDisplay';
import { GameSectionData, GameState } from '../types';
import { audioService } from '../services/audioService';
import { Zap, Heart, Star, Sun, Anchor, Flame, Trophy } from 'lucide-react';

const SECTIONS: GameSectionData[] = [
  { id: 0, color: '#DC2626', activeColor: '#FF0000', icon: Heart, frequency: 261.63, label: 'Red Heart' },   // C4
  { id: 1, color: '#2563EB', activeColor: '#0044FF', icon: Star, frequency: 293.66, label: 'Blue Star' },    // D4
  { id: 2, color: '#059669', activeColor: '#00FF88', icon: Zap, frequency: 329.63, label: 'Green Bolt' },    // E4
  { id: 3, color: '#D97706', activeColor: '#FFCC00', icon: Sun, frequency: 349.23, label: 'Yellow Sun' },    // F4
  { id: 4, color: '#7C3AED', activeColor: '#AA00FF', icon: Anchor, frequency: 392.00, label: 'Purple Anchor' }, // G4
  { id: 5, color: '#EA580C', activeColor: '#FF6600', icon: Flame, frequency: 440.00, label: 'Orange Flame' },  // A4
];

const INITIAL_SPEED = 800;
const MIN_SPEED = 250;
const SPEED_DECREMENT = 50;
const TURN_TIMEOUT_BASE = 5000; // 5 seconds initial time per move

export const Board: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100); // Percentage
  
  // Refs for logic that doesn't need immediate re-renders or interval management
  const sequenceRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const turnStartTimeRef = useRef<number>(0);
  const turnDurationRef = useRef<number>(TURN_TIMEOUT_BASE);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('hexa-memory-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hexa-memory-highscore', score.toString());
    }
  }, [score, highScore]);

  // Timer Logic
  useEffect(() => {
    if (gameState === GameState.PLAYER_TURN) {
      turnStartTimeRef.current = Date.now();
      
      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - turnStartTimeRef.current;
        const remaining = turnDurationRef.current - elapsed;
        
        if (remaining <= 0) {
          handleGameOver();
        } else {
          setTimeLeft((remaining / turnDurationRef.current) * 100);
        }
      }, 50); // High refresh rate for smooth gauge
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]); // Re-run when game state changes to PLAYER_TURN

  const playSoundAndHighlight = useCallback((id: number) => {
    const section = SECTIONS.find(s => s.id === id);
    if (section) {
      setActiveId(id);
      audioService.playTone(section.frequency);
      setTimeout(() => setActiveId(null), 300);
    }
  }, []);

  const playSequence = async () => {
    setGameState(GameState.PLAYING_SEQUENCE);
    setPlayerInput([]);
    
    // Calculate speed based on sequence length
    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (sequenceRef.current.length * SPEED_DECREMENT));
    
    // Initial delay before playing
    await new Promise(r => setTimeout(r, 800));

    for (let i = 0; i < sequenceRef.current.length; i++) {
      const id = sequenceRef.current[i];
      playSoundAndHighlight(id);
      await new Promise(r => setTimeout(r, speed)); // Wait for sound + gap
    }

    // Give a small buffer before player can start
    setGameState(GameState.PLAYER_TURN);
    // Reset turn timer duration slightly faster as game progresses
    turnDurationRef.current = Math.max(2000, TURN_TIMEOUT_BASE - (sequenceRef.current.length * 100));
  };

  const startNewRound = () => {
    const nextId = Math.floor(Math.random() * 6);
    const newSequence = [...sequenceRef.current, nextId];
    sequenceRef.current = newSequence;
    setSequence(newSequence);
    playSequence();
  };

  const handleStartGame = () => {
    setScore(0);
    sequenceRef.current = [];
    setSequence([]);
    setGameState(GameState.IDLE);
    // Initialize audio context on user interaction
    audioService.playSuccess(); 
    
    setTimeout(() => {
        startNewRound();
    }, 500);
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
    audioService.playError();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSectionClick = (id: number) => {
    if (gameState !== GameState.PLAYER_TURN) return;

    // Reset timer for the next click (optional mechanic: reset timer on every correct click? 
    // The prompt implies a "timer gauge", usually for the whole turn or per click. 
    // I'll make it per-turn limit, but reset it on successful click to allow thinking for next step?)
    // Let's reset the timer on each valid input to keep the flow going.
    turnStartTimeRef.current = Date.now();

    playSoundAndHighlight(id);
    const newInput = [...playerInput, id];
    setPlayerInput(newInput);

    // Check correctness
    const currentIndex = newInput.length - 1;
    if (newInput[currentIndex] !== sequenceRef.current[currentIndex]) {
      handleGameOver();
      return;
    }

    // Check if round complete
    if (newInput.length === sequenceRef.current.length) {
      setScore(s => s + 1);
      setGameState(GameState.PLAYING_SEQUENCE); // Lock input immediately
      setTimeout(startNewRound, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      {/* HUD Header */}
      <div className="w-full flex justify-between items-center mb-8 px-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg z-20">
         <div className="flex items-center space-x-2">
           <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
           <span className="text-sm font-arcade text-gray-600 dark:text-gray-300 tracking-wider">LIVE MEMORY FEED</span>
         </div>
         <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-gray-500 font-bold">Best Run</span>
                <div className="flex items-center text-yellow-500">
                    <Trophy size={16} className="mr-1" />
                    <span className="font-arcade font-bold text-xl">{highScore}</span>
                </div>
            </div>
         </div>
      </div>

      {/* 3D Board Container */}
      <div className="relative w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] perspective-container">
        <div 
          className="absolute inset-0 preserve-3d transition-transform duration-700 ease-out"
          style={{ 
            transform: gameState === GameState.IDLE ? 'rotateX(0deg)' : 'rotateX(20deg)',
          }}
        >
          {/* Base Plate Shadow */}
          <div className="absolute inset-0 rounded-full bg-black/20 blur-xl transform translate-y-20 scale-90" />
          
          {/* Main Board Surface */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-800 dark:to-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-gray-300 dark:border-gray-700 flex items-center justify-center preserve-3d">
            
             {/* Decorative lines */}
             <div className="absolute inset-4 rounded-full border border-dashed border-gray-400/30 pointer-events-none" />
             <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

            {/* Center Status Display */}
            <StatusDisplay 
              gameState={gameState} 
              score={score} 
              timeLeftPct={timeLeft}
              onStart={handleStartGame}
              onReset={handleStartGame}
            />

            {/* Sections */}
            {SECTIONS.map((section, index) => (
              <GameSection
                key={section.id}
                data={section}
                isActive={activeId === section.id}
                disabled={gameState !== GameState.PLAYER_TURN}
                onClick={handleSectionClick}
                angle={index * 60} // 360 / 6 = 60 degrees apart
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="mt-16 text-center h-8">
        {gameState === GameState.IDLE && (
            <p className="text-gray-500 animate-bounce">Press START to begin simulation</p>
        )}
        {gameState === GameState.GAME_OVER && (
            <p className="text-red-500 font-arcade">SYSTEM FAILURE. SEQUENCE BROKEN.</p>
        )}
      </div>
    </div>
  );
};
