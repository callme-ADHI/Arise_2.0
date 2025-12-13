import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Flag, Calendar, MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  dueDate: string;
  category: string;
  subtasks: Subtask[];
}

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

const priorityColors = {
  high: "text-destructive",
  medium: "text-arise-warning",
  low: "text-arise-success",
};

const TaskItem = ({ task, onToggle }: TaskItemProps) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <Card
      className={cn(
        "glass p-4 transition-all hover:bg-secondary/30",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "font-medium",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm">
            <div
              className={cn(
                "flex items-center gap-1",
                priorityColors[task.priority as keyof typeof priorityColors]
              )}
            >
              <Flag className="w-3 h-3" />
              <span className="capitalize">{task.priority}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
              {task.category}
            </span>
          </div>

          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <ChevronRight className="w-3 h-3" />
              <span>
                {completedSubtasks}/{task.subtasks.length} subtasks
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskItem;
