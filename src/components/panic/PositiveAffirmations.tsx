import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, Share2, Bookmark, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Affirmation {
  id: number;
  text: string;
  category: string;
  emoji: string;
}

const AFFIRMATIONS: Affirmation[] = [
  { id: 1, text: "I am stronger than my anxiety.", category: "Strength", emoji: "💪" },
  { id: 2, text: "This feeling is temporary. It will pass.", category: "Perspective", emoji: "🌅" },
  { id: 3, text: "I choose peace over worry.", category: "Choice", emoji: "☮️" },
  { id: 4, text: "I am worthy of love and kindness.", category: "Self-worth", emoji: "💖" },
  { id: 5, text: "My breath is my anchor to the present.", category: "Mindfulness", emoji: "🌬️" },
  { id: 6, text: "I release what I cannot control.", category: "Acceptance", emoji: "🦋" },
  { id: 7, text: "Every small step forward is progress.", category: "Progress", emoji: "👣" },
  { id: 8, text: "I am not my thoughts. I am the observer.", category: "Awareness", emoji: "👁️" },
  { id: 9, text: "I trust in my ability to handle whatever comes.", category: "Trust", emoji: "🌟" },
  { id: 10, text: "I give myself permission to rest.", category: "Rest", emoji: "🛋️" },
  { id: 11, text: "My feelings are valid, but they don't define me.", category: "Identity", emoji: "🎭" },
  { id: 12, text: "I am exactly where I need to be right now.", category: "Presence", emoji: "📍" },
  { id: 13, text: "I breathe in calm, I breathe out tension.", category: "Breathing", emoji: "🌊" },
  { id: 14, text: "Tomorrow is a fresh start.", category: "Hope", emoji: "🌅" },
  { id: 15, text: "I am surrounded by support and love.", category: "Connection", emoji: "🤗" },
  { id: 16, text: "My peace is my priority.", category: "Priority", emoji: "🕊️" },
  { id: 17, text: "I have survived 100% of my worst days.", category: "Resilience", emoji: "🏆" },
  { id: 18, text: "Challenges help me grow stronger.", category: "Growth", emoji: "🌱" },
  { id: 19, text: "I am doing the best I can, and that is enough.", category: "Acceptance", emoji: "✨" },
  { id: 20, text: "I choose to focus on what brings me joy.", category: "Joy", emoji: "🌈" },
];

export default function PositiveAffirmations() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(AFFIRMATIONS[0]);
  const [savedAffirmations, setSavedAffirmations] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const getRandomAffirmation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newAffirmation;
      do {
        newAffirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
      } while (newAffirmation.id === currentAffirmation.id);
      setCurrentAffirmation(newAffirmation);
      setIsAnimating(false);
    }, 300);
  };

  const toggleSave = () => {
    if (savedAffirmations.includes(currentAffirmation.id)) {
      setSavedAffirmations((prev) => prev.filter((id) => id !== currentAffirmation.id));
      toast({ title: "Removed from favorites" });
    } else {
      setSavedAffirmations((prev) => [...prev, currentAffirmation.id]);
      toast({ title: "Saved to favorites", description: "You can revisit this affirmation anytime." });
    }
  };

  const shareAffirmation = async () => {
    const text = `"${currentAffirmation.text}" ${currentAffirmation.emoji}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!", description: "Share this affirmation with someone who needs it." });
    }
  };

  useEffect(() => {
    getRandomAffirmation();
  }, []);

  const isSaved = savedAffirmations.includes(currentAffirmation.id);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-semibold mb-2">Daily Affirmations</h2>
        <p className="text-panic-text/70 text-sm">
          Words of encouragement to lift your spirits
        </p>
      </div>

      <Card className="bg-gradient-to-br from-panic-accent/20 to-panic-accent/5 border-panic-accent/20">
        <CardContent className="p-8 text-center">
          <span className={`text-5xl block mb-6 transition-all duration-300 ${isAnimating ? "scale-0" : "scale-100"}`}>
            {currentAffirmation.emoji}
          </span>
          <p className={`text-xl font-display leading-relaxed mb-4 transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            "{currentAffirmation.text}"
          </p>
          <span className="inline-block px-3 py-1 bg-panic-accent/20 rounded-full text-sm text-panic-text/70">
            {currentAffirmation.category}
          </span>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={getRandomAffirmation}
          className="gap-2 border-panic-accent/30 text-panic-text hover:bg-panic-accent/10 flex-1"
        >
          <RefreshCw className="w-4 h-4" />
          New Affirmation
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSave}
          className={`border-panic-accent/30 hover:bg-panic-accent/10 ${isSaved ? "text-red-400" : "text-panic-text"}`}
        >
          {isSaved ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={shareAffirmation}
          className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {savedAffirmations.length > 0 && (
        <div className="pt-4 border-t border-panic-accent/20">
          <h3 className="text-sm font-medium text-panic-text/70 mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Your Favorites ({savedAffirmations.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedAffirmations.map((id) => {
              const aff = AFFIRMATIONS.find((a) => a.id === id);
              if (!aff) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 p-2 bg-panic-accent/10 rounded-lg text-sm cursor-pointer hover:bg-panic-accent/20 transition-all"
                  onClick={() => setCurrentAffirmation(aff)}
                >
                  <span>{aff.emoji}</span>
                  <span className="flex-1 truncate">{aff.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
