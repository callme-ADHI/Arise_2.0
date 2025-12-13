import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  sentiment: string;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
}

const moodEmojis = ["", "😔", "😐", "🙂", "😊", "🤩"];
const sentimentColors = {
  positive: "border-l-arise-success",
  neutral: "border-l-arise-warning",
  mixed: "border-l-primary",
  negative: "border-l-destructive",
};

const JournalEntryCard = ({ entry }: JournalEntryCardProps) => {
  return (
    <Card
      className={cn(
        "glass border-l-4 hover:bg-secondary/30 transition-all cursor-pointer",
        sentimentColors[entry.sentiment as keyof typeof sentimentColors]
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{entry.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <span className="text-2xl">{moodEmojis[entry.mood]}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {entry.content}
        </p>
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalEntryCard;
