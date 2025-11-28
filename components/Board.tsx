import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameSection } from './GameSection';
import { StatusDisplay } from './StatusDisplay';
import { GameSectionData, GameState } from '../types';
import { audioService } from '../services/audioService';
import { Zap, Heart, Star, Sun, Anchor, Flame, Trophy } from 'lucide-react';

const SECTIONS: GameSectionData[] = [
  { id: 0, color: '#DC2626', activeColor: '#FF4444', icon: Heart, frequency: 261.63, label: 'Red Heart' },   // C4
  { id: 1, color: '#2563EB', activeColor: '#4488FF', icon: Star, frequency: 329.63, label: 'Blue Star' },    // E4
  { id: 2, color: '#059669', activeColor: '#00FF99', icon: Zap, frequency: 392.00, label: 'Green Bolt' },    // G4
  { id: 3, color: '#D97706', activeColor: '#FFDD00', icon: Sun, frequency: 523.25, label: 'Yellow Sun' },    // C5
  { id: 4, color: '#7C3AED', activeColor: '#CC44FF', icon: Anchor, frequency: 440.00, label: 'Purple Anchor' }, // A4
  { id: 5, color: '#EA580C', activeColor: '#FF8800', icon: Flame, frequency: 493.88, label: 'Orange Flame' },  // B4
];

const INITIAL_SPEED = 800;
const MIN_SPEED = 200;
const SPEED_DECREMENT = 60;
const TURN_TIMEOUT_BASE = 5000; 

export const Board: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100); 
  const [errorState, setErrorState] = useState(false);
  
  const sequenceRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const turnStartTimeRef = useRef<number>(0);
  const turnDurationRef = useRef<number>(TURN_TIMEOUT_BASE);

  useEffect(() => {
    const saved = localStorage.getItem('hexa-memory-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

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
      }, 50); 
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const playSoundAndHighlight = useCallback((id: number, duration: number = 300) => {
    const section = SECTIONS.find(s => s.id === id);
    if (section) {
      setActiveId(id);
      audioService.playTone(section.frequency);
      setTimeout(() => setActiveId(null), duration);
    }
  }, []);

  const playSequence = async () => {
    setGameState(GameState.PLAYING_SEQUENCE);
    setPlayerInput([]);
    
    // Dynamic speed
    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (sequenceRef.current.length * SPEED_DECREMENT));
    
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < sequenceRef.current.length; i++) {
      const id = sequenceRef.current[i];
      playSoundAndHighlight(id, speed * 0.6); // Highlight shorter than full interval
      await new Promise(r => setTimeout(r, speed)); 
    }

    setGameState(GameState.PLAYER_TURN);
    turnDurationRef.current = Math.max(2000, TURN_TIMEOUT_BASE - (sequenceRef.current.length * 50));
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
    audioService.playSuccess(); 
    
    setTimeout(() => {
        startNewRound();
    }, 500);
  };

  const handleGameOver = () => {
    setErrorState(true);
    setGameState(GameState.GAME_OVER);
    audioService.playError();
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setErrorState(false), 500);
  };

  const handleSectionClick = (id: number) => {
    if (gameState !== GameState.PLAYER_TURN) return;

    // Reset timer on input to give thinking time
    turnStartTimeRef.current = Date.now();

    const newInput = [...playerInput, id];
    setPlayerInput(newInput);

    const currentIndex = newInput.length - 1;
    if (newInput[currentIndex] !== sequenceRef.current[currentIndex]) {
      // Immediate failure feedback
      handleGameOver();
      return;
    }

    // Success feedback for individual click
    playSoundAndHighlight(id);

    // Check if round complete
    if (newInput.length === sequenceRef.current.length) {
      setScore(s => s + 1);
      setGameState(GameState.PLAYING_SEQUENCE);
      // Small delay before next round
      setTimeout(startNewRound, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      {/* HUD Header */}
      <div className="w-full flex justify-between items-center mb-8 px-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg z-20">
         <div className="flex items-center space-x-2">
           <div className={`w-3 h-3 rounded-full ${gameState === GameState.PLAYER_TURN ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-sm font-arcade text-gray-600 dark:text-gray-300 tracking-wider">
              {gameState === GameState.PLAYER_TURN ? 'PLAYER ACTIVE' : 'SYSTEM LOCK'}
           </span>
         </div>
         <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-gray-500 font-bold">High Score</span>
                <div className="flex items-center text-yellow-500">
                    <Trophy size={16} className="mr-1" />
                    <span className="font-arcade font-bold text-xl">{highScore}</span>
                </div>
            </div>
         </div>
      </div>

      {/* 3D Board Container */}
      <div className={`relative w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] perspective-container ${errorState ? 'animate-shake' : ''}`}>
        <div 
          className="absolute inset-0 preserve-3d transition-transform duration-700 ease-out"
          style={{ 
            transform: gameState === GameState.IDLE ? 'rotateX(0deg)' : 'rotateX(25deg)',
          }}
        >
          {/* Base Plate Shadow */}
          <div className="absolute inset-0 rounded-full bg-black/30 blur-2xl transform translate-y-20 scale-90" />
          
          {/* Main Board Surface */}
          <div className={`
              absolute inset-0 rounded-full 
              bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-800 dark:to-gray-900 
              shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-gray-300 dark:border-gray-700 
              flex items-center justify-center preserve-3d
              ${errorState ? 'border-red-500 shadow-red-500/50' : ''}
              transition-colors duration-200
            `}>
            
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
                angle={index * 60} 
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
            <p className="text-red-500 font-arcade font-bold tracking-widest">SYSTEM FAILURE // SEQUENCE BROKEN</p>
        )}
        {gameState === GameState.PLAYER_TURN && (
            <p className="text-blue-500 font-arcade text-sm">REPEAT SEQUENCE</p>
        )}
      </div>
    </div>
  );
};