import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { AVAILABLE_BADGES, Badge as BadgeType } from "@/hooks/useGamification";

interface BadgesShowcaseProps {
  earnedBadges: string[];
}

export default function BadgesShowcase({ earnedBadges }: BadgesShowcaseProps) {
  const sortedBadges = AVAILABLE_BADGES.sort((a, b) => {
    const aEarned = earnedBadges.includes(a.id);
    const bEarned = earnedBadges.includes(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return 0;
  });

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Badges
          <Badge variant="secondary" className="ml-auto">
            {earnedBadges.length}/{AVAILABLE_BADGES.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {sortedBadges.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  earned ? "hover:scale-110" : "opacity-40 grayscale"
                }`}
                title={earned ? `${badge.name}: ${badge.description}` : `??? - ${badge.description}`}
              >
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl ${
                    earned
                      ? "bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/30"
                      : "bg-muted/50"
                  }`}
                >
                  {earned ? badge.emoji : "🔒"}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {earned ? badge.name : "???"}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
