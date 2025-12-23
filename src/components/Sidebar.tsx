import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Home, BookOpen, CheckSquare, Target, Calendar, BarChart3, User, Sparkles, Repeat, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useStats } from "@/lib/store";
import FunLogo from "./FunLogo";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Habits", href: "/habits", icon: Repeat },
  { name: "Focus", href: "/focus", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

const Sidebar = ({ isOpen, onClose, isExpanded, setIsExpanded }: SidebarProps) => {
  const stats = useStats();
  const [isHovering, setIsHovering] = useState(false);

  const expanded = isExpanded || isHovering;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          expanded ? "w-56" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("flex items-center h-14 px-3 border-b border-border", expanded ? "justify-between" : "justify-center")}>
            <div className={`flex items-center gap-2 ${expanded ? "w-full" : ""}`}>
              {expanded ? (
                <FunLogo showText={true} />
              ) : (
                <FunLogo showText={false} />
              )}
            </div>
            {expanded && (
              <Button variant="ghost" size="icon" className="h-7 w-7 hidden md:flex" onClick={() => setIsExpanded(!isExpanded)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    !expanded && "justify-center px-2"
                  )
                }
                title={!expanded ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {expanded && <span className="whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-border">
            {expanded ? (
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Level {stats.level}</span>
                  <span className="text-xs font-medium">{stats.xp} XP</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.xp % 100}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2">
                <span className="text-xs font-bold">{stats.level}</span>
                <div className="w-8 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${stats.xp % 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
