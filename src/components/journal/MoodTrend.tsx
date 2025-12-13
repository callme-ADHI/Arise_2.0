import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const moodData = [
  { day: "Mon", mood: 4 },
  { day: "Tue", mood: 3 },
  { day: "Wed", mood: 4 },
  { day: "Thu", mood: 5 },
  { day: "Fri", mood: 3 },
  { day: "Sat", mood: 4 },
  { day: "Sun", mood: 4 },
];

const MoodTrend = () => {
  const maxMood = 5;

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-arise-success" />
          Mood This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-24 gap-1">
          {moodData.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-primary/60 to-primary transition-all"
                style={{ height: `${(item.mood / maxMood) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Weekly Average</span>
          <span className="font-bold text-arise-success">3.9 / 5</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTrend;
