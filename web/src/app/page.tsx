'use client';

import { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import Clock from "@/components/Clock";
import ZoneComparison from "@/components/ZoneComparison";
import Alarm from "@/components/Alarm";
import Timer from "@/components/Timer";
import Stopwatch from "@/components/Stopwatch";
import Pomodoro from "@/components/Pomodoro";
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { playChime, stopChime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const INITIAL_ORDER = ['zone', 'alarm', 'timer', 'stopwatch'];

export default function Home() {
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'sunrise' | 'noon' | 'sunset' | 'night'>('noon');
  const [isManual, setIsManual] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    alarm: '/iphone_alarm.mp3',
    timer: '/iphone_alarm.mp3',
    pomodoro: '/iphone_alarm.mp3',
  });
  const [tempSettings, setTempSettings] = useState(settings);

  const handleReset = () => {
    localStorage.removeItem('do-time-alarms');
    localStorage.removeItem('do-time-order');
    localStorage.removeItem('do-time-zones');
    window.location.reload();
  };

  // Load from local storage on mount & determine time of day
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const mountTimer = setTimeout(() => {
      setMounted(true);
      const savedOrder = localStorage.getItem('do-time-order');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder).filter((item: string) => item !== 'pomodoro');
        // Ensure all items from INITIAL_ORDER are present
        const mergedOrder = [
          ...parsedOrder,
          ...INITIAL_ORDER.filter(item => !parsedOrder.includes(item))
        ];
        setOrder(mergedOrder);
      }
      const savedSettings = localStorage.getItem('do-time-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('do-time-settings', JSON.stringify(settings));
    }
  }, [settings, mounted]);



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
    night: 'from-indigo-950 via-slate-900 to-blue-900',
  };

  const isNight = timeOfDay === 'night';

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${gradients[timeOfDay]} ${isNight ? 'text-white' : 'text-[#1D1D1F]'} font-sans py-12 transition-all duration-1000`}>
      {/* Subtle top line for depth */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isNight ? 'via-zinc-700' : 'via-zinc-300'} to-transparent`}></div>
      
      <main className="relative z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-4xl px-4">
        <div className="text-center space-y-2">
          <h1 className={`text-5xl font-bold tracking-tight sm:text-6xl ${isNight ? 'text-white' : 'text-[#1D1D1F]'}`}>
            do-time
          </h1>
          <p className={`${isNight ? 'text-zinc-400' : 'text-zinc-600'} text-lg font-medium`}>
            Engineered for focus.
          </p>
        </div>
        
        <Clock />
        
        <Pomodoro sound={settings.pomodoro} />
        
        {/* Reorderable Sections */}
        <Reorder.Group axis="y" values={order} onReorder={setOrder} className="w-full flex flex-col items-center space-y-4">
          {order.map((id) => (
            <ReorderItem key={id} id={id} sound={settings[id as keyof typeof settings]} />
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
              <div className="grid grid-cols-7 gap-2 w-full">
                <button 
                  onClick={() => { setTimeOfDay('sunrise'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'sunrise' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌅</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Sunrise</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('noon'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'noon' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">☀️</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Noon</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('sunset'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'sunset' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌆</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Sunset</span>
                </button>
                <button 
                  onClick={() => { setTimeOfDay('night'); setIsManual(true); }}
                  className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${timeOfDay === 'night' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xl mb-1">🌙</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Night</span>
                </button>
                <button 
                  onClick={() => setIsResetModalOpen(true)}
                  className="border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🔄</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Reset</span>
                </button>
                <button 
                  onClick={() => {
                    setTempSettings(settings);
                    setIsSettingsModalOpen(true);
                  }}
                  className="border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">⚙️</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">Setting</span>
                </button>
                <button 
                  onClick={() => setIsAboutModalOpen(true)}
                  className="border border-zinc-200 bg-white/80 backdrop-blur-md p-2 rounded-xl text-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">ℹ️</span>
                  <span className="text-xs font-medium text-[#1D1D1F]">About</span>
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
        {/* Reset Confirmation Modal */}
        <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
          <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 w-[95%] max-w-md rounded-3xl text-[#1D1D1F] p-6 sm:p-8 flex flex-col items-center space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Reset to Default State?</DialogTitle>
            </DialogHeader>
            <div className="text-center text-zinc-600 font-medium">
              This will return all states to Default State, which will remove all your changes.
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="bg-zinc-100 text-[#1D1D1F] font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReset}
                className="bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Modal */}
        <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
          <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 w-[95%] max-w-md rounded-3xl text-[#1D1D1F] p-6 sm:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {['alarm', 'timer', 'pomodoro'].map((module) => (
                <div key={module} className="flex flex-col space-y-2">
                  <label className="text-sm font-medium capitalize">{module} Sound</label>
                  <div className="flex gap-2">
                    <select
                      value={tempSettings[module as keyof typeof tempSettings]}
                      onChange={(e) => setTempSettings({ ...tempSettings, [module]: e.target.value })}
                      className="flex-1 bg-white/50 backdrop-blur-md border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#1D1D1F]"
                    >
                      <option value="/alarm.mp3">Alarm</option>
                      <option value="/digital_alarm.mp3">Digital Alarm</option>
                      <option value="/gentle_chime.mp3">Gentle Chime</option>
                      <option value="/iphone_alarm.mp3">iPhone Alarm</option>
                    </select>
                    <button
                      onClick={() => playChime(tempSettings[module as keyof typeof tempSettings])}
                      className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => stopChime()}
                      className="bg-zinc-100 text-[#1D1D1F] text-xs font-medium px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button 
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  stopChime(); // Stop any testing sound
                }}
                className="bg-zinc-100 text-[#1D1D1F] font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setSettings(tempSettings);
                  setIsSettingsModalOpen(false);
                  stopChime();
                }}
                className="bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* About Modal */}
        <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
          <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 w-[95%] max-w-md rounded-3xl text-[#1D1D1F] p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">About do-time</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 text-sm text-[#1D1D1F]">
              <p className="text-lg font-bold text-center text-[#1D1D1F]">⏳ Engineered for Focus.</p>
              
              <div className="text-center space-y-2">
                <p className="text-zinc-600">In a world full of digital noise, <code>do-time</code> aims to be your sanctuary of focus. We believe that productivity tools should be as beautiful as they are functional.</p>
              </div>
              
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 text-center mb-2">The Essentials</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong className="text-[#1D1D1F]">Pomodoro</strong>
                    <p className="text-zinc-500 mt-0.5">Peak Productivity.</p>
                  </div>
                  <div>
                    <strong className="text-[#1D1D1F]">World Clock</strong>
                    <p className="text-zinc-500 mt-0.5">Time without Borders.</p>
                  </div>
                  <div>
                    <strong className="text-[#1D1D1F]">Smart Alarms</strong>
                    <p className="text-zinc-500 mt-0.5">Precision Scheduling.</p>
                  </div>
                  <div>
                    <strong className="text-[#1D1D1F]">Workspace</strong>
                    <p className="text-zinc-500 mt-0.5">Fluid Movement.</p>
                  </div>
                  <div>
                    <strong className="text-[#1D1D1F]">Timer</strong>
                    <p className="text-zinc-500 mt-0.5">Targeted Focus.</p>
                  </div>
                  <div>
                    <strong className="text-[#1D1D1F]">Stopwatch</strong>
                    <p className="text-zinc-500 mt-0.5">Every Second Counts.</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-zinc-500 mt-6">
                Designed & Crafted by <a href="https://priyambodo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Doddi Priyambodo</a><br/>
                with the support of <i>Chisiella Alzena Athaya</i>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setIsAboutModalOpen(false)}
                className="bg-zinc-100 text-[#1D1D1F] font-medium px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function ReorderItem({ id, sound }: { id: string, sound?: string }) {
  const controls = useDragControls();
  
  const renderComponent = () => {
    switch (id) {
      case 'zone': return <ZoneComparison />;
      case 'alarm': return <Alarm sound={sound} />;
      case 'timer': return <Timer sound={sound} />;
      case 'stopwatch': return <Stopwatch />;
      default: return null;
    }
  };

  return (
    <Reorder.Item 
      value={id} 
      dragControls={controls} 
      dragListener={false}
      className="w-full flex items-start gap-2 max-w-3xl mx-auto"
    >
      <div 
        onPointerDown={(e) => controls.start(e)} 
        className="cursor-grab p-1.5 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 z-20 mt-9 h-fit"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 w-full">
        {renderComponent()}
      </div>
    </Reorder.Item>
  );
}
