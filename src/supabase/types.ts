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
    PostgrestVersion: "15.1.8"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_artists: {
        Row: {
          artist_name: string
          created_at: string
          event_id: string
          id: string
          performance_time: string | null
          role: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          event_id: string
          id?: string
          performance_time?: string | null
          role?: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          event_id?: string
          id?: string
          performance_time?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          location: string | null
          metadata: Json
          partner_id: string | null
          partner_name: string | null
          price_range: string | null
          start_date: string
          status: string
          ticket_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          category?: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          location?: string | null
          metadata?: Json
          partner_id?: string | null
          partner_name?: string | null
          price_range?: string | null
          start_date: string
          status?: string
          ticket_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          location?: string | null
          metadata?: Json
          partner_id?: string | null
          partner_name?: string | null
          price_range?: string | null
          start_date?: string
          status?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_urls: Json
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: Json
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: Json
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          social_links: Json
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name: string
          social_links?: Json
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          social_links?: Json
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          metadata: Json
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          metadata?: Json
          role?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          metadata?: Json
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          social_links: Json
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          social_links?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          social_links?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_partners_view: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          social_links: Json
          status: string
          updated_at: string
          website_url: string | null
        }
        Relationships: []
      }
      active_team_view: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          social_links: Json
          status: string
          title: string | null
          updated_at: string
        }
        Relationships: []
      }
      audit_summary: {
        Row: {
          action: string
          action_count: number
          last_action: string | null
          table_name: string
        }
        Relationships: []
      }
      database_performance: {
        Row: {
          dead_tup: number | null
          last_analyze: string | null
          last_autoanalyze: string | null
          live_tup: number | null
          modifications_since_analyze: number | null
          schemaname: string | null
          tablename: string | null
          tup_del: number | null
          tup_ins: number | null
          tup_upd: number | null
        }
        Relationships: []
      }
      events_by_month: {
        Row: {
          category: string
          event_count: number
          month: string
          unique_partners: number
        }
        Relationships: []
      }
      partner_engagement: {
        Row: {
          avg_event_duration_hours: number | null
          id: string
          last_event_date: string | null
          name: string
          total_events: number
        }
        Relationships: []
      }
      public_events_view: {
        Row: {
          artists: string[] | null
          category: string
          description: string | null
          end_date: string
          id: string
          location: string | null
          partner_logo_url: string | null
          partner_name: string | null
          partner_website_url: string | null
          price_range: string | null
          start_date: string
          status: string
          ticket_url: string | null
          title: string
        }
        Relationships: []
      }
      published_gallery_view: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_urls: Json
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Relationships: []
      }
      storage_usage: {
        Row: {
          bucket_id: string
          total_files: number
          total_size_bytes: number | null
          total_size_human: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_data_export_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_unique_username: {
        Args: {
          base_name: string
          user_id: string
        }
        Returns: string
      }
      get_current_user_role_via_jwt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_recent_security_events: {
        Args: {
          hours_back?: number
        }
        Returns: {
          created_at: string
          details: Json
          event_type: string
          user_id: string
          user_role: string
        }[]
      }
      get_system_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          status: string
          value: string
        }[]
      }
      get_table_policies: {
        Args: {
          target_table: string
        }
        Returns: {
          cmd: string | null
          permissive: string | null
          qual: string | null
          roles: string[] | null
          policyname: string | null
          with_check: string | null
        }[]
      }
      get_user_avatar_url: {
        Args: {
          user_id: string
        }
        Returns: string | null
      }
      get_user_profile: {
        Args: {
          user_id?: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          metadata: Json
          role: string
          updated_at: string
          username: string | null
        }[]
      }
      get_events_with_details: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          status_filter?: string
        }
        Returns: {
          artists: string[]
          capacity: number | null
          category: string
          description: string | null
          end_date: string
          id: string
          location: string | null
          partner_logo_url: string | null
          partner_name: string | null
          partner_website_url: string | null
          price_range: string | null
          start_date: string
          ticket_url: string | null
          title: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_via_jwt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_editor_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_editor_or_admin_via_jwt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          details?: Json
          event_type: string
        }
        Returns: undefined
      }
      search_events: {
        Args: {
          limit_count?: number
          search_query: string
        }
        Returns: {
          description: string | null
          id: string
          partner_name: string | null
          rank: number
          start_date: string
          title: string
        }[]
      }
      test_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      update_user_role: {
        Args: {
          new_role: string
          target_user_id: string
        }
        Returns: boolean
      }
      validate_file_upload: {
        Args: {
          bucket_name: string
          file_name: string
          file_size: number
        }
        Returns: boolean
      }
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
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
