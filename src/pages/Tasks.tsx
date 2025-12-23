import { useState, useRef, useEffect, forwardRef } from "react";
import {
  Plus, Search, Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle2,
  Layers, CheckSquare, AlignLeft, Trash2, Edit2, Tag, Trophy, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Removing Tabs import to use standard buttons for reliability
import { useTasks, useCategories } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import CategoryManagerDialog from "@/components/CategoryManagerDialog";
import { Task } from "@/lib/types";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// Helper functions (moved outside component)
const todayStr = new Date().toLocaleDateString('en-CA');
const isHabit = (t: Task) => t.description?.startsWith('Habit:');
const canComplete = (t: Task) => !isHabit(t) || t.dueDate === todayStr || t.completed;
const canDelete = (t: Task) => !isHabit(t);

// --- Premium Components with ForwardRef ---
interface TaskCardProps {
  task: Task;
  isCompact?: boolean;
  showActions?: boolean;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPromote: (task: Task) => void;
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, isCompact = false, showActions = true, onComplete, onEdit, onDelete, onPromote }, ref) => {
    const locked = !canComplete(task) && !task.completed;
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className={cn(
          "group relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300",
          task.completed ? "bg-zinc-900/20 border-white/5 opacity-60" :
            task.priority === 'high' ? "bg-zinc-900/60 border-amber-500/20 shadow-[0_0_30px_-15px_rgba(245,158,11,0.15)]" :
              "bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60"
        )}
      >
        <div className={cn("relative flex items-center gap-4", isCompact ? "p-3" : "p-4")}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onComplete(task)}
            disabled={locked}
            className={cn(
              "w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-300",
              task.completed ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                locked ? "border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-50" :
                  "border-zinc-700 group-hover:border-amber-500/50 text-transparent hover:text-amber-500/50"
            )}
          >
            {task.completed ? <CheckSquare className="w-4 h-4 fill-current" /> : locked ? <Lock className="w-3 h-3 text-zinc-600" /> : <CheckSquare className="w-4 h-4 fill-current opacity-0 hover:opacity-100" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <h3 className={cn("font-medium text-zinc-200 transition-colors truncate", task.completed && "line-through text-zinc-500")}>
              {task.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
              {task.dueDate && <span className={cn("flex items-center gap-1", task.dueDate === todayStr && "text-amber-500 font-medium")}><Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
              {task.priority === 'high' && !task.completed && <span className="text-amber-500 flex items-center gap-1">★ High Priority</span>}
              {isHabit(task) && <span className="text-blue-400 flex items-center gap-1">↻ Habit</span>}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => onEdit(task)}><Edit2 className="w-4 h-4" /></Button>
            {canDelete(task) && <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => onDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>}
            {showActions && !task.completed && !locked && (
              task.priority !== 'high' ?
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500" onClick={() => onPromote(task)}><ArrowRight className="w-4 h-4" /></Button> :
                null
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);
TaskCard.displayName = "TaskCard";

const Tasks = () => {
  const { tasks, addTask, updateTask, toggleTask, deleteTask, pendingTasks, completedTasks } = useTasks();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { toast } = useToast();

  // UI State
  const [view, setView] = useState<'today' | 'all' | 'habits' | 'done' | 'categories'>('today');

  // Category View specific state
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Form State
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "medium" as const, category: "Work",
    dueDate: new Date().toLocaleDateString('en-CA'), estimatedMinutes: 30, reminderTime: "18:00"
  });

  // Parallax Hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.5]);

  // Derived Data
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Set default active sector
  useEffect(() => {
    if (categories.length > 0 && !activeSector) setActiveSector(categories[0].name);
  }, [categories]);

  // Logic Handlers
  const handlePromote = (task: Task) => { updateTask({ ...task, priority: 'high' }); toast({ title: "Promoted to In Focus", className: "bg-amber-900/50 border-amber-500/20 text-amber-200" }); };
  const handleComplete = (task: Task) => {
    if (!canComplete(task)) { toast({ title: "Habit Locked", description: "You can only complete habits on their scheduled day.", variant: "destructive" }); return; }
    toggleTask(task.id);
    if (!task.completed) toast({ title: "Mission Accomplished", className: "bg-emerald-900/50 border-emerald-500/20 text-emerald-200" });
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    addTask({ ...newTask, completed: false, subtasks: [] });
    setIsAdding(false);
    setNewTask({ ...newTask, title: "", description: "" });
    toast({ title: "Task Created" });
  };
  const handleUpdateTask = () => { if (editingTask) { updateTask(editingTask); setEditingTask(null); toast({ title: "Task Updated" }); } };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName, `bg-${['blue', 'emerald', 'amber', 'violet', 'rose'][Math.floor(Math.random() * 5)]}-500`);
    setNewCatName("");
    toast({ title: "Sector Initialized" });
  };

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto bg-[#09090b] text-zinc-100 font-sans -m-4 relative overflow-x-hidden">
      {/* Background Ambience */}
      <motion.div style={{ y: bgY, opacity }} className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-amber-900/10 via-blue-900/5 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/5 pb-4 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50 pt-4 -mx-8 px-8 gap-4">
          <div>
            <h1 className="text-4xl font-extralight tracking-tight text-white mb-1"><span className="font-bold text-amber-500">Mission</span> Control</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase">Tactical Operations Center // EST. 2024</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <div className="bg-zinc-900/80 border border-white/5 p-1 rounded-lg flex overflow-x-auto max-w-full scrollbar-hide">
              {['today', 'all', 'categories', 'habits', 'done'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setView(tab as any)}
                  className={cn(
                    "capitalize text-xs px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap",
                    view === tab ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsManagingCategories(true)} className="flex-1 sm:flex-none bg-zinc-900/50 border-white/10 hover:border-amber-500/50 hover:bg-zinc-900 text-zinc-400 hover:text-amber-500 transition-all text-xs">
                <Tag className="w-3 h-3 mr-2" /> Sectors
              </Button>
              <Button onClick={() => setIsAdding(true)} className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] text-xs font-bold uppercase tracking-wide">
                <Plus className="w-3 h-3 mr-2" /> New Mission
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row (Only show in Today/All views for cleanliness) */}
        {view !== 'categories' && (
          <motion.div style={{ opacity: opacity }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Completion', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-amber-500' },
              { label: 'Pending', value: pendingTasks.length, icon: Clock, color: 'text-blue-500' },
              { label: 'Sectors', value: categories.length, icon: Layers, color: 'text-emerald-500' },
              { label: 'Total Missions', value: tasks.length, icon: AlignLeft, color: 'text-zinc-500' },
            ].map((stat, i) => (
              <Card key={i} className="bg-zinc-900/20 border-white/5 backdrop-blur-sm group hover:border-white/10 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold group-hover:text-amber-500/70 transition-colors">{stat.label}</p>
                    <p className="text-2xl font-light text-white mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={cn("w-5 h-5 opacity-30 group-hover:opacity-100 transition-all", stat.color)} />
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-h-0">
          {view === 'categories' ? (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              {/* Sector Selector Rail */}
              <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveSector(cat.name)}
                    className={cn(
                      "relative px-6 py-3 rounded-full text-sm font-medium transition-all shrink-0 flex items-center gap-2 border",
                      activeSector === cat.name
                        ? "text-white border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "text-zinc-500 border-white/5 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-300"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                    {cat.name}
                    <span className="ml-2 text-[10px] opacity-50 bg-white/5 px-1.5 rounded-full">
                      {tasks.filter(t => t.category === cat.name && !t.completed).length}
                    </span>
                    {activeSector === cat.name && (
                      <motion.div layoutId="sector-glow" className="absolute inset-0 rounded-full border border-amber-500/50 z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                  </button>
                ))}
                <button onClick={() => setIsManagingCategories(true)} className="px-4 py-3 rounded-full text-sm font-medium text-zinc-600 border border-dashed border-zinc-800 hover:border-zinc-600 hover:text-zinc-400 transition-all shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task List for Active Sector */}
              <div className="flex-1 max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSector}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {tasks.filter(t => t.category === activeSector && !t.completed).length > 0 ? (
                      tasks
                        .filter(t => t.category === activeSector && !t.completed)
                        .map((t, i) => (
                          <div key={t.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
                            <TaskCard
                              task={t}
                              onComplete={handleComplete}
                              onEdit={setEditingTask}
                              onDelete={deleteTask}
                              onPromote={handlePromote}
                            />
                          </div>
                        ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Trophy className="w-16 h-16 text-zinc-800 mb-4" />
                        <p className="text-zinc-500 text-lg font-light">Sector Clear</p>
                        <p className="text-zinc-600 text-sm">No active threats in {activeSector}.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              <AnimatePresence mode='popLayout'>
                {tasks.filter(t => {
                  if (view === 'today') return !t.completed && t.dueDate === todayStr;
                  if (view === 'all') return !t.completed;
                  if (view === 'habits') return isHabit(t) && !t.completed;
                  if (view === 'done') return t.completed;
                  return true;
                }).length > 0 ? (
                  tasks.filter(t => { /* filter logic duplicate for render */
                    if (view === 'today') return !t.completed && t.dueDate === todayStr;
                    if (view === 'all') return !t.completed;
                    if (view === 'habits') return isHabit(t) && !t.completed;
                    if (view === 'done') return t.completed;
                    return true;
                  }).map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onComplete={handleComplete}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                      onPromote={handlePromote}
                    />
                  ))
                ) : (
                  <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-3xl mx-auto max-w-lg">
                    <Trophy className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500">System Nominal.</p>
                    {view === 'today' && <Button onClick={() => setIsAdding(true)} variant="link" className="text-amber-500 mt-2">Initialize Mission</Button>}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- MODALS --- */}

        {/* Task Editor */}
        <Dialog open={isAdding || !!editingTask} onOpenChange={(o) => { if (!o) { setIsAdding(false); setEditingTask(null); } }}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px] max-h-[85vh] overflow-y-auto shadow-2xl">
            <DialogHeader><DialogTitle className="text-xl font-light text-amber-500">{isAdding ? "Initialize Mission" : "Modify Mission"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input className="bg-zinc-900 border-zinc-800 h-11" placeholder="Mission Title" value={isAdding ? newTask.title : editingTask?.title} onChange={e => isAdding ? setNewTask({ ...newTask, title: e.target.value }) : setEditingTask({ ...editingTask!, title: e.target.value })} autoFocus />
              <Textarea className="bg-zinc-900 border-zinc-800 min-h-[100px]" placeholder="Briefing / Details" value={isAdding ? newTask.description : editingTask?.description} onChange={e => isAdding ? setNewTask({ ...newTask, description: e.target.value }) : setEditingTask({ ...editingTask!, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Select value={isAdding ? newTask.priority : editingTask?.priority} onValueChange={v => isAdding ? setNewTask({ ...newTask, priority: v as any }) : setEditingTask({ ...editingTask!, priority: v as any })}><SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="high">High Priority</SelectItem><SelectItem value="medium">Medium Priority</SelectItem><SelectItem value="low">Low Priority</SelectItem></SelectContent></Select>
                <Select value={isAdding ? newTask.category : editingTask?.category} onValueChange={v => isAdding ? setNewTask({ ...newTask, category: v }) : setEditingTask({ ...editingTask!, category: v })}><SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue placeholder="Sector" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white">{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" className="bg-zinc-900 border-zinc-800 h-10" value={isAdding ? newTask.dueDate : editingTask?.dueDate} onChange={e => isAdding ? setNewTask({ ...newTask, dueDate: e.target.value }) : setEditingTask({ ...editingTask!, dueDate: e.target.value })} />
                <Input type="time" className="bg-zinc-900 border-zinc-800 h-10" value={isAdding ? newTask.reminderTime : editingTask?.reminderTime || "18:00"} onChange={e => isAdding ? setNewTask({ ...newTask, reminderTime: e.target.value }) : setEditingTask({ ...editingTask!, reminderTime: e.target.value })} />
              </div>
              <Button onClick={isAdding ? handleAddTask : handleUpdateTask} className="w-full bg-amber-600 hover:bg-amber-500 text-white h-11 text-base font-medium">{isAdding ? "Initialize" : "Update"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Manager */}
        {/* Category Manager */}
        <CategoryManagerDialog
          isOpen={isManagingCategories}
          onClose={setIsManagingCategories}
        />

      </div>
    </div>
  );
};

export default Tasks;
