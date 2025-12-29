import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wind, Eye, MessageCircle, Music, X, Gamepad2, Sparkles, Palette, Mountain, Video, Phone } from "lucide-react";
import BreathingExercise from "@/components/panic/BreathingExercise";
import GroundingExercise from "@/components/panic/GroundingExercise";
import AIChatCompanion from "@/components/panic/AIChatCompanion";
import CalmingMedia from "@/components/panic/CalmingMedia";
import MiniGame from "@/components/panic/MiniGame";
import GuidedVisualization from "@/components/panic/GuidedVisualization";
import PositiveAffirmations from "@/components/panic/PositiveAffirmations";
import ColoringCanvas from "@/components/panic/ColoringCanvas";
import CalmingVideos from "@/components/panic/CalmingVideos";
import EmergencyContacts from "@/components/panic/EmergencyContacts";

type PanicFeature = "breathing" | "grounding" | "chat" | "media" | "game" | "visualization" | "affirmations" | "coloring" | "videos" | "emergency" | null;

export default function PanicMode() {
  const [activeFeature, setActiveFeature] = useState<PanicFeature>(null);
  const navigate = useNavigate();

  const features = [
    { id: "breathing" as const, icon: Wind, label: "Breathing", description: "Guided exercises", color: "from-blue-500/20 to-cyan-500/20" },
    { id: "grounding" as const, icon: Eye, label: "Grounding", description: "5-4-3-2-1 technique", color: "from-green-500/20 to-emerald-500/20" },
    { id: "chat" as const, icon: MessageCircle, label: "Talk", description: "AI companion", color: "from-purple-500/20 to-pink-500/20" },
    { id: "media" as const, icon: Music, label: "Sounds", description: "Calming audio", color: "from-orange-500/20 to-amber-500/20" },
    { id: "videos" as const, icon: Video, label: "Videos", description: "Nature scenes", color: "from-sky-500/20 to-blue-500/20" },
    { id: "game" as const, icon: Gamepad2, label: "Game", description: "Memory match", color: "from-rose-500/20 to-red-500/20" },
    { id: "visualization" as const, icon: Mountain, label: "Journey", description: "Guided imagery", color: "from-teal-500/20 to-cyan-500/20" },
    { id: "affirmations" as const, icon: Sparkles, label: "Affirm", description: "Positive words", color: "from-yellow-500/20 to-orange-500/20" },
    { id: "coloring" as const, icon: Palette, label: "Color", description: "Mindful art", color: "from-indigo-500/20 to-violet-500/20" },
    { id: "emergency" as const, icon: Phone, label: "Help", description: "Emergency contacts", color: "from-red-500/20 to-pink-500/20" },
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {features.map((feature, index) => (
                <Card
                  key={feature.id}
                  className={`bg-gradient-to-br ${feature.color} border-panic-accent/20 cursor-pointer hover:scale-105 transition-all animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <feature.icon className="w-6 h-6 text-panic-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-0.5">{feature.label}</h3>
                    <p className="text-xs text-panic-text/60">{feature.description}</p>
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
            {activeFeature === "videos" && <CalmingVideos />}
            {activeFeature === "game" && <MiniGame />}
            {activeFeature === "visualization" && <GuidedVisualization />}
            {activeFeature === "affirmations" && <PositiveAffirmations />}
            {activeFeature === "coloring" && <ColoringCanvas />}
            {activeFeature === "emergency" && <EmergencyContacts />}
          </div>
        )}
      </main>
    </div>
  );
}
