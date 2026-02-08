/**
 * Supabase Database Types
 * Generated from migration schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Type for Supabase relationship definitions (unused but kept for documentation)
type _RelationshipDefinition = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      practices: {
        Row: {
          id: string;
          name: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          practice_id: string;
          external_id: string | null;
          client_id: string | null;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: "M" | "F" | "Non-binary" | "Other" | "Prefer not to say" | null;
          email: string | null;
          phone_mobile: string | null;
          phone_home: string | null;
          address_street: string | null;
          address_city: string | null;
          address_state: string | null;
          address_zip: string | null;
          insurance_provider: string | null;
          insurance_member_id: string | null;
          primary_diagnosis_code: string | null;
          primary_diagnosis_name: string | null;
          secondary_diagnosis_code: string | null;
          risk_level: "low" | "medium" | "high" | null;
          medications: string[] | null;
          treatment_start_date: string | null;
          provider: string | null;
          status: "Active" | "Inactive" | "Discharged";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          external_id?: string | null;
          client_id?: string | null;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender?: "M" | "F" | "Non-binary" | "Other" | "Prefer not to say" | null;
          email?: string | null;
          phone_mobile?: string | null;
          phone_home?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
          insurance_provider?: string | null;
          insurance_member_id?: string | null;
          primary_diagnosis_code?: string | null;
          primary_diagnosis_name?: string | null;
          secondary_diagnosis_code?: string | null;
          risk_level?: "low" | "medium" | "high" | null;
          medications?: string[] | null;
          treatment_start_date?: string | null;
          provider?: string | null;
          status?: "Active" | "Inactive" | "Discharged";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          external_id?: string | null;
          client_id?: string | null;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          gender?: "M" | "F" | "Non-binary" | "Other" | "Prefer not to say" | null;
          email?: string | null;
          phone_mobile?: string | null;
          phone_home?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
          insurance_provider?: string | null;
          insurance_member_id?: string | null;
          primary_diagnosis_code?: string | null;
          primary_diagnosis_name?: string | null;
          secondary_diagnosis_code?: string | null;
          risk_level?: "low" | "medium" | "high" | null;
          medications?: string[] | null;
          treatment_start_date?: string | null;
          provider?: string | null;
          status?: "Active" | "Inactive" | "Discharged";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          external_id: string | null;
          date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          status: "Scheduled" | "Confirmed" | "Checked-In" | "In Session" | "Completed" | "No-Show" | "Cancelled";
          service_type: string;
          cpt_code: string | null;
          location: string | null;
          notes: string | null;
          appointment_type: string | null;
          format: "in_person" | "telehealth" | null;
          room: string | null;
          recurring_group_id: string | null;
          recurring_pattern: "weekly" | "biweekly" | "monthly" | null;
          cancelled_reason: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          external_id?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          status: "Scheduled" | "Confirmed" | "Checked-In" | "In Session" | "Completed" | "No-Show" | "Cancelled";
          service_type: string;
          cpt_code?: string | null;
          location?: string | null;
          notes?: string | null;
          appointment_type?: string | null;
          format?: "in_person" | "telehealth" | null;
          room?: string | null;
          recurring_group_id?: string | null;
          recurring_pattern?: "weekly" | "biweekly" | "monthly" | null;
          cancelled_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          external_id?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          status?: "Scheduled" | "Confirmed" | "Checked-In" | "In Session" | "Completed" | "No-Show" | "Cancelled";
          service_type?: string;
          cpt_code?: string | null;
          location?: string | null;
          notes?: string | null;
          appointment_type?: string | null;
          format?: "in_person" | "telehealth" | null;
          room?: string | null;
          recurring_group_id?: string | null;
          recurring_pattern?: "weekly" | "biweekly" | "monthly" | null;
          cancelled_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      outcome_measures: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          measure_type: "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
          score: number;
          max_score: number;
          measurement_date: string;
          administered_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          measure_type: "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
          score: number;
          max_score: number;
          measurement_date: string;
          administered_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          measure_type?: "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
          score?: number;
          max_score?: number;
          measurement_date?: string;
          administered_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outcome_measures_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outcome_measures_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          direction: "inbound" | "outbound";
          channel: "sms" | "email" | "portal" | "voice";
          content: string;
          timestamp: string;
          read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          direction: "inbound" | "outbound";
          channel: "sms" | "email" | "portal" | "voice";
          content: string;
          timestamp: string;
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          direction?: "inbound" | "outbound";
          channel?: "sms" | "email" | "portal" | "voice";
          content?: string;
          timestamp?: string;
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          appointment_id: string | null;
          external_id: string | null;
          date_of_service: string;
          cpt_code: string | null;
          charge_amount: number;
          insurance_paid: number;
          patient_responsibility: number;
          patient_paid: number;
          balance: number;
          status: "Paid" | "Pending" | "Partial" | "Denied" | "Cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          appointment_id?: string | null;
          external_id?: string | null;
          date_of_service: string;
          cpt_code?: string | null;
          charge_amount: number;
          insurance_paid?: number;
          patient_responsibility: number;
          patient_paid?: number;
          balance: number;
          status: "Paid" | "Pending" | "Partial" | "Denied" | "Cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          appointment_id?: string | null;
          external_id?: string | null;
          date_of_service?: string;
          cpt_code?: string | null;
          charge_amount?: number;
          insurance_paid?: number;
          patient_responsibility?: number;
          patient_paid?: number;
          balance?: number;
          status?: "Paid" | "Pending" | "Partial" | "Denied" | "Cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
        ];
      };
      priority_actions: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          urgency: "urgent" | "high" | "medium" | "low";
          title: string;
          description: string | null;
          clinical_context: string | null;
          ai_reasoning: string | null;
          confidence_score: number | null;
          timeframe: string | null;
          suggested_actions: Json | null;
          icon: string | null;
          status: "pending" | "in_progress" | "completed" | "dismissed";
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          urgency: "urgent" | "high" | "medium" | "low";
          title: string;
          description?: string | null;
          clinical_context?: string | null;
          ai_reasoning?: string | null;
          confidence_score?: number | null;
          timeframe?: string | null;
          suggested_actions?: Json | null;
          icon?: string | null;
          status?: "pending" | "in_progress" | "completed" | "dismissed";
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          urgency?: "urgent" | "high" | "medium" | "low";
          title?: string;
          description?: string | null;
          clinical_context?: string | null;
          ai_reasoning?: string | null;
          confidence_score?: number | null;
          timeframe?: string | null;
          suggested_actions?: Json | null;
          icon?: string | null;
          status?: "pending" | "in_progress" | "completed" | "dismissed";
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "priority_actions_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "priority_actions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_tasks: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          priority_action_id: string | null;
          task_type: string;
          title: string;
          description: string | null;
          status: "pending" | "completed" | "cancelled";
          due_date: string | null;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          priority_action_id?: string | null;
          task_type: string;
          title: string;
          description?: string | null;
          status?: "pending" | "completed" | "cancelled";
          due_date?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          priority_action_id?: string | null;
          task_type?: string;
          title?: string;
          description?: string | null;
          status?: "pending" | "completed" | "cancelled";
          due_date?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_tasks_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_tasks_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_tasks_priority_action_id_fkey";
            columns: ["priority_action_id"];
            isOneToOne: false;
            referencedRelation: "priority_actions";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_analysis_runs: {
        Row: {
          id: string;
          practice_id: string;
          batch_id: string;
          patients_analyzed: number;
          actions_generated: number;
          duration_seconds: number;
          started_at: string;
          completed_at: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          batch_id: string;
          patients_analyzed: number;
          actions_generated: number;
          duration_seconds: number;
          started_at: string;
          completed_at: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          batch_id?: string;
          patients_analyzed?: number;
          actions_generated?: number;
          duration_seconds?: number;
          started_at?: string;
          completed_at?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_analysis_runs_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          reviewer_name: string | null;
          review_type: "treatment_outcome" | "care_quality" | "provider_feedback" | "general";
          rating: number;
          title: string;
          review_text: string;
          is_anonymous: boolean;
          review_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          reviewer_name?: string | null;
          review_type: "treatment_outcome" | "care_quality" | "provider_feedback" | "general";
          rating: number;
          title: string;
          review_text: string;
          is_anonymous?: boolean;
          review_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          reviewer_name?: string | null;
          review_type?: "treatment_outcome" | "care_quality" | "provider_feedback" | "general";
          rating?: number;
          title?: string;
          review_text?: string;
          is_anonymous?: boolean;
          review_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      // Demo-specific tables (created by demo migration, not in base schema)
      prioritized_actions: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          title: string;
          urgency: string;
          time_window: string | null;
          ai_confidence: number | null;
          clinical_context: string | null;
          suggested_actions: string[] | null;
          status: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          title: string;
          urgency: string;
          time_window?: string | null;
          ai_confidence?: number | null;
          clinical_context?: string | null;
          suggested_actions?: string[] | null;
          status?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          title?: string;
          urgency?: string;
          time_window?: string | null;
          ai_confidence?: number | null;
          clinical_context?: string | null;
          suggested_actions?: string[] | null;
          status?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prioritized_actions_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prioritized_actions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      communications: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          channel: string;
          direction: string;
          sender: string | null;
          recipient: string | null;
          sender_email: string | null;
          recipient_email: string | null;
          sender_phone: string | null;
          recipient_phone: string | null;
          message_body: string | null;
          is_read: boolean;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          channel: string;
          direction: string;
          sender?: string | null;
          recipient?: string | null;
          sender_email?: string | null;
          recipient_email?: string | null;
          sender_phone?: string | null;
          recipient_phone?: string | null;
          message_body?: string | null;
          is_read?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          channel?: string;
          direction?: string;
          sender?: string | null;
          recipient?: string | null;
          sender_email?: string | null;
          recipient_email?: string | null;
          sender_phone?: string | null;
          recipient_phone?: string | null;
          message_body?: string | null;
          is_read?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communications_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "communications_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      visit_summaries: {
        Row: {
          id: string;
          practice_id: string;
          patient_id: string;
          clinical_note_id: string | null;
          visit_date: string;
          patient_name: string | null;
          appointment_type: string | null;
          visit_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          patient_id: string;
          clinical_note_id?: string | null;
          visit_date: string;
          patient_name?: string | null;
          appointment_type?: string | null;
          visit_summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          patient_id?: string;
          clinical_note_id?: string | null;
          visit_date?: string;
          patient_name?: string | null;
          appointment_type?: string | null;
          visit_summary?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visit_summaries_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visit_summaries_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      appointment_reminders: {
        Row: {
          id: string;
          practice_id: string;
          appointment_id: string;
          reminder_type: "24h" | "2h" | "custom";
          scheduled_at: string;
          sent_at: string | null;
          channel: "email" | "sms" | "push";
          status: "pending" | "sent" | "failed" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          appointment_id: string;
          reminder_type: "24h" | "2h" | "custom";
          scheduled_at: string;
          sent_at?: string | null;
          channel?: "email" | "sms" | "push";
          status?: "pending" | "sent" | "failed" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          appointment_id?: string;
          reminder_type?: "24h" | "2h" | "custom";
          scheduled_at?: string;
          sent_at?: string | null;
          channel?: "email" | "sms" | "push";
          status?: "pending" | "sent" | "failed" | "cancelled";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Practice = Database["public"]["Tables"]["practices"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type OutcomeMeasure = Database["public"]["Tables"]["outcome_measures"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type PriorityAction = Database["public"]["Tables"]["priority_actions"]["Row"];
export type ClinicalTask = Database["public"]["Tables"]["clinical_tasks"]["Row"];
export type AIAnalysisRun = Database["public"]["Tables"]["ai_analysis_runs"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

// Demo-specific types
export type PrioritizedAction = Database["public"]["Tables"]["prioritized_actions"]["Row"];
export type Communication = Database["public"]["Tables"]["communications"]["Row"];
export type VisitSummary = Database["public"]["Tables"]["visit_summaries"]["Row"];

// Scheduling types
export type AppointmentReminder = Database["public"]["Tables"]["appointment_reminders"]["Row"];
export type AppointmentReminderInsert = Database["public"]["Tables"]["appointment_reminders"]["Insert"];

// Extended appointment status type
export type AppointmentStatus = "Scheduled" | "Confirmed" | "Checked-In" | "In Session" | "Completed" | "No-Show" | "Cancelled";

// Appointment type definitions with CPT codes
export type AppointmentTypeCode =
  | "initial_evaluation"
  | "individual_therapy_30"
  | "individual_therapy_45"
  | "individual_therapy_53"
  | "crisis_session"
  | "medication_management";

export interface AppointmentTypeConfig {
  code: AppointmentTypeCode;
  label: string;
  cptCode: string;
  defaultDuration: number;
}

export const APPOINTMENT_TYPES: AppointmentTypeConfig[] = [
  { code: "initial_evaluation", label: "Initial Evaluation", cptCode: "90791", defaultDuration: 60 },
  { code: "individual_therapy_30", label: "Individual Therapy 30min", cptCode: "90834", defaultDuration: 30 },
  { code: "individual_therapy_45", label: "Individual Therapy 45min", cptCode: "90837", defaultDuration: 45 },
  { code: "individual_therapy_53", label: "Individual Therapy 53min", cptCode: "90836", defaultDuration: 53 },
  { code: "crisis_session", label: "Crisis Session", cptCode: "", defaultDuration: 60 },
  { code: "medication_management", label: "Medication Management", cptCode: "", defaultDuration: 15 },
];

// Status state machine definition
export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  "Scheduled": ["Confirmed", "Cancelled"],
  "Confirmed": ["Checked-In", "Cancelled"],
  "Checked-In": ["In Session", "No-Show"],
  "In Session": ["Completed"],
  "Completed": [], // Terminal state
  "No-Show": [], // Terminal state
  "Cancelled": [], // Terminal state (but can reschedule via new appointment)
};

// Insert types
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type OutcomeMeasureInsert = Database["public"]["Tables"]["outcome_measures"]["Insert"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
export type PriorityActionInsert = Database["public"]["Tables"]["priority_actions"]["Insert"];
export type ClinicalTaskInsert = Database["public"]["Tables"]["clinical_tasks"]["Insert"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

// Priority action with patient relation
export type PriorityActionWithPatient = PriorityAction & {
  patient: Pick<
    Patient,
    "id" | "first_name" | "last_name" | "date_of_birth" | "risk_level" | "avatar_url"
  >;
};

// Prioritized action with patient relation (for demo table)
export type PrioritizedActionWithPatient = PrioritizedAction & {
  patient: Pick<
    Patient,
    "id" | "first_name" | "last_name" | "date_of_birth" | "risk_level" | "avatar_url"
  >;
  // Mapped fields for UI compatibility
  urgency: "urgent" | "high" | "medium" | "low";
  confidence_score: number;
  timeframe: string;
  status: string;
};
