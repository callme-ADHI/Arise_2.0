-- Add reminder_time column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_time TEXT;
