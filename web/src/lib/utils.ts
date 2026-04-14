import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let currentAudio: HTMLAudioElement | null = null;

export function playChime(soundPath: string = '/iphone_alarm.mp3') {
  if (typeof window === 'undefined') return;
  
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(soundPath);
    currentAudio.play().catch(error => {
      console.error("Failed to play sound (likely autoplay policy):", error);
    });
  } catch (error) {
    console.error("Failed to create audio object:", error);
  }
}

export function stopChime() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}
