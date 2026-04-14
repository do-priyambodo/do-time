'use client';

import { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import Clock from "@/components/Clock";
import ZoneComparison from "@/components/ZoneComparison";
import Alarm from "@/components/Alarm";
import Timer from "@/components/Timer";
import Stopwatch from "@/components/Stopwatch";
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const INITIAL_ORDER = ['zone', 'alarm', 'timer', 'stopwatch'];

export default function Home() {
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'sunrise' | 'noon' | 'sunset' | 'night'>('noon');
  const [isManual, setIsManual] = useState(false);

  // Load from local storage on mount & determine time of day
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const mountTimer = setTimeout(() => {
      setMounted(true);
      const savedOrder = localStorage.getItem('do-time-order');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }

      const updateBackground = () => {
        if (isManual) return; // Skip automatic updates if user manually selected a theme
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 9) setTimeOfDay('sunrise');
        else if (hour >= 9 && hour < 17) setTimeOfDay('noon');
        else if (hour >= 17 && hour < 20) setTimeOfDay('sunset');
        else setTimeOfDay('night');
      };
      
      updateBackground();
      timer = setInterval(updateBackground, 60000); // Check every minute
    }, 0);

    return () => {
      clearTimeout(mountTimer);
      if (timer) clearInterval(timer);
    };
  }, [isManual]); // Rerun effect if manual mode toggles

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('do-time-order', JSON.stringify(order));
    }
  }, [order, mounted]);

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#1D1D1F] font-sans py-12 opacity-50">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-[#1D1D1F] sm:text-6xl">
            do-time
          </h1>
          <p className="text-zinc-600 text-lg font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const gradients = {
    sunrise: 'from-orange-100 via-pink-100 to-blue-200',
    noon: 'from-sky-50 via-white to-zinc-100',
    sunset: 'from-purple-100 via-rose-100 to-orange-100',
    night: 'from-slate-900 via-indigo-950 to-zinc-900',
  };

  const isNight = timeOfDay === 'night';

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${gradients[timeOfDay]} text-[#1D1D1F] font-sans py-12 transition-all duration-1000`}>
      {/* Subtle top line for depth */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isNight ? 'via-zinc-700' : 'via-zinc-300'} to-transparent`}></div>
      
      <main className="relative z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-4xl px-4">
        <div className="text-center space-y-2">
          <h1 className={`text-5xl font-bold tracking-tight sm:text-6xl ${isNight ? 'text-white' : 'text-[#1D1D1F]'}`}>
            do-time
          </h1>
          <p className={`${isNight ? 'text-zinc-400' : 'text-zinc-600'} text-lg font-medium`}>
            Time, refined.
          </p>
        </div>
        
        <Clock />
        
        {/* Reorderable Sections */}
        <Reorder.Group axis="y" values={order} onReorder={setOrder} className="w-full flex flex-col items-center space-y-4">
          {order.map((id) => (
            <ReorderItem key={id} id={id} />
          ))}
        </Reorder.Group>
        
        {/* Minimalist Controls */}
        <div className="w-full max-w-2xl space-y-4 mt-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold tracking-tight ${isNight ? 'text-white' : 'text-[#1D1D1F]'}`}>Controls</h2>
              <button 
                onClick={() => setIsControlsCollapsed(!isControlsCollapsed)} 
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {isControlsCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isControlsCollapsed && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <button 
                  onClick={() => { setTimeOfDay('sunrise'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-3 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'sunrise' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌅</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Sunrise</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('noon'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-3 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'noon' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">☀️</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Noon</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('sunset'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-3 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'sunset' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌆</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Sunset</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('night'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-3 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'night' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌙</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Night</span>
                </button>
              </div>
              
              {isManual && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsManual(false)}
                    className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Reset to Automatic Time
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ReorderItem({ id }: { id: string }) {
  const controls = useDragControls();
  
  const renderComponent = () => {
    switch (id) {
      case 'zone': return <ZoneComparison />;
      case 'alarm': return <Alarm />;
      case 'timer': return <Timer />;
      case 'stopwatch': return <Stopwatch />;
      default: return null;
    }
  };

  return (
    <Reorder.Item 
      value={id} 
      dragControls={controls} 
      dragListener={false}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full max-w-2xl flex justify-end pr-2 -mb-5 z-20">
        <div 
          onPointerDown={(e) => controls.start(e)} 
          className="cursor-grab p-1.5 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
      {renderComponent()}
    </Reorder.Item>
  );
}
