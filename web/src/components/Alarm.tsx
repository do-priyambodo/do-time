'use client';

import { useEffect, useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { playChime } from "@/lib/utils";

type AlarmItem = {
  id: string;
  time: string; // HH:MM
  label: string;
  enabled: boolean;
};

export default function Alarm() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');

  // 1. Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedAlarms = localStorage.getItem('do-time-alarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
  }, []);

  // 2. Check alarms every second (avoids dependency on 'alarms' by using functional update)
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentSeconds = now.getSeconds();
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      setAlarms(prev => {
        let triggeredAlarm: AlarmItem | undefined;
        
        const updated = prev.map(alarm => {
          if (alarm.enabled && alarm.time === currentTimeStr && currentSeconds === 0) {
            triggeredAlarm = alarm;
            return { ...alarm, enabled: false }; // Disable after trigger
          }
          return alarm;
        });

        if (triggeredAlarm) {
          playChime();
          alert(`🔔 Alarm: ${triggeredAlarm.label || 'Time up!'}`);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  // 3. Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('do-time-alarms', JSON.stringify(alarms));
    }
  }, [alarms, mounted]);

  const addAlarm = () => {
    const id = Math.random().toString(36).substring(7);
    setAlarms([...alarms, { id, time: newTime, label: newLabel, enabled: true }]);
    setNewTime('08:00');
    setNewLabel('');
    setIsOpen(false);
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-2xl space-y-4 mt-8 opacity-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Alarms</h2>
        </div>
        <div className="text-center text-zinc-500 text-sm py-8 border border-dashed border-zinc-300 rounded-2xl">
          Loading alarms...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Alarms</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        
        {!isCollapsed && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer">
              <Plus className="w-3 h-3" /> Add Alarm
            </DialogTrigger>
            <DialogContent className="bg-white/90 backdrop-blur-xl border-zinc-200 max-w-md rounded-2xl text-[#1D1D1F]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Set Alarm</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-zinc-600">Time</label>
                  <input 
                    type="time" 
                    className="border border-zinc-200 rounded-lg p-3 text-2xl font-bold font-mono bg-white text-[#1D1D1F]"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-zinc-600">Label</label>
                  <input 
                    type="text" 
                    placeholder="Alarm Label (optional)" 
                    className="border border-zinc-200 rounded-lg p-2 text-sm bg-white text-[#1D1D1F]"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <button 
                  onClick={addAlarm}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save Alarm
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alarms.map((alarm) => (
            <div key={alarm.id} className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-5 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 ${!alarm.enabled ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold tracking-tighter text-[#1D1D1F] font-mono">
                  {alarm.time}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1D1D1F] text-sm">{alarm.label || 'Alarm'}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Once</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 ${alarm.enabled ? 'bg-green-500' : 'bg-zinc-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${alarm.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <button 
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isCollapsed && alarms.length === 0 && (
        <div className="text-center text-zinc-500 text-sm py-8 border border-dashed border-zinc-300 rounded-2xl">
          No alarms set. Click &quot;Add Alarm&quot; to set one.
        </div>
      )}
    </div>
  );
}
