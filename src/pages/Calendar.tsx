import { useState } from "react";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2,
  MapPin, Clock, Check, MoreHorizontal, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCalendar, useTasks, useHabits, useJournal } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper for strict local YYYY-MM-DD
const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = () => {
  const { events, addEvent, deleteEvent } = useCalendar();
  const { tasks, addTask } = useTasks();
  const { habits, isCompletedToday } = useHabits();
  const { addEntry } = useJournal();
  const { toast } = useToast();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toLocalISOString(new Date()));
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'event' | 'task' | 'journal'>('event');

  // Forms
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting" as const, time: "09:00", duration: "1h", recurring: "none" });
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const, category: "Work" });

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = toLocalISOString(new Date());

  // Data Selectors
  const selectedEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate);
  const selectedHabits = habits.filter(h => h.frequency === 'daily' || (h.frequency === 'weekly' && h.targetDays?.includes(new Date(selectedDate).getDay())));

  const handleAdd = () => {
    if (addType === 'event') {
      if (!newEvent.title.trim()) return;
      addEvent({ ...newEvent, date: selectedDate, color: 'bg-blue-600', recurring: newEvent.recurring !== "none" ? newEvent.recurring as any : undefined });
    } else if (addType === 'task') {
      if (!newTask.title.trim()) return;
      addTask({ ...newTask, dueDate: selectedDate, completed: false, subtasks: [] });
    }
    setIsAdding(false);
    setNewEvent({ title: "", type: "meeting", time: "09:00", duration: "1h", recurring: "none" });
    setNewTask({ title: "", description: "", priority: "medium", category: "Work" });
  };

  return (
    <div className="h-screen bg-[#09090b] text-white p-6 flex flex-col font-sans overflow-hidden">
      {/* Minimalist Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" /> Calendar
          </h1>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="h-7 w-7 text-zinc-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
            <div className="w-32 text-center text-sm font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="h-7 w-7 text-zinc-400 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs text-zinc-500 hover:text-white h-7">Today</Button>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs font-medium px-4 shadow-sm">
          <Plus className="w-3 h-3 mr-2" /> Add Item
        </Button>
      </div>

      {/* Main Layout: Split View (Neutral/Glass) */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

        {/* Calendar Grid (8 Cols) */}
        <div className="col-span-8 bg-zinc-900/40 border border-white/5 rounded-xl flex flex-col overflow-hidden">
          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-2 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* The Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {Array.from({ length: 42 }).map((_, i) => {
              const gridStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              gridStart.setDate(1 - firstDay);
              const cellDate = new Date(gridStart);
              cellDate.setDate(gridStart.getDate() + i);
              const dateStr = toLocalISOString(cellDate);

              const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              const dayEvents = events.filter(e => e.date === dateStr);
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "relative border-b border-r border-white/5 p-2 flex flex-col cursor-pointer transition-colors group",
                    !isCurrentMonth ? "bg-zinc-950/50 opacity-30" : "bg-transparent hover:bg-white/[0.02]",
                    isSelected && "bg-blue-500/10"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-all",
                      isToday ? "bg-blue-600 text-white" : isSelected ? "text-blue-400 font-bold" : "text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      {cellDate.getDate()}
                    </span>
                  </div>

                  {/* Minimalist Dots */}
                  <div className="flex gap-1 mt-auto px-1">
                    {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    {dayTasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />}
                  </div>

                  {isSelected && <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Day Detail */}
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          {/* Date Header Card */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white">{new Date(selectedDate).getDate()}</h2>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long' })}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-light text-blue-500">{selectedEvents.length + selectedTasks.length}</div>
              <div className="text-[10px] text-zinc-600 uppercase">Entries</div>
            </div>
          </div>

          {/* Agenda Items */}
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-0 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Schedule</h3>
              <Clock className="w-3 h-3 text-zinc-600" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
              {selectedEvents.length === 0 && selectedTasks.length === 0 && selectedHabits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <MapPin className="w-6 h-6 opacity-20 mb-2" />
                  <p className="text-xs">No items.</p>
                </div>
              ) : (
                <>
                  {/* Events */}
                  {selectedEvents.map(e => (
                    <div key={e.id} className="group relative flex gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-all bg-zinc-900/50">
                      <div className="flex flex-col items-center min-w-[3rem] border-r border-white/5 pr-3">
                        <span className="text-xs font-bold text-white">{e.time}</span>
                        <span className="text-[10px] text-zinc-500 mt-1">{e.duration}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("text-xs font-medium text-zinc-200 truncate", e.completed && "line-through opacity-50")}>{e.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 capitalize">{e.type}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}

                  {/* Tasks Section */}
                  {(selectedTasks.length > 0 || selectedHabits.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 pl-1">Tasks & Habits</h3>
                      {selectedHabits.map(h => (
                        <div key={h.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors group">
                          <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", isCompletedToday(h.id) ? "bg-emerald-600 border-emerald-600" : "border-zinc-700")}><Check className="w-2 h-2 text-white" /></div>
                          <span className={cn("text-xs text-zinc-400 flex-1 truncate", isCompletedToday(h.id) && "line-through opacity-50")}>{h.title}</span>
                        </div>
                      ))}
                      {selectedTasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors">
                          <div className={cn("w-1.5 h-1.5 rounded-sm shrink-0", t.priority === 'high' ? "bg-red-500" : "bg-blue-500")} />
                          <span className={cn("text-xs text-zinc-300 flex-1 truncate", t.completed && "line-through opacity-50")}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add (Minimal) */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[380px]">
          <DialogHeader><DialogTitle className="text-sm">New Item</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-1">
            <Select value={addType} onValueChange={(v: any) => setAddType(v)}><SelectTrigger className="bg-zinc-900 border-white/10 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 text-white"><SelectItem value="event">Event</SelectItem><SelectItem value="task">Task</SelectItem></SelectContent></Select>
            {addType === 'event' && <><Input placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="bg-zinc-900 border-white/10 h-8 text-xs" /><Input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="bg-zinc-900 border-white/10 h-8 text-xs" /></>}
            {addType === 'task' && <Input placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="bg-zinc-900 border-white/10 h-8 text-xs" />}
            <Button className="w-full bg-blue-600 hover:bg-blue-500 h-8 text-xs" onClick={handleAdd}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
