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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          category: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      clients: {
        Row: {
          address_line: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          allow_custom_branding: boolean
          allow_pdf_export: boolean
          allow_templates: boolean
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          is_active: boolean | null
          is_starter: boolean
          max_clients: number | null
          max_proposals: number | null
          name: string
          price: number | null
          trial_days: number
        }
        Insert: {
          allow_custom_branding?: boolean
          allow_pdf_export?: boolean
          allow_templates?: boolean
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          is_starter?: boolean
          max_clients?: number | null
          max_proposals?: number | null
          name: string
          price?: number | null
          trial_days?: number
        }
        Update: {
          allow_custom_branding?: boolean
          allow_pdf_export?: boolean
          allow_templates?: boolean
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          is_starter?: boolean
          max_clients?: number | null
          max_proposals?: number | null
          name?: string
          price?: number | null
          trial_days?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          logo_url: string | null
          onboarding_complete: boolean
          primary_color: string | null
          secondary_color: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          logo_url?: string | null
          onboarding_complete?: boolean
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          onboarding_complete?: boolean
          primary_color?: string | null
          secondary_color?: string | null
        }
        Relationships: []
      }
      proposal_items: {
        Row: {
          created_at: string
          description: string
          id: string
          position: number
          proposal_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          proposal_id: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          proposal_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_signatures: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          proposal_id: string
          signed_at: string
          signer_email: string | null
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          proposal_id: string
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          proposal_id?: string
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_signatures_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          proposal_id: string
          status_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          proposal_id: string
          status_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          proposal_id?: string
          status_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_status_history_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_status_history_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "proposal_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_statuses: {
        Row: {
          color: string
          created_at: string
          id: string
          is_default: boolean | null
          is_final: boolean | null
          is_won: boolean
          name: string
          position: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_final?: boolean | null
          is_won?: boolean
          name: string
          position?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_final?: boolean | null
          is_won?: boolean
          name?: string
          position?: number
        }
        Relationships: []
      }
      proposal_views: {
        Row: {
          id: string
          ip_hash: string | null
          proposal_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_hash?: string | null
          proposal_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_hash?: string | null
          proposal_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_id: string | null
          closed_amount: number | null
          closed_at: string | null
          closed_notes: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          notes: string | null
          public_code: string
          status_id: string | null
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          closed_amount?: number | null
          closed_at?: string | null
          closed_notes?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          notes?: string | null
          public_code?: string
          status_id?: string | null
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          closed_amount?: number | null
          closed_at?: string | null
          closed_notes?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          notes?: string | null
          public_code?: string
          status_id?: string | null
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "proposal_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          plan_id: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          plan_id: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          plan_id?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_proposal: { Args: { p_code: string }; Returns: undefined }
      get_proposal_branding: {
        Args: { p_code: string }
        Returns: {
          accent_color: string
          company_name: string
          has_active_plan: boolean
          logo_url: string
          primary_color: string
          secondary_color: string
        }[]
      }
      get_proposal_signature: {
        Args: { p_code: string }
        Returns: {
          signed_at: string
          signer_name: string
        }[]
      }
      get_public_proposal: { Args: { p_code: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sign_proposal: {
        Args: {
          p_code: string
          p_signer_email?: string
          p_signer_name: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
