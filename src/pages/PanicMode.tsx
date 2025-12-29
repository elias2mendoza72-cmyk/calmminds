import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wind, Eye, MessageCircle, Music, X } from "lucide-react";
import BreathingExercise from "@/components/panic/BreathingExercise";
import GroundingExercise from "@/components/panic/GroundingExercise";
import AIChatCompanion from "@/components/panic/AIChatCompanion";
import CalmingMedia from "@/components/panic/CalmingMedia";

type PanicFeature = "breathing" | "grounding" | "chat" | "media" | null;

export default function PanicMode() {
  const [activeFeature, setActiveFeature] = useState<PanicFeature>(null);
  const navigate = useNavigate();

  const features = [
    { id: "breathing" as const, icon: Wind, label: "Breathing", description: "Guided breathing exercises" },
    { id: "grounding" as const, icon: Eye, label: "Grounding", description: "5-4-3-2-1 technique" },
    { id: "chat" as const, icon: MessageCircle, label: "Talk", description: "AI companion" },
    { id: "media" as const, icon: Music, label: "Calm", description: "Soothing sounds" },
  ];

  return (
    <div className="min-h-screen bg-panic-bg text-panic-text">
      {/* Calming background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-panic-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-panic-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        {!activeFeature ? (
          <>
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-display font-semibold mb-3">
                You're safe here
              </h1>
              <p className="text-panic-text/70">
                Take a moment. Choose what feels right for you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={feature.id}
                  className="bg-panic-accent/10 border-panic-accent/20 cursor-pointer hover:bg-panic-accent/20 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="w-7 h-7 text-panic-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1">{feature.label}</h3>
                    <p className="text-sm text-panic-text/60">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFeature(null)}
              className="mb-4 text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/10"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>

            {activeFeature === "breathing" && <BreathingExercise />}
            {activeFeature === "grounding" && <GroundingExercise />}
            {activeFeature === "chat" && <AIChatCompanion />}
            {activeFeature === "media" && <CalmingMedia />}
          </div>
        )}
      </main>
    </div>
  );
}
