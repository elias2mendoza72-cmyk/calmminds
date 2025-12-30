import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CelebrationEffects from "@/components/CelebrationEffects";

const MOODS = [
  { score: 1, emoji: "😢", label: "Struggling", color: "from-rose-200 to-rose-300" },
  { score: 2, emoji: "😔", label: "Low", color: "from-amber-200 to-amber-300" },
  { score: 3, emoji: "😐", label: "Okay", color: "from-slate-200 to-slate-300" },
  { score: 4, emoji: "🙂", label: "Good", color: "from-emerald-200 to-emerald-300" },
  { score: 5, emoji: "😊", label: "Great", color: "from-sky-200 to-sky-300" },
];

interface MoodCheckInProps {
  onMoodLogged: () => void;
  onStreakUpdate?: () => void;
  onWeeklyUpdate?: () => void;
}

export default function MoodCheckIn({ onMoodLogged, onStreakUpdate, onWeeklyUpdate }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (user) checkTodaysMood();
  }, [user]);

  const checkTodaysMood = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("mood_entries")
      .select("mood_score")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setTodaysMood(data[0].mood_score);
    }
    setLoading(false);
  };

  const handleMoodSelect = useCallback((score: number) => {
    setSelectedMood(score);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, score: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMoodSelect(score);
    }
  }, [handleMoodSelect]);

  const saveMood = async () => {
    if (!user || selectedMood === null) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user.id,
        mood_score: selectedMood,
        notes: notes || null,
      });

      if (error) throw error;

      // Trigger celebration
      if (!prefersReducedMotion) {
        setShowCelebration(true);
        setJustLogged(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      setTodaysMood(selectedMood);
      setSelectedMood(null);
      setNotes("");
      onMoodLogged();
      
      // Trigger gamification updates
      if (onStreakUpdate) onStreakUpdate();
      if (onWeeklyUpdate) onWeeklyUpdate();

      toast({
        title: "Mood logged!",
        description: "Thanks for checking in today.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (todaysMood !== null) {
    const mood = MOODS.find((m) => m.score === todaysMood);
    return (
      <>
        <CelebrationEffects trigger={showCelebration} type="confetti" />
        <Card 
          className={`border-0 shadow-soft bg-gradient-to-br from-secondary/50 to-calm-sage/20 ${
            justLogged && !prefersReducedMotion ? 'animate-scale-in' : ''
          }`}
          role="status"
          aria-label={`Today's mood: ${mood?.label}`}
        >
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`${!prefersReducedMotion ? 'animate-bounce' : ''}`}>
                <Check className="w-5 h-5 text-calm-forest" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-calm-forest">Today's mood logged</span>
            </div>
            <div 
              className={`text-4xl mb-1 ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
              role="img" 
              aria-label={mood?.label}
            >
              {mood?.emoji}
            </div>
            <p className="text-sm text-muted-foreground">{mood?.label}</p>
            {justLogged && (
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary animate-fade-in">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>Great job checking in!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Card 
      className="border-0 shadow-warm bg-gradient-to-br from-card to-calm-peach/20"
      role="form"
      aria-labelledby="mood-checkin-title"
    >
      <CardHeader className="pb-2">
        <CardTitle id="mood-checkin-title" className="text-lg font-display">
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="flex justify-between gap-2" 
          role="radiogroup" 
          aria-label="Select your mood"
        >
          {MOODS.map((mood) => (
            <button
              key={mood.score}
              onClick={() => handleMoodSelect(mood.score)}
              onKeyDown={(e) => handleKeyDown(e, mood.score)}
              role="radio"
              aria-checked={selectedMood === mood.score}
              aria-label={`${mood.label} mood`}
              tabIndex={0}
              className={`
                flex-1 py-3 rounded-xl transition-all duration-200 
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                ${selectedMood === mood.score
                  ? `bg-gradient-to-br ${mood.color} ring-2 ring-primary ${!prefersReducedMotion ? 'scale-105' : ''}`
                  : 'bg-muted/50 hover:bg-muted hover:scale-102'
                }
                ${!prefersReducedMotion ? 'active:scale-95' : ''}
              `}
            >
              <div 
                className={`text-3xl mb-1 transition-transform duration-200 ${
                  selectedMood === mood.score && !prefersReducedMotion ? 'animate-bounce-subtle' : ''
                }`}
                role="img"
                aria-hidden="true"
              >
                {mood.emoji}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{mood.label}</div>
            </button>
          ))}
        </div>

        {selectedMood !== null && (
          <div className={`space-y-3 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
            <Textarea
              placeholder="Add a note about how you're feeling (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background/50 resize-none focus-visible:ring-primary"
              rows={2}
              aria-label="Optional notes about your mood"
            />
            <Button 
              onClick={saveMood} 
              disabled={saving} 
              className={`w-full gap-2 ${!prefersReducedMotion ? 'hover:scale-102 active:scale-98' : ''} transition-transform`}
              aria-busy={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="w-4 h-4" aria-hidden="true" />
              )}
              Log My Mood
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
