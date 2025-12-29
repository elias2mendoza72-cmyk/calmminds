import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

const BREATHING_PATTERNS = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { name: "4-7-8 Breathing", inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { name: "Deep Belly", inhale: 5, hold1: 2, exhale: 6, hold2: 0 },
];

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [patternIndex, setPatternIndex] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [countdown, setCountdown] = useState(0);

  const pattern = BREATHING_PATTERNS[patternIndex];

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
        do {
          currentPhaseIndex = (currentPhaseIndex + 1) % 4;
        } while (phaseDurations[phaseOrder[currentPhaseIndex]] === 0);
        
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
    switch (phase) {
      case "inhale": return "scale-110";
      case "hold1": return "scale-110";
      case "exhale": return "scale-100";
      case "hold2": return "scale-100";
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-display font-semibold mb-2">{pattern.name}</h2>
      
      <div className="flex justify-center gap-2 mb-8">
        {BREATHING_PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => { setPatternIndex(i); setPhase("inhale"); setCountdown(0); }}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              i === patternIndex ? "bg-panic-accent text-panic-bg" : "bg-panic-accent/20 text-panic-text/70"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <div
          className={`absolute inset-0 rounded-full bg-panic-accent/20 transition-transform duration-1000 ease-in-out ${
            isActive ? getScale() : "scale-100"
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full bg-panic-accent/30 transition-transform duration-1000 ease-in-out ${
            isActive ? getScale() : "scale-100"
          }`}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold mb-2">
            {isActive ? countdown : "—"}
          </span>
          <span className="text-lg text-panic-text/70">
            {isActive ? getInstruction() : "Ready?"}
          </span>
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => { setIsActive(!isActive); if (!isActive) setCountdown(pattern.inhale); }}
        className="bg-panic-accent text-panic-bg hover:bg-panic-accent/90 gap-2"
      >
        {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isActive ? "Pause" : "Start"}
      </Button>
    </div>
  );
}
