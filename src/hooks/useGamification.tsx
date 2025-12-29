import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  type: "streak" | "mood_logs" | "journal" | "tasks";
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: "streak_3", name: "Getting Started", description: "3-day mood logging streak", emoji: "🌱", requirement: 3, type: "streak" },
  { id: "streak_7", name: "Week Warrior", description: "7-day mood logging streak", emoji: "🔥", requirement: 7, type: "streak" },
  { id: "streak_14", name: "Consistency Champion", description: "14-day mood logging streak", emoji: "⭐", requirement: 14, type: "streak" },
  { id: "streak_30", name: "Monthly Master", description: "30-day mood logging streak", emoji: "🏆", requirement: 30, type: "streak" },
  { id: "mood_10", name: "Mood Explorer", description: "Log 10 mood entries", emoji: "🧭", requirement: 10, type: "mood_logs" },
  { id: "mood_50", name: "Self-Aware", description: "Log 50 mood entries", emoji: "🪞", requirement: 50, type: "mood_logs" },
  { id: "journal_5", name: "Storyteller", description: "Write 5 journal entries", emoji: "📖", requirement: 5, type: "journal" },
  { id: "journal_20", name: "Reflective Soul", description: "Write 20 journal entries", emoji: "✨", requirement: 20, type: "journal" },
  { id: "tasks_10", name: "Task Tackler", description: "Complete 10 weekly tasks", emoji: "✅", requirement: 10, type: "tasks" },
  { id: "tasks_50", name: "Habit Hero", description: "Complete 50 weekly tasks", emoji: "🦸", requirement: 50, type: "tasks" },
];

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
}

interface WeeklyAchievement {
  moodsLogged: number;
  tasksCompleted: number;
  journalsWritten: number;
  achievementUnlocked: boolean;
}

export function useGamification() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastLogDate: null });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [weeklyAchievement, setWeeklyAchievement] = useState<WeeklyAchievement>({
    moodsLogged: 0,
    tasksCompleted: 0,
    journalsWritten: 0,
    achievementUnlocked: false,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const getWeekStart = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return weekStart.toISOString().split("T")[0];
  };

  const loadGamificationData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakData) {
        setStreak({
          currentStreak: streakData.current_streak,
          longestStreak: streakData.longest_streak,
          lastLogDate: streakData.last_log_date,
        });
      }

      // Load earned badges
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);

      if (badgesData) {
        setEarnedBadges(badgesData.map((b) => b.badge_id));
      }

      // Load or create weekly achievement
      const weekStart = getWeekStart();
      const { data: weeklyData } = await supabase
        .from("weekly_achievements")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (weeklyData) {
        setWeeklyAchievement({
          moodsLogged: weeklyData.moods_logged,
          tasksCompleted: weeklyData.tasks_completed,
          journalsWritten: weeklyData.journals_written,
          achievementUnlocked: weeklyData.achievement_unlocked,
        });
      }
    } catch (error) {
      console.error("Error loading gamification data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    try {
      // Get current streak data
      const { data: currentData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      let newStreak = 1;
      let longestStreak = 1;

      if (currentData) {
        // If already logged today, no update needed
        if (currentData.last_log_date === today) {
          return;
        }

        // If logged yesterday, increment streak
        if (currentData.last_log_date === yesterday) {
          newStreak = currentData.current_streak + 1;
        }
        
        longestStreak = Math.max(newStreak, currentData.longest_streak);

        await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_log_date: today,
          })
          .eq("user_id", user.id);
      } else {
        // First time logging
        await supabase.from("user_streaks").insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_log_date: today,
        });
      }

      setStreak({ currentStreak: newStreak, longestStreak, lastLogDate: today });

      // Check for streak badges
      await checkAndAwardBadges("streak", newStreak);
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const updateWeeklyProgress = async (type: "mood" | "task" | "journal") => {
    if (!user) return;

    const weekStart = getWeekStart();

    try {
      const { data: weeklyData } = await supabase
        .from("weekly_achievements")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();

      const currentData = weeklyData || {
        moods_logged: 0,
        tasks_completed: 0,
        journals_written: 0,
        achievement_unlocked: false,
      };

      const updates = {
        moods_logged: currentData.moods_logged + (type === "mood" ? 1 : 0),
        tasks_completed: currentData.tasks_completed + (type === "task" ? 1 : 0),
        journals_written: currentData.journals_written + (type === "journal" ? 1 : 0),
        achievement_unlocked: false,
      };

      // Check if weekly achievement is unlocked (logged mood 5+ days, completed 3+ tasks, wrote 2+ journals)
      if (updates.moods_logged >= 5 && updates.tasks_completed >= 3 && updates.journals_written >= 2) {
        updates.achievement_unlocked = true;
      }

      if (weeklyData) {
        await supabase
          .from("weekly_achievements")
          .update(updates)
          .eq("user_id", user.id)
          .eq("week_start", weekStart);
      } else {
        await supabase.from("weekly_achievements").insert({
          user_id: user.id,
          week_start: weekStart,
          ...updates,
        });
      }

      setWeeklyAchievement({
        moodsLogged: updates.moods_logged,
        tasksCompleted: updates.tasks_completed,
        journalsWritten: updates.journals_written,
        achievementUnlocked: updates.achievement_unlocked,
      });

      if (updates.achievement_unlocked && !currentData.achievement_unlocked) {
        toast({
          title: "🎉 Weekly Achievement Unlocked!",
          description: "You've completed all your weekly goals!",
        });
      }
    } catch (error) {
      console.error("Error updating weekly progress:", error);
    }
  };

  const checkAndAwardBadges = async (type: Badge["type"], count: number) => {
    if (!user) return;

    const eligibleBadges = AVAILABLE_BADGES.filter(
      (b) => b.type === type && b.requirement <= count && !earnedBadges.includes(b.id)
    );

    for (const badge of eligibleBadges) {
      try {
        await supabase.from("user_badges").insert({
          user_id: user.id,
          badge_id: badge.id,
        });

        setEarnedBadges((prev) => [...prev, badge.id]);

        toast({
          title: `${badge.emoji} Badge Earned!`,
          description: `${badge.name}: ${badge.description}`,
        });
      } catch (error) {
        console.error("Error awarding badge:", error);
      }
    }
  };

  const checkTotalBadges = async () => {
    if (!user) return;

    try {
      // Check mood count badges
      const { count: moodCount } = await supabase
        .from("mood_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (moodCount) {
        await checkAndAwardBadges("mood_logs", moodCount);
      }

      // Check journal count badges
      const { count: journalCount } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (journalCount) {
        await checkAndAwardBadges("journal", journalCount);
      }

      // Check completed tasks badges
      const { count: taskCount } = await supabase
        .from("weekly_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (taskCount) {
        await checkAndAwardBadges("tasks", taskCount);
      }
    } catch (error) {
      console.error("Error checking total badges:", error);
    }
  };

  return {
    streak,
    earnedBadges,
    weeklyAchievement,
    loading,
    updateStreak,
    updateWeeklyProgress,
    checkTotalBadges,
    refreshData: loadGamificationData,
  };
}
