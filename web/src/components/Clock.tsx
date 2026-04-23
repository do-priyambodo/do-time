'use client';

import { useEffect, useState } from 'react';

import { Maximize2, Minimize2 } from 'lucide-react';

export default function Clock({ onToggleMaximize, isMaximized }: { onToggleMaximize?: () => void, isMaximized?: boolean }) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(mountTimer);
      clearInterval(timer);
    };
  }, []);

  // Avoid hydration mismatch by rendering a skeleton or placeholder until mounted
  if (!mounted) {
    return (
      <div className="border border-zinc-200 bg-white/80 backdrop-blur-xl p-10 rounded-3xl flex flex-col items-center justify-center space-y-4 max-w-md w-full shadow-lg opacity-50">
        <div className="text-7xl font-bold tracking-tighter text-[#1D1D1F] font-mono">
          00:00:00
        </div>
        <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
          Loading...
        </div>
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className={`border border-zinc-200 bg-white/80 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center space-y-8 shadow-lg relative ${isMaximized ? 'max-w-5xl w-full p-20 sm:p-32' : 'max-w-md w-full p-10'}`}>
      {onToggleMaximize && (
        <button 
          onClick={onToggleMaximize}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          title={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
      )}
      <div className={`font-bold tracking-tighter text-[#1D1D1F] font-mono ${isMaximized ? 'text-[5rem] sm:text-[8rem]' : 'text-7xl'}`}>
        {hours}:{minutes}:{seconds}
      </div>
      <div className={`text-zinc-500 font-medium uppercase tracking-wider ${isMaximized ? 'text-2xl' : 'text-sm'}`}>
        {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
