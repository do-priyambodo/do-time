'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { playChime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Input states
  const [inputHours, setInputHours] = useState('00');
  const [inputMinutes, setInputMinutes] = useState('05');
  const [inputSeconds, setInputSeconds] = useState('00');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            setIsModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      const h = parseInt(inputHours) || 0;
      const m = parseInt(inputMinutes) || 0;
      const s = parseInt(inputSeconds) || 0;
      const totalSeconds = h * 3600 + m * 60 + s;
      
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setIsRunning(true);
      }
    } else {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-full max-w-2xl space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Timer</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="border border-zinc-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
          
          {timeLeft > 0 || isRunning ? (
            <div className="text-6xl font-bold tracking-tighter text-[#1D1D1F] font-mono">
              {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              {/* Hours Input */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setInputHours(prev => {
                    const val = parseInt(prev) || 0;
                    return val >= 23 ? '00' : (val + 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <input 
                  type="text" 
                  value={inputHours} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0,2);
                    const num = parseInt(val);
                    if (num >= 0 && num <= 23) setInputHours(val.padStart(2, '0'));
                    else if (val === '') setInputHours('');
                  }} 
                  onBlur={() => {
                    if (inputHours === '') setInputHours('00');
                    else setInputHours(inputHours.padStart(2, '0'));
                  }}
                  className="w-16 text-center text-4xl font-bold font-mono bg-transparent text-[#1D1D1F] focus:outline-none" 
                />
                <button 
                  onClick={() => setInputHours(prev => {
                    const val = parseInt(prev) || 0;
                    return val <= 0 ? '23' : (val - 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <span className="text-sm text-zinc-500 mt-2">hours</span>
              </div>

              <span className="text-4xl font-bold text-[#1D1D1F] mb-6">:</span>

              {/* Minutes Input */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setInputMinutes(prev => {
                    const val = parseInt(prev) || 0;
                    return val >= 59 ? '00' : (val + 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <input 
                  type="text" 
                  value={inputMinutes} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0,2);
                    const num = parseInt(val);
                    if (num >= 0 && num <= 59) setInputMinutes(val.padStart(2, '0'));
                    else if (val === '') setInputMinutes('');
                  }} 
                  onBlur={() => {
                    if (inputMinutes === '') setInputMinutes('00');
                    else setInputMinutes(inputMinutes.padStart(2, '0'));
                  }}
                  className="w-16 text-center text-4xl font-bold font-mono bg-transparent text-[#1D1D1F] focus:outline-none" 
                />
                <button 
                  onClick={() => setInputMinutes(prev => {
                    const val = parseInt(prev) || 0;
                    return val <= 0 ? '59' : (val - 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <span className="text-sm text-zinc-500 mt-2">min</span>
              </div>

              <span className="text-4xl font-bold text-[#1D1D1F] mb-6">:</span>

              {/* Seconds Input */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setInputSeconds(prev => {
                    const val = parseInt(prev) || 0;
                    return val >= 59 ? '00' : (val + 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <input 
                  type="text" 
                  value={inputSeconds} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0,2);
                    const num = parseInt(val);
                    if (num >= 0 && num <= 59) setInputSeconds(val.padStart(2, '0'));
                    else if (val === '') setInputSeconds('');
                  }} 
                  onBlur={() => {
                    if (inputSeconds === '') setInputSeconds('00');
                    else setInputSeconds(inputSeconds.padStart(2, '0'));
                  }}
                  className="w-16 text-center text-4xl font-bold font-mono bg-transparent text-[#1D1D1F] focus:outline-none" 
                />
                <button 
                  onClick={() => setInputSeconds(prev => {
                    const val = parseInt(prev) || 0;
                    return val <= 0 ? '59' : (val - 1).toString().padStart(2, '0');
                  })}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <span className="text-sm text-zinc-500 mt-2">sec</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {isRunning ? (
              <button onClick={pauseTimer} className="bg-zinc-900 text-white p-4 rounded-full hover:bg-zinc-800 transition-colors">
                <Pause className="w-6 h-6" />
              </button>
            ) : (
              <button onClick={startTimer} className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors">
                <Play className="w-6 h-6" />
              </button>
            )}
            <button onClick={resetTimer} className="border border-zinc-200 bg-white p-4 rounded-full hover:bg-zinc-100 transition-colors">
              <RotateCcw className="w-6 h-6 text-zinc-600" />
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 max-w-md rounded-3xl text-[#1D1D1F] p-8 flex flex-col items-center space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Timer</DialogTitle>
          </DialogHeader>
          <div className="text-center text-lg font-medium">
            🔔 Timer finished!
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
