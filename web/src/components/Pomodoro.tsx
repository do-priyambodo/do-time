'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Coffee, Brain, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { playChime, stopChime } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_TIMES = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function Pomodoro({ sound, onToggleMaximize, isMaximized }: { sound?: string, onToggleMaximize?: () => void, isMaximized?: boolean }) {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES[mode]);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Reset timer when mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(MODE_TIMES[mode]);
      setIsActive(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [mode]);

  const handlePhaseCompletion = useCallback(() => {
    setIsActive(false);
    
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setModalMessage('🎉 Great job! Time for a long break.');
        setIsModalOpen(true);
      } else {
        setMode('shortBreak');
        setModalMessage('☕ Focus session done! Take a short break.');
        setIsModalOpen(true);
      }
    } else {
      setMode('focus');
      setModalMessage('💪 Break is over! Time to focus.');
      setIsModalOpen(true);
    }
  }, [mode, sessionsCompleted]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      playChime(sound);
      setTimeout(() => {
        handlePhaseCompletion();
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, handlePhaseCompletion, sound]);

  // Stop chime when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      stopChime();
    }
  }, [isModalOpen]);


  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const skipPhase = () => {
    setIsActive(false);
    handlePhaseCompletion();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return 'text-rose-500 bg-rose-50';
      case 'shortBreak': return 'text-emerald-500 bg-emerald-50';
      case 'longBreak': return 'text-blue-500 bg-blue-50';
    }
  };

  const getModeProgressColor = () => {
    switch (mode) {
      case 'focus': return 'bg-rose-500';
      case 'shortBreak': return 'bg-emerald-500';
      case 'longBreak': return 'bg-blue-500';
    }
  };

  const progress = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className={`w-full space-y-4 mt-8 ${isMaximized ? 'max-w-5xl' : 'max-w-2xl'}`}>
      {!isMaximized && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Pomodoro</h2>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            {onToggleMaximize && (
              <button 
                onClick={onToggleMaximize}
                className="text-zinc-400 hover:text-zinc-600 transition-colors ml-1"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getModeColor()}`}>
              {mode === 'focus' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
              <span className="capitalize">{mode.replace('Break', ' Break')}</span>
            </div>
          </div>
          
          <div className="text-sm text-zinc-500 font-medium">
            Sessions: {sessionsCompleted}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className={`bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative ${isMaximized ? 'p-20 sm:p-32 space-y-8' : 'p-6 space-y-4'}`}>
          {isMaximized && onToggleMaximize && (
            <button 
              onClick={onToggleMaximize}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          )}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {/* Timer Display */}
            <div className={`font-bold font-mono text-[#1D1D1F] tracking-tighter ${isMaximized ? 'text-[8rem] sm:text-[12rem]' : 'text-6xl'}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getModeProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={resetTimer}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105 ${isActive ? 'bg-zinc-800 hover:bg-zinc-900' : 'bg-blue-600 hover:bg-blue-700'}`}
            title={isActive ? 'Pause' : 'Start'}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button 
            onClick={skipPhase}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            title="Skip"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session Indicators */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[...Array(4)].map((_, index) => {
          const sessionInCycle = sessionsCompleted % 4;
          const isCompleted = index < sessionInCycle;
          const isCurrent = index === sessionInCycle && mode === 'focus';
          
          return (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-rose-500' : isCurrent ? 'bg-rose-500 animate-pulse' : 'bg-zinc-200'}`}
            />
          );
        })}
      </div>
        </div>
      )}

      {/* Completion Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 w-[95%] max-w-md rounded-3xl text-[#1D1D1F] p-6 sm:p-8 flex flex-col items-center space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Pomodoro</DialogTitle>
          </DialogHeader>
          <div className="text-center text-lg font-medium">
            {modalMessage}
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-full bg-zinc-900 text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Dismiss
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
