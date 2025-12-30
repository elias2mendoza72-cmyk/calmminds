import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    if (user) {
      checkOnboardingAndLoadTasks();
    }
  }, [user]);

  const checkOnboardingAndLoadTasks = async () => {
    if (!user) return;

    // Check if onboarding is complete
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

    // Get the start of the current week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", weekStartStr)
      .eq("is_completed", false) // Only fetch incomplete tasks
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
    // If completing a task, trigger celebration
    if (!currentState) {
      setCelebratingTaskId(taskId);
      
      // Haptic feedback
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
      // Update the task state immediately
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: !currentState, completed_at: !currentState ? new Date().toISOString() : null }
            : t
        )
      );
      
      // Update weekly progress for gamification
      if (!currentState) {
        updateWeeklyProgress("task");
        checkTotalBadges();
        
        // After celebration, fade out and remove the task from view
        setTimeout(() => {
          setFadingOutTaskIds(prev => new Set(prev).add(taskId));
          
          // Remove from list after fade animation
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

  // Count includes tasks that are fading out
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
    <div className="min-h-screen bg-background">
      {/* Celebration effects for task completion */}
      <CelebrationEffects
        trigger={celebratingTaskId !== null}
        type="confetti"
        duration={1500}
        onComplete={handleCelebrationComplete}
      />

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-calm-peach rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-calm-sage rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-display font-semibold">CalmMind</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/journal")}
            >
              <BookOpen className="w-4 h-4" />
              Journal
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="gap-2 shadow-lg"
              onClick={() => navigate("/panic")}
            >
              <AlertTriangle className="w-4 h-4" />
              Panic Mode
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-semibold mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-muted-foreground">
            Here are your personalized habits for this week.
          </p>
        </div>

        {/* Gamification section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <StreakDisplay 
            currentStreak={streak.currentStreak} 
            longestStreak={streak.longestStreak} 
          />
          <WeeklyAchievementCard
            moodsLogged={weeklyAchievement.moodsLogged}
            tasksCompleted={weeklyAchievement.tasksCompleted}
            journalsWritten={weeklyAchievement.journalsWritten}
            achievementUnlocked={weeklyAchievement.achievementUnlocked}
          />
        </div>

        {/* Badges */}
        <div className="mb-8">
          <BadgesShowcase earnedBadges={earnedBadges} />
        </div>

        {/* Mood section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <MoodCheckIn 
            onMoodLogged={handleMoodLogged} 
            onStreakUpdate={handleStreakUpdate}
            onWeeklyUpdate={handleWeeklyUpdate}
          />
          <MoodChart refreshTrigger={moodRefreshTrigger} />
        </div>

        {/* Week progress card */}
        <Card className="mb-8 border-0 shadow-warm bg-gradient-to-br from-card to-calm-cream/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{getWeekDateRange()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTasks}
                disabled={generating}
                className="gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {tasks.length === 0 ? "Generate Tasks" : "Regenerate"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Weekly Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {tasks.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            {progress === 100 && tasks.length > 0 && (
              <p className="text-sm text-calm-forest mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Amazing work! You've completed all your tasks this week!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks list */}
        {loading || generating ? (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg mb-4">
              {generating ? "Generating your personalized tasks..." : "Loading tasks..."}
            </h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-0 shadow-soft bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-5 h-5 rounded mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 && !showAddTask ? (
          <Card className="border-0 shadow-soft text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">
                Ready to start your week?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Let's generate personalized tasks based on your anxiety profile and goals.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={generateTasks} disabled={generating} className="gap-2">
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate My Tasks
                </Button>
                <Button variant="outline" onClick={() => setShowAddTask(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Custom Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Weekly Tasks</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddTask(!showAddTask)}
                className="gap-2"
              >
                {showAddTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddTask ? "Cancel" : "Add Task"}
              </Button>
            </div>

            {/* Add custom task form */}
            {showAddTask && (
              <Card className="border-0 shadow-soft bg-primary/5 animate-fade-in">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Task title (e.g., Practice deep breathing)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-background"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="bg-background resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddTask(false);
                        setNewTaskTitle("");
                        setNewTaskDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addCustomTask}
                      disabled={!newTaskTitle.trim() || addingTask}
                      className="gap-2"
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

            {tasks
              .filter(task => !task.is_completed || fadingOutTaskIds.has(task.id))
              .map((task, index) => {
                const isFadingOut = fadingOutTaskIds.has(task.id);
                const isCelebrating = celebratingTaskId === task.id;
                
                return (
                  <Card
                    key={task.id}
                    className={`border-0 shadow-soft transition-all duration-300 animate-fade-in relative overflow-hidden ${
                      isFadingOut 
                        ? "opacity-0 scale-95 -translate-x-4" 
                        : isCelebrating
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 ring-2 ring-green-500/50 scale-[1.02]"
                        : task.is_completed 
                        ? "bg-secondary/50" 
                        : "bg-card hover:shadow-md"
                    }`}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {isCelebrating && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />
                    )}
                    <CardContent className="p-4 relative">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                          disabled={isFadingOut || isCelebrating}
                          className={`mt-1 transition-transform ${isCelebrating ? "scale-110" : ""}`}
                          aria-label={`Mark "${task.title}" as ${task.is_completed ? "incomplete" : "complete"}`}
                        />
                        <div className="flex-1">
                          <h4
                            className={`font-medium transition-all ${
                              task.is_completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                        {isCelebrating && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 animate-bounce-in">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Done!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
