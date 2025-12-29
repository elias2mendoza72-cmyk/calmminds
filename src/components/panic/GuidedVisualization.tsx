import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface Scene {
  id: string;
  title: string;
  emoji: string;
  description: string;
  steps: string[];
  color: string;
}

const VISUALIZATIONS: Scene[] = [
  {
    id: "beach",
    title: "Peaceful Beach",
    emoji: "🏖️",
    description: "Imagine yourself on a serene tropical beach",
    color: "from-cyan-900/30 to-blue-900/30",
    steps: [
      "Close your eyes and take a deep breath...",
      "You're standing on warm, soft sand. Feel it between your toes.",
      "The sun is setting, painting the sky in warm oranges and pinks.",
      "Gentle waves lap at the shore, a rhythmic, soothing sound.",
      "A light breeze carries the salty scent of the ocean.",
      "You find a comfortable spot and sit down, completely at peace.",
      "With each wave, your worries drift further away...",
      "You are safe. You are calm. You are present.",
    ],
  },
  {
    id: "forest",
    title: "Enchanted Forest",
    emoji: "🌲",
    description: "Walk through a magical, peaceful forest",
    color: "from-green-900/30 to-emerald-900/30",
    steps: [
      "Take a slow, deep breath and let your shoulders relax...",
      "You're walking along a soft, mossy path through an ancient forest.",
      "Tall trees surround you, their leaves filtering golden sunlight.",
      "Birds sing softly in the distance, a gentle melody.",
      "The air is fresh and cool, filled with the scent of pine.",
      "You come to a small clearing with a peaceful stream.",
      "The water flows gently, sparkling like diamonds.",
      "Here, in this magical place, everything is peaceful.",
    ],
  },
  {
    id: "mountain",
    title: "Mountain Peak",
    emoji: "🏔️",
    description: "Find peace at a tranquil mountain summit",
    color: "from-slate-900/30 to-purple-900/30",
    steps: [
      "Breathe deeply... feel yourself becoming lighter...",
      "You're sitting at the top of a beautiful mountain.",
      "Below you, clouds drift peacefully through valleys.",
      "The air is crisp and pure, filling your lungs with energy.",
      "Snow-capped peaks stretch endlessly in every direction.",
      "An eagle soars gracefully on the wind currents.",
      "Up here, above everything, you feel completely free.",
      "All your troubles seem small from this great height.",
    ],
  },
  {
    id: "garden",
    title: "Secret Garden",
    emoji: "🌷",
    description: "Discover a hidden garden of wonders",
    color: "from-pink-900/30 to-rose-900/30",
    steps: [
      "Let your breathing slow... become gentle and easy...",
      "You've discovered a hidden garden behind an old stone wall.",
      "Colorful flowers bloom everywhere, filling the air with sweet fragrance.",
      "Butterflies dance from flower to flower in lazy spirals.",
      "A small fountain bubbles peacefully in the center.",
      "Soft grass cushions your every step.",
      "You find a cozy bench beneath a flowering tree.",
      "This is your secret place. Only peace lives here.",
    ],
  },
];

export default function GuidedVisualization() {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !selectedScene) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= selectedScene.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 6000); // 6 seconds per step

    return () => clearInterval(timer);
  }, [isPlaying, selectedScene]);

  const startVisualization = (scene: Scene) => {
    setSelectedScene(scene);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const goBack = () => {
    setSelectedScene(null);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!selectedScene) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-2">Guided Visualization</h2>
          <p className="text-panic-text/70 text-sm">
            Choose a peaceful scene and let your mind wander
          </p>
        </div>

        <div className="grid gap-3">
          {VISUALIZATIONS.map((scene, index) => (
            <Card
              key={scene.id}
              className={`bg-gradient-to-r ${scene.color} border-panic-accent/20 cursor-pointer hover:scale-[1.02] transition-all animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => startVisualization(scene)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-3xl">{scene.emoji}</span>
                <div>
                  <h3 className="font-display font-semibold">{scene.title}</h3>
                  <p className="text-sm text-panic-text/70">{scene.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / selectedScene.steps.length) * 100;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/10"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Choose another scene
      </Button>

      <Card className={`bg-gradient-to-br ${selectedScene.color} border-panic-accent/20`}>
        <CardContent className="p-8 text-center min-h-[300px] flex flex-col justify-center">
          <span className="text-5xl mb-6">{selectedScene.emoji}</span>
          <p 
            className="text-xl font-display leading-relaxed animate-fade-in" 
            key={currentStep}
          >
            {selectedScene.steps[currentStep]}
          </p>
        </CardContent>
      </Card>

      {/* Progress indicator */}
      <div className="space-y-3">
        <div className="flex justify-center gap-1">
          {selectedScene.steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-panic-accent w-6"
                  : index < currentStep
                  ? "bg-panic-accent/60"
                  : "bg-panic-accent/20"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentStep((prev) => Math.min(selectedScene.steps.length - 1, prev + 1))}
            disabled={currentStep === selectedScene.steps.length - 1}
            className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
