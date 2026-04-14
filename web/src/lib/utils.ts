import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function playChime() {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio('/iphone_alarm.mp3');
    audio.play().catch(error => {
      console.error("Failed to play sound (likely autoplay policy):", error);
    });
  } catch (error) {
    console.error("Failed to create audio object:", error);
  }
}
