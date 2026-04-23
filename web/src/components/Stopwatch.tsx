'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Flag, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

export default function Stopwatch({ onToggleMaximize, isMaximized }: { onToggleMaximize?: () => void, isMaximized?: boolean }) {
  const [time, setTime] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const startStopwatch = () => setIsRunning(true);
  const pauseStopwatch = () => setIsRunning(false);
  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };
  const addLap = () => {
    setLaps([...laps, time]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const centiseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${centiseconds}`;
  };

  return (
    <div className={`w-full space-y-4 mt-8 ${isMaximized ? 'max-w-5xl' : 'max-w-2xl'}`}>
      {!isMaximized && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Stopwatch</h2>
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
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className={`border border-zinc-200 bg-white/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-8 shadow-sm hover:shadow-md transition-all duration-300 relative ${isMaximized ? 'p-20 sm:p-32' : 'p-6'}`}>
          {isMaximized && onToggleMaximize && (
            <button 
              onClick={onToggleMaximize}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          )}
          
          <div className={`font-bold tracking-tighter text-[#1D1D1F] font-mono ${isMaximized ? 'text-[8rem] sm:text-[12rem]' : 'text-6xl'}`}>
            {formatTime(time)}
          </div>

          <div className="flex gap-4">
            {isRunning ? (
              <button onClick={pauseStopwatch} className="bg-zinc-900 text-white p-4 rounded-full hover:bg-zinc-800 transition-colors">
                <Pause className="w-6 h-6" />
              </button>
            ) : (
              <button onClick={startStopwatch} className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors">
                <Play className="w-6 h-6" />
              </button>
            )}
            <button 
              onClick={addLap} 
              disabled={!isRunning} 
              className="border border-zinc-200 bg-white p-4 rounded-full hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Flag className="w-6 h-6 text-zinc-600" />
            </button>
            <button onClick={resetStopwatch} className="border border-zinc-200 bg-white p-4 rounded-full hover:bg-zinc-100 transition-colors">
              <RotateCcw className="w-6 h-6 text-zinc-600" />
            </button>
          </div>

          {laps.length > 0 && (
            <div className="w-full max-h-40 overflow-y-auto border-t border-zinc-100 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-zinc-600 mb-2">Laps</h3>
              {laps.map((lap, index) => (
                <div key={index} className="flex justify-between text-sm py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-zinc-500">Lap {index + 1}</span>
                  <span className="font-mono text-[#1D1D1F]">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
