import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface MoodEntry {
  mood_score: number;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  score: number;
  emoji: string;
}

const MOODS = [
  { score: 1, emoji: "😢" },
  { score: 2, emoji: "😔" },
  { score: 3, emoji: "😐" },
  { score: 4, emoji: "🙂" },
  { score: 5, emoji: "😊" },
];

interface MoodChartProps {
  refreshTrigger: number;
}

export default function MoodChart({ refreshTrigger }: MoodChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [trend, setTrend] = useState<"up" | "down" | "stable" | null>(null);
  const [average, setAverage] = useState<number | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) loadMoodData();
  }, [user, timeRange, refreshTrigger]);

  const loadMoodData = async () => {
    if (!user) return;
    setLoading(true);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const { data: entries, error } = await supabase
      .from("mood_entries")
      .select("mood_score, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading mood data:", error);
      setLoading(false);
      return;
    }

    // Group by date and take the latest entry per day
    const dailyMoods = new Map<string, MoodEntry>();
    entries?.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyMoods.set(date, entry);
    });

    const chartData: ChartDataPoint[] = Array.from(dailyMoods.entries()).map(
      ([date, entry]) => ({
        date,
        score: entry.mood_score,
        emoji: MOODS.find((m) => m.score === entry.mood_score)?.emoji || "😐",
      })
    );

    setData(chartData);

    // Calculate trend and average
    if (chartData.length >= 2) {
      const recentAvg =
        chartData.slice(-3).reduce((sum, d) => sum + d.score, 0) /
        Math.min(3, chartData.length);
      const olderAvg =
        chartData.slice(0, -3).reduce((sum, d) => sum + d.score, 0) /
        Math.max(1, chartData.length - 3);

      if (recentAvg > olderAvg + 0.3) setTrend("up");
      else if (recentAvg < olderAvg - 0.3) setTrend("down");
      else setTrend("stable");

      setAverage(
        chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
      );
    } else if (chartData.length === 1) {
      setAverage(chartData[0].score);
      setTrend("stable");
    } else {
      setAverage(null);
      setTrend(null);
    }

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card px-3 py-2 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-medium">{data.date}</p>
          <p className="text-2xl">{data.emoji}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Mood Trends</CardTitle>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map((days) => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(days)}
                className="h-7 px-2 text-xs"
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No mood data yet.</p>
            <p className="text-xs">Start logging your mood to see trends!</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="flex gap-4 mb-4">
              {average !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {MOODS.find((m) => m.score === Math.round(average))?.emoji}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-sm font-medium">{average.toFixed(1)}/5</p>
                  </div>
                </div>
              )}
              {trend && (
                <div className="flex items-center gap-2">
                  {trend === "up" && (
                    <TrendingUp className="w-5 h-5 text-calm-forest" />
                  )}
                  {trend === "down" && (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                  {trend === "stable" && (
                    <Minus className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className="text-sm font-medium capitalize">{trend}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
