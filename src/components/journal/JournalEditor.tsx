import { useState } from "react";
import { X, Save, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface JournalEditorProps {
  onClose: () => void;
}

const moodOptions = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

const JournalEditor = ({ onClose }: JournalEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please add a title and content to your entry.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Entry saved!",
      description: "Your journal entry has been saved successfully.",
    });
    onClose();
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput.toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Card className="glass animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">New Journal Entry</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            How are you feeling?
          </label>
          <div className="flex gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={mood === option.value ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setMood(option.value)}
              >
                <span className="text-lg mr-1">{option.emoji}</span>
                <span className="hidden md:inline text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-2 block">Title</label>
          <Input
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            What's on your mind?
          </label>
          <Textarea
            placeholder="Write freely... Let your thoughts flow."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button variant="outline" onClick={addTag}>
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 glow" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </div>

        {/* AI Assist */}
        <Button variant="ghost" size="sm" className="w-full text-primary">
          <Sparkles className="w-4 h-4 mr-2" />
          Get AI writing suggestions
        </Button>
      </CardContent>
    </Card>
  );
};

export default JournalEditor;
