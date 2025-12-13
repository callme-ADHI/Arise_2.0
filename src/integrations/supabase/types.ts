export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_id: string
          description: string | null
          icon: string | null
          id: string
          target_value: number | null
          tier: number | null
          title: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id: string
          description?: string | null
          icon?: string | null
          id?: string
          target_value?: number | null
          tier?: number | null
          title: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string
          description?: string | null
          icon?: string | null
          id?: string
          target_value?: number | null
          tier?: number | null
          title?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string | null
          completed: boolean | null
          created_at: string | null
          duration: string | null
          event_date: string
          event_time: string | null
          event_type: string | null
          habit_id: string | null
          id: string
          recurring: string | null
          task_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          duration?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string | null
          habit_id?: string | null
          id?: string
          recurring?: string | null
          task_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          duration?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string | null
          habit_id?: string | null
          id?: string
          recurring?: string | null
          task_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completed_duration: number | null
          duration: number
          id: string
          interruptions: number | null
          mode: string
          notes: string | null
          quality: number | null
          started_at: string | null
          task_id: string | null
          task_title: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completed_duration?: number | null
          duration: number
          id?: string
          interruptions?: number | null
          mode: string
          notes?: string | null
          quality?: number | null
          started_at?: string | null
          task_id?: string | null
          task_title?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completed_duration?: number | null
          duration?: number
          id?: string
          interruptions?: number | null
          mode?: string
          notes?: string | null
          quality?: number | null
          started_at?: string | null
          task_id?: string | null
          task_title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_at: string | null
          completed_date: string
          habit_id: string | null
          id: string
          notes: string | null
          quality_rating: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_date: string
          habit_id?: string | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_date?: string
          habit_id?: string | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_tasks: {
        Row: {
          ai_generated: boolean | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          estimated_minutes: number | null
          habit_id: string | null
          id: string
          priority: string | null
          scheduled_date: string
          scheduled_time: string | null
          task_description: string | null
          task_title: string
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          estimated_minutes?: number | null
          habit_id?: string | null
          id?: string
          priority?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          task_description?: string | null
          task_title: string
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          estimated_minutes?: number | null
          habit_id?: string | null
          id?: string
          priority?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          task_description?: string | null
          task_title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_tasks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          ai_analysis: Json | null
          best_streak: number | null
          category: string | null
          color: string | null
          created_at: string | null
          cue: string | null
          current_phase: string | null
          description: string | null
          frequency: string | null
          id: string
          implementation_intention: string | null
          is_active: boolean | null
          reminder_time: string | null
          schedule_frequency: string | null
          start_date: string | null
          streak: number | null
          target_automaticity: number | null
          target_days: number[] | null
          target_end_date: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          best_streak?: number | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          cue?: string | null
          current_phase?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          implementation_intention?: string | null
          is_active?: boolean | null
          reminder_time?: string | null
          schedule_frequency?: string | null
          start_date?: string | null
          streak?: number | null
          target_automaticity?: number | null
          target_days?: number[] | null
          target_end_date?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          best_streak?: number | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          cue?: string | null
          current_phase?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          implementation_intention?: string | null
          is_active?: boolean | null
          reminder_time?: string | null
          schedule_frequency?: string | null
          start_date?: string | null
          streak?: number | null
          target_automaticity?: number | null
          target_days?: number[] | null
          target_end_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          mood: number | null
          sentiment: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          mood?: number | null
          sentiment?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          mood?: number | null
          sentiment?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string | null
          energy: number | null
          factors: string[] | null
          id: string
          log_date: string | null
          mood: number
          note: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          energy?: number | null
          factors?: string[] | null
          id?: string
          log_date?: string | null
          mood: number
          note?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          energy?: number | null
          factors?: string[] | null
          id?: string
          log_date?: string | null
          mood?: number
          note?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          goals: string[] | null
          id: string
          name: string | null
          onboarding_complete: boolean | null
          preferred_focus_time: string | null
          priorities: string[] | null
          timezone: string | null
          updated_at: string | null
          work_style: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          goals?: string[] | null
          id: string
          name?: string | null
          onboarding_complete?: boolean | null
          preferred_focus_time?: string | null
          priorities?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          work_style?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean | null
          preferred_focus_time?: string | null
          priorities?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          work_style?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_generated: boolean | null
          category: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_minutes: number | null
          habit_id: string | null
          id: string
          priority: string | null
          subtasks: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          habit_id?: string | null
          id?: string
          priority?: string | null
          subtasks?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          habit_id?: string | null
          id?: string
          priority?: string | null
          subtasks?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          completed_tasks: number | null
          current_focus_streak: number | null
          current_journal_streak: number | null
          current_task_streak: number | null
          id: string
          level: number | null
          total_focus_minutes: number | null
          total_journal_entries: number | null
          total_tasks: number | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          completed_tasks?: number | null
          current_focus_streak?: number | null
          current_journal_streak?: number | null
          current_task_streak?: number | null
          id: string
          level?: number | null
          total_focus_minutes?: number | null
          total_journal_entries?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          completed_tasks?: number | null
          current_focus_streak?: number | null
          current_journal_streak?: number | null
          current_task_streak?: number | null
          id?: string
          level?: number | null
          total_focus_minutes?: number | null
          total_journal_entries?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
