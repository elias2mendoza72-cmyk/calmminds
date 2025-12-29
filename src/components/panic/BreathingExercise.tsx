import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreathingProgress } from "@/hooks/useLocalStorage";
import { usePanicModeShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BREATHING_PATTERNS = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: "Equal counts for calm" },
  { name: "4-7-8 Breathing", inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: "Deep relaxation" },
  { name: "Deep Belly", inhale: 5, hold1: 2, exhale: 6, hold2: 0, description: "Simple & grounding" },
];

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [patternIndex, setPatternIndex] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [countdown, setCountdown] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const breathCircleRef = useRef<HTMLDivElement>(null);

  const { progress, saveProgress, clearProgress } = useBreathingProgress();
  const reducedMotion = useReducedMotion();
  const pattern = BREATHING_PATTERNS[patternIndex];

  // Keyboard shortcuts
  usePanicModeShortcuts({
    onSpace: () => {
      setIsActive(!isActive);
      if (!isActive) setCountdown(pattern.inhale);
    },
  });

  // Restore progress on mount
  useEffect(() => {
    if (progress) {
      setPatternIndex(progress.patternIndex);
      setCyclesCompleted(progress.cyclesCompleted);
    }
  }, []);

  // Save progress when cycles change
  useEffect(() => {
    if (cyclesCompleted > 0) {
      saveProgress(patternIndex, cyclesCompleted);
    }
  }, [cyclesCompleted, patternIndex, saveProgress]);

  useEffect(() => {
    if (!isActive) return;

    const phaseOrder: ("inhale" | "hold1" | "exhale" | "hold2")[] = ["inhale", "hold1", "exhale", "hold2"];
    const phaseDurations = { inhale: pattern.inhale, hold1: pattern.hold1, exhale: pattern.exhale, hold2: pattern.hold2 };

    let currentPhaseIndex = phaseOrder.indexOf(phase);
    let remaining = countdown > 0 ? countdown : phaseDurations[phase];

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        // Move to next phase
        const previousPhaseIndex = currentPhaseIndex;
        do {
          currentPhaseIndex = (currentPhaseIndex + 1) % 4;
        } while (phaseDurations[phaseOrder[currentPhaseIndex]] === 0);
        
        // Check if we completed a full cycle
        if (currentPhaseIndex === 0 && previousPhaseIndex !== 0) {
          setCyclesCompleted(prev => prev + 1);
          // Haptic feedback on cycle complete
          if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
          }
        }
        
        setPhase(phaseOrder[currentPhaseIndex]);
        remaining = phaseDurations[phaseOrder[currentPhaseIndex]];
      }
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, pattern]);

  const getInstruction = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold1": return "Hold";
      case "exhale": return "Breathe Out";
      case "hold2": return "Hold";
    }
  };

  const getScale = () => {
    if (reducedMotion) return "scale-100";
    switch (phase) {
      case "inhale": return "scale-110";
      case "hold1": return "scale-110";
      case "exhale": return "scale-100";
      case "hold2": return "scale-100";
    }
  };

  const handlePatternChange = (index: number) => {
    setPatternIndex(index);
    setPhase("inhale");
    setCountdown(0);
    setCyclesCompleted(0);
    clearProgress();
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setCountdown(0);
    setCyclesCompleted(0);
    clearProgress();
  };

  const handleToggle = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setCountdown(pattern.inhale);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  };

  return (
    <div className="text-center" role="region" aria-label="Breathing exercise">
      {/* Pattern name and description */}
      <h2 className="text-2xl font-display font-semibold mb-1">{pattern.name}</h2>
      <p className="text-sm text-panic-text/60 mb-4">{pattern.description}</p>
      
      {/* Pattern selector */}
      <div 
        className="flex justify-center gap-2 mb-8 flex-wrap" 
        role="tablist" 
        aria-label="Breathing patterns"
      >
        {BREATHING_PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => handlePatternChange(i)}
            role="tab"
            aria-selected={i === patternIndex}
            aria-controls="breathing-circle"
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-all touch-target focus-ring",
              i === patternIndex 
                ? "bg-panic-accent text-panic-bg" 
                : "bg-panic-accent/20 text-panic-text/70 hover:bg-panic-accent/30"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Cycles counter */}
      {cyclesCompleted > 0 && (
        <div className="mb-4 animate-fade-in">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-panic-accent/20 text-sm">
            <span aria-label={`${cyclesCompleted} cycles completed`}>
              🌟 {cyclesCompleted} {cyclesCompleted === 1 ? "cycle" : "cycles"}
            </span>
          </span>
        </div>
      )}

      {/* Breathing circle */}
      <div 
        id="breathing-circle"
        className="relative w-64 h-64 mx-auto mb-8"
        role="img"
        aria-label={isActive ? `${getInstruction()}, ${countdown} seconds remaining` : "Ready to start"}
        ref={breathCircleRef}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-panic-accent/20",
            !reducedMotion && "transition-transform duration-1000 ease-in-out",
            isActive ? getScale() : "scale-100"
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute inset-4 rounded-full bg-panic-accent/30",
            !reducedMotion && "transition-transform duration-1000 ease-in-out",
            isActive ? getScale() : "scale-100"
          )}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-5xl font-display font-bold mb-2 tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {isActive ? countdown : "—"}
          </span>
          <span className="text-lg text-panic-text/70" aria-live="polite">
            {isActive ? getInstruction() : "Ready?"}
          </span>
        </div>
        
        {/* Progress indicator ring */}
        {isActive && !reducedMotion && (
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90" 
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="hsl(var(--panic-accent) / 0.5)"
              strokeWidth="2"
              strokeDasharray={`${(1 - countdown / (phase === "inhale" ? pattern.inhale : phase === "hold1" ? pattern.hold1 : phase === "exhale" ? pattern.exhale : pattern.hold2)) * 301.59} 301.59`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={handleToggle}
          className="bg-panic-accent text-panic-bg hover:bg-panic-accent/90 gap-2 touch-target focus-ring"
          aria-label={isActive ? "Pause breathing exercise" : "Start breathing exercise"}
        >
          {isActive ? <Pause className="w-5 h-5" aria-hidden="true" /> : <Play className="w-5 h-5" aria-hidden="true" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        
        {(isActive || cyclesCompleted > 0) && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10 touch-target focus-ring"
            aria-label="Reset breathing exercise"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Pattern timing info */}
      <p className="mt-6 text-xs text-panic-text/50">
        Inhale {pattern.inhale}s → Hold {pattern.hold1}s → Exhale {pattern.exhale}s
        {pattern.hold2 > 0 && ` → Hold ${pattern.hold2}s`}
      </p>
    </div>
  );
}
