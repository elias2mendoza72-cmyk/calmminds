import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆";
    if (streak >= 14) return "⭐";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "🌱";
    return "✨";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Incredible dedication!";
    if (streak >= 14) return "Two weeks strong!";
    if (streak >= 7) return "Week warrior!";
    if (streak >= 3) return "Building momentum!";
    if (streak >= 1) return "Keep it going!";
    return "Start your streak today!";
  };

  return (
    <Card className="border-0 shadow-warm bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-display font-bold">{currentStreak}</span>
                <span className="text-lg">{getStreakEmoji(currentStreak)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Best: {longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getStreakMessage(currentStreak)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
