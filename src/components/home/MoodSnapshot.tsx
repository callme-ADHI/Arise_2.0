import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Zap, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const moods = [
  { icon: Frown, label: "Low", value: 1, color: "text-destructive" },
  { icon: Meh, label: "Okay", value: 2, color: "text-arise-warning" },
  { icon: Smile, label: "Good", value: 3, color: "text-arise-success" },
  { icon: Zap, label: "Great", value: 4, color: "text-primary" },
  { icon: Heart, label: "Amazing", value: 5, color: "text-accent" },
];

const MoodSnapshot = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(3);

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col gap-1 h-auto py-2 px-3",
                selectedMood === mood.value && "bg-secondary"
              )}
              onClick={() => setSelectedMood(mood.value)}
            >
              <mood.icon
                className={cn(
                  "w-6 h-6 transition-all",
                  selectedMood === mood.value ? mood.color : "text-muted-foreground"
                )}
              />
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
        {selectedMood && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            You've been feeling{" "}
            <span className="font-medium text-foreground">
              {moods[selectedMood - 1]?.label.toLowerCase()}
            </span>{" "}
            today
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodSnapshot;
