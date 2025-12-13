import { Clock, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const scheduleItems = [
  {
    id: 1,
    time: "09:00",
    title: "Morning Review",
    type: "routine",
    completed: true,
  },
  {
    id: 2,
    time: "10:00",
    title: "Deep Work: Project Alpha",
    type: "focus",
    completed: true,
  },
  {
    id: 3,
    time: "12:00",
    title: "Team Standup",
    type: "meeting",
    completed: false,
  },
  {
    id: 4,
    time: "14:00",
    title: "Focus Session: Documentation",
    type: "focus",
    completed: false,
  },
  {
    id: 5,
    time: "16:00",
    title: "Evening Review & Planning",
    type: "routine",
    completed: false,
  },
];

const typeColors = {
  routine: "border-l-accent",
  focus: "border-l-primary",
  meeting: "border-l-arise-warning",
};

const TodaySchedule = () => {
  return (
    <Card className="glass">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Today's Schedule
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/calendar">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scheduleItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border-l-4 transition-all",
                typeColors[item.type as keyof typeof typeColors],
                item.completed && "opacity-60"
              )}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-arise-success shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium truncate",
                    item.completed && "line-through"
                  )}
                >
                  {item.title}
                </p>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
