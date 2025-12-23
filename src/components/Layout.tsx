import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useRef, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import MobileBottomNav from "./MobileBottomNav";
import FunLogo from "./FunLogo";
import { useAuth } from "@/contexts/AuthContext";
import { refreshHabitTasks } from "@/lib/store";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { session } = useAuth();

  // Daily Habit Refresh
  useEffect(() => {
    if (session?.user?.id) {
      refreshHabitTasks(session.user.id);
    }
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-center px-4">
        <FunLogo />
      </div>

      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>

      {/* Main content */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        isExpanded ? "md:ml-56" : "md:ml-16"
      )}>
        <div className="p-4 md:p-6 pt-20 md:pt-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Layout;
