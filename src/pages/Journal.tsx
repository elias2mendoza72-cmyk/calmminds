import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Loader2,
  BookOpen,
  Calendar,
  Trash2,
  Edit3,
  X,
  Save,
  RefreshCw,
  Heart,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  reflection_prompt: string | null;
  mood_tag: string | null;
  created_at: string;
}

const MOOD_TAGS = [
  { emoji: "😌", label: "Calm" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🤔", label: "Reflective" },
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [reflectionPrompt, setReflectionPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading entries:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const fetchReflectionPrompt = async (personalized = false) => {
    setPromptLoading(true);
    try {
      const response = await supabase.functions.invoke("journal-prompts", {
        body: {
          type: personalized && content.length > 50 ? "personalized" : "random",
          content: personalized ? content : undefined,
        },
      });

      if (response.error) throw response.error;
      setReflectionPrompt(response.data.prompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      setReflectionPrompt("What's on your mind today?");
    } finally {
      setPromptLoading(false);
    }
  };

  const startNewEntry = async () => {
    setIsWriting(true);
    setEditingId(null);
    setTitle("");
    setContent("");
    setMoodTag("");
    await fetchReflectionPrompt(false);
  };

  const editEntry = (entry: JournalEntry) => {
    setIsWriting(true);
    setEditingId(entry.id);
    setTitle(entry.title || "");
    setContent(entry.content);
    setMoodTag(entry.mood_tag || "");
    setReflectionPrompt(entry.reflection_prompt || "");
  };

  const saveEntry = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            title: title || null,
            content,
            mood_tag: moodTag || null,
            reflection_prompt: reflectionPrompt || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Entry updated" });
      } else {
        const { error } = await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: title || null,
          content,
          mood_tag: moodTag || null,
          reflection_prompt: reflectionPrompt || null,
        });

        if (error) throw error;
        toast({ title: "Entry saved" });
      }

      setIsWriting(false);
      await loadEntries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entry deleted" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-calm-lavender rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-calm-peach rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">My Journal</h1>
            </div>
          </div>
          {!isWriting && (
            <Button onClick={startNewEntry} className="gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {isWriting ? (
          <div className="animate-fade-in">
            {/* Writing mode */}
            <Card className="border-0 shadow-warm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-display">
                    {editingId ? "Edit Entry" : "New Entry"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsWriting(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reflection prompt */}
                <div className="bg-calm-lavender/30 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Reflection prompt</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchReflectionPrompt(content.length > 50)}
                      disabled={promptLoading}
                      className="h-7 text-xs"
                    >
                      {promptLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-foreground italic">
                    {promptLoading ? "Getting a prompt for you..." : reflectionPrompt}
                  </p>
                </div>

                {/* Title */}
                <Input
                  placeholder="Give your entry a title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 border-border/50"
                />

                {/* Content */}
                <Textarea
                  placeholder="Write your thoughts here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-background/50 border-border/50 resize-none"
                />

                {/* Mood tags */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">How are you feeling?</p>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_TAGS.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setMoodTag(moodTag === mood.label ? "" : mood.label)}
                        className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                          moodTag === mood.label
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI personalized prompt */}
                {content.length > 50 && (
                  <Button
                    variant="outline"
                    onClick={() => fetchReflectionPrompt(true)}
                    disabled={promptLoading}
                    className="w-full gap-2"
                  >
                    {promptLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Get a personalized reflection question
                  </Button>
                )}

                {/* Save button */}
                <Button
                  onClick={saveEntry}
                  disabled={!content.trim() || saving}
                  className="w-full gap-2"
                  size="lg"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Entry
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-0 shadow-soft text-center py-16 animate-fade-in">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Start Your Journal</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Writing about your thoughts and feelings can help you process emotions and reduce anxiety.
              </p>
              <Button onClick={startNewEntry} className="gap-2">
                <Plus className="w-4 h-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card
                key={entry.id}
                className="border-0 shadow-soft animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(entry.created_at)}</span>
                        {entry.mood_tag && (
                          <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                            {MOOD_TAGS.find((m) => m.label === entry.mood_tag)?.emoji} {entry.mood_tag}
                          </span>
                        )}
                      </div>
                      {entry.title && (
                        <h3 className="font-display font-semibold text-lg mb-1">{entry.title}</h3>
                      )}
                      <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editEntry(entry)}
                        className="h-8 w-8"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEntry(entry.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
