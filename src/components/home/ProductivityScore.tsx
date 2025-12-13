import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProductivityScoreProps {
  score: number;
  change: number;
}

const ProductivityScore = ({ score, change }: ProductivityScoreProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="glass overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Today's Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-bold gradient-text">{score}%</div>
          <div
            className={cn(
              "flex items-center gap-1 text-sm mb-2",
              isPositive ? "text-arise-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change}% from yesterday
            </span>
          </div>
        </div>
        <Progress value={score} className="mt-4 h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Tasks: 4/6 completed</span>
          <span>Focus: 2.5 hrs</span>
          <span>Goals: 2/3 on track</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityScore;
