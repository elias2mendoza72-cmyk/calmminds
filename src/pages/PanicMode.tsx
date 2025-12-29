import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Wind, 
  Eye, 
  MessageCircle, 
  Music, 
  X, 
  Gamepad2, 
  Sparkles, 
  Palette, 
  Mountain, 
  Video, 
  Phone, 
  Circle, 
  Grid3X3,
  Clock,
  Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentPanicFeatures } from "@/hooks/useLocalStorage";
import { usePanicModeShortcuts, useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
import BubblePopGame from "@/components/panic/BubblePopGame";
import ZenPuzzle from "@/components/panic/ZenPuzzle";

type PanicFeature = "breathing" | "grounding" | "chat" | "media" | "game" | "visualization" | "affirmations" | "coloring" | "videos" | "emergency" | "bubbles" | "puzzle" | null;

// Feature categories for better organization
const FEATURE_CATEGORIES = [
  {
    name: "Breathing & Calm",
    description: "Quick relief techniques",
    features: ["breathing", "grounding", "visualization"],
  },
  {
    name: "Interactive Activities",
    description: "Mindful distractions",
    features: ["game", "bubbles", "puzzle", "coloring"],
  },
  {
    name: "Media & Support",
    description: "Soothing content",
    features: ["media", "videos", "affirmations", "chat", "emergency"],
  },
];

const ALL_FEATURES = [
  { id: "breathing" as const, icon: Wind, label: "Breathing", description: "Guided exercises", color: "from-blue-500/20 to-cyan-500/20", hoverColor: "group-hover:from-blue-500/30 group-hover:to-cyan-500/30" },
  { id: "grounding" as const, icon: Eye, label: "Grounding", description: "5-4-3-2-1 technique", color: "from-green-500/20 to-emerald-500/20", hoverColor: "group-hover:from-green-500/30 group-hover:to-emerald-500/30" },
  { id: "chat" as const, icon: MessageCircle, label: "Talk", description: "AI companion", color: "from-purple-500/20 to-pink-500/20", hoverColor: "group-hover:from-purple-500/30 group-hover:to-pink-500/30" },
  { id: "media" as const, icon: Music, label: "Sounds", description: "Calming audio", color: "from-orange-500/20 to-amber-500/20", hoverColor: "group-hover:from-orange-500/30 group-hover:to-amber-500/30" },
  { id: "videos" as const, icon: Video, label: "Videos", description: "Nature scenes", color: "from-sky-500/20 to-blue-500/20", hoverColor: "group-hover:from-sky-500/30 group-hover:to-blue-500/30" },
  { id: "game" as const, icon: Gamepad2, label: "Memory", description: "Card matching", color: "from-rose-500/20 to-red-500/20", hoverColor: "group-hover:from-rose-500/30 group-hover:to-red-500/30" },
  { id: "bubbles" as const, icon: Circle, label: "Bubbles", description: "Pop to relax", color: "from-cyan-500/20 to-blue-500/20", hoverColor: "group-hover:from-cyan-500/30 group-hover:to-blue-500/30" },
  { id: "puzzle" as const, icon: Grid3X3, label: "Puzzle", description: "Zen patterns", color: "from-amber-500/20 to-yellow-500/20", hoverColor: "group-hover:from-amber-500/30 group-hover:to-yellow-500/30" },
  { id: "visualization" as const, icon: Mountain, label: "Journey", description: "Guided imagery", color: "from-teal-500/20 to-cyan-500/20", hoverColor: "group-hover:from-teal-500/30 group-hover:to-cyan-500/30" },
  { id: "affirmations" as const, icon: Sparkles, label: "Affirm", description: "Positive words", color: "from-yellow-500/20 to-orange-500/20", hoverColor: "group-hover:from-yellow-500/30 group-hover:to-orange-500/30" },
  { id: "coloring" as const, icon: Palette, label: "Color", description: "Mindful art", color: "from-indigo-500/20 to-violet-500/20", hoverColor: "group-hover:from-indigo-500/30 group-hover:to-violet-500/30" },
  { id: "emergency" as const, icon: Phone, label: "Help", description: "Emergency contacts", color: "from-red-500/20 to-pink-500/20", hoverColor: "group-hover:from-red-500/30 group-hover:to-pink-500/30" },
];

export default function PanicMode() {
  const [activeFeature, setActiveFeature] = useState<PanicFeature>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();
  const { recentFeatures, addRecentFeature } = useRecentPanicFeatures();
  const reducedMotion = useReducedMotion();

  // Keyboard shortcuts
  useGlobalShortcuts();
  usePanicModeShortcuts({
    onEscape: () => setActiveFeature(null),
  });

  const handleFeatureSelect = (featureId: PanicFeature) => {
    if (featureId) {
      addRecentFeature(featureId);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
    setActiveFeature(featureId);
  };

  const getFeatureById = (id: string) => ALL_FEATURES.find((f) => f.id === id);

  // Get recent features that exist
  const recentFeatureObjects = recentFeatures
    .map((id) => getFeatureById(id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-panic-bg text-panic-text pb-20 md:pb-0">
      {/* Calming background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div 
          className={cn(
            "absolute top-1/4 left-1/4 w-96 h-96 bg-panic-accent/10 rounded-full blur-3xl",
            !reducedMotion && "animate-pulse-slow"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-1/4 right-1/4 w-80 h-80 bg-panic-accent/5 rounded-full blur-3xl",
            !reducedMotion && "animate-pulse-slow"
          )} 
          style={{ animationDelay: "1.5s" }} 
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/10 touch-target focus-ring"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Dashboard
        </Button>

        {/* Keyboard shortcuts hint */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="text-panic-text/50 hover:text-panic-text/80 hover:bg-panic-accent/10 hidden md:flex"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" aria-hidden="true" />
        </Button>
      </header>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div className="relative z-10 mx-4 mb-4 p-4 bg-panic-accent/10 rounded-xl border border-panic-accent/20 animate-fade-in">
          <h3 className="text-sm font-semibold mb-2 text-panic-text/80">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-panic-text/60">
            <div><kbd className="px-1 py-0.5 bg-panic-bg rounded">Esc</kbd> Close feature</div>
            <div><kbd className="px-1 py-0.5 bg-panic-bg rounded">Space</kbd> Play/Pause</div>
            <div><kbd className="px-1 py-0.5 bg-panic-bg rounded">Ctrl+H</kbd> Go Home</div>
            <div><kbd className="px-1 py-0.5 bg-panic-bg rounded">Ctrl+J</kbd> Journal</div>
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        {!activeFeature ? (
          <>
            {/* Welcome message */}
            <div className="text-center mb-6 animate-fade-in" role="heading" aria-level={1}>
              <h1 className="text-3xl font-display font-semibold mb-3">
                You're safe here
              </h1>
              <p className="text-panic-text/70">
                Take a moment. Choose what feels right for you.
              </p>
            </div>

            {/* Recently used section */}
            {recentFeatureObjects.length > 0 && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center gap-2 mb-3 text-sm text-panic-text/60">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Recently used</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {recentFeatureObjects.map((feature) => {
                    if (!feature) return null;
                    const Icon = feature.icon;
                    return (
                      <button
                        key={feature.id}
                        onClick={() => handleFeatureSelect(feature.id)}
                        className={cn(
                          "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
                          "bg-panic-accent/20 hover:bg-panic-accent/30",
                          "transition-all duration-200 touch-target focus-ring",
                          !reducedMotion && "hover:scale-105"
                        )}
                        aria-label={`Open ${feature.label}`}
                      >
                        <Icon className="w-4 h-4 text-panic-accent" aria-hidden="true" />
                        <span className="text-sm font-medium">{feature.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feature categories */}
            {FEATURE_CATEGORIES.map((category, catIndex) => (
              <div 
                key={category.name} 
                className="mb-6 animate-fade-in"
                style={{ animationDelay: `${(catIndex + 1) * 100}ms` }}
              >
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-panic-text/80">{category.name}</h2>
                  <p className="text-xs text-panic-text/50">{category.description}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {category.features.map((featureId, index) => {
                    const feature = getFeatureById(featureId);
                    if (!feature) return null;
                    const Icon = feature.icon;
                    
                    return (
                      <Card
                        key={feature.id}
                        className={cn(
                          "group cursor-pointer transition-all duration-200 border-panic-accent/20",
                          `bg-gradient-to-br ${feature.color} ${feature.hoverColor}`,
                          "focus-within:ring-2 focus-within:ring-panic-accent/50",
                          !reducedMotion && "hover:scale-105"
                        )}
                        onClick={() => handleFeatureSelect(feature.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleFeatureSelect(feature.id);
                          }
                        }}
                        aria-label={`${feature.label}: ${feature.description}`}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="w-10 h-10 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-1.5 group-hover:bg-panic-accent/30 transition-colors">
                            <Icon className="w-5 h-5 text-panic-accent" aria-hidden="true" />
                          </div>
                          <h3 className="font-display font-semibold text-xs mb-0.5">{feature.label}</h3>
                          <p className="text-[10px] text-panic-text/60 line-clamp-1">{feature.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFeature(null)}
              className="mb-4 text-panic-text/70 hover:text-panic-text hover:bg-panic-accent/10 touch-target focus-ring"
              aria-label="Close and return to feature selection"
            >
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Close
            </Button>

            {/* Live region for screen readers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {activeFeature && `Now showing ${getFeatureById(activeFeature)?.label}`}
            </div>

            {activeFeature === "breathing" && <BreathingExercise />}
            {activeFeature === "grounding" && <GroundingExercise />}
            {activeFeature === "chat" && <AIChatCompanion />}
            {activeFeature === "media" && <CalmingMedia />}
            {activeFeature === "videos" && <CalmingVideos />}
            {activeFeature === "game" && <MiniGame />}
            {activeFeature === "bubbles" && <BubblePopGame />}
            {activeFeature === "puzzle" && <ZenPuzzle />}
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
