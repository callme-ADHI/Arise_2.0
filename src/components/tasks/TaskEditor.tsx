import { useState } from "react";
import { X, Save, Plus, Calendar, Flag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TaskEditorProps {
  onClose: () => void;
}

const TaskEditor = ({ onClose }: TaskEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!title) {
      toast({
        title: "Missing title",
        description: "Please add a title to your task.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task created!",
      description: "Your task has been added successfully.",
    });
    onClose();
  };

  const addSubtask = () => {
    if (subtaskInput) {
      setSubtasks([...subtasks, subtaskInput]);
      setSubtaskInput("");
    }
  };

  return (
    <Card className="glass animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">New Task</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-2 block">Task Title</label>
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Description (optional)
          </label>
          <Textarea
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <Flag className="w-3 h-3 text-destructive" /> High
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <Flag className="w-3 h-3 text-arise-warning" /> Medium
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <Flag className="w-3 h-3 text-arise-success" /> Low
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Due Date</label>
          <Input type="date" />
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-sm font-medium mb-2 block">Subtasks</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSubtask())
              }
              className="flex-1"
            />
            <Button variant="outline" onClick={addSubtask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm"
                >
                  <span className="flex-1">{subtask}</span>
                  <button
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, i) => i !== index))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
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
            Create Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskEditor;
