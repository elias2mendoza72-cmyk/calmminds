import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'rain' | 'ocean' | 'forest' | 'night' | 'bowls' | 'drone';

interface AudioNodes {
  oscillators: OscillatorNode[];
  noiseSource: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  filterNode: BiquadFilterNode | null;
}

export function useMeditationAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNodes | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Create white/pink/brown noise buffer
  const createNoiseBuffer = useCallback((ctx: AudioContext, type: 'white' | 'pink' | 'brown' = 'white') => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      if (type === 'white') {
        data[i] = white * 0.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        // Brown noise
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    
    return buffer;
  }, []);

  // Rain sound - filtered noise with droplet oscillators
  const createRainSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const noiseBuffer = createNoiseBuffer(ctx, 'brown');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    lowpass.Q.value = 1;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.3;

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(masterGain);

    return { noiseSource, oscillators: [] };
  }, [createNoiseBuffer]);

  // Ocean waves - modulated noise
  const createOceanSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const noiseBuffer = createNoiseBuffer(ctx, 'pink');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    // LFO for wave-like modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Slow wave rhythm

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.4;

    noiseSource.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(masterGain);

    lfo.start();

    return { noiseSource, oscillators: [lfo] };
  }, [createNoiseBuffer]);

  // Forest breeze - layered filtered noise with bird-like chirps
  const createForestSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const noiseBuffer = createNoiseBuffer(ctx, 'pink');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 300;
    bandpass.Q.value = 0.5;

    // Wind LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(masterGain);

    lfo.start();

    return { noiseSource, oscillators: [lfo] };
  }, [createNoiseBuffer]);

  // Night garden - cricket-like sounds with subtle ambience
  const createNightSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const oscillators: OscillatorNode[] = [];

    // Cricket-like high frequency oscillator
    const cricketOsc = ctx.createOscillator();
    cricketOsc.type = 'sine';
    cricketOsc.frequency.value = 4000;

    // Amplitude modulation for chirping effect
    const ampMod = ctx.createOscillator();
    ampMod.type = 'square';
    ampMod.frequency.value = 15;

    const ampModGain = ctx.createGain();
    ampModGain.gain.value = 0.5;

    const cricketGain = ctx.createGain();
    cricketGain.gain.value = 0;

    ampMod.connect(ampModGain);
    ampModGain.connect(cricketGain.gain);

    cricketOsc.connect(cricketGain);
    cricketGain.connect(masterGain);

    // Background drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 120;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.08;

    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);

    ampMod.start();
    cricketOsc.start();
    droneOsc.start();

    oscillators.push(cricketOsc, ampMod, droneOsc);

    return { noiseSource: null, oscillators };
  }, []);

  // Singing bowls - harmonically rich tones
  const createBowlsSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const oscillators: OscillatorNode[] = [];
    const fundamentals = [256, 384, 512]; // C4, G4, C5 approximate

    fundamentals.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow vibrato
      const vibrato = ctx.createOscillator();
      vibrato.type = 'sine';
      vibrato.frequency.value = 4 + index;

      const vibratoGain = ctx.createGain();
      vibratoGain.gain.value = 2;

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.1 / (index + 1);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      vibrato.start();
      osc.start();

      oscillators.push(osc, vibrato);
    });

    return { noiseSource: null, oscillators };
  }, []);

  // Deep drone - calming low frequency pad
  const createDroneSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    const oscillators: OscillatorNode[] = [];
    const frequencies = [55, 110, 165, 220]; // A1, A2, E3, A3

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow detuning for richness
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + index * 0.05;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.12 / (index + 1);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      lfo.start();
      osc.start();

      oscillators.push(osc, lfo);
    });

    return { noiseSource: null, oscillators };
  }, []);

  const getSoundCreator = useCallback((soundType: SoundType) => {
    switch (soundType) {
      case 'rain': return createRainSound;
      case 'ocean': return createOceanSound;
      case 'forest': return createForestSound;
      case 'night': return createNightSound;
      case 'bowls': return createBowlsSound;
      case 'drone': return createDroneSound;
      default: return createDroneSound;
    }
  }, [createRainSound, createOceanSound, createForestSound, createNightSound, createBowlsSound, createDroneSound]);

  const play = useCallback((soundType: SoundType) => {
    try {
      // Stop any existing audio first
      stop();

      const ctx = getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2); // Fade in
      masterGain.connect(ctx.destination);

      const createSound = getSoundCreator(soundType);
      const { noiseSource, oscillators } = createSound(ctx, masterGain);

      if (noiseSource) {
        noiseSource.start();
      }

      activeNodesRef.current = {
        oscillators,
        noiseSource,
        gainNode: masterGain,
        filterNode: null,
      };
      isPlayingRef.current = true;
    } catch (e) {
      console.log('Audio playback error:', e);
    }
  }, [getAudioContext, getSoundCreator]);

  const stop = useCallback(() => {
    try {
      const nodes = activeNodesRef.current;
      const ctx = audioContextRef.current;
      
      if (nodes && ctx) {
        const now = ctx.currentTime;
        
        // Fade out
        if (nodes.gainNode) {
          nodes.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        }

        // Stop all after fade
        setTimeout(() => {
          nodes.oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
          });
          if (nodes.noiseSource) {
            try { nodes.noiseSource.stop(); } catch (e) {}
          }
        }, 600);
      }

      activeNodesRef.current = null;
      isPlayingRef.current = false;
    } catch (e) {
      console.log('Error stopping audio:', e);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    play,
    stop,
    isPlaying: isPlayingRef.current,
  };
}

// Map meditation IDs to sound types
export const meditationSoundMap: Record<string, SoundType> = {
  'morning-calm': 'bowls',
  'stress-relief': 'drone',
  'deep-focus': 'drone',
  'sleep-well': 'drone',
  'rain-sounds': 'rain',
  'ocean-waves': 'ocean',
  'forest-wind': 'forest',
  'night-garden': 'night',
  'box-breathing': 'bowls',
  '478-breathing': 'bowls',
};
