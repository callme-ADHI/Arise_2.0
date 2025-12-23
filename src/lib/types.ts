export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
  estimatedMinutes?: number;
  habitId?: string;
  reminderTime?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface FocusSession {
  id: string;
  mode: string;
  duration: number;
  completedDuration: number;
  taskId?: string;
  taskTitle?: string;
  quality?: number;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
  interruptions?: number;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'routine' | 'focus' | 'meeting' | 'break' | 'task' | 'habit';
  date: string;
  time: string;
  duration: string;
  taskId?: string;
  color: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed?: boolean;
}

export interface MoodLog {
  id: string;
  mood: number;
  energy?: number;
  date: string;
  note?: string;
  factors?: string[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[];
  category: string;
  streak: number;
  bestStreak: number;
  completedDates: string[];
  createdAt: string;
  color: string;
  reminderTime?: string;
  aiSuggested?: boolean;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalFocusMinutes: number;
  totalJournalEntries: number;
  currentTaskStreak: number;
  currentFocusStreak: number;
  currentJournalStreak: number;
  level: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  goals: string[];
  priorities: string[];
  preferredFocusTime?: string;
  workStyle?: string;
  onboardingComplete: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
