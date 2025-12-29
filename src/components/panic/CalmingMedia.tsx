import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

const CALMING_SOUNDS = [
  { id: "rain", name: "Gentle Rain", emoji: "🌧️", color: "bg-blue-500/20" },
  { id: "ocean", name: "Ocean Waves", emoji: "🌊", color: "bg-cyan-500/20" },
  { id: "forest", name: "Forest Birds", emoji: "🌲", color: "bg-green-500/20" },
  { id: "fire", name: "Crackling Fire", emoji: "🔥", color: "bg-orange-500/20" },
];

const AFFIRMATIONS = [
  "This feeling will pass. It always does.",
  "You are stronger than you know.",
  "Right now, in this moment, you are okay.",
  "Breathe. You've survived every hard moment so far.",
  "It's okay to not be okay. You're doing your best.",
  "You are not alone in this.",
];

export default function CalmingMedia() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const toggleSound = (id: string) => {
    setActiveSound(activeSound === id ? null : id);
  };

  const nextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  return (
    <div className="space-y-8">
      {/* Affirmation */}
      <Card
        className="bg-panic-accent/10 border-panic-accent/20 cursor-pointer hover:bg-panic-accent/15 transition-all"
        onClick={nextAffirmation}
      >
        <CardContent className="p-8 text-center">
          <p className="text-xl font-display italic text-panic-text/90 mb-3 animate-fade-in" key={affirmationIndex}>
            "{AFFIRMATIONS[affirmationIndex]}"
          </p>
          <p className="text-sm text-panic-text/50">Tap for another affirmation</p>
        </CardContent>
      </Card>

      {/* Sound options */}
      <div>
        <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Calming Sounds
        </h3>
        <p className="text-sm text-panic-text/60 mb-4">
          Imagine these peaceful sounds as you focus on your breathing
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CALMING_SOUNDS.map((sound) => (
            <Card
              key={sound.id}
              className={`cursor-pointer transition-all ${sound.color} border-panic-accent/20 ${
                activeSound === sound.id ? "ring-2 ring-panic-accent" : ""
              }`}
              onClick={() => toggleSound(sound.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{sound.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{sound.name}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/20"
                >
                  {activeSound === sound.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-panic-text/40 mt-3 text-center">
          Sound visualization only • Close your eyes and imagine
        </p>
      </div>
    </div>
  );
}
