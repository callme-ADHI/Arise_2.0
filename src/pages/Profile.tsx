import { useState, useEffect } from "react";
import { User, Moon, Sun, Trash2, Download, Upload, Shield, Bell, Target, Brain, Trophy, Zap, Star, Edit2, Save, Crown, Award, Medal, Gem, Rocket, Heart, Coffee, BookOpen, Dumbbell, Music, Hexagon, Activity, Power, Cpu, Database, Share2, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/ThemeProvider";
import { useStats, useApp, useAI, useAchievements, useTasks, useFocus, useJournal, useHabits, useDataManagement } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { calculateLevelInfo } from "@/lib/progression";
import { cn } from "@/lib/utils";

// Progressive achievements with tiers (Keep existing data structure)
const achievementTiers = [
  // Task achievements
  { id: "task_starter", title: "First Steps", description: "Complete 1 task", icon: "🎯", target: 1, category: "tasks", tier: 1 },
  { id: "task_10", title: "Getting Started", description: "Complete 10 tasks", icon: "✅", target: 10, category: "tasks", tier: 1 },
  { id: "task_50", title: "Task Warrior", description: "Complete 50 tasks", icon: "⚔️", target: 50, category: "tasks", tier: 2 },
  { id: "task_100", title: "Task Master", description: "Complete 100 tasks", icon: "🏆", target: 100, category: "tasks", tier: 2 },
  { id: "task_250", title: "Task Legend", description: "Complete 250 tasks", icon: "👑", target: 250, category: "tasks", tier: 3 },
  { id: "task_500", title: "Task Titan", description: "Complete 500 tasks", icon: "⭐", target: 500, category: "tasks", tier: 3 },
  { id: "task_1000", title: "Task Deity", description: "Complete 1000 tasks", icon: "💎", target: 1000, category: "tasks", tier: 4 },

  // Focus achievements
  { id: "focus_1h", title: "Focus Initiate", description: "1 hour focused", icon: "🧘", target: 60, category: "focus", tier: 1 },
  { id: "focus_5h", title: "Deep Thinker", description: "5 hours focused", icon: "🎯", target: 300, category: "focus", tier: 1 },
  { id: "focus_10h", title: "Focus Warrior", description: "10 hours focused", icon: "⚡", target: 600, category: "focus", tier: 2 },
  { id: "focus_25h", title: "Mind Master", description: "25 hours focused", icon: "🧠", target: 1500, category: "focus", tier: 2 },
  { id: "focus_50h", title: "Focus Legend", description: "50 hours focused", icon: "🔥", target: 3000, category: "focus", tier: 3 },
  { id: "focus_100h", title: "Zen Master", description: "100 hours focused", icon: "✨", target: 6000, category: "focus", tier: 4 },

  // Journal achievements
  { id: "journal_1", title: "First Entry", description: "Write 1 journal", icon: "📝", target: 1, category: "journal", tier: 1 },
  { id: "journal_10", title: "Reflector", description: "Write 10 journals", icon: "📔", target: 10, category: "journal", tier: 1 },
  { id: "journal_30", title: "Month of Reflection", description: "Write 30 journals", icon: "📚", target: 30, category: "journal", tier: 2 },
  { id: "journal_100", title: "Journal Master", description: "Write 100 journals", icon: "✍️", target: 100, category: "journal", tier: 3 },

  // Habit achievements
  { id: "habit_1", title: "Habit Starter", description: "Create 1 habit", icon: "🔄", target: 1, category: "habits", tier: 1 },
  { id: "habit_5", title: "Habit Builder", description: "Create 5 habits", icon: "🌱", target: 5, category: "habits", tier: 2 },
  { id: "habit_10", title: "Habit Master", description: "Create 10 habits", icon: "🌳", target: 10, category: "habits", tier: 3 },

  // Streak achievements
  { id: "streak_3", title: "On Fire", description: "3-day streak", icon: "🔥", target: 3, category: "streak", tier: 1 },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", icon: "💪", target: 7, category: "streak", tier: 2 },
  { id: "streak_14", title: "Fortnight Fighter", description: "14-day streak", icon: "⚔️", target: 14, category: "streak", tier: 2 },
  { id: "streak_30", title: "Monthly Champion", description: "30-day streak", icon: "🏅", target: 30, category: "streak", tier: 3 },
  { id: "streak_60", title: "Habit Master", description: "60-day streak", icon: "🎖️", target: 60, category: "streak", tier: 3 },
  { id: "streak_100", title: "Century Legend", description: "100-day streak", icon: "💯", target: 100, category: "streak", tier: 4 },

  // Level achievements
  { id: "level_5", title: "Rising Star", description: "Reach level 5", icon: "⭐", target: 5, category: "level", tier: 1 },
  { id: "level_10", title: "Dedicated", description: "Reach level 10", icon: "🌟", target: 10, category: "level", tier: 2 },
  { id: "level_25", title: "Committed", description: "Reach level 25", icon: "💫", target: 25, category: "level", tier: 3 },
  { id: "level_50", title: "Elite", description: "Reach level 50", icon: "👑", target: 50, category: "level", tier: 4 },
  { id: "level_100", title: "Legendary", description: "Reach level 100", icon: "💎", target: 100, category: "level", tier: 4 },
];

const TechCard = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={`relative group ${className}`}>
    {/* Tech Borders */}
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg group-hover:border-cyan-400 transition-colors" />
    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg group-hover:border-cyan-400 transition-colors" />
    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg group-hover:border-cyan-400 transition-colors" />
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg group-hover:border-cyan-400 transition-colors" />

    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

    <div className="relative h-full bg-[#0a0a0b]/80 backdrop-blur-md border border-white/5 rounded-lg p-6 overflow-hidden">
      {/* Scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

      {title && (
        <div className="flex items-center gap-2 mb-4 text-cyan-500/80 mb-6 font-mono text-xs tracking-[0.2em] uppercase">
          {Icon && <Icon className="w-4 h-4" />}
          {title}
          <div className="h-px flex-1 bg-cyan-500/20" />
        </div>
      )}
      {children}
    </div>
  </div>
);

const HoloStat = ({ label, value, icon: Icon, color = "cyan" }: { label: string, value: string | number, icon: any, color?: string }) => (
  <div className="flex flex-col items-center justify-center p-4 relative group">
    <div className={`absolute inset-0 bg-${color}-500/5 blur-xl group-hover:bg-${color}-500/10 transition-colors`} />
    <Icon className={`w-6 h-6 mb-2 text-${color}-500`} />
    <span className="text-2xl font-bold font-mono text-white tracking-widest">{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</span>
  </div>
);

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Lock } from "lucide-react";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const stats = useStats();
  const { state } = useApp();
  const { updateProfile } = useAI();
  const { achievements } = useAchievements();
  const { completedTasks } = useTasks();
  const { entries } = useJournal();
  const { habits } = useHabits();
  const { toast } = useToast();

  // Data Management Hook
  const { verifyPassword, deleteAllTasks, deleteAllJournals, deleteEverything, isLoading: isPurging } = useDataManagement();

  const [activeTab, setActiveTab] = useState<'status' | 'achievements' | 'config'>('status');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(state.userName);
  const [notifications, setNotifications] = useState({ tasks: true, focus: true, habits: true, insights: true });
  const [focusSettings, setFocusSettings] = useState({ defaultDuration: 25, breakDuration: 5, autoBreak: true });

  // Delete Dialog State
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [purgeStep, setPurgeStep] = useState<'verify' | 'select'>('verify');
  const [password, setPassword] = useState("");
  const [purgeError, setPurgeError] = useState("");

  const getAchievementStatus = (achievement: typeof achievementTiers[0]) => {
    let current = 0;
    switch (achievement.category) {
      case 'tasks': current = completedTasks.length; break;
      case 'focus': current = stats.totalFocusMinutes; break;
      case 'journal': current = entries.length; break;
      case 'habits': current = habits.length; break;
      case 'streak': current = Math.max(stats.currentTaskStreak, stats.currentFocusStreak, stats.currentJournalStreak); break;
      case 'level': current = stats.level; break;
    }
    return { current, unlocked: current >= achievement.target, progress: Math.min(100, (current / achievement.target) * 100) };
  };

  const unlockedAchievements = achievementTiers.filter(a => getAchievementStatus(a).unlocked);
  const lockedAchievements = achievementTiers.filter(a => !getAchievementStatus(a).unlocked);

  const saveName = () => {
    updateProfile({ name: editName });
    setIsEditingName(false);
    toast({ title: "IDENTITY UPDATED", description: "Operator profile re-calibrated." });
  };

  const handleVerifyPassword = async () => {
    if (!password) {
      setPurgeError("Password required");
      return;
    }
    setPurgeError("");
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setPurgeStep('select');
      } else {
        setPurgeError("Invalid password");
      }
    } catch (e) {
      setPurgeError("Verification failed");
    }
  };

  const handlePurge = async (type: 'tasks' | 'journals' | 'all') => {
    try {
      if (type === 'tasks') await deleteAllTasks();
      if (type === 'journals') await deleteAllJournals();
      if (type === 'all') await deleteEverything();
      setShowPurgeDialog(false);
      setPassword("");
      setPurgeStep('verify');
    } catch (e) {
      toast({ title: "Purge Failed", description: "System lock engaged.", variant: "destructive" });
    }
  };

  const navItems = [
    { id: 'status', label: 'STATUS', icon: Activity },
    { id: 'achievements', label: 'LEGACY', icon: Trophy },
    { id: 'config', label: 'SYSTEM', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">

        {/* Navigation Rail */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <TechCard className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#00f0ff]" />
              <span className="font-mono text-xs text-cyan-500 tracking-[0.2em]">ONLINE</span>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-300 relative group overflow-hidden ${activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-muted-foreground hover:text-cyan-200 hover:bg-white/5'
                    }`}
                >
                  {activeTab === item.id && (
                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span className="font-mono text-sm tracking-widest">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Mini User Data */}
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-xl font-bold text-cyan-400 font-mono">
                  {state.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate text-cyan-100">{state.userName}</h3>
                  <p className="text-xs text-cyan-500/70 font-mono">LVL {stats.level}</p>
                </div>
              </div>
            </div>
          </TechCard>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar"
              >
                {/* Hero Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TechCard className="aspect-video md:aspect-auto flex items-center justify-center">
                    <HoloStat label="Tasks" value={stats.completedTasks} icon={Target} color="cyan" />
                  </TechCard>
                  <TechCard className="aspect-video md:aspect-auto flex items-center justify-center">
                    <HoloStat label="Focus (h)" value={Math.floor(stats.totalFocusMinutes / 60)} icon={Brain} color="indigo" />
                  </TechCard>
                  <TechCard className="aspect-video md:aspect-auto flex items-center justify-center">
                    <HoloStat label="Streak" value={Math.max(stats.currentTaskStreak, stats.currentFocusStreak) + "d"} icon={Zap} color="amber" />
                  </TechCard>
                  <TechCard className="aspect-video md:aspect-auto flex items-center justify-center">
                    <HoloStat label="XP" value={stats.xp} icon={Star} color="purple" />
                  </TechCard>
                </div>

                {/* Level Progress */}
                <TechCard title="RANK AUTHORIZATION" icon={Shield}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center text-4xl font-black border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                        calculateLevelInfo(stats.xp).rank === 'S' ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-amber-500/20" :
                          calculateLevelInfo(stats.xp).rank === 'A' ? "bg-red-500/10 border-red-500 text-red-500 shadow-red-500/20" :
                            calculateLevelInfo(stats.xp).rank === 'B' ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-indigo-500/20" :
                              calculateLevelInfo(stats.xp).rank === 'C' ? "bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-cyan-500/20" :
                                calculateLevelInfo(stats.xp).rank === 'D' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-emerald-500/20" :
                                  "bg-zinc-500/10 border-zinc-500 text-zinc-500"
                      )}>
                        {calculateLevelInfo(stats.xp).rank}
                      </div>
                      <div>
                        <h3 className={cn("text-xl font-bold tracking-widest uppercase",
                          calculateLevelInfo(stats.xp).rank === 'S' ? "text-amber-400" :
                            calculateLevelInfo(stats.xp).rank === 'A' ? "text-red-400" :
                              calculateLevelInfo(stats.xp).rank === 'B' ? "text-indigo-400" :
                                calculateLevelInfo(stats.xp).rank === 'C' ? "text-cyan-400" :
                                  calculateLevelInfo(stats.xp).rank === 'D' ? "text-emerald-400" :
                                    "text-zinc-400"
                        )}>{calculateLevelInfo(stats.xp).rankTitle}</h3>
                        <p className="font-mono text-xs text-muted-foreground">Level {calculateLevelInfo(stats.xp).level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold font-mono text-white">{stats.xp}</span>
                      <span className="text-xs text-muted-foreground block">TOTAL XP</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-cyan-500/60">
                      <span>PROGRESS TO LVL {calculateLevelInfo(stats.xp).level + 1}</span>
                      <span>{calculateLevelInfo(stats.xp).currentLevelXp} / 100 XP</span>
                    </div>
                    <Progress value={calculateLevelInfo(stats.xp).progress} className="h-2 bg-zinc-900" indicatorClassName={cn("shadow-[0_0_10px_currentColor]",
                      calculateLevelInfo(stats.xp).rank === 'S' ? "bg-amber-500 text-amber-500" :
                        calculateLevelInfo(stats.xp).rank === 'A' ? "bg-red-500 text-red-500" :
                          calculateLevelInfo(stats.xp).rank === 'B' ? "bg-indigo-500 text-indigo-500" :
                            calculateLevelInfo(stats.xp).rank === 'C' ? "bg-cyan-500 text-cyan-500" :
                              calculateLevelInfo(stats.xp).rank === 'D' ? "bg-emerald-500 text-emerald-500" : "bg-zinc-500 text-zinc-500"
                    )} />
                  </div>
                </TechCard>

                {/* Identity Management */}
                <TechCard title="OPERATOR IDENTITY" icon={User}>
                  <div className="flex items-center gap-4">
                    {isEditingName ? (
                      <div className="flex gap-2 w-full max-w-sm">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-cyan-950/30 border-cyan-500/50 text-cyan-100 font-mono"
                          onKeyDown={(e) => e.key === 'Enter' && saveName()}
                        />
                        <Button onClick={saveName} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30">
                          NOITIFY
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <span className="text-xl text-white font-mono tracking-wider">{state.userName}</span>
                          <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono rounded">
                            ID: #OP-001
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TechCard>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6"
              >
                <TechCard title="ACQUIRED ASSETS" icon={Trophy}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {unlockedAchievements.map(achievement => (
                      <div key={achievement.id} className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded hover:border-cyan-400/50 transition-colors group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{achievement.icon}</div>
                        <h4 className="text-xs font-bold text-cyan-100 mb-1">{achievement.title}</h4>
                        <p className="text-[10px] text-cyan-500/70 leading-tight">{achievement.description}</p>
                      </div>
                    ))}
                    {unlockedAchievements.length === 0 && (
                      <div className="col-span-full py-12 text-center text-cyan-500/40 font-mono text-sm">
                        NO ASSETS ACQUIRED. INITIATE MISSIONS.
                      </div>
                    )}
                  </div>
                </TechCard>

                <TechCard title="PENDING UNLOCKS" icon={Target}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedAchievements.slice(0, 6).map(achievement => {
                      const status = getAchievementStatus(achievement);
                      return (
                        <div key={achievement.id} className="flex items-center gap-4 p-3 border border-white/5 rounded bg-black/40">
                          <div className="text-2xl opacity-30 grayscale">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium text-muted-foreground">{achievement.title}</span>
                              <span className="text-xs font-mono text-cyan-500">{status.current}/{achievement.target}</span>
                            </div>
                            <Progress value={status.progress} className="h-1 bg-white/5" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TechCard>
              </motion.div>
            )}

            {activeTab === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6"
              >
                <TechCard title="VISUAL PARAMETERS" icon={Sun}>
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <p className="font-mono text-sm text-cyan-100">INTERFACE MODE</p>
                      <p className="text-xs text-cyan-500/60">System locked to Dark Mode (Premium)</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-4 py-2 text-xs font-mono border bg-cyan-500 text-black border-cyan-500 opacity-50 cursor-not-allowed">LIGHT</div>
                      <div className="px-4 py-2 text-xs font-mono border bg-cyan-950 text-cyan-500 border-cyan-500 shadow-[0_0_10px_#00f0ff] flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        DARK CORE
                      </div>
                    </div>
                  </div>
                </TechCard>

                <TechCard title="ALERT PROTOCOLS" icon={Bell}>
                  {Object.entries({ tasks: "MISSION UPDATES", focus: "SESSION ALERTS", habits: "ROUTINE PINGS", insights: "AI ANALYSIS" }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-sm font-mono text-cyan-200/80">{label}</span>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                        className="scale-90 data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                  ))}
                </TechCard>

                <TechCard title="CHRONO SETTINGS" icon={Power}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-cyan-500 mb-2">
                        <span>FOCUS DURATION</span>
                        <span>{focusSettings.defaultDuration} MIN</span>
                      </div>
                      <Slider
                        value={[focusSettings.defaultDuration]}
                        onValueChange={([v]) => setFocusSettings({ ...focusSettings, defaultDuration: v })}
                        max={60} min={5} step={5}
                        className="[&_.bg-primary]:bg-cyan-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono text-cyan-500 mb-2">
                        <span>RECHARGE CYCLE</span>
                        <span>{focusSettings.breakDuration} MIN</span>
                      </div>
                      <Slider
                        value={[focusSettings.breakDuration]}
                        onValueChange={([v]) => setFocusSettings({ ...focusSettings, breakDuration: v })}
                        max={30} min={1} step={1}
                        className="[&_.bg-primary]:bg-cyan-500"
                      />
                    </div>
                  </div>
                </TechCard>

                <TechCard title="DATA CORE" icon={Database} className="border-red-900/30">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-mono" onClick={() => toast({ title: "EXPORT INITIATED", description: "Archiving neural patterns..." })}>
                      <Download className="w-4 h-4 mr-2" /> EXPORT
                    </Button>

                    <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-500/30 hover:bg-red-500/10 text-red-400 font-mono">
                          <Trash2 className="w-4 h-4 mr-2" /> PURGE
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-red-500/20 bg-zinc-950 text-white font-mono sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            DANGER ZONE: DATA PURGE
                          </DialogTitle>
                          <DialogDescription className="text-zinc-500 text-xs">
                            Security Protocol Alpha-1 engaged. Authorization required for destructive commands.
                          </DialogDescription>
                        </DialogHeader>

                        {purgeStep === 'verify' && (
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-red-300">ENTER ACCESS CODE (PASSWORD)</Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="pl-9 bg-black border-red-900/50 text-red-100 placeholder:text-red-900/50"
                                  placeholder="••••••••••••"
                                />
                              </div>
                              {purgeError && <p className="text-red-500 text-xs animate-pulse">{purgeError}</p>}
                            </div>
                            <Button className="w-full bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50" onClick={handleVerifyPassword}>
                              VERIFY CLEARANCE
                            </Button>
                          </div>
                        )}

                        {purgeStep === 'select' && (
                          <div className="space-y-3 py-4">
                            <p className="text-xs text-zinc-400 mb-2">ACCESS GRANTED. SELECT TARGET:</p>

                            <Button
                              variant="outline"
                              className="w-full justify-start text-zinc-300 hover:text-red-400 hover:bg-red-950/30 border-zinc-800"
                              onClick={() => handlePurge('tasks')}
                              disabled={isPurging}
                            >
                              [1] DELETE ALL TASKS & FOCUS LOGS
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full justify-start text-zinc-300 hover:text-red-400 hover:bg-red-950/30 border-zinc-800"
                              onClick={() => handlePurge('journals')}
                              disabled={isPurging}
                            >
                              [2] DELETE ALL JOURNAL ENTRIES
                            </Button>

                            <div className="w-full h-px bg-red-900/30 my-2" />

                            <Button
                              variant="destructive"
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest"
                              onClick={() => handlePurge('all')}
                              disabled={isPurging}
                            >
                              [3] WIPE ALL SYSTEM DATA
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TechCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Profile;