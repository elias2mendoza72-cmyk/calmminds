import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CelebrationEffectsProps {
  trigger: boolean;
  type?: "confetti" | "sparkle" | "hearts";
  duration?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
  scale: number;
  rotation: number;
}

const CONFETTI_EMOJIS = ["🎉", "✨", "🌟", "💫", "🎊", "⭐"];
const SPARKLE_EMOJIS = ["✨", "💫", "🌟", "⭐", "✨"];
const HEART_EMOJIS = ["💖", "💕", "💗", "💝", "💓"];

export default function CelebrationEffects({
  trigger,
  type = "confetti",
  duration = 2000,
  onComplete,
}: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      const emojis =
        type === "confetti"
          ? CONFETTI_EMOJIS
          : type === "sparkle"
          ? SPARKLE_EMOJIS
          : HEART_EMOJIS;

      // Generate particles
      const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        delay: Math.random() * 0.3,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);
      setIsVisible(true);

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, type, duration, onComplete]);

  if (!isVisible || particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute text-2xl md:text-3xl",
            "animate-celebration-particle"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}

// Simpler inline celebration for smaller moments
export function MiniCelebration({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-3xl animate-bounce-in">✨</span>
      </div>
    </div>
  );
}
