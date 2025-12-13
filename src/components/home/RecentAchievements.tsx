import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Zap, Target } from "lucide-react";

const achievements = [
  {
    id: 1,
    icon: Trophy,
    title: "Week Warrior",
    description: "7-day task streak",
    color: "text-arise-energy",
    bgColor: "bg-arise-energy/10",
  },
  {
    id: 2,
    icon: Star,
    title: "Focus Master",
    description: "10 hours this week",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 3,
    icon: Zap,
    title: "Quick Start",
    description: "First task by 9 AM",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const RecentAchievements = () => {
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-arise-energy" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-lg ${achievement.bgColor} flex items-center justify-center`}
            >
              <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
            </div>
            <div>
              <p className="font-medium text-sm">{achievement.title}</p>
              <p className="text-xs text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentAchievements;
