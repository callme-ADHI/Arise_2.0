import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const moodData = [
  { day: "Mon", mood: 4, energy: 3.5 },
  { day: "Tue", mood: 3.5, energy: 4 },
  { day: "Wed", mood: 4.5, energy: 4.5 },
  { day: "Thu", mood: 5, energy: 5 },
  { day: "Fri", mood: 3, energy: 3 },
  { day: "Sat", mood: 4, energy: 3.5 },
  { day: "Sun", mood: 4, energy: 4 },
];

const moodDistribution = [
  { mood: "Amazing", count: 8, color: "hsl(172 66% 50%)" },
  { mood: "Great", count: 12, color: "hsl(262 83% 58%)" },
  { mood: "Good", count: 15, color: "hsl(142 76% 36%)" },
  { mood: "Okay", count: 5, color: "hsl(38 92% 50%)" },
  { mood: "Low", count: 2, color: "hsl(0 84% 60%)" },
];

const MoodAnalytics = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Mood & Energy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(220 10% 46%)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(220 10% 46%)"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(224 28% 12%)",
                    border: "1px solid hsl(224 20% 18%)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="mood" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="energy" fill="hsl(172 66% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Mood Distribution (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moodDistribution.map((item) => {
              const total = moodDistribution.reduce((acc, i) => acc + i.count, 0);
              const percentage = Math.round((item.count / total) * 100);
              return (
                <div key={item.mood}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.mood}</span>
                    <span className="text-muted-foreground">
                      {item.count} days ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium mb-1">Mood Insight</p>
            <p className="text-xs text-muted-foreground">
              Your mood tends to peak on Thursdays after completing focus sessions.
              Wednesday journaling sessions correlate with better Thursday mood.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodAnalytics;
