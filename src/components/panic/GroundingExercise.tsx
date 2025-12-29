import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Eye, Hand, Ear, Heart } from "lucide-react";

const GROUNDING_STEPS = [
  { count: 5, sense: "SEE", icon: Eye, prompt: "Name 5 things you can see around you", color: "bg-blue-500/20" },
  { count: 4, sense: "TOUCH", icon: Hand, prompt: "Name 4 things you can physically feel", color: "bg-green-500/20" },
  { count: 3, sense: "HEAR", icon: Ear, prompt: "Name 3 things you can hear right now", color: "bg-yellow-500/20" },
  { count: 2, sense: "SMELL", icon: Heart, prompt: "Name 2 things you can smell", color: "bg-orange-500/20" },
  { count: 1, sense: "TASTE", icon: Heart, prompt: "Name 1 thing you can taste", color: "bg-red-500/20" },
];

export default function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const step = GROUNDING_STEPS[currentStep];
  const isComplete = completed.length === 5;

  const handleNext = () => {
    if (!completed.includes(currentStep)) {
      setCompleted([...completed, currentStep]);
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCompleted([]);
  };

  if (isComplete) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-panic-accent" />
        </div>
        <h2 className="text-2xl font-display font-semibold mb-3">Well done</h2>
        <p className="text-panic-text/70 mb-6">
          You've completed the grounding exercise. Take a moment to notice how you feel.
        </p>
        <Button onClick={reset} variant="outline" className="border-panic-accent/30 text-panic-text hover:bg-panic-accent/10">
          Start Again
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-display font-semibold mb-2">5-4-3-2-1 Grounding</h2>
      <p className="text-panic-text/60 mb-6">Focus on your senses to anchor yourself</p>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {GROUNDING_STEPS.map((s, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              completed.includes(i) ? "bg-panic-accent" : i === currentStep ? "bg-panic-accent/50" : "bg-panic-accent/20"
            }`}
          />
        ))}
      </div>

      <Card className={`bg-panic-accent/10 border-panic-accent/20 mb-6 ${step.color}`}>
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <step.icon className="w-8 h-8 text-panic-accent" />
          </div>
          <div className="text-5xl font-display font-bold text-panic-accent mb-2">{step.count}</div>
          <div className="text-lg font-medium mb-3">things you can {step.sense}</div>
          <p className="text-panic-text/70">{step.prompt}</p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={handleNext}
        className="bg-panic-accent text-panic-bg hover:bg-panic-accent/90 gap-2"
      >
        {currentStep < 4 ? "Next" : "Complete"}
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
