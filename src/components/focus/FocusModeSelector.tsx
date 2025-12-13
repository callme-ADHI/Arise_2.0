import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mode {
  id: string;
  name: string;
  duration: number;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface FocusModeSelectorProps {
  modes: Mode[];
  selectedMode: string;
  onSelectMode: (modeId: string) => void;
}

const FocusModeSelector = ({
  modes,
  selectedMode,
  onSelectMode,
}: FocusModeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {modes.map((mode) => (
        <Card
          key={mode.id}
          className={cn(
            "glass p-4 cursor-pointer transition-all hover:scale-105",
            selectedMode === mode.id && "ring-2 ring-primary glow-sm"
          )}
          onClick={() => onSelectMode(mode.id)}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <mode.icon className={cn("w-6 h-6", mode.color)} />
            <span className="font-medium text-sm">{mode.name}</span>
            <span className="text-xs text-muted-foreground">
              {mode.duration} min
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FocusModeSelector;
