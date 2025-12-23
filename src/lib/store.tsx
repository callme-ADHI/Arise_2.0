import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task, JournalEntry, FocusSession, CalendarEvent, MoodLog, UserStats, Achievement, Habit, AIMessage, UserProfile, Category } from './types';
import { toast } from 'sonner';
import { calculateLevelInfo, XP_REWARDS } from './progression';
import { NotificationManager } from './notifications';

// Helper to get today's date in YYYY-MM-DD
const getToday = () => new Date().toLocaleDateString('en-CA');

const updateTaskNotification = async (userId: string) => {
  const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('completed', false).eq('user_id', userId);
  if (count !== null && count > 0) {
    NotificationManager.scheduleDailyTaskSummary();
  } else {
    NotificationManager.cancelDailyTaskSummary();
  }
};

const updateJournalNotification = async (userId: string) => {
  const today = getToday();
  // Simple check: do we have any entry created today?
  // We'll trust the database generic check or just check local cache if easier, but DB is safer.
  // Actually, let's use the same range logic as the hooks if possible, or just exact date match if stored as date.
  // The hooks use created_at (timestamptz). 
  // Let's match >= today T00:00:00 and < tomorrow
  const { count } = await supabase.from('journal_entries').select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  if (count !== null && count > 0) {
    NotificationManager.cancelDailyJournalSummary();
  } else {
    NotificationManager.scheduleDailyJournalSummary();
  }
};

// --- HELPER FUNCTIONS ---

export const refreshHabitTasks = async (userId: string) => {
  const today = getToday();

  // 1. Get all active habits
  const { data: habits, error: habitsError } = await supabase.from('habits').select('*').eq('user_id', userId);
  if (habitsError || !habits) return;

  // 2. Get today's existing habit tasks 
  // (We identify them by description or metadata. Ideally we'd have a habit_id column on tasks but for now we rely on the prefix convention or metadata if we added it)
  // Actually, wait, let's verify if we added habit_id column to tasks? 
  // Looking at useTasks hook line 69: `habitId: t.habit_id || undefined`. Yes we have it!
  const { data: existingTasks } = await supabase.from('tasks')
    .select('habit_id, id, completed')
    .eq('user_id', userId)
    .not('habit_id', 'is', null)
    .eq('due_date', today);

  const existingHabitIds = existingTasks?.map(t => t.habit_id) || [];

  // 3. Create missing tasks for today
  const missingHabits = habits.filter(h => !existingHabitIds.includes(h.id));

  for (const habit of missingHabits) {
    // Only create if habit is scheduled for today (frequency check)
    // For MVP "daily" means every day. If we had complex frequency we'd check here.
    // Assuming 'daily' for now as per habits hook defaults.
    const { data: newHabitTask, error: newHabitError } = await supabase.from('tasks').insert({
      user_id: userId,
      title: habit.title,
      description: `Habit: ${habit.title} - ${habit.description || 'Daily Protocol'}`,
      priority: 'medium',
      due_date: today,
      category: habit.category,
      habit_id: habit.id,
      estimated_minutes: 15,
      reminder_time: '18:00' // Default reminder for habits
    }).select().single();

    if (!newHabitError && newHabitTask) {
      NotificationManager.scheduleTaskReminder(newHabitTask.id, newHabitTask.title, newHabitTask.due_date, '18:00');
    }
  }

  // 4. CLEANUP: Delete INCOMPLETE habit tasks from BEFORE today to prevent clutter
  // CHANGED: User wants to keep them as "Pending".
  // So we do NOT delete them anymore.
  // await supabase.from('tasks')
  //   .delete()
  //   .eq('user_id', userId)
  //   .not('habit_id', 'is', null)
  //   .eq('completed', false)
  //   .lt('due_date', today);
};

// --- TASKS HOOK ---
export function useTasks() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        completed: t.completed || false,
        priority: t.priority as 'high' | 'medium' | 'low',
        dueDate: t.due_date || '',
        category: t.category || 'Personal',
        subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks) : t.subtasks || [],
        createdAt: t.created_at || new Date().toISOString(),
        completedAt: t.completed_at || undefined,
        estimatedMinutes: t.estimated_minutes || undefined,
        habitId: t.habit_id || undefined,
        // @ts-ignore
        reminderTime: t.reminder_time || undefined
      })) as Task[];
    },
    enabled: !!session?.user?.id,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase.from('tasks').insert({
        user_id: session?.user?.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
        category: task.category,
        subtasks: task.subtasks ? JSON.stringify(task.subtasks) : '[]',
        estimated_minutes: task.estimatedMinutes,
        habit_id: task.habitId,
        reminder_time: task.reminderTime
      }).select().single();
      if (error) throw error;

      // Schedule Individual Notification
      if (data.due_date && task.reminderTime) {
        NotificationManager.scheduleTaskReminder(data.id, data.title, data.due_date, task.reminderTime);
      }

      // Schedule Notification Check (Legacy Summary)
      if (session?.user?.id) updateTaskNotification(session.user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const { error } = await supabase.from('tasks').update({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
        category: task.category,
        completed: task.completed,
        completed_at: task.completed ? new Date().toISOString() : null,
        subtasks: JSON.stringify(task.subtasks)
      }).eq('id', task.id);
      if (error) throw error;
      if (session?.user?.id) updateTaskNotification(session.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const newCompleted = !task.completed;
      const { error } = await supabase.from('tasks').update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null // Clear completed_at if unchecking
      }).eq('id', id);
      if (error) throw error;

      // HABIT SYNC LOGIC
      // If this task is a habit task, sync with habit completion
      if (task.habitId || task.description?.startsWith('Habit:')) {
        // Resolve habit ID if not explicit (legacy support)
        let habitId = task.habitId;
        if (!habitId && task.description?.startsWith('Habit:')) {
          // Try to find habit by title matching
          const habitTitle = task.description.split(' - ')[0].replace('Habit: ', '');
          const { data: habit } = await supabase.from('habits').select('id').eq('title', habitTitle).eq('user_id', session?.user?.id).single();
          if (habit) habitId = habit.id;
        }

        if (habitId) {
          const today = getToday();
          // Use task.dueDate for completion date if it exists, otherwise today
          // This ensures if I complete yesterday's habit today, it fills yesterday's slot in the grid
          const completionDate = task.dueDate || today;

          if (newCompleted) {
            // complete habit
            const { error: hError } = await supabase.from('habit_completions').insert({
              habit_id: habitId,
              user_id: session?.user?.id,
              completed_date: completionDate
            });
            // Ignore duplicate key error (already completed)
            if (hError && hError.code !== '23505') console.error("Habit sync error:", hError);

            // Update local habit streak display if needed (invalidation handles it)
          } else {
            // uncomplete habit
            await supabase.from('habit_completions').delete()
              .eq('habit_id', habitId)
              .eq('user_id', session?.user?.id)
              .eq('completed_date', completionDate);
          }
          // Invalidate habits to refresh streak UI
          queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
      }

      // XP REWARD / DEDUCTION
      const { data: currentStats } = await supabase.from('user_stats').select('*').eq('id', session?.user?.id).single();
      const isOverdue = task.dueDate && task.dueDate < getToday();

      if (newCompleted) {
        // Notification Update
        NotificationManager.cancelTaskReminder(task.id);
        if (session?.user?.id) updateTaskNotification(session.user.id);

        if (currentStats) {
          // STRICT DEADLINE LOGIC: 0 XP if overdue
          if (isOverdue) {
            toast.info(`Task Completed (Overdue). No XP awarded.`);
          } else {
            const newXp = (currentStats.xp || 0) + XP_REWARDS.TASK_COMPLETION;
            const lvlInfo = calculateLevelInfo(newXp);
            await supabase.from('user_stats').update({ xp: newXp, level: lvlInfo.level }).eq('id', session?.user?.id);

            if (lvlInfo.level > (currentStats.level || 1)) {
              toast.success(`LEVEL UP! Rank: ${lvlInfo.rank} - ${lvlInfo.rankTitle}`);
            } else {
              toast.success(`+${XP_REWARDS.TASK_COMPLETION} XP`);
            }
          }
        }
      } else {
        // Task Unchecked - Deduct XP
        // Re-schedule reminder if it exists
        if (task.dueDate && task.reminderTime) {
          NotificationManager.scheduleTaskReminder(task.id, task.title, task.dueDate, task.reminderTime);
        }

        if (currentStats && !isOverdue) {
          let newXp = (currentStats.xp || 0) - XP_REWARDS.TASK_COMPLETION;
          if (newXp < 0) newXp = 0; // Prevent negative XP

          const lvlInfo = calculateLevelInfo(newXp);
          await supabase.from('user_stats').update({ xp: newXp, level: lvlInfo.level }).eq('id', session?.user?.id);

          toast.info(`-${XP_REWARDS.TASK_COMPLETION} XP`);
        } else if (isOverdue) {
          toast.info("Task Reset. (No XP change for overdue task)");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      if (session?.user?.id) updateTaskNotification(session.user.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return {
    tasks,
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => addTaskMutation.mutate(task),
    updateTask: (task: Task) => updateTaskMutation.mutate(task),
    deleteTask: (id: string) => deleteTaskMutation.mutate(id),
    toggleTask: (id: string) => toggleTaskMutation.mutate(id),
    todayTasks: tasks.filter(t => t.dueDate === getToday()),
    pendingTasks: tasks.filter(t => !t.completed),
    completedTasks: tasks.filter(t => t.completed),
    isLoading
  };
}

// --- HABITS HOOK ---
export function useHabits() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const today = getToday();

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('habits').select('*, habit_completions(completed_date)');
      if (error) throw error;

      return data.map(h => ({
        id: h.id,
        title: h.title,
        description: h.description || undefined,
        frequency: h.frequency as any,
        targetDays: h.target_days,
        category: h.category || 'Personal',
        streak: h.streak || 0,
        bestStreak: h.best_streak || 0,
        completedDates: h.habit_completions?.map((hc: any) => hc.completed_date) || [],
        createdAt: h.created_at,
        color: h.color || 'bg-primary',
        reminderTime: h.reminder_time,
      })) as Habit[];
    },
    enabled: !!session?.user?.id,
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => {
      const { data, error } = await supabase.from('habits').insert({
        user_id: session?.user?.id,
        title: habit.title,
        frequency: habit.frequency,
        category: habit.category,
        color: habit.color,
        // Default values
        streak: 0,
        best_streak: 0
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Get habit details for legacy matching
      const { data: habit } = await supabase.from('habits').select('title').eq('id', id).single();

      // 2. Cascade delete tasks by habit_id (Cleanest way)
      const { error: errorId } = await supabase.from('tasks').delete().eq('habit_id', id);
      if (errorId) throw errorId;

      // 3. Legacy fallback: Delete tasks by description matching
      if (habit?.title) {
        const { error: errorLegacy } = await supabase.from('tasks')
          .delete()
          .ilike('description', `Habit: ${habit.title} - %`);
        if (errorLegacy) throw errorLegacy;
      }

      // 4. Delete the habit
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks as some might be deleted by cascade
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habit_completions').insert({
        habit_id: id,
        user_id: session?.user?.id,
        completed_date: today
      });
      if (error) {
        // If already completed today, ignore unique constraint error
        if (error.code === '23505') return;
        throw error;
      }

      // --- XP LOGIC BEGIN ---
      const { data: currentStats } = await supabase.from('user_stats').select('*').eq('id', session?.user?.id).single();

      if (currentStats) {
        const newXp = (currentStats.xp || 0) + 10; // +10 XP for habit
        const newLevel = Math.floor(newXp / 100) + 1;

        await supabase.from('user_stats').update({
          xp: newXp,
          level: newLevel,
        }).eq('id', session?.user?.id);

        if (newLevel > (currentStats.level || 1)) {
          toast.success(`LEVEL UP! You are now Level ${newLevel}`);
        }
      }
      // --- XP LOGIC END ---

      // --- STREAK CALCULATION LOGIC ---
      // Fetch all completion dates for this habit (inclusive of today)
      const { data: completions } = await supabase.from('habit_completions')
        .select('completed_date')
        .eq('habit_id', id)
        .eq('user_id', session?.user?.id)
        .lte('completed_date', today)
        .order('completed_date', { ascending: false });

      if (completions) {
        // Create a Set of unique completion dates
        const uniqueDates = Array.from(new Set(completions.map(c => c.completed_date)));

        let currentStreak = 0;
        let checkDateStr = today;

        // Helper to subtract 1 day correctly in local time
        const getPrevDay = (dStr: string) => {
          const [y, m, d] = dStr.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          date.setDate(date.getDate() - 1);
          return date.toLocaleDateString('en-CA');
        };

        // Iterate to count consecutive days
        for (const d of uniqueDates) {
          if (d === checkDateStr) {
            currentStreak++;
            checkDateStr = getPrevDay(checkDateStr);
          } else {
            break; // Gap found
          }
        }

        // Update Habit Streak
        const { data: habitData } = await supabase.from('habits').select('best_streak').eq('id', id).single();
        const bestStreak = Math.max(habitData?.best_streak || 0, currentStreak);

        await supabase.from('habits').update({
          streak: currentStreak,
          best_streak: bestStreak
        }).eq('id', id);
      }
      // --- STREAK CALCULATION END ---
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // In case profile relies on level
    },
  });

  const uncompleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habit_completions').delete()
        .eq('habit_id', id)
        .eq('user_id', session?.user?.id)
        .eq('completed_date', today);

      if (error) throw error;

      // Optional: Deduct XP? usually we don't to avoid complexity/anger, but strictly speaking we should. 
      // For now, let's just allow unchecking without penalty logic to keep it simple, or user might abuse it? 
      // Actually simpler not to touch XP on undo for this MVP.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const updateHabitMutation = useMutation({
    mutationFn: async (habit: Habit) => {
      const { error } = await supabase.from('habits').update({
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        category: habit.category,
        color: habit.color,
        reminder_time: habit.reminderTime
      }).eq('id', habit.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  return {
    habits,
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => addHabitMutation.mutateAsync(habit),
    updateHabit: (habit: Habit) => updateHabitMutation.mutate(habit),
    deleteHabit: (id: string) => deleteHabitMutation.mutate(id),
    completeHabit: (id: string) => completeHabitMutation.mutate(id),
    uncompleteHabit: (id: string) => uncompleteHabitMutation.mutate(id),
    isCompletedToday: (id: string) => habits.find(h => h.id === id)?.completedDates.includes(today) || false,
  };
}

// --- FOCUS HOOK ---
export function useFocus() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['focus_sessions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('focus_sessions').select('*').order('started_at', { ascending: false });
      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        mode: s.mode,
        duration: s.duration,
        completedDuration: s.completed_duration || 0,
        taskId: s.task_id,
        taskTitle: s.task_title,
        startedAt: s.started_at,
        completedAt: s.completed_at,
        completed: s.completed || false,
      })) as FocusSession[];
    },
    enabled: !!session?.user?.id
  });

  const startSessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<FocusSession, 'id' | 'startedAt'>) => {
      const { data, error } = await supabase.from('focus_sessions').insert({
        user_id: session?.user?.id,
        mode: sessionData.mode,
        duration: sessionData.duration,
        task_id: sessionData.taskId,
        task_title: sessionData.taskTitle,
        started_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focus_sessions'] })
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (sessionData: FocusSession) => {
      const { error } = await supabase.from('focus_sessions').update({
        completed: sessionData.completed,
        completed_duration: sessionData.completedDuration,
        completed_at: sessionData.completedAt
      }).eq('id', sessionData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  return {
    sessions,
    todaySessions: sessions.filter(s => s.startedAt.startsWith(getToday())),
    startSession: (session: Omit<FocusSession, 'id' | 'startedAt'>) => startSessionMutation.mutate(session),
    updateSession: (session: FocusSession) => updateSessionMutation.mutate(session),
    completeSession: (session: FocusSession) => updateSessionMutation.mutate({ ...session, completed: true, completedAt: new Date().toISOString() }),
  };
}

// --- JOURNAL HOOK ---
export function useJournal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['journal', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('journal_entries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(e => ({
        id: e.id,
        title: e.title,
        content: e.content || '',
        mood: e.mood || 0,
        tags: e.tags || [],
        createdAt: e.created_at,
        sentiment: e.sentiment
      })) as JournalEntry[];
    },
    enabled: !!session?.user?.id
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
      const { error } = await supabase.from('journal_entries').insert({
        user_id: session?.user?.id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        sentiment: entry.sentiment || 'neutral'
      });
      if (error) throw error;
      if (session?.user?.id) updateJournalNotification(session.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      const { error } = await supabase.from('journal_entries').update({
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
      }).eq('id', entry.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal'] })
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) throw error;
      if (session?.user?.id) updateJournalNotification(session.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  return {
    entries,
    addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => addEntryMutation.mutate(entry),
    updateEntry: (entry: JournalEntry) => updateEntryMutation.mutate(entry),
    deleteEntry: (id: string) => deleteEntryMutation.mutate(id),
  };
}

// --- CALENDAR HOOK ---
export function useCalendar() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['calendar', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('calendar_events').select('*');
      if (error) throw error;
      return data.map(e => ({
        id: e.id,
        title: e.title,
        type: e.event_type as any,
        date: e.event_date,
        time: e.event_time || '',
        duration: e.duration || '',
        color: e.color || 'bg-primary',
        completed: e.completed || false,
        recurring: e.recurring || undefined
      })) as CalendarEvent[];
    },
    enabled: !!session?.user?.id
  });

  const addEventMutation = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'completed'>) => {
      const { error } = await supabase.from('calendar_events').insert({
        user_id: session?.user?.id,
        title: event.title,
        event_type: event.type,
        event_date: event.date,
        event_time: event.time,
        duration: event.duration,
        color: event.color,
        recurring: event.recurring
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const updateEventMutation = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      const { error } = await supabase.from('calendar_events').update({
        title: event.title,
        event_type: event.type,
        event_date: event.date,
        event_time: event.time,
        duration: event.duration,
        color: event.color,
        completed: event.completed,
        recurring: event.recurring
      }).eq('id', event.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });

  return {
    events,
    addEvent: (event: Omit<CalendarEvent, 'id' | 'completed'>) => addEventMutation.mutate(event),
    updateEvent: (event: CalendarEvent) => updateEventMutation.mutate(event),
    deleteEvent: (id: string) => deleteEventMutation.mutate(id),
    getEventsForDate: (date: string) => events.filter(e => e.date === date),
  };
}

// --- MOOD HOOK ---
export function useMood() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const today = getToday();

  const { data: moodLogs = [] } = useQuery({
    queryKey: ['mood_logs', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('mood_logs').select('*').order('log_date', { ascending: false });
      if (error) throw error;
      return data.map(m => ({
        id: m.id,
        mood: m.mood,
        energy: m.energy,
        date: m.log_date,
        note: m.note,
        factors: m.factors
      })) as MoodLog[];
    },
    enabled: !!session?.user?.id
  });

  const logMoodMutation = useMutation({
    mutationFn: async (moodData: { mood: number, energy?: number, note?: string }) => {
      const { error } = await supabase.from('mood_logs').insert({
        user_id: session?.user?.id,
        mood: moodData.mood,
        energy: moodData.energy,
        note: moodData.note,
        log_date: today
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mood_logs'] })
  });

  return {
    moodLogs,
    todayMood: moodLogs.find(m => m.date === today),
    logMood: (mood: number, energy?: number, note?: string) => logMoodMutation.mutate({ mood, energy, note }),
    weekMoods: moodLogs.slice(0, 7),
  };
}

// --- STATS HOOK ---
export function useStats() {
  const { session } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['stats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { totalTasks: 0, completedTasks: 0, totalFocusMinutes: 0, totalJournalEntries: 0, currentTaskStreak: 0, currentFocusStreak: 0, currentJournalStreak: 0, level: 1, xp: 0 } as UserStats;
      const { data, error } = await supabase.from('user_stats').select('*').single();
      if (error) {
        // If no stats, return default (auth trigger should have created it though)
        return { totalTasks: 0, completedTasks: 0, totalFocusMinutes: 0, totalJournalEntries: 0, currentTaskStreak: 0, currentFocusStreak: 0, currentJournalStreak: 0, level: 1, xp: 0 } as UserStats;
      }
      return {
        totalTasks: data.total_tasks || 0,
        completedTasks: data.completed_tasks || 0,
        totalFocusMinutes: data.total_focus_minutes || 0,
        totalJournalEntries: data.total_journal_entries || 0,
        currentTaskStreak: data.current_task_streak || 0,
        currentFocusStreak: data.current_focus_streak || 0,
        currentJournalStreak: data.current_journal_streak || 0,
        level: data.level || 1,
        xp: data.xp || 0
      } as UserStats;
    },
    enabled: !!session?.user?.id
  });

  // Calculate daily stats locally for now as they are dynamic
  const productivity = 80; // Placeholder until we have more complex backend aggregation
  const todayTasksCompleted = 0; // Better to fetch derived
  const todayFocusMinutes = 0; // Better to fetch derived

  return {
    ...(stats || { totalTasks: 0, completedTasks: 0, totalFocusMinutes: 0, totalJournalEntries: 0, currentTaskStreak: 0, currentFocusStreak: 0, currentJournalStreak: 0, level: 1, xp: 0 }),
    productivity,
    todayTasksCompleted,
    todayFocusMinutes,
    todayHabitsCompleted: 0 // Placeholder
  };
}

// --- AI/PROFILE HOOK ---
export function useAI() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { name: '', goals: [], priorities: [], onboardingComplete: false } as UserProfile;
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (error) return { name: '', goals: [], priorities: [], onboardingComplete: false } as UserProfile;
      return {
        name: data.name || '',
        goals: data.goals || [],
        priorities: data.priorities || [],
        onboardingComplete: data.onboarding_complete || false,
        workStyle: data.work_style || undefined,
        preferredFocusTime: data.preferred_focus_time || undefined
      } as UserProfile;
    },
    enabled: !!session?.user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { error } = await supabase.from('profiles').update({
        name: updates.name,
        goals: updates.goals,
        priorities: updates.priorities,
        onboarding_complete: updates.onboardingComplete
      }).eq('id', session?.user?.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  return {
    messages: [], // AI features
    addMessage: () => { },
    profile: profile || { name: '', goals: [], priorities: [], onboardingComplete: false },
    updateProfile: (updates: Partial<UserProfile>) => updateProfileMutation.mutate(updates),
  };
}

// --- ACHIEVEMENTS HOOK ---
export function useAchievements() {
  const { session } = useAuth();
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('achievements').select('*');
      if (error) throw error;
      return data.map(a => ({
        id: a.achievement_id,
        title: a.title,
        description: a.description || '',
        unlockedAt: a.unlocked_at,
        icon: a.icon || '🏆'
      })) as Achievement[];
    },
    enabled: !!session?.user?.id
  });

  return { achievements, unlock: () => { } };
}

// --- CATEGORIES HOOK ---
export function useCategories() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color || 'bg-primary'
      })) as Category[];
    },
    enabled: !!session?.user?.id
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name: string, color: string }) => {
      const { error } = await supabase.from('categories').insert({
        user_id: session?.user?.id,
        name: category.name,
        color: category.color
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (category: { id: string, name: string, color: string }) => {
      const { error } = await supabase.from('categories').update({
        name: category.name,
        color: category.color
      }).eq('id', category.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return {
    categories,
    addCategory: (name: string, color: string) => addCategoryMutation.mutateAsync({ name, color }),
    updateCategory: (id: string, name: string, color: string) => updateCategoryMutation.mutateAsync({ id, name, color }),
    deleteCategory: (id: string) => deleteCategoryMutation.mutateAsync(id)
  };
}

// --- DATA MANAGEMENT HOOK (DANGER ZONE) ---
export function useDataManagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const verifyPassword = async (password: string) => {
    if (!session?.user?.email) throw new Error("User not found");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password
    });
    if (error) throw error;
    return !!data.user;
  };

  const deleteAllTasksMutation = useMutation({
    mutationFn: async () => {
      // Delete tasks, focus sessions, generic events
      const { error: tErr } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matching RLS
      if (tErr) throw tErr;
      const { error: fErr } = await supabase.from('focus_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (fErr) throw fErr;
      const { error: cErr } = await supabase.from('calendar_events').delete().eq('event_type', 'task');
      if (cErr) throw cErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success("All tasks and focus history wiped.");
    }
  });

  const deleteAllJournalsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('journal_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success("Journal encrypted archives destroyed.");
    }
  });

  const deleteEverythingMutation = useMutation({
    mutationFn: async () => {
      // 1. Data Tables
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('journal_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('focus_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('calendar_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('mood_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ai_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Reset Stats
      await supabase.from('user_stats').update({
        total_tasks: 0,
        completed_tasks: 0,
        total_focus_minutes: 0,
        total_journal_entries: 0,
        current_task_streak: 0,
        current_focus_streak: 0,
        current_journal_streak: 0,
        level: 1,
        xp: 0
      }).eq('id', session?.user?.id);

      // 3. Reset Categories to Default? (Optional, maybe keep custom sectors or wipe them?)
      // User said "delete all data and all history". Categories are config data. Let's wipe custom ones, keep defaults.
      await supabase.from('categories').delete().eq('is_default', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("SYSTEM FACTORY RESET COMPLETE. WELCOME BACK, OPERATOR.");
    }
  });

  return {
    verifyPassword,
    deleteAllTasks: deleteAllTasksMutation.mutateAsync,
    deleteAllJournals: deleteAllJournalsMutation.mutateAsync,
    deleteEverything: deleteEverythingMutation.mutateAsync,
    isLoading: deleteAllTasksMutation.isPending || deleteAllJournalsMutation.isPending || deleteEverythingMutation.isPending
  };
}

// --- APP PROVIDER (CONTEXT) ---
// Kept for backward compatibility if needed, but mostly just wrapper
export const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // We can provide some global state if needed, or just be a pass-through
  return <AppContext.Provider value={{ state: {} }}>{children}</AppContext.Provider>;
}

// --- USEAPP HOOK ---
// Refactored to get data from hooks instead of context state
export function useApp() {
  // This is a bridge for components using `useApp`. created to avoid breaking Profile.tsx
  const { profile } = useAI();
  const stats = useStats();

  return {
    state: {
      userName: profile.name || 'Achiever',
      userStats: stats
      // Other state properties might be missing, need to check usages
    },
    dispatch: () => console.warn("Dispatch is deprecated in favor of useMutation")
  };
}
