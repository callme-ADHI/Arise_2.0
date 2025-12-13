import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const habits = ["Tasks", "Focus", "Journal", "Exercise", "Reading"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Generate mock data
const generateHeatmapData = () => {
  const data: { [key: string]: { [key: string]: number } } = {};
  habits.forEach((habit) => {
    data[habit] = {};
    days.forEach((day) => {
      data[habit][day] = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
    });
  });
  return data;
};

const heatmapData = generateHeatmapData();

const getIntensityClass = (value: number) => {
  if (value === 0) return "bg-secondary";
  if (value === 1) return "bg-primary/30";
  if (value === 2) return "bg-primary/60";
  return "bg-primary";
};

const HabitHeatmap = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Habit Completion Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-2"></th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground pb-2 px-1"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit}>
                    <td className="text-sm py-1 pr-4">{habit}</td>
                    {days.map((day) => (
                      <td key={day} className="p-1">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-md transition-all",
                            getIntensityClass(heatmapData[habit][day])
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-secondary" />
              <div className="w-4 h-4 rounded bg-primary/30" />
              <div className="w-4 h-4 rounded bg-primary/60" />
              <div className="w-4 h-4 rounded bg-primary" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Habit Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habits.map((habit) => {
            const completed = Object.values(heatmapData[habit]).filter(
              (v) => v > 0
            ).length;
            const percentage = Math.round((completed / 7) * 100);
            return (
              <div key={habit}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{habit}</span>
                  <span
                    className={cn(
                      percentage >= 70
                        ? "text-arise-success"
                        : percentage >= 50
                        ? "text-arise-warning"
                        : "text-destructive"
                    )}
                  >
                    {completed}/7 days ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      percentage >= 70
                        ? "bg-arise-success"
                        : percentage >= 50
                        ? "bg-arise-warning"
                        : "bg-destructive"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm font-medium mb-1">Consistency Tip</p>
            <p className="text-xs text-muted-foreground">
              Your reading habit drops on weekdays. Try linking it to an existing
              routine like morning coffee or commute time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitHeatmap;
