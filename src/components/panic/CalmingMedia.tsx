import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

// Free ambient audio URLs from reliable sources
const CALMING_SOUNDS = [
  { 
    id: "rain", 
    name: "Gentle Rain", 
    emoji: "🌧️", 
    color: "bg-blue-500/20",
    audioUrl: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112ce99.mp3" // Rain sounds
  },
  { 
    id: "ocean", 
    name: "Ocean Waves", 
    emoji: "🌊", 
    color: "bg-cyan-500/20",
    audioUrl: "https://cdn.pixabay.com/audio/2024/11/29/audio_f7c5c78d4e.mp3" // Ocean waves
  },
  { 
    id: "forest", 
    name: "Forest Birds", 
    emoji: "🌲", 
    color: "bg-green-500/20",
    audioUrl: "https://cdn.pixabay.com/audio/2022/02/14/audio_5e04e8d053.mp3" // Forest ambience
  },
  { 
    id: "fire", 
    name: "Crackling Fire", 
    emoji: "🔥", 
    color: "bg-orange-500/20",
    audioUrl: "https://cdn.pixabay.com/audio/2024/02/28/audio_3b1ec44e93.mp3" // Fire crackling
  },
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
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = (id: string) => {
    if (activeSound === id) {
      // Stop current sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSound(null);
    } else {
      // Stop previous sound if any
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Play new sound
      const sound = CALMING_SOUNDS.find(s => s.id === id);
      if (sound) {
        const audio = new Audio(sound.audioUrl);
        audio.loop = true;
        audio.volume = volume;
        audio.play().catch(console.error);
        audioRef.current = audio;
        setActiveSound(id);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
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
        
        {/* Volume control */}
        {activeSound && (
          <div className="flex items-center gap-3 mt-4 px-2">
            <Volume2 className="w-4 h-4 text-panic-text/60" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="flex-1"
            />
          </div>
        )}
        
        <p className="text-xs text-panic-text/40 mt-3 text-center">
          Tap to play real calming sounds
        </p>
      </div>
    </div>
  );
}
