import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, ArrowRight } from "lucide-react";

const BrainDump = () => {
  const [thoughts, setThoughts] = useState("");

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          Brain Dump
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Dump all your thoughts here... AI will help convert them into actionable tasks."
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!thoughts}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Convert to Tasks
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrainDump;
