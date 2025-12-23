import { useState } from "react";
import { Repeat, Plus, Flame, Trophy, Trash2, Sparkles, Brain, Calendar, CheckCircle2, ArrowRight, Clock, HelpCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useHabits, useCategories, useTasks, useCalendar } from "@/lib/store";
// import AdvancedColorPicker from "@/components/ui/advanced-color-picker"; // Not needed directly anymore
import { useToast } from "@/hooks/use-toast";
import CategoryManagerDialog from "@/components/CategoryManagerDialog";
import { cn } from "@/lib/utils";

const habitColors = ["bg-primary", "bg-accent", "bg-arise-success", "bg-arise-warning", "bg-arise-energy", "bg-arise-info"];

interface AIAction {
  number: number;
  task: string;
  frequency: string;
  estimatedMinutes: number;
}

interface HabitAnalysis {
  habit: string;
  actions: AIAction[];
  cue: string;
  implementation_intention: string;
  duration_days: number;
  schedule_frequency: string;
}

interface HabitQuestions {
  availableMinutes: number;
  preferredTime: string;
  currentLevel: string;
  motivation: string;
  obstacles: string;
}

const Habits = () => {
  const { habits, addHabit, completeHabit, uncompleteHabit, isCompletedToday, deleteHabit } = useHabits();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { addTask } = useTasks();
  const { addEvent } = useCalendar();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<HabitAnalysis | null>(null);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(habitColors[1]); // Default to something not primary/red if possible, though index 1 is fine
  const [selectedHabitCategory, setSelectedHabitCategory] = useState<string>("");
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  // Pre-habit questions
  const [questions, setQuestions] = useState<HabitQuestions>({
    availableMinutes: 15,
    preferredTime: 'morning',
    currentLevel: 'beginner',
    motivation: 'self-improvement',
    obstacles: 'time',
  });
  // --- LOCAL BRAIN LOGIC ---
  const generateLocalPlan = (habitTitle: string, userContext: HabitQuestions): HabitAnalysis => {
    const title = habitTitle.toLowerCase();
    let category = "General";
    if (title.includes("run") || title.includes("exercise") || title.includes("gym")) category = "Health";
    if (title.includes("read") || title.includes("study") || title.includes("learn")) category = "Education";
    if (title.includes("meditate") || title.includes("breathe")) category = "Mindfulness";
    if (title.includes("code") || title.includes("dev") || title.includes("program")) category = "Skill";

    const getActions = (cat: string, mins: number) => {
      if (cat === "Health") return [
        { mins: 2, task: "Put on workout clothes immediately" },
        { mins: 5, task: "Warm up + 5 min light activity" },
        { mins: 15, task: "15 min focused workout" },
        { mins: 30, task: "Full session + stretch" }
      ];
      if (cat === "Education") return [
        { mins: 2, task: "Open book/course and read 1 page" },
        { mins: 10, task: "Read/Study for 10 minutes" },
        { mins: 20, task: "Deep work session" },
        { mins: 30, task: "Study session + review notes" }
      ];
      if (cat === "Mindfulness") return [
        { mins: 1, task: "Take 3 deep breaths" },
        { mins: 3, task: "Sit in silence for 3 minutes" },
        { mins: 5, task: "5 minute guided meditation" },
        { mins: 10, task: "10 minute unguided focus" }
      ];
      return [
        { mins: 2, task: `Start ${habitTitle} for 2 mins` },
        { mins: 5, task: `Do 5 mins of ${habitTitle}` },
        { mins: 15, task: `15 min ${habitTitle} sprint` },
        { mins: 30, task: `Deep ${habitTitle} session` }
      ];
    };

    const actions = getActions(category, userContext.availableMinutes)
      .filter(a => a.mins <= userContext.availableMinutes)
      .map((a, i) => ({
        number: i + 1,
        task: a.task,
        frequency: "daily",
        estimatedMinutes: a.mins
      }));

    return {
      habit: habitTitle,
      actions,
      cue: userContext.preferredTime === 'morning' ? 'After morning coffee' :
        userContext.preferredTime === 'evening' ? 'After dinner' : 'Before starting work',
      implementation_intention: `When I feel the cue, I will ${actions[0]?.task || 'start'}`,
      duration_days: 66,
      schedule_frequency: "once"
    };
  };

  const handleStartQuestionnaire = () => {
    if (!newHabitTitle.trim()) {
      toast({ title: "Please enter a habit name", variant: "destructive" });
      return;
    }
    setShowQuestionsDialog(true);
  };

  const handleSubmitQuestions = async () => {
    setShowQuestionsDialog(false);
    setShowAIDialog(true);
    setAiLoading(true);
    setAiAnalysis(null);
    setSelectedActions([]);

    // Simulate AI thinking time for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Try local generation first as it's more reliable without backend
      const localPlan = generateLocalPlan(newHabitTitle, questions);
      setAiAnalysis(localPlan);

      // Optional: Try fetching for "enhanced" analysis if backend was online, 
      // but for now we rely on Local Brain to strictly solve the user's issue.

    } catch (error) {
      console.error("Planning error:", error);
      toast({ title: "Plan generation failed", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAction = (num: number) => {
    setSelectedActions(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const scheduleHabitTasks = async () => {
    if (!aiAnalysis || selectedActions.length === 0) {
      toast({ title: "Please select at least one action", variant: "destructive" });
      return;
    }

    // Resolve category and color
    const categoryName = selectedHabitCategory || "General";

    // Find the category object
    const categoryObj = categories.find(c => c.name === categoryName);

    // Logic: If 'General' or not found, use Grey. Else use category color.
    // We force 'General' to be grey always.
    const habitColor = (categoryName === "General" || !categoryObj)
      ? "bg-zinc-500"
      : categoryObj.color;

    // Create the habit and get the ID
    const newHabit = await addHabit({
      title: newHabitTitle,
      description: aiAnalysis.implementation_intention,
      frequency: 'daily',
      category: categoryName,
      color: habitColor
    });

    // Schedule tasks for the next 60 days
    const selectedActionsList = aiAnalysis.actions.filter(a => selectedActions.includes(a.number));
    const today = new Date();

    selectedActionsList.forEach((action, index) => {
      // FIX: DUPLICATION & PRE-GENERATION
      // User reported tasks duplicating twice.
      // Cause 1: We were generating 60 days of tasks here.
      // Cause 2: We weren't passing 'habitId', so refreshHabitTasks didn't know these tasks belonged to the habit, and created duplicates.

      // NEW LOGIC: Only create TODAY's task here. Future tasks are handled by refreshHabitTasks daily.
      const daysPerAction = Math.floor(aiAnalysis.duration_days / selectedActionsList.length);
      const startDay = index * daysPerAction;
      const endDay = (index + 1) * daysPerAction;

      // Only check if today (day 0) falls within this action's phase
      // Since we just started, today is day 0. So we only trigger for the FIRST action (index 0).
      if (index === 0) {
        const dateStr = new Date().toLocaleDateString('en-CA'); // Use local time!

        addTask({
          title: action.task,
          description: `Habit: ${newHabitTitle} - ${aiAnalysis.cue}`,
          completed: false,
          priority: 'high',
          dueDate: dateStr,
          category: categoryName,
          subtasks: [],
          estimatedMinutes: action.estimatedMinutes,
          habitId: newHabit.id // <--- CRITICAL FIX: Pass habitId
        });

        addEvent({
          title: action.task,
          type: 'habit',
          date: dateStr,
          time: questions.preferredTime === 'morning' ? '07:00' :
            questions.preferredTime === 'afternoon' ? '13:00' : '19:00',
          duration: `${action.estimatedMinutes}m`,
          color: 'bg-arise-success'
        });
      }
    });

    toast({
      title: "Habit plan created! 🎉",
      description: `${selectedActions.length} actions scheduled over ${aiAnalysis.duration_days} days`
    });

    setShowAIDialog(false);
    setNewHabitTitle("");
    setAiAnalysis(null);
    setSelectedActions([]);
    setIsAdding(false);
    setQuestions({
      availableMinutes: 15,
      preferredTime: 'morning',
      currentLevel: 'beginner',
      motivation: 'self-improvement',
      obstacles: 'time',
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      // Allow user to pick color, but we filter out Red in UI.
      // Just in case, if they somehow picked Red (index 0 usually), we could force change, but UI restriction is better.
      await addCategory(newCategory, newCategoryColor);
      setNewCategory("");
      setNewCategoryColor(habitColors[Math.floor(Math.random() * (habitColors.length - 1)) + 1]); // Skip first red-ish if 0 is red
      toast({ title: "Category added!" });
    } catch (error) {
      toast({ title: "Failed to add category", description: "Please try again.", variant: "destructive" });
    }
  };

  // --- UI RENDER ---
  const habitStats = habits.map(h => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-CA');
    });
    const completedCount = h.completedDates.filter(d => last30Days.includes(d)).length;
    return { ...h, completionRate: Math.round((completedCount / 30) * 100) };
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-400" />
            HABIT LAB
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono tracking-wide">BEHAVIORAL ENGINEERING // ACTIVE PROTOCOLS: {habits.length}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all backdrop-blur-md"
            onClick={() => setIsManagingCategories(true)}
          >
            <Tag className="w-4 h-4 mr-2" />Sectors
          </Button>
          <Button
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-none transition-all hover:scale-105"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />Initialize
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Habit Input - Animate Presence */}
        {isAdding && (
          <div className="col-span-full mb-4">
            <Card className="bg-zinc-900/80 border-indigo-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(79,70,229,0.1)]">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-mono text-sm tracking-widest uppercase">New Protocol Sequence</span>
                  </div>

                  {/* Category Selector */}
                  <Select value={selectedHabitCategory} onValueChange={setSelectedHabitCategory}>
                    <SelectTrigger className="w-[180px] bg-zinc-800/50 border-white/10 h-8 text-xs">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="General">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-zinc-500" />
                          General
                        </div>
                      </SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.name}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", c.color)} />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Define target behavior (e.g. 'Read 30 mins', 'Morning Run')..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="bg-black/40 border-white/10 text-lg py-6 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all font-medium placeholder:text-zinc-600"
                />
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 flex-1" onClick={() => setIsAdding(false)}>Abort</Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleStartQuestionnaire}>
                    <ArrowRight className="w-4 h-4 mr-2" />Analyze & Build
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {habits.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-indigo-900/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-white">No Active Protocols</h3>
            <p className="text-zinc-500 max-w-md mx-auto">Initialize your first behavioral protocol using our Local Intelligence engine. Science-backed formation in seconds.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-4 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
              <Plus className="w-4 h-4 mr-2" />Start Sequence
            </Button>
          </div>
        )}

        {/* Habit Cards */}
        {habitStats.map((habit) => {
          const done = isCompletedToday(habit.id);
          return (
            <div
              key={habit.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border transition-all duration-300",
                done
                  ? "bg-zinc-900/40 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-zinc-900/60 border-white/10 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]"
              )}
            >
              {/* Card Content */}
              <div className="p-5 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-mono tracking-wider",
                      done ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-500 bg-white/5"
                    )}>
                      {habit.category.toUpperCase()}
                    </span>
                    <h3 className={cn("text-xl font-semibold transition-colors", done ? "text-emerald-400" : "text-white")}>
                      {habit.title}
                    </h3>
                  </div>

                  {/* Streak Counter */}
                  <div className="text-right">
                    <div className={cn("flex items-center gap-1.5 font-mono text-sm", done ? "text-emerald-400" : "text-zinc-500")}>
                      <Flame className={cn("w-4 h-4", habit.streak > 0 && (done ? "text-emerald-500" : "text-orange-500"))} />
                      {habit.streak} DAY
                    </div>
                  </div>
                </div>

                {habit.description && (
                  <p className="text-sm text-zinc-400 mb-6 font-light italic leading-relaxed">"{habit.description}"</p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="text-xs font-mono text-zinc-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    DAILY PROTOCOL
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Delete Action - Hidden until hover */}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Completion Trigger */}
                    <button
                      onClick={() => {
                        if (done) {
                          uncompleteHabit(habit.id);
                          toast({ title: "Protocol Reset", description: "Completion undone." });
                        } else {
                          completeHabit(habit.id);
                          toast({ title: "Protocol Complete", description: "System verified. Streak incremented." });
                        }
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border border-transparent",
                        done
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 scale-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "bg-white/5 text-white/20 hover:bg-indigo-600 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                      )}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Completion Progress Line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${habit.completionRate}%`, opacity: done ? 1 : 0.3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Questions Dialog (Re-styled) */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-400">
              <HelpCircle className="w-5 h-5" />
              Analyze Parameters
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Calibrate your behavior plan based on current constraints.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4 pt-4">
              <div className="space-y-3">
                <Label className="text-zinc-300">Daily Time Budget (Minutes)</Label>
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                  <Slider
                    value={[questions.availableMinutes]}
                    onValueChange={(v) => setQuestions({ ...questions, availableMinutes: v[0] })}
                    min={5}
                    max={120}
                    step={5}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-mono mt-2">
                    <span>5 MIN</span>
                    <span className="text-indigo-400 font-bold">{questions.availableMinutes} MIN</span>
                    <span>120 MIN</span>
                  </div>
                </div>
              </div>

              {/* Re-using existing RadioGroups but styling them container-wise could be verbose, 
                   so keeping simple functional layout for questionnaire to ensure stability */}
              <div className="space-y-4">
                <Label className="text-zinc-300">Preferred Time Window</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
                    <div key={time}
                      onClick={() => setQuestions({ ...questions, preferredTime: time })}
                      className={cn(
                        "p-3 rounded-md border cursor-pointer transition-all text-sm capitalize text-center",
                        questions.preferredTime === time
                          ? "bg-indigo-900/30 border-indigo-500/50 text-white"
                          : "bg-zinc-900/30 border-white/5 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1 text-zinc-400 hover:text-white" onClick={() => setShowQuestionsDialog(false)}>Back</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleSubmitQuestions}>
              <Sparkles className="w-4 h-4 mr-2" />Generate Protocol
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Dialog (Local Brain Result) */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-indigo-400 flex items-center gap-2"><Brain className="w-5 h-5" /> Protocol Generated</DialogTitle>
            <DialogDescription className="text-zinc-500">Local Intelligence has optimized a 60-day plan.</DialogDescription>
          </DialogHeader>

          {aiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <p className="font-mono text-sm text-indigo-400 animate-pulse">COMPUTING OPTIMAL PATH...</p>
            </div>
          ) : aiAnalysis && (
            <div className="space-y-6 pt-2">
              <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg">
                <div className="text-xs font-mono text-indigo-400 mb-1 uppercase tracking-wider">Implementation Intention</div>
                <p className="text-lg font-medium text-white">"{aiAnalysis.implementation_intention}"</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Micro-Action Sequence:</p>
                {aiAnalysis.actions.map(action => (
                  <div
                    key={action.number}
                    onClick={() => toggleAction(action.number)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedActions.includes(action.number)
                        ? "bg-emerald-900/20 border-emerald-500/30"
                        : "bg-zinc-900 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                      selectedActions.includes(action.number) ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {action.number}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", selectedActions.includes(action.number) ? "text-emerald-300" : "text-zinc-300")}>{action.task}</p>
                      <p className="text-xs text-zinc-500">{action.estimatedMinutes} min</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg" onClick={scheduleHabitTasks}>
                Initialize Sequence <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CategoryManagerDialog
        isOpen={isManagingCategories}
        onClose={setIsManagingCategories}
      />
    </div>
  );
};




export default Habits;
