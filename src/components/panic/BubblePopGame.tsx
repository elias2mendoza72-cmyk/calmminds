import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  popped: boolean;
}

const COLORS = [
  "bg-blue-400/80",
  "bg-purple-400/80",
  "bg-pink-400/80",
  "bg-cyan-400/80",
  "bg-teal-400/80",
  "bg-indigo-400/80",
];

export default function BubblePopGame() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playClickSound, playSuccessSound } = useSound();

  const createBubble = useCallback((): Bubble => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 110,
      size: Math.random() * 30 + 25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 0.5 + 0.3,
      popped: false,
    };
  }, []);

  const startGame = () => {
    setBubbles([]);
    setScore(0);
    setIsPlaying(true);
  };

  const popBubble = (id: number) => {
    setBubbles(prev =>
      prev.map(b =>
        b.id === id ? { ...b, popped: true } : b
      )
    );
    setScore(s => {
      const newScore = s + 1;
      // Play sounds on milestones
      if (newScore % 10 === 0) {
        playSuccessSound();
      } else {
        playClickSound();
      }
      return newScore;
    });
  };

  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(() => {
      setBubbles(prev => [...prev.slice(-20), createBubble()]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, createBubble]);

  useEffect(() => {
    if (!isPlaying) return;

    const moveInterval = setInterval(() => {
      setBubbles(prev =>
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20 && !b.popped)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-muted-foreground text-sm">Bubbles popped</span>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startGame}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          {isPlaying ? "Restart" : "Start"}
        </Button>
      </div>

      <div 
        className="relative h-80 bg-gradient-to-b from-primary/10 to-secondary/20 rounded-xl overflow-hidden border border-border/30"
        style={{ touchAction: "none" }}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-2">🫧</p>
              <p className="text-muted-foreground text-sm">Tap bubbles to pop them</p>
              <Button
                onClick={startGame}
                className="mt-3"
              >
                Start Popping
              </Button>
            </div>
          </div>
        )}

        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => popBubble(bubble.id)}
            className={`absolute rounded-full transition-transform active:scale-75 ${bubble.color} 
              shadow-lg backdrop-blur-sm border border-white/30
              before:absolute before:inset-2 before:rounded-full before:bg-white/30 before:blur-sm`}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <p className="text-center text-muted-foreground text-sm">
        Let your worries float away with each pop 🫧
      </p>
    </div>
  );
}
