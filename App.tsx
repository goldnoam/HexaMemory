import React, { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-[#0a0a0e] transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black font-arcade text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400 drop-shadow-sm">
            HEXA<span className="text-gray-800 dark:text-white">MEMORY</span>
            </h1>
            <span className="text-xs tracking-[0.3em] text-gray-500 font-bold ml-1">NEURAL TRAINING DECK</span>
        </div>
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
          aria-label="Toggle Theme"
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-indigo-600" />
          )}
        </button>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <Board />
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 text-center">
        <div className="inline-block px-6 py-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono">
          <p>(C) Noam Gold AI 2025 Send Feedback gold.noam@gmail.com</p>
        </div>
      </footer>
    </div>
  );
};

export default App;