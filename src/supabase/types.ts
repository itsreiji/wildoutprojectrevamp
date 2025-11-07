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
      artists: {
        Row: {
          bio: string | null
          created_at: string | null
          genre: string | null
          id: string
          name: string
          social_links: Json | null
          status: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          name: string
          social_links?: Json | null
          status?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          name?: string
          social_links?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      benefits_members: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      benefits_partners: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          artist_ids: string[] | null
          artists: string
          created_at: string | null
          day_name: string
          description: string | null
          event_date: string
          id: string
          status: string | null
          time: string | null
          updated_at: string | null
          venue: string
          venue_id: string | null
        }
        Insert: {
          artist_ids?: string[] | null
          artists: string
          created_at?: string | null
          day_name: string
          description?: string | null
          event_date: string
          id?: string
          status?: string | null
          time?: string | null
          updated_at?: string | null
          venue: string
          venue_id?: string | null
        }
        Update: {
          artist_ids?: string[] | null
          artists?: string
          created_at?: string | null
          day_name?: string
          description?: string | null
          event_date?: string
          id?: string
          status?: string | null
          time?: string | null
          updated_at?: string | null
          venue?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          alt: string
          created_at: string | null
          id: string
          img: string
        }
        Insert: {
          alt: string
          created_at?: string | null
          id?: string
          img: string
        }
        Update: {
          alt?: string
          created_at?: string | null
          id?: string
          img?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string | null
          id: string
          logo: string
          name: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo: string
          name: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo?: string
          name?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      photo_moments: {
        Row: {
          caption: string
          created_at: string | null
          id: string
          img: string
        }
        Insert: {
          caption: string
          created_at?: string | null
          id?: string
          img: string
        }
        Update: {
          caption?: string
          created_at?: string | null
          id?: string
          img?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          contact_email: string
          content_config: Json
          created_at: string | null
          id: string
          primary_color: string
          seo_settings: Json
          site_description: string
          site_name: string
          social_links: Json
          theme: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string
          content_config?: Json
          created_at?: string | null
          id?: string
          primary_color?: string
          seo_settings?: Json
          site_description?: string
          site_name?: string
          social_links?: Json
          theme?: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string
          content_config?: Json
          created_at?: string | null
          id?: string
          primary_color?: string
          seo_settings?: Json
          site_description?: string
          site_name?: string
          social_links?: Json
          theme?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          email: string | null
          featured: boolean | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          role: string
          socials: Json | null
          sort_order: number
          status: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          role?: string
          socials?: Json | null
          sort_order?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: string
          socials?: Json | null
          sort_order?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_performance_summary: {
        Row: {
          active_events: number | null
          metric_type: string | null
          total_events: number | null
          unique_artists: number | null
          unique_venues: number | null
          upcoming_events: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_database_health_metrics: {
        Args: never
        Returns: {
          metric_name: string
          metric_unit: string
          metric_value: number
        }[]
      }
      get_events_by_date: {
        Args: { end_date: string; start_date: string }
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
      }
      get_events_grouped_by_date: {
        Args: { end_date?: string; event_status?: string; start_date?: string }
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
      }
      get_events_with_details: {
        Args: {
          end_date?: string
          event_status?: string
          limit_count?: number
          offset_count?: number
          start_date?: string
        }
        Returns: {
          artist_ids: string[]
          artists: Json
          day_name: string
          description: string
          event_date: string
          event_id: string
          event_time: string
          status: string
          total_count: number
          venue_address: string
          venue_capacity: number
          venue_city: string
          venue_email: string
          venue_id: string
          venue_images: string[]
          venue_instagram: string
          venue_name: string
          venue_phone: string
          venue_website: string
        }[]
      }
      get_past_events_week: {
        Args: never
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
      }
      get_upcoming_events_week: {
        Args: never
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
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
