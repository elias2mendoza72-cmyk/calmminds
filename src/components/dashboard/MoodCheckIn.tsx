import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";

const MOODS = [
  { score: 1, emoji: "😢", label: "Struggling" },
  { score: 2, emoji: "😔", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😊", label: "Great" },
];

interface MoodCheckInProps {
  onMoodLogged: () => void;
}

export default function MoodCheckIn({ onMoodLogged }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

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

      setTodaysMood(selectedMood);
      setSelectedMood(null);
      setNotes("");
      onMoodLogged();

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
      <Card className="border-0 shadow-soft bg-gradient-to-br from-secondary/50 to-calm-sage/20">
        <CardContent className="py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Check className="w-5 h-5 text-calm-forest" />
            <span className="text-sm font-medium text-calm-forest">Today's mood logged</span>
          </div>
          <div className="text-4xl mb-1">{mood?.emoji}</div>
          <p className="text-sm text-muted-foreground">{mood?.label}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-warm bg-gradient-to-br from-card to-calm-peach/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              className={`flex-1 py-3 rounded-xl transition-all ${
                selectedMood === mood.score
                  ? "bg-primary/20 ring-2 ring-primary scale-105"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-3xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-muted-foreground">{mood.label}</div>
            </button>
          ))}
        </div>

        {selectedMood !== null && (
          <div className="space-y-3 animate-fade-in">
            <Textarea
              placeholder="Add a note about how you're feeling (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background/50 resize-none"
              rows={2}
            />
            <Button onClick={saveMood} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Log My Mood
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
