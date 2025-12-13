import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Target, BookOpen, TrendingUp, Flame, Clock, CheckCircle2, Brain, Repeat, ArrowRight, Calendar as CalendarIcon, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTasks, useStats, useMood, useHabits, useFocus, useCalendar } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TextareaCard } from "@/components/TextareaCard";

const moodEmojis = ["", "😔", "😐", "🙂", "😊", "🤩"];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { todayTasks, pendingTasks, toggleTask, addTask, isLoading: tasksLoading } = useTasks();
  const stats = useStats();
  const { todayMood, logMood, weekMoods } = useMood();
  const { habits, completeHabit, isCompletedToday } = useHabits();
  const { sessions } = useFocus(); // Added this
  const { getEventsForDate } = useCalendar();
  const { toast } = useToast();

  const [selectedMood, setSelectedMood] = useState(todayMood?.mood || 3);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskLoading, setNewTaskLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = getEventsForDate(today);
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  const todayHabitsCompleted = dailyHabits.filter(h => isCompletedToday(h.id)).length;

  // New Client-Side Stats Logic
  const clientSideCompletedTasks = todayTasks.filter(t => t.completed).length;
  const todayFocusMinutes = sessions
    .filter(s => s.completedAt && s.completedAt.startsWith(today))
    .reduce((acc, curr) => acc + (curr.completedDuration || 0), 0);
  const totalDailyItems = todayTasks.length + dailyHabits.length;
  const completedDailyItems = clientSideCompletedTasks + todayHabitsCompleted;
  const dailyVelocity = totalDailyItems > 0 ? Math.round((completedDailyItems / totalDailyItems) * 100) : 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const handleMoodLog = (mood: number) => {
    setSelectedMood(mood);
    logMood(mood);
    toast({ title: `Mood logged: ${moodEmojis[mood]}` });
  };

  const handleQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setNewTaskLoading(true);
    try {
      await addTask({
        title: newTaskTitle,
        completed: false,
        priority: 'medium',
        dueDate: today,
        category: 'Personal',
        subtasks: []
      });
      toast({ title: "Task added!" });
      setNewTaskTitle("");
      setIsTaskOpen(false);
    } catch (error) {
      toast({ title: "Failed to add task", variant: "destructive" });
    } finally {
      setNewTaskLoading(false);
    }
  };

  const handleQuickJournal = () => {
    navigate('/journal');
  };

  const handleQuickFocus = () => {
    navigate('/focus');
  };

  const handleQuickHabit = () => {
    navigate('/habits');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-gradient">{user?.user_metadata?.name || 'Achiever'}</span></h1>
          <p className="text-muted-foreground mt-1">{pendingTasks.length} tasks flow • {todayFocusMinutes}m deep work</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* Quick Actions - Premium Formal */}
      <div className="grid grid-cols-4 gap-4">
        <Button
          className="group relative h-24 flex flex-col gap-3 bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-zinc-800/60 text-white shadow-lg transition-all duration-300 overflow-hidden"
          onClick={() => navigate('/tasks')}
        >
          <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 ring-1 ring-blue-500/20 transition-colors">
            <Plus className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-medium tracking-wide text-gray-400 group-hover:text-blue-100 transition-colors">TASKS</span>
        </Button>
        <Button
          className="group relative h-24 flex flex-col gap-3 bg-zinc-900/40 border border-white/5 hover:border-teal-500/30 hover:bg-zinc-800/60 text-white shadow-lg transition-all duration-300 overflow-hidden"
          onClick={() => navigate('/journal')}
        >
          <div className="p-2.5 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 ring-1 ring-teal-500/20 transition-colors">
            <BookOpen className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-xs font-medium tracking-wide text-gray-400 group-hover:text-teal-100 transition-colors">JOURNAL</span>
        </Button>
        <Button
          className="group relative h-24 flex flex-col gap-3 bg-zinc-900/40 border border-white/5 hover:border-amber-500/30 hover:bg-zinc-800/60 text-white shadow-lg transition-all duration-300 overflow-hidden"
          onClick={() => navigate('/focus')}
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 ring-1 ring-amber-500/20 transition-colors">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-medium tracking-wide text-gray-400 group-hover:text-amber-100 transition-colors">FOCUS</span>
        </Button>
        <Button
          className="group relative h-24 flex flex-col gap-3 bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-800/60 text-white shadow-lg transition-all duration-300 overflow-hidden"
          onClick={() => navigate('/habits')}
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 ring-1 ring-emerald-500/20 transition-colors">
            <Repeat className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-medium tracking-wide text-gray-400 group-hover:text-emerald-100 transition-colors">HABITS</span>
        </Button>
      </div>

      {/* Productivity Score - Hero Card */}
      < Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl shadow-2xl ring-1 ring-white/10" >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 opacity-30 pointer-events-none" />
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Daily Velocity</p>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{dailyVelocity}%</h2>
            </div>
            <div className="flex gap-4 text-xs font-medium text-muted-foreground/80 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> {clientSideCompletedTasks} Tasks</span>
              <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-purple-400" /> {todayFocusMinutes}m Focus</span>
            </div>
          </div>
          <Progress value={dailyVelocity} className="h-3 bg-white/5" indicatorClassName="bg-gradient-to-r from-primary via-purple-500 to-accent shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </CardContent>
      </Card >

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 flex flex-col h-full">
          <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <div className="p-1.5 rounded-lg bg-blue-500/10"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
              Today's Mission
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} className="text-xs text-muted-foreground hover:text-white hover:bg-white/5 font-medium">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 flex-1">
            {tasksLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
            ) : todayTasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                <div className="bg-white/5 p-3 rounded-full w-fit mx-auto mb-3"><CheckCircle2 className="w-6 h-6 text-muted-foreground" /></div>
                <p className="text-sm text-muted-foreground mb-4 font-medium">All cleared for today!</p>
                <Button size="sm" onClick={() => navigate('/tasks')} className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <Plus className="w-4 h-4 mr-1" /> Plan Tomorrow
                </Button>
              </div>
            ) : (
              todayTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="group flex items-center gap-4 p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-all duration-300 border border-white/5 hover:border-blue-500/30 hover:shadow-md">
                  <button
                    onClick={() => {
                      toggleTask(task.id);
                      if (!task.completed) toast({ title: "Task completed!", description: "+10 XP gained" });
                    }}
                    className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300", task.completed ? "bg-blue-500 border-blue-500 scale-110" : "border-white/20 group-hover:border-blue-400")}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <span className={cn("text-sm flex-1 font-medium transition-colors", task.completed ? "line-through text-muted-foreground" : "text-gray-200 group-hover:text-white")}>{task.title}</span>
                  <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider", task.priority === 'high' ? "bg-red-500/10 text-red-400 border border-red-500/20" : task.priority === 'medium' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>{task.priority}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Daily Note / Quick Thought */}
        <Card className="border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 flex flex-col h-full">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <div className="p-1.5 rounded-lg bg-purple-500/10"><BookOpen className="w-5 h-5 text-purple-400" /></div>
              Daily Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            <TextareaCard />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Habits */}
        <Card
          className="group cursor-pointer border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 hover:ring-emerald-500/50 hover:shadow-emerald-900/20 transition-all duration-500 relative overflow-hidden"
          onClick={() => navigate('/habits')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-125"><Repeat className="w-24 h-24 text-emerald-500" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-100"><Repeat className="w-4 h-4 text-emerald-400" />Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {dailyHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Start a new habit...</p>
            ) : (
              dailyHabits.slice(0, 3).map((habit) => {
                const done = isCompletedToday(habit.id);
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full ring-2", done ? "bg-emerald-400 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-transparent ring-white/20 group-hover:ring-emerald-500/50")} />
                    <span className={cn("text-sm transition-colors", done ? "text-emerald-100/50 line-through" : "text-gray-300 group-hover:text-emerald-50")}>{habit.title}</span>
                  </div>
                );
              })
            )}
            <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground group-hover:text-emerald-200/70 transition-colors">
              <span>{todayHabitsCompleted}/{dailyHabits.length} Completed</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card
          className="group cursor-pointer border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 hover:ring-amber-500/50 hover:shadow-amber-900/20 transition-all duration-500 relative overflow-hidden"
          onClick={() => navigate('/profile')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-125"><Flame className="w-24 h-24 text-amber-500" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-base flex items-center gap-2 text-amber-100"><Flame className="w-4 h-4 text-amber-400" />Streaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Tasks</span>
              <span className="text-lg font-bold text-amber-400 tabular-nums">{stats.currentTaskStreak}<span className="text-xs text-amber-500/70 font-normal ml-1">days</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Focus</span>
              <span className="text-lg font-bold text-orange-400 tabular-nums">{stats.currentFocusStreak}<span className="text-xs text-orange-500/70 font-normal ml-1">days</span></span>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 flex justify-end items-center text-xs text-muted-foreground group-hover:text-amber-200/70 transition-colors">
              <span className="flex items-center">View Profile <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card
          className="group cursor-pointer border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 hover:ring-blue-500/50 hover:shadow-blue-900/20 transition-all duration-500 relative overflow-hidden"
          onClick={() => navigate('/profile')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-125"><TrendingUp className="w-24 h-24 text-blue-500" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-base flex items-center gap-2 text-blue-100"><TrendingUp className="w-4 h-4 text-blue-400" />Level {stats.level}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div>
              <div className="flex justify-between text-xs mb-2 text-blue-200/70">
                <span>{stats.xp} XP</span>
                <span>{100 - (stats.xp % 100)} to Level {stats.level + 1}</span>
              </div>
              <div className="h-2 w-full bg-blue-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-full transition-all duration-1000" style={{ width: `${stats.xp % 100}%` }} />
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 flex justify-end items-center text-xs text-muted-foreground group-hover:text-blue-200/70 transition-colors">
              <span className="flex items-center">See Analytics <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Events */}
      <Card className="border-0 bg-zinc-900/50 backdrop-blur-md shadow-lg ring-1 ring-white/10">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-white/5">
          <CardTitle className="text-lg flex items-center gap-2 font-semibold">
            <div className="p-1.5 rounded-lg bg-pink-500/10"><CalendarIcon className="w-5 h-5 text-pink-400" /></div>
            Today's Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="text-xs text-muted-foreground hover:text-white hover:bg-white/5 font-medium">
            Open Calendar <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No events scheduled. Free day?</p>
              <Button size="sm" variant="secondary" className="relative z-10 bg-white/10 hover:bg-white/20 text-white border-0" onClick={() => navigate('/calendar')}>
                <Plus className="w-4 h-4 mr-1" /> Add Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl bg-black/20 hover:bg-black/30 border border-white/5 transition-all hover:border-pink-500/20">
                  <div className={cn("w-1 h-12 rounded-full shadow-[0_0_5px_currentColor]", event.color.replace('bg-', 'text-'))} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-200">{event.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="flex items-center bg-white/5 px-1.5 py-0.5 rounded text-gray-400"><Clock className="w-3 h-3 mr-1" /> {event.time}</span>
                      <span className="opacity-50">•</span>
                      <span>{event.duration}</span>
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white rounded-full hover:bg-white/10" onClick={() => navigate('/calendar')}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Task Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Quick Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                className="bg-black/20 border-white/10 focus:border-primary"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={newTaskLoading || !newTaskTitle.trim()}>
                {newTaskLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Home;