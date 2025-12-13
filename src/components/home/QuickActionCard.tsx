import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  href: string;
  color: "primary" | "accent" | "energy" | "success";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary hover:bg-primary/20 hover:glow-sm",
  accent: "bg-accent/10 text-accent hover:bg-accent/20",
  energy: "bg-arise-energy/10 text-arise-energy hover:bg-arise-energy/20",
  success: "bg-arise-success/10 text-arise-success hover:bg-arise-success/20",
};

const QuickActionCard = ({
  icon: Icon,
  label,
  href,
  color,
}: QuickActionCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105",
        colorClasses[color]
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default QuickActionCard;
