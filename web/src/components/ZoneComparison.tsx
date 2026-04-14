'use client';

import { useEffect, useState } from 'react';
import { Minus, GripVertical, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import citiesData from "@/data/cities.json";

type ZoneItem = {
  city: string;
  zone?: string;
  offset?: number;
  gmt?: string;
};

const INITIAL_ZONES: ZoneItem[] = [
  { city: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur' },
  { city: 'Jakarta', zone: 'Asia/Jakarta' },
  { city: 'Bangalore', zone: 'Asia/Kolkata' },
  { city: 'California', zone: 'America/Los_Angeles' },
];

export default function ZoneComparison() {
  const [time, setTime] = useState(new Date());
  const [zones, setZones] = useState<ZoneItem[]>(INITIAL_ZONES);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [customCity, setCustomCity] = useState('');
  const [customOffset, setCustomOffset] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedZones = localStorage.getItem('do-time-zones');
    if (savedZones) {
      setZones(JSON.parse(savedZones));
    }
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('do-time-zones', JSON.stringify(zones));
    }
  }, [zones, mounted]);

  const removeZone = (indexToRemove: number) => {
    setZones(zones.filter((_, index) => index !== indexToRemove));
  };

  const addZone = (newZone: ZoneItem) => {
    if (zones.length < 4 && !zones.some(z => z.zone === newZone.zone)) {
      setZones([...zones, newZone]);
      setIsOpen(false);
      setSearchQuery(''); // Reset search
    }
  };

  const addCustomZone = () => {
    const offset = parseFloat(customOffset);
    if (customCity && !isNaN(offset) && zones.length < 4) {
      setZones([...zones, { city: customCity, offset: offset }]);
      setCustomCity('');
      setCustomOffset('');
      setIsOpen(false);
      setSearchQuery(''); // Reset search
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newZones = [...zones];
    const draggedItem = newZones[draggedIndex];
    newZones.splice(draggedIndex, 1);
    newZones.splice(index, 0, draggedItem);
    setZones(newZones);
    setDraggedIndex(null);
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-2xl space-y-4 mt-8 opacity-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">World Clock</h2>
        </div>
        <div className="text-center text-zinc-500 text-sm py-8 border border-dashed border-zinc-300 rounded-2xl">
          Loading clocks...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">World Clock</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        
        {!isCollapsed && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className={`text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer ${zones.length >= 4 ? 'text-zinc-400 cursor-not-allowed no-underline' : ''}`}>
              <Plus className="w-3 h-3" /> Add City
            </DialogTrigger>
            <DialogContent className="bg-white/90 backdrop-blur-xl border-zinc-200 max-w-md rounded-2xl text-[#1D1D1F]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Add City</DialogTitle>
              </DialogHeader>
              
              {/* 1. Add Custom City Form (At top) */}
              <div className="border-b border-zinc-200 pb-4 mb-2 mt-2">
                <h3 className="text-sm font-semibold mb-2">Add Custom City</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="City Name" 
                    className="border border-zinc-200 rounded-lg p-2 text-sm flex-1 bg-white"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="GMT (e.g. 7 or -5)" 
                    className="border border-zinc-200 rounded-lg p-2 text-sm w-28 bg-white"
                    value={customOffset}
                    onChange={(e) => setCustomOffset(e.target.value)}
                  />
                  <button 
                    onClick={addCustomZone}
                    disabled={!customCity || !customOffset || zones.length >= 4}
                    className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 2. Search City Input */}
              <div className="mb-2">
                <input 
                  type="text" 
                  placeholder="Search preset cities..." 
                  className="border border-zinc-200 rounded-lg p-2 text-sm w-full bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 3. Preset Cities List (Filtered and at bottom) */}
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {citiesData
                  .filter(item => item.city.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => {
                    const isAdded = zones.some(z => z.zone === item.zone);
                    return (
                      <button
                        key={`${item.city}-${item.zone}`}
                        onClick={() => addZone(item)}
                        disabled={isAdded || zones.length >= 4}
                        className={`flex justify-between items-center p-3 rounded-xl text-left transition-colors ${isAdded ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'hover:bg-zinc-100 text-[#1D1D1F]'}`}
                      >
                        <span className="font-medium">{item.city}</span>
                        {isAdded ? (
                          <span className="text-xs text-zinc-400">Added</span>
                        ) : (
                          <div className="text-xs text-zinc-500 font-mono flex flex-col items-end">
                            <span>GMT {item.gmt}</span>
                            <span className="text-[10px] text-zinc-400">{item.zone}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {zones.map((item, index) => {
            const { city, zone, offset } = item;
            
            let timeStr = '';
            let dateStr = '';

            if (offset !== undefined) {
              const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
              const targetTime = new Date(utc + (3600000 * offset));
              timeStr = targetTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              dateStr = `GMT ${offset >= 0 ? '+' : ''}${offset}`;
            } else if (zone) {
              timeStr = time.toLocaleTimeString('en-US', {
                timeZone: zone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              dateStr = time.toLocaleDateString('en-US', {
                timeZone: zone,
                weekday: 'short',
              });
            }

            return (
              <div 
                key={`${city}-${index}`} 
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`border border-zinc-200 bg-white/80 backdrop-blur-md p-5 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab" />
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F]">{city}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{dateStr}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold tracking-tighter text-[#1D1D1F] font-mono">
                    {timeStr}
                  </div>
                  <button 
                    onClick={() => removeZone(index)}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!isCollapsed && zones.length === 0 && (
        <div className="text-center text-zinc-500 text-sm py-8 border border-dashed border-zinc-300 rounded-2xl">
          No cities added. Click &quot;Add City&quot; to compare time zones.
        </div>
      )}
    </div>
  );
}
