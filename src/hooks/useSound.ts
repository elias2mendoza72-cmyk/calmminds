import { useCallback, useRef } from 'react';

// Premium sound frequencies for a satisfying completion tone
const COMPLETION_SOUND = {
  frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - major chord
  duration: 0.15,
  volume: 0.3,
};

const SUCCESS_SOUND = {
  frequencies: [440, 554.37, 659.25], // A4, C#5, E5
  duration: 0.12,
  volume: 0.25,
};

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, volume: number, startTime: number) => {
    const ctx = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Smooth envelope for premium feel
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, [getAudioContext]);

  const playCompletionSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Play ascending arpeggio for satisfying completion
      COMPLETION_SOUND.frequencies.forEach((freq, index) => {
        playTone(freq, COMPLETION_SOUND.duration, COMPLETION_SOUND.volume, now + index * 0.08);
      });
    } catch (e) {
      // Silently fail if audio context is not available
      console.log('Audio not available');
    }
  }, [getAudioContext, playTone]);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      SUCCESS_SOUND.frequencies.forEach((freq, index) => {
        playTone(freq, SUCCESS_SOUND.duration, SUCCESS_SOUND.volume, now + index * 0.06);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, playTone]);

  const playClickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Subtle click sound
      playTone(800, 0.05, 0.15, now);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, playTone]);

  return {
    playCompletionSound,
    playSuccessSound,
    playClickSound,
  };
}