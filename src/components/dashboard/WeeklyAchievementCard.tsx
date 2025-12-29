import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Check } from "lucide-react";

interface WeeklyAchievementCardProps {
  moodsLogged: number;
  tasksCompleted: number;
  journalsWritten: number;
  achievementUnlocked: boolean;
}

const GOALS = {
  moods: 5,
  tasks: 3,
  journals: 2,
};

export default function WeeklyAchievementCard({
  moodsLogged,
  tasksCompleted,
  journalsWritten,
  achievementUnlocked,
}: WeeklyAchievementCardProps) {
  const goals = [
    { label: "Mood Check-ins", current: moodsLogged, target: GOALS.moods, emoji: "😊" },
    { label: "Tasks Completed", current: tasksCompleted, target: GOALS.tasks, emoji: "✅" },
    { label: "Journal Entries", current: journalsWritten, target: GOALS.journals, emoji: "📝" },
  ];

  const totalProgress = goals.reduce((acc, g) => acc + Math.min(g.current / g.target, 1), 0) / goals.length * 100;

  return (
    <Card className={`border-0 shadow-soft transition-all ${
      achievementUnlocked 
        ? "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 ring-2 ring-green-500/30" 
        : "bg-card"
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Weekly Goals
          {achievementUnlocked && (
            <span className="ml-auto text-sm font-normal text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Completed!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const completed = goal.current >= goal.target;
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          
          return (
            <div key={goal.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{goal.emoji}</span>
                  <span className={completed ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                    {goal.label}
                  </span>
                </span>
                <span className={`font-medium ${completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                  {goal.current}/{goal.target}
                </span>
              </div>
              <Progress 
                value={progress} 
                className={`h-2 ${completed ? "[&>div]:bg-green-500" : ""}`} 
              />
            </div>
          );
        })}

        {achievementUnlocked && (
          <div className="pt-2 text-center">
            <span className="text-2xl">🎉</span>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
              Amazing work this week!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
