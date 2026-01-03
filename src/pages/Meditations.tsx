import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Clock, Leaf, Moon, Sun, Wind, Waves, Cloud, Heart, Brain, Sparkles, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSound } from "@/hooks/useSound";
import { useMeditationAudio, meditationSoundMap } from "@/hooks/useMeditationAudio";
import BubblePopGame from "@/components/panic/BubblePopGame";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: "guided" | "ambient" | "breathing";
  icon: React.ReactNode;
  gradient: string;
}

const meditations: Meditation[] = [
  {
    id: "morning-calm",
    title: "Morning Calm",
    description: "Start your day with peaceful intentions",
    duration: 5,
    category: "guided",
    icon: <Sun className="w-6 h-6" />,
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: "stress-relief",
    title: "Stress Relief",
    description: "Release tension and find your center",
    duration: 10,
    category: "guided",
    icon: <Heart className="w-6 h-6" />,
    gradient: "from-rose-500/20 to-pink-500/20"
  },
  {
    id: "deep-focus",
    title: "Deep Focus",
    description: "Enhance concentration and clarity",
    duration: 15,
    category: "guided",
    icon: <Brain className="w-6 h-6" />,
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    id: "sleep-well",
    title: "Sleep Well",
    description: "Drift into restful slumber",
    duration: 20,
    category: "guided",
    icon: <Moon className="w-6 h-6" />,
    gradient: "from-indigo-500/20 to-blue-500/20"
  },
  {
    id: "rain-sounds",
    title: "Gentle Rain",
    description: "Soothing rainfall ambience",
    duration: 30,
    category: "ambient",
    icon: <Cloud className="w-6 h-6" />,
    gradient: "from-slate-500/20 to-gray-500/20"
  },
  {
    id: "ocean-waves",
    title: "Ocean Waves",
    description: "Rhythmic waves on the shore",
    duration: 30,
    category: "ambient",
    icon: <Waves className="w-6 h-6" />,
    gradient: "from-cyan-500/20 to-teal-500/20"
  },
  {
    id: "forest-wind",
    title: "Forest Breeze",
    description: "Wind through the trees",
    duration: 30,
    category: "ambient",
    icon: <Wind className="w-6 h-6" />,
    gradient: "from-emerald-500/20 to-green-500/20"
  },
  {
    id: "night-garden",
    title: "Night Garden",
    description: "Crickets and evening calm",
    duration: 30,
    category: "ambient",
    icon: <Leaf className="w-6 h-6" />,
    gradient: "from-lime-500/20 to-green-500/20"
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "4-4-4-4 pattern for calm",
    duration: 5,
    category: "breathing",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-sky-500/20 to-blue-500/20"
  },
  {
    id: "478-breathing",
    title: "4-7-8 Breathing",
    description: "Relaxation breathing technique",
    duration: 5,
    category: "breathing",
    icon: <Wind className="w-6 h-6" />,
    gradient: "from-teal-500/20 to-cyan-500/20"
  }
];

export default function Meditations() {
  const [activeMeditation, setActiveMeditation] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playClickSound, playSuccessSound } = useSound();
  const { play: playAmbient, stop: stopAmbient } = useMeditationAudio();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      stopAmbient();
    };
  }, [stopAmbient]);

  const handlePlay = (id: string) => {
    playClickSound();
    
    // If clicking the same meditation that's playing, pause it
    if (activeMeditation === id && isPlaying) {
      setIsPlaying(false);
      stopAmbient();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    // Stop any existing playback
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    stopAmbient();

    // Start new meditation
    setActiveMeditation(id);
    setIsPlaying(true);
    setProgress(0);

    // Play ambient sound
    const soundType = meditationSoundMap[id] || 'drone';
    playAmbient(soundType);

    // Progress tracking
    const meditation = meditations.find(m => m.id === id);
    if (meditation) {
      const totalMs = meditation.duration * 60 * 1000;
      const updateInterval = 100;
      const progressIncrement = (100 / (totalMs / updateInterval));

      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            stopAmbient();
            setIsPlaying(false);
            playSuccessSound();
            return 100;
          }
          return prev + progressIncrement;
        });
      }, updateInterval);
    }
  };

  const MeditationCard = ({ meditation }: { meditation: Meditation }) => {
    const isActive = activeMeditation === meditation.id;
    const isCurrentlyPlaying = isActive && isPlaying;

    return (
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] border-border/50 ${
          isActive ? 'ring-2 ring-primary/50' : ''
        }`}
        onClick={() => handlePlay(meditation.id)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${meditation.gradient} text-foreground`}>
              {meditation.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{meditation.title}</h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {meditation.duration}m
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{meditation.description}</p>
              
              {isActive && (
                <div className="mt-3 space-y-2">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {isCurrentlyPlaying ? "Playing..." : progress >= 100 ? "Completed" : "Paused"}
                  </p>
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant={isCurrentlyPlaying ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(meditation.id);
              }}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filterByCategory = (category: Meditation["category"]) => 
    meditations.filter(m => m.category === category);

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meditation Library</h1>
            <p className="text-muted-foreground">Find your moment of peace</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="guided" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="guided" className="data-[state=active]:bg-primary/20">
              Guided
            </TabsTrigger>
            <TabsTrigger value="ambient" className="data-[state=active]:bg-primary/20">
              Ambient
            </TabsTrigger>
            <TabsTrigger value="breathing" className="data-[state=active]:bg-primary/20">
              Breathing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guided" className="space-y-4">
            <div className="grid gap-4">
              {filterByCategory("guided").map(meditation => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ambient" className="space-y-4">
            <div className="grid gap-4">
              {filterByCategory("ambient").map(meditation => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="breathing" className="space-y-4">
            <div className="grid gap-4">
              {filterByCategory("breathing").map(meditation => (
                <MeditationCard key={meditation.id} meditation={meditation} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Mindful Games Section */}
        <Card className="mt-8 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Mindful Games
            </CardTitle>
            <CardDescription>Calming activities to ease your mind</CardDescription>
          </CardHeader>
          <CardContent>
            <BubblePopGame />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="mt-8 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Practice</CardTitle>
            <CardDescription>Track your meditation journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-primary">0m</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
