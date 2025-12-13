import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, RefreshCw } from "lucide-react";

const prompts = [
  {
    category: "Gratitude",
    prompt: "What are three things you're grateful for today?",
  },
  {
    category: "Reflection",
    prompt: "What was the most challenging part of your day and how did you handle it?",
  },
  {
    category: "Growth",
    prompt: "What's one thing you learned about yourself this week?",
  },
  {
    category: "Goals",
    prompt: "What's one small step you can take tomorrow toward your biggest goal?",
  },
  {
    category: "Mindfulness",
    prompt: "Describe your current emotional state without judgment.",
  },
];

const JournalPrompts = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-arise-warning" />
          Writing Prompts
        </h3>
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3">
        {prompts.map((item, index) => (
          <Card
            key={index}
            className="glass hover:bg-secondary/50 transition-all cursor-pointer group"
          >
            <CardContent className="p-4">
              <span className="text-xs text-primary font-medium">
                {item.category}
              </span>
              <p className="mt-1 text-sm">{item.prompt}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Use this prompt
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JournalPrompts;
