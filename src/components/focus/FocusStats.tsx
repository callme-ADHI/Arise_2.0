import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Flame, Target, TrendingUp } from "lucide-react";

interface FocusStatsProps {
  sessionsCompleted: number;
}

const FocusStats = ({ sessionsCompleted }: FocusStatsProps) => {
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Today's Focus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm">Total Time</span>
          </div>
          <span className="font-bold">2h 35m</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm">Sessions</span>
          </div>
          <span className="font-bold">{sessionsCompleted}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-arise-energy" />
            <span className="text-sm">Streak</span>
          </div>
          <span className="font-bold text-arise-energy">5 days</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-arise-success" />
            <span className="text-sm">Avg. Quality</span>
          </div>
          <span className="font-bold text-arise-success">8.5/10</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusStats;
