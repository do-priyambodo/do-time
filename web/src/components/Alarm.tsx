'use client';

import { useEffect, useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { playChime, stopChime } from "@/lib/utils";

type AlarmItem = {
  id: string;
  time: string; // HH:MM
  label: string;
  enabled: boolean;
  repeatDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
};

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'morning',
    time: '08:00',
    label: 'Good Morning!',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'night',
    time: '22:00',
    label: 'Good Night!',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
  },
];

export default function Alarm({ sound }: { sound?: string }) {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newHours, setNewHours] = useState('08');
  const [newMinutes, setNewMinutes] = useState('00');
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  // 1. Load from local storage on mount
  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
      const savedAlarms = localStorage.getItem('do-time-alarms');
      if (savedAlarms) {
        setAlarms(JSON.parse(savedAlarms));
      } else {
        setAlarms(INITIAL_ALARMS);
      }
    }, 0);
    return () => clearTimeout(mountTimer);
  }, []);

  // 2. Check alarms every second
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentSeconds = now.getSeconds();
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay();

      let triggeredAlarm: AlarmItem | undefined;

      const updatedAlarms = alarms.map(alarm => {
        const isRightDay = !alarm.repeatDays || alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);
        
        if (alarm.enabled && alarm.time === currentTimeStr && currentSeconds === 0 && isRightDay) {
          triggeredAlarm = alarm;
          const shouldDisable = !alarm.repeatDays || alarm.repeatDays.length === 0;
          return { ...alarm, enabled: !shouldDisable };
        }
        return alarm;
      });

      if (triggeredAlarm) {
        playChime(sound);
        setRingingAlarm(triggeredAlarm);
        setAlarms(updatedAlarms);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, alarms, sound]);

  // 3. Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('do-time-alarms', JSON.stringify(alarms));
    }
  }, [alarms, mounted]);

  // Stop chime when alarm is stopped or snoozed
  useEffect(() => {
    if (ringingAlarm === null) {
      stopChime();
    }
  }, [ringingAlarm]);

  const testRingingModal = () => {
    playChime(sound);
    setRingingAlarm({
      id: 'test',
      time: '12:34',
      label: 'Test Alarm',
      enabled: true
    });
  };

  const stopAlarm = () => {
    setRingingAlarm(null);
  };

  const snoozeAlarm = () => {
    if (!ringingAlarm) return;
    
    const now = new Date();
    now.setMinutes(now.getMinutes() + 9); // Snooze for 9 mins
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const snoozedTime = `${hours}:${minutes}`;
    
    const id = Math.random().toString(36).substring(7);
    setAlarms(prev => [...prev, { 
      id, 
      time: snoozedTime, 
      label: `Snooze: ${ringingAlarm.label || 'Alarm'}`, 
      enabled: true 
    }]);
    
    setRingingAlarm(null);
  };

  const formatRepeatDays = (days?: number[]) => {
    if (!days || days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ');
  };

  const openEditModal = (alarm: AlarmItem) => {
    setEditingAlarmId(alarm.id);
    const [hours, minutes] = alarm.time.split(':');
    setNewHours(hours);
    setNewMinutes(minutes);
    setNewLabel(alarm.label);
    setSelectedDays(alarm.repeatDays || []);
    setIsOpen(true);
  };

  const updateAlarm = () => {
    if (!editingAlarmId) return;
    const combinedTime = `${newHours}:${newMinutes}`;
    setAlarms(alarms.map(a => a.id === editingAlarmId ? { ...a, time: combinedTime, label: newLabel, repeatDays: selectedDays } : a));
    setIsOpen(false);
    setEditingAlarmId(null);
  };

  const addAlarm = () => {
    const id = Math.random().toString(36).substring(7);
    const combinedTime = `${newHours}:${newMinutes}`;
    setAlarms([...alarms, { id, time: combinedTime, label: newLabel, enabled: true, repeatDays: selectedDays }]);
    setNewHours('08');
    setNewMinutes('00');
    setNewLabel('');
    setSelectedDays([]);
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
          <h2 className="text-xl font-bold tracking-tight">Alarms</h2>
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
          <h2 className="text-xl font-bold tracking-tight">Alarms</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        
        {!isCollapsed && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger 
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setEditingAlarmId(null);
                setNewHours('08');
                setNewMinutes('00');
                setNewLabel('');
                setSelectedDays([]);
              }}
            >
              <Plus className="w-3 h-3" /> Add Alarm
            </DialogTrigger>
            <DialogContent className="bg-white/90 backdrop-blur-xl border-zinc-200 max-w-md rounded-2xl text-[#1D1D1F]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{editingAlarmId ? 'Edit Alarm' : 'Set Alarm'}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-zinc-600">Time</label>
                  <div className="flex items-center justify-center space-x-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    {/* Hours Input */}
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => setNewHours(prev => {
                          const val = parseInt(prev);
                          return val >= 23 ? '00' : (val + 1).toString().padStart(2, '0');
                        })}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                      <input 
                        type="text" 
                        className="w-16 text-center text-4xl font-bold font-mono bg-transparent text-[#1D1D1F] focus:outline-none"
                        value={newHours}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 2) {
                            const num = parseInt(val);
                            if (num >= 0 && num <= 23) setNewHours(val.padStart(2, '0'));
                          }
                        }}
                      />
                      <button 
                        onClick={() => setNewHours(prev => {
                          const val = parseInt(prev);
                          return val <= 0 ? '23' : (val - 1).toString().padStart(2, '0');
                        })}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>

                    <span className="text-4xl font-bold text-[#1D1D1F]">:</span>

                    {/* Minutes Input */}
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => setNewMinutes(prev => {
                          const val = parseInt(prev);
                          return val >= 59 ? '00' : (val + 1).toString().padStart(2, '0');
                        })}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                      <input 
                        type="text" 
                        className="w-16 text-center text-4xl font-bold font-mono bg-transparent text-[#1D1D1F] focus:outline-none"
                        value={newMinutes}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 2) {
                            const num = parseInt(val);
                            if (num >= 0 && num <= 59) setNewMinutes(val.padStart(2, '0'));
                          }
                        }}
                      />
                      <button 
                        onClick={() => setNewMinutes(prev => {
                          const val = parseInt(prev);
                          return val <= 0 ? '59' : (val - 1).toString().padStart(2, '0');
                        })}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
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
                
                {/* Repeat Days UI */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-zinc-600">Repeat</label>
                  <div className="flex justify-between gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDays(prev => 
                          prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]
                        )}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${selectedDays.includes(index) ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Button */}
                <div className="flex justify-end">
                  <button 
                    onClick={testRingingModal}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    Test Alarm Sound
                  </button>
                </div>

                <button 
                  onClick={editingAlarmId ? updateAlarm : addAlarm}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {editingAlarmId ? 'Update Alarm' : 'Save Alarm'}
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => openEditModal(alarm)}>
                <div className="text-3xl font-bold tracking-tighter text-[#1D1D1F] font-mono">
                  {alarm.time}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1D1D1F] text-sm">{alarm.label || 'Alarm'}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{formatRepeatDays(alarm.repeatDays)}</p>
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

      {/* Ringing Modal */}
      <Dialog open={ringingAlarm !== null} onOpenChange={() => {}}>
        <DialogContent className="bg-white/90 backdrop-blur-2xl border-zinc-200 max-w-md rounded-3xl text-[#1D1D1F] p-8 flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
            <Bell className="w-10 h-10 text-blue-600" />
          </div>
          
          <div className="text-center">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Alarm</h2>
            <h1 className="text-4xl font-bold mt-1 font-mono">{ringingAlarm?.time}</h1>
            <p className="text-xl text-zinc-700 mt-2">{ringingAlarm?.label || 'Time to get up!'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <button 
              onClick={snoozeAlarm}
              className="bg-zinc-100 text-[#1D1D1F] font-medium py-4 rounded-xl hover:bg-zinc-200 transition-colors flex flex-col items-center"
            >
              <span className="text-lg">Snooze</span>
              <span className="text-xs text-zinc-500 mt-0.5">+9 mins</span>
            </button>
            <button 
              onClick={stopAlarm}
              className="bg-blue-600 text-white font-medium py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center text-lg"
            >
              Stop
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
