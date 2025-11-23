import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          created_at?: string;
        };
      };
      cycle_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          entry_type: "period_start" | "period_end";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          entry_type: "period_start" | "period_end";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          entry_type?: "period_start" | "period_end";
          notes?: string | null;
          created_at?: string;
        };
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          mood: number | null;
          energy: number | null;
          symptoms: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date: string;
          mood?: number | null;
          energy?: number | null;
          symptoms?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          mood?: number | null;
          energy?: number | null;
          symptoms?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type CycleEntry = Database["public"]["Tables"]["cycle_entries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];
