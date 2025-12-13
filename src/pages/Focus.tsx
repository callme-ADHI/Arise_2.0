import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, RotateCcw, Brain, Zap, Moon, Coffee,
  Volume2, CheckCircle2, Music2, Layers, Maximize2, Minimize2,
  ChevronRight, ChevronLeft, Hexagon, Trophy, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useFocus, useTasks, useStats } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const MODES = [
  { id: "deep", name: "Deep Work", duration: 50, icon: Brain, color: "text-blue-500", glow: "shadow-blue-500/50" },
  { id: "pomodoro", name: "Pomodoro", duration: 25, icon: Hexagon, color: "text-amber-500", glow: "shadow-amber-500/50" },
  { id: "sprint", name: "Sprint", duration: 15, icon: Zap, color: "text-cyan-500", glow: "shadow-cyan-500/50" },
  { id: "calm", name: "Calm", duration: 45, icon: Moon, color: "text-violet-500", glow: "shadow-violet-500/50" },
  { id: "break", name: "Break", duration: 5, icon: Coffee, color: "text-emerald-500", glow: "shadow-emerald-500/50" },
];

const SOUNDS = [
  { id: "rain", name: "Heavy Rain", color: "bg-blue-950" },
  { id: "forest", name: "Deep Forest", color: "bg-emerald-950" },
  { id: "cafe", name: "Night Cafe", color: "bg-amber-950" },
  { id: "waves", name: "Ocean Waves", color: "bg-cyan-950" },
];

// --- Components ---

const BreathingHalo = ({ progress, isRunning, modeColor }: { progress: number, isRunning: boolean, modeColor: string }) => {
  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Outer Pulsing Rings */}
      <motion.div
        animate={isRunning ? { scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute inset-0 rounded-full border border-white/10 opacity-20 blur-xl", modeColor.replace("text-", "bg-"))}
      />
      <motion.div
        animate={isRunning ? { scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={cn("absolute inset-10 rounded-full border border-current opacity-10", modeColor)}
      />

      {/* Main Progress Ring */}
      <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
        <circle cx="250" cy="250" r="180" className="stroke-white/5" strokeWidth="2" fill="transparent" />
        <motion.circle
          cx="250" cy="250" r="180"
          className={cn("stroke-current transition-colors duration-1000", modeColor)}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDasharray: 2 * Math.PI * 180, strokeDashoffset: 2 * Math.PI * 180 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 180 * (1 - progress / 100) }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </svg>

      {/* Inner Glow Content */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("absolute inset-0 rounded-full blur-[100px] opacity-20", modeColor.replace("text-", "bg-"))}
        />
      )}
    </div>
  );
};

const Focus = () => {
  const { sessions, todaySessions, startSession, completeSession } = useFocus();
  const { pendingTasks, tasks } = useTasks();
  const stats = useStats();
  const { toast } = useToast();

  // State
  const [selectedMode, setSelectedMode] = useState("pomodoro");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const [isZenMode, setIsZenMode] = useState(false);

  // Panels
  const [showTasks, setShowTasks] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMode = MODES.find((m) => m.id === selectedMode) || MODES[0];
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // --- Logic ---
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (ambientSound) {
      const audio = new Audio(`/sounds/${ambientSound}.mp3`);
      audio.loop = true;
      audio.volume = volume[0] / 100;
      audio.play().catch(() => { });
      audioRef.current = audio;
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [ambientSound]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume[0] / 100; }, [volume]);

  // Auto-Zen Mode
  useEffect(() => {
    if (isRunning) {
      const t = setTimeout(() => setIsZenMode(true), 15000); // Enter zen mode after 15s of focus
      return () => clearTimeout(t);
    } else {
      setIsZenMode(false);
    }
  }, [isRunning]);

  const handleStart = () => {
    if (!currentSessionId) {
      const sid = crypto.randomUUID();
      startSession({ mode: selectedMode, duration: totalTime, completedDuration: 0, completed: false, taskId: selectedTaskId !== "none" ? selectedTaskId : undefined, taskTitle: selectedTask?.title });
      setCurrentSessionId(sid);
    }
    setIsRunning(true);
  };

  const handleComplete = () => {
    setIsRunning(false);
    setIsZenMode(false);
    const completedDuration = totalTime - timeLeft;
    const mins = Math.floor(completedDuration / 60);
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) completeSession({ ...session, completedDuration, interruptions: 0 });
    }
    toast({ title: "Session Complete", description: `+${mins * 5} XP Gained`, className: "bg-zinc-950 border-zinc-800 text-white" });
    setTimeLeft(totalTime);
    setCurrentSessionId(null);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return { mins, secs };
  };

  const { mins, secs } = formatTime(timeLeft);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-white/20">

      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: isZenMode ? 0.4 : 0.8 }}>
        <div className={cn("absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 animate-pulse-slow transition-colors duration-1000", currentMode.color.replace("text-", "bg-"))} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Top Bar: Stats */}
      <motion.div
        initial={{ y: -50, opacity: 0 }} animate={{ y: isZenMode ? -100 : 0, opacity: isZenMode ? 0 : 1 }}
        className="relative z-10 flex justify-between items-center p-8"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium">Focus Streak</span>
            <span className="text-xl font-light text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" /> {stats.currentFocusStreak} <span className="text-sm text-zinc-600">Days</span>
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium">Today's Focus</span>
            <span className="text-xl font-light text-white">
              {Math.floor(todaySessions.reduce((a, b) => a + b.completedDuration, 0) / 60)} <span className="text-sm text-zinc-600">Min</span>
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsZenMode(!isZenMode)} className="text-zinc-500 hover:text-white transition-colors">
          {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      </motion.div>


      {/* Main Stage: The Clock */}
      <div className="flex-1 flex items-center justify-center relative z-0">
        <div className="relative flex flex-col items-center justify-center">
          <BreathingHalo progress={progress} isRunning={isRunning} modeColor={currentMode.color} />

          {/* Digital Time Display (Centered) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={selectedMode}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-baseline gap-1 font-extralight tracking-tighter text-white tabular-nums drop-shadow-2xl md:text-[8rem] text-6xl">
                <span>{mins}</span>
                <span className={cn("animate-pulse text-zinc-600", isRunning && "text-white")}>:</span>
                <span>{secs}</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={cn("bg-white/5 border border-white/5 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 mt-4", isRunning ? "opacity-100" : "opacity-0")}
              >
                <div className={cn("w-2 h-2 rounded-full animate-pulse", currentMode.color.replace("text-", "bg-"))} />
                <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">{selectedTask ? selectedTask.title : currentMode.name}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>


      {/* Bottom Bar: Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: isZenMode ? 150 : 0, opacity: isZenMode ? 0 : 1 }}
        className="relative z-10 flex justify-center pb-12"
      >
        <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-2 rounded-full shadow-2xl hover:border-white/10 transition-colors">

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 pr-4 border-r border-white/5">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => { if (!isRunning) { setSelectedMode(mode.id); setTotalTime(mode.duration * 60); setTimeLeft(mode.duration * 60); } }}
                disabled={isRunning}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50",
                  selectedMode === mode.id
                    ? cn("bg-white/10 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]", mode.color)
                    : "text-zinc-600 hover:text-white hover:bg-white/5"
                )}
              >
                <mode.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Main Play Controls */}
          <div className="flex items-center gap-3 px-2">
            <Button
              variant="ghost"
              className="w-12 h-12 rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={() => { setIsRunning(false); setTimeLeft(totalTime); }}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              className={cn(
                "w-16 h-16 rounded-full transition-all duration-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95",
                isRunning ? "bg-white text-black hover:bg-zinc-200" : currentMode.color.replace("text-", "bg-") + " text-white"
              )}
              onClick={isRunning ? () => setIsRunning(false) : handleStart}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </Button>

            <Button
              variant="ghost"
              className={cn("w-12 h-12 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500", !currentSessionId ? "text-zinc-700 pointer-events-none" : "text-zinc-400")}
              onClick={handleComplete}
            >
              <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Side Panels Toggles */}
          <div className="flex items-center gap-1 pl-4 border-l border-white/5">
            <Button variant="ghost" size="icon" className={cn("rounded-full", showAudio && "text-blue-400 bg-blue-400/10")} onClick={() => setShowAudio(!showAudio)}>
              <Music2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("rounded-full", showTasks && "text-amber-400 bg-amber-400/10")} onClick={() => setShowTasks(!showTasks)}>
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>


      {/* Drawer: Tasks */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 z-20 shadow-2xl h-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2"><Layers className="w-4 h-4" /> Select Mission</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500" onClick={() => setShowTasks(false)}><ChevronLeft className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              <button
                onClick={() => setSelectedTaskId("none")}
                className={cn("w-full text-left px-3 py-3 rounded-lg text-xs font-medium transition-colors border", selectedTaskId === "none" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-transparent text-zinc-500 hover:bg-white/5")}
              >
                -- Freestyle Focus --
              </button>
              {pendingTasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={cn("w-full text-left px-3 py-3 rounded-lg text-xs font-medium transition-colors border flex items-center justify-between group", selectedTaskId === t.id ? "bg-amber-500/10 border-amber-500/20 text-amber-200" : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10")}
                >
                  <span className="truncate">{t.title}</span>
                  {t.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer: Audio */}
      <AnimatePresence>
        {showAudio && (
          <motion.div
            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 z-20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-white flex items-center gap-2"><Music2 className="w-4 h-4" /> Soundscape</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500" onClick={() => setShowAudio(false)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {SOUNDS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setAmbientSound(ambientSound === s.id ? null : s.id)}
                  className={cn(
                    "h-20 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300",
                    ambientSound === s.id
                      ? cn("border-blue-500/50 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]", s.color)
                      : "border-white/5 bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800"
                  )}
                >
                  {ambientSound === s.id && <Volume2 className="w-5 h-5 animate-pulse" />}
                  <span className="text-xs font-medium">{s.name}</span>
                </button>
              ))}
            </div>
            {ambientSound && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span>Volume</span>
                  <span>{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="py-2" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Focus;
