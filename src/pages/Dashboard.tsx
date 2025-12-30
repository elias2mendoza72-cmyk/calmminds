import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Heart,
  BookOpen,
  Settings,
  Plus,
  X,
  Target,
  Zap,
} from "lucide-react";
import MoodCheckIn from "@/components/dashboard/MoodCheckIn";
import MoodChart from "@/components/dashboard/MoodChart";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import BadgesShowcase from "@/components/dashboard/BadgesShowcase";
import WeeklyAchievementCard from "@/components/dashboard/WeeklyAchievementCard";
import CelebrationEffects from "@/components/CelebrationEffects";

interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [moodRefreshTrigger, setMoodRefreshTrigger] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const [fadingOutTaskIds, setFadingOutTaskIds] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { user, signOut } = useAuth();
  const { 
    streak, 
    earnedBadges, 
    weeklyAchievement, 
    loading: gamificationLoading,
    updateStreak,
    updateWeeklyProgress,
    checkTotalBadges,
  } = useGamification();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      checkOnboardingAndLoadTasks();
    }
  }, [user]);

  const checkOnboardingAndLoadTasks = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    await loadTasks();
  };

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date();
    const dayOfWeek = today.getUTCDay();
    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", weekStartStr)
      .eq("is_completed", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading tasks:", error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to generate tasks.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("generate-tasks", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "New tasks generated!",
        description: "Your personalized weekly tasks are ready.",
      });

      await loadTasks();
    } catch (error: any) {
      console.error("Error generating tasks:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to generate tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, currentState: boolean) => {
    if (!currentState) {
      setCelebratingTaskId(taskId);
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    }

    const { error } = await supabase
      .from("weekly_tasks")
      .update({
        is_completed: !currentState,
        completed_at: !currentState ? new Date().toISOString() : null,
      })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
      setCelebratingTaskId(null);
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: !currentState, completed_at: !currentState ? new Date().toISOString() : null }
            : t
        )
      );
      
      if (!currentState) {
        updateWeeklyProgress("task");
        checkTotalBadges();
        
        setTimeout(() => {
          setFadingOutTaskIds(prev => new Set(prev).add(taskId));
          
          setTimeout(() => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setFadingOutTaskIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(taskId);
              return newSet;
            });
          }, 400);
        }, 1200);
      }
    }
  };

  const handleCelebrationComplete = useCallback(() => {
    setCelebratingTaskId(null);
  }, []);

  const addCustomTask = async () => {
    if (!user || !newTaskTitle.trim()) return;
    
    setAddingTask(true);
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartDate = weekStart.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_tasks")
      .insert({
        user_id: user.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || "Custom task",
        week_start: weekStartDate,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    } else if (data) {
      setTasks((prev) => [...prev, data]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowAddTask(false);
      toast({
        title: "Task added!",
        description: "Your custom task has been added.",
      });
    }
    
    setAddingTask(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleMoodLogged = () => {
    setMoodRefreshTrigger((prev) => prev + 1);
  };

  const handleStreakUpdate = async () => {
    await updateStreak();
    await checkTotalBadges();
  };

  const handleWeeklyUpdate = () => {
    updateWeeklyProgress("mood");
  };

  const visibleTasks = tasks.filter(t => !t.is_completed || fadingOutTaskIds.has(t.id));
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalTasksForProgress = tasks.length + fadingOutTaskIds.size;
  const progress = totalTasksForProgress > 0 ? (completedCount / totalTasksForProgress) * 100 : 0;

  const getWeekDateRange = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-US", options)} - ${weekEnd.toLocaleDateString("en-US", options)}`;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative">
      {/* Celebration effects */}
      <CelebrationEffects
        trigger={celebratingTaskId !== null}
        type="confetti"
        duration={1500}
        onComplete={handleCelebrationComplete}
      />

      {/* Premium background with parallax gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary peach orb - moves slower */}
        <div 
          className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-gradient-radial from-calm-peach/40 via-calm-peach/10 to-transparent blur-3xl transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translate3d(${scrollY * 0.02}px, ${scrollY * 0.05}px, 0)` }}
        />
        {/* Sage orb - moves at medium speed */}
        <div 
          className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-radial from-calm-sage/30 via-calm-sage/5 to-transparent blur-3xl transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translate3d(${scrollY * -0.03}px, ${scrollY * 0.08}px, 0)` }}
        />
        {/* Lavender orb - moves faster for depth */}
        <div 
          className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full bg-gradient-radial from-calm-lavender/20 via-transparent to-transparent blur-3xl transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translate3d(${scrollY * 0.04}px, ${scrollY * -0.1}px, 0)` }}
        />
        {/* Small accent orb - moves fastest */}
        <div 
          className="absolute top-1/2 right-1/3 w-[200px] h-[200px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translate3d(${scrollY * -0.06}px, ${scrollY * 0.12}px, 0)` }}
        />
        {/* Subtle grid pattern with parallax */}
        <div 
          className="absolute inset-0 opacity-[0.015] transition-transform duration-75 ease-out"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `translate3d(0, ${scrollY * 0.02}px, 0)`,
          }}
        />
      </div>

      {/* Premium Header */}
      <header className="relative z-10 border-b border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-premium from-primary/40 via-calm-rose/30 to-calm-gold/40 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-premium from-primary to-calm-terracotta rounded-xl flex items-center justify-center shadow-elevated">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">CalmMind</h1>
              <p className="text-xs text-muted-foreground font-medium">Your wellness companion</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/journal")}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/25 btn-premium"
              onClick={() => navigate("/panic")}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Panic Mode</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Hero Welcome Section */}
        <section className="mb-12 animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  This Week
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-3">
                Welcome back
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Here are your personalized habits designed to help you feel your best.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid sm:grid-cols-2 gap-5 mb-10 stagger-children">
          <div className="premium-card floating-element">
            <StreakDisplay 
              currentStreak={streak.currentStreak} 
              longestStreak={streak.longestStreak} 
            />
          </div>
          <div className="premium-card floating-element">
            <WeeklyAchievementCard
              moodsLogged={weeklyAchievement.moodsLogged}
              tasksCompleted={weeklyAchievement.tasksCompleted}
              journalsWritten={weeklyAchievement.journalsWritten}
              achievementUnlocked={weeklyAchievement.achievementUnlocked}
            />
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="premium-card p-1">
            <BadgesShowcase earnedBadges={earnedBadges} />
          </div>
        </section>

        {/* Mood Section */}
        <section className="grid sm:grid-cols-2 gap-5 mb-10">
          <div className="premium-card animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <MoodCheckIn 
              onMoodLogged={handleMoodLogged} 
              onStreakUpdate={handleStreakUpdate}
              onWeeklyUpdate={handleWeeklyUpdate}
            />
          </div>
          <div className="premium-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <MoodChart refreshTrigger={moodRefreshTrigger} />
          </div>
        </section>

        {/* Weekly Progress Card */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <Card className="border-0 shadow-elevated bg-gradient-premium from-card via-card to-calm-cream/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/5 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{getWeekDateRange()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateTasks}
                  disabled={generating}
                  className="gap-2 border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {tasks.length === 0 ? "Generate" : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {completedCount} of {tasks.length} tasks completed
                </span>
                <span className="text-sm font-semibold text-primary">
                  {tasks.length > 0 ? Math.round(progress) : 0}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-muted/50" />
                <div 
                  className="absolute top-0 left-0 h-3 rounded-full bg-gradient-premium from-primary via-calm-terracotta to-calm-rose transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && tasks.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-calm-forest bg-calm-sage/20 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Amazing! You've completed all your tasks this week!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tasks Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {loading || generating ? (
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-xl">
                    {generating ? "Creating your personalized tasks..." : "Loading your tasks..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {generating ? "AI is analyzing your profile" : "Please wait a moment"}
                  </p>
                </div>
              </div>

              {/* Enhanced skeleton cards with shimmer */}
              {[1, 2, 3].map((i) => (
                <Card 
                  key={i} 
                  className="border border-border/30 shadow-soft bg-card/80 overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-5 relative">
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 200}ms` }} />
                    
                    <div className="flex items-start gap-4">
                      {/* Checkbox skeleton with pulse */}
                      <div className="relative">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" style={{ animationDelay: `${i * 150}ms` }} />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {/* Title skeleton */}
                        <div className="relative h-5 rounded-md bg-gradient-to-r from-muted via-muted/80 to-muted overflow-hidden" style={{ width: `${70 + i * 8}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" style={{ animationDelay: `${i * 100}ms` }} />
                        </div>
                        
                        {/* Description skeleton */}
                        <div className="space-y-2">
                          <div className="relative h-4 rounded-md bg-gradient-to-r from-muted/70 via-muted/50 to-muted/70 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 120}ms` }} />
                          </div>
                          <div className="relative h-4 rounded-md bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 overflow-hidden" style={{ width: '60%' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 140}ms` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading indicator dots */}
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : tasks.length === 0 && !showAddTask ? (
            <Card className="border-0 shadow-elevated text-center py-16 bg-gradient-premium from-card via-card to-calm-cream/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
              <CardContent className="relative">
                <div className="relative inline-flex mb-6">
                  <div className="absolute -inset-4 bg-gradient-radial from-primary/20 to-transparent blur-xl" />
                  <div className="relative w-20 h-20 bg-gradient-premium from-primary/20 to-calm-peach/30 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">
                  Ready to start your week?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                  Let's generate personalized wellness tasks based on your unique profile and goals.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={generateTasks} 
                    disabled={generating} 
                    className="gap-2 btn-premium bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {generating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    Generate My Tasks
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddTask(true)} 
                    className="gap-2 border-border/60 hover:bg-muted/50"
                    size="lg"
                  >
                    <Plus className="w-5 h-5" />
                    Custom Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl">Weekly Tasks</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="gap-2 border-border/60 hover:bg-muted/50 hover:border-primary/30"
                >
                  {showAddTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddTask ? "Cancel" : "Add Task"}
                </Button>
              </div>

              {/* Add Task Form */}
              {showAddTask && (
                <Card className="border border-primary/20 shadow-glow-sm bg-gradient-premium from-card to-primary/5 animate-scale-in overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <Input
                      placeholder="Task title (e.g., Practice deep breathing)"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-background/80 border-border/60 focus:border-primary/50"
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="bg-background/80 border-border/60 focus:border-primary/50 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTaskTitle("");
                          setNewTaskDescription("");
                        }}
                        className="hover:bg-muted/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={addCustomTask}
                        disabled={!newTaskTitle.trim() || addingTask}
                        className="gap-2 btn-premium"
                      >
                        {addingTask ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Task List */}
              <div className="space-y-3">
                {tasks
                  .filter(task => !task.is_completed || fadingOutTaskIds.has(task.id))
                  .map((task, index) => {
                    const isFadingOut = fadingOutTaskIds.has(task.id);
                    const isCelebrating = celebratingTaskId === task.id;
                    
                    return (
                      <Card
                        key={task.id}
                        className={`group border-0 transition-all duration-300 overflow-hidden relative ${
                          isFadingOut 
                            ? "opacity-0 scale-95 -translate-x-4" 
                            : isCelebrating
                            ? "shadow-glow-sm ring-2 ring-calm-sage/50 bg-gradient-premium from-calm-sage/10 to-calm-forest/5"
                            : task.is_completed 
                            ? "bg-secondary/30 shadow-soft" 
                            : "bg-card shadow-soft hover:shadow-warm hover:-translate-y-0.5"
                        }`}
                        style={{ 
                          animationDelay: `${index * 60}ms`,
                          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                      >
                        {isCelebrating && (
                          <div className="absolute inset-0 bg-gradient-premium from-calm-sage/10 via-transparent to-calm-forest/5 animate-pulse" />
                        )}
                        <CardContent className="p-5 relative">
                          <div className="flex items-start gap-4">
                            <div className="relative mt-0.5">
                              <Checkbox
                                checked={task.is_completed}
                                onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                                disabled={isFadingOut || isCelebrating}
                                className={`w-6 h-6 rounded-lg border-2 transition-all ${
                                  isCelebrating 
                                    ? "scale-110 border-calm-forest bg-calm-forest" 
                                    : "border-border group-hover:border-primary/50"
                                }`}
                                aria-label={`Mark "${task.title}" as ${task.is_completed ? "incomplete" : "complete"}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-base transition-all leading-snug ${
                                task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                              }`}>
                                {task.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                            {isCelebrating && (
                              <div className="flex items-center gap-1.5 text-calm-forest animate-bounce-in shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-semibold">Done!</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom spacing for mobile nav */}
      <div className="h-24 sm:h-12" />
    </div>
  );
}