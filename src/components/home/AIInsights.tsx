import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    id: 1,
    icon: TrendingUp,
    type: "prediction",
    message: "You're most productive between 10 AM - 12 PM. Schedule deep work then.",
    color: "text-arise-success",
  },
  {
    id: 2,
    icon: AlertCircle,
    type: "warning",
    message: "You tend to skip tasks on Fridays. Consider lighter workloads.",
    color: "text-arise-warning",
  },
  {
    id: 3,
    icon: Lightbulb,
    type: "suggestion",
    message: "Try a 5-minute journaling session to boost afternoon focus.",
    color: "text-primary",
  },
];

const AIInsights = () => {
  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Insights
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
            Powered by AI
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <insight.icon className={`w-5 h-5 ${insight.color} shrink-0 mt-0.5`} />
            <p className="text-sm">{insight.message}</p>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Brain className="w-4 h-4 mr-2" />
          Get More Insights
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
