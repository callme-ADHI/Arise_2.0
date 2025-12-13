-- Migration: Add cascade delete for habit-related tasks
-- This ensures that when a habit is deleted, all future tasks related to that habit are also deleted

-- First, create a function to delete future tasks when a habit is deleted
CREATE OR REPLACE FUNCTION delete_future_habit_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all tasks related to the deleted habit that are due today or in the future
  DELETE FROM tasks
  WHERE habit_id = OLD.id
  AND due_date >= CURRENT_DATE;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs before a habit is deleted
DROP TRIGGER IF EXISTS trigger_delete_future_habit_tasks ON habits;
CREATE TRIGGER trigger_delete_future_habit_tasks
  BEFORE DELETE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION delete_future_habit_tasks();

-- Also update the tasks table to have proper foreign key with cascade
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_habit_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_habit_id_fkey
  FOREIGN KEY (habit_id)
  REFERENCES habits(id)
  ON DELETE CASCADE;

-- Create index for better performance on habit_id and due_date queries
CREATE INDEX IF NOT EXISTS idx_tasks_habit_due_date 
ON tasks(habit_id, due_date) 
WHERE habit_id IS NOT NULL;