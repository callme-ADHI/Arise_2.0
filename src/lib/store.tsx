import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task, JournalEntry, FocusSession, CalendarEvent, MoodLog, UserStats, Achievement, Habit, AIMessage, UserProfile, Category } from './types';
import { toast } from 'sonner';
import { calculateLevelInfo, XP_REWARDS } from './progression';

// Helper to get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

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
        estimatedMinutes: t.estimated_minutes || undefined
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
        estimated_minutes: task.estimatedMinutes
      }).select().single();
      if (error) throw error;
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

      // XP REWARD
      if (newCompleted) {
        const { data: currentStats } = await supabase.from('user_stats').select('*').eq('id', session?.user?.id).single();
        if (currentStats) {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
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
      const { error } = await supabase.from('habits').insert({
        user_id: session?.user?.id,
        title: habit.title,
        frequency: habit.frequency,
        category: habit.category,
        color: habit.color,
        // Default values
        streak: 0,
        best_streak: 0
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
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
          // We could also update total_habits_completed if that column existed, but it doesn't.
        }).eq('id', session?.user?.id);

        if (newLevel > (currentStats.level || 1)) {
          toast.success(`LEVEL UP! You are now Level ${newLevel}`);
        }
      }
      // --- XP LOGIC END ---
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // In case profile relies on level
    },
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
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => addHabitMutation.mutate(habit),
    updateHabit: (habit: Habit) => updateHabitMutation.mutate(habit),
    deleteHabit: (id: string) => deleteHabitMutation.mutate(id),
    completeHabit: (id: string) => completeHabitMutation.mutate(id),
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

  return {
    categories,
    addCategory: (name: string, color: string) => addCategoryMutation.mutateAsync({ name, color }),
    deleteCategory: (id: string) => deleteCategoryMutation.mutateAsync(id)
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
