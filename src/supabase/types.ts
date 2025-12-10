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
      about_content: {
        Row: {
          created_at: string | null
          features: Json | null
          founded_year: string | null
          id: string
          story: string[] | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          founded_year?: string | null
          id?: string
          story?: string[] | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          founded_year?: string | null
          id?: string
          story?: string[] | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_sections: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean
          icon: string
          id: string
          label: string
          order_index: number
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          icon: string
          id?: string
          label: string
          order_index?: number
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          icon?: string
          id?: string
          label?: string
          order_index?: number
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          category: string
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          current_attendees: number | null
          description: string | null
          end_date: string | null
          gallery_images_urls: Json | null
          id: string
          image_url: string | null
          is_free: boolean | null
          is_virtual: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          max_attendees: number | null
          metadata: Json | null
          partner_id: string | null
          partner_logo_url: string | null
          partner_name: string | null
          price: number | null
          short_description: string | null
          social_links: Json | null
          start_date: string
          state: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          virtual_link: string | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          gallery_images_urls?: Json | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          metadata?: Json | null
          partner_id?: string | null
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          short_description?: string | null
          social_links?: Json | null
          start_date: string
          state?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          virtual_link?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          gallery_images_urls?: Json | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          metadata?: Json | null
          partner_id?: string | null
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          short_description?: string | null
          social_links?: Json | null
          start_date?: string
          state?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          virtual_link?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_events_partner"
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
          created_at: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          id: string
          image_url: string
          metadata: Json | null
          partner_id: string | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url: string
          metadata?: Json | null
          partner_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url?: string
          metadata?: Json | null
          partner_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "partner_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_content: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          stats: Json | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          stats?: Json | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          stats?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string | null
          category: string
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          metadata: Json | null
          name: string
          social_links: Json | null
          state: string | null
          status: string
          updated_at: string | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          social_links?: Json | null
          state?: string | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          social_links?: Json | null
          state?: string | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_delete: boolean
          can_edit: boolean
          can_publish: boolean
          can_view: boolean
          created_at: string | null
          created_by: string | null
          id: string
          role: string
          section_slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          can_delete?: boolean
          can_edit?: boolean
          can_publish?: boolean
          can_view?: boolean
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: string
          section_slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          can_delete?: boolean
          can_edit?: boolean
          can_publish?: boolean
          can_view?: boolean
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: string
          section_slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_section_slug_fkey"
            columns: ["section_slug"]
            isOneToOne: false
            referencedRelation: "admin_sections"
            referencedColumns: ["slug"]
          },
        ]
      }
      section_content: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          payload: Json
          section_id: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          payload?: Json
          section_id: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          payload?: Json
          section_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "section_content_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "admin_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          site_description: string | null
          site_name: string
          social_media: Json | null
          tagline: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          site_description?: string | null
          site_name?: string
          social_media?: Json | null
          tagline?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          site_description?: string | null
          site_name?: string
          social_media?: Json | null
          tagline?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          linkedin_url: string | null
          metadata: Json | null
          name: string
          social_links: Json | null
          status: string
          title: string | null
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json | null
          name: string
          social_links?: Json | null
          status?: string
          title?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json | null
          name?: string
          social_links?: Json | null
          status?: string
          title?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_delete: boolean | null
          can_edit: boolean | null
          can_publish: boolean | null
          can_view: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          profile_id: string
          section_slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_publish?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          profile_id: string
          section_slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_publish?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          profile_id?: string
          section_slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_section_slug_fkey"
            columns: ["section_slug"]
            isOneToOne: false
            referencedRelation: "admin_sections"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      database_performance: {
        Row: {
          dead_tuples: number | null
          deletes: number | null
          inserts: number | null
          live_tuples: number | null
          schemaname: unknown
          updates: number | null
        }
        Relationships: []
      }
      event_statistics: {
        Row: {
          avg_price: number | null
          category: string | null
          month: string | null
          published_events: number | null
          total_attendees: number | null
          total_events: number | null
        }
        Relationships: []
      }
      monthly_event_stats: {
        Row: {
          avg_price: number | null
          category: string | null
          last_updated: string | null
          month: string | null
          published_events: number | null
          total_attendees: number | null
          total_events: number | null
        }
        Relationships: []
      }
      partner_events: {
        Row: {
          category: string | null
          city: string | null
          current_attendees: number | null
          end_date: string | null
          id: string | null
          is_free: boolean | null
          location: string | null
          max_attendees: number | null
          partner_logo_url: string | null
          partner_name: string | null
          price: number | null
          start_date: string | null
          state: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      public_events: {
        Row: {
          category: string | null
          city: string | null
          created_at: string | null
          currency: string | null
          current_attendees: number | null
          end_date: string | null
          id: string | null
          image_url: string | null
          is_free: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          partner_logo_url: string | null
          partner_name: string | null
          price: number | null
          short_description: string | null
          start_date: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          virtual_link: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          end_date?: string | null
          id?: string | null
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          short_description?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          virtual_link?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          end_date?: string | null
          id?: string | null
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          short_description?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          virtual_link?: string | null
        }
        Relationships: []
      }
      public_events_view: {
        Row: {
          artists: Json | null
          attendees: number | null
          capacity: number | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          gallery: Json | null
          highlights: Json | null
          id: string | null
          image: string | null
          image_url: string | null
          location: string | null
          metadata: Json | null
          partner_logo_url: string | null
          partner_name: string | null
          price: number | null
          price_range: string | null
          short_description: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          ticket_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          artists?: never
          attendees?: number | null
          capacity?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          gallery?: never
          highlights?: never
          id?: string | null
          image?: string | null
          image_url?: string | null
          location?: string | null
          metadata?: never
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          price_range?: never
          short_description?: string | null
          start_date?: string | null
          status?: string | null
          tags?: never
          ticket_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          artists?: never
          attendees?: number | null
          capacity?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          gallery?: never
          highlights?: never
          id?: string | null
          image?: string | null
          image_url?: string | null
          location?: string | null
          metadata?: never
          partner_logo_url?: string | null
          partner_name?: string | null
          price?: number | null
          price_range?: never
          short_description?: string | null
          start_date?: string | null
          status?: string | null
          tags?: never
          ticket_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_performance: {
        Row: {
          latest_record: string | null
          record_count: number | null
          records_last_week: number | null
          table_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_profile: {
        Args: {
          profile_avatar_url?: string
          profile_full_name?: string
          profile_role?: string
          profile_username?: string
          user_id: string
        }
        Returns: boolean
      }
      admin_force_logout_user: {
        Args: { target_user_id: string }
        Returns: number
      }
      bulk_archive_past_events: {
        Args: never
        Returns: {
          archived_count: number
        }[]
      }
      can_user_edit_event: { Args: { event_id: string }; Returns: boolean }
      can_user_edit_gallery_item: {
        Args: { item_id: string }
        Returns: boolean
      }
      can_user_edit_partner: { Args: { partner_id: string }; Returns: boolean }
      create_user_session: {
        Args: { expiry_hours?: number; session_token: string }
        Returns: string
      }
      generate_unique_username: {
        Args: { base_username: string; user_id: string }
        Returns: string
      }
      get_about_content: {
        Args: never
        Returns: {
          created_at: string | null
          features: Json | null
          founded_year: string | null
          id: string
          story: string[] | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "about_content"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_admin_sections_for_user: {
        Args: { user_id: string }
        Returns: {
          category: string
          description: string
          icon: string
          id: string
          label: string
          order_index: number
          slug: string
        }[]
      }
      get_database_health_metrics: {
        Args: never
        Returns: {
          metric_name: string
          metric_unit: string
          metric_value: number
        }[]
      }
      get_event_with_artists: {
        Args: { event_uuid: string }
        Returns: {
          artist_genre: string
          artist_id: string
          artist_name: string
          artist_social_links: Json
          category: string
          description: string
          end_date: string
          event_id: string
          is_headliner: boolean
          partner_name: string
          set_time: string
          start_date: string
          title: string
          venue_name: string
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
      get_events_near_location: {
        Args: {
          limit_count?: number
          radius_km?: number
          user_lat?: number
          user_lng?: number
        }
        Returns: {
          distance_km: number
          id: string
          location: string
          start_date: string
          title: string
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
      get_hero_content: {
        Args: never
        Returns: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          stats: Json | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "hero_content"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_my_claim: { Args: { claim: string }; Returns: Json }
      get_my_role: { Args: never; Returns: string }
      get_past_events_week: {
        Args: never
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
      }
      get_section_content: {
        Args: { section_slug: string; user_id: string }
        Returns: {
          payload: Json
          updated_at: string
          updated_by: string
          version: number
        }[]
      }
      get_site_settings: {
        Args: never
        Returns: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          site_description: string | null
          site_name: string
          social_media: Json | null
          tagline: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "site_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_upcoming_events_week: {
        Args: never
        Returns: {
          day_name: string
          event_date: string
          events: Json
        }[]
      }
      get_user_profile: {
        Args: { user_uuid?: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          metadata: Json
          role: string
          updated_at: string
          username: string
        }[]
      }
      has_any_role: { Args: { required_roles: string[] }; Returns: boolean }
      has_role: { Args: { required_role: string }; Returns: boolean }
      increment_event_views: { Args: { event_uuid: string }; Returns: number }
      invalidate_user_session: {
        Args: { session_token_param: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_authenticated_user: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
      moderate_content: {
        Args: { action: string; content_id: string }
        Returns: boolean
      }
      refresh_analytics: { Args: never; Returns: undefined }
      refresh_monthly_event_stats: { Args: never; Returns: undefined }
      search_events: {
        Args: {
          event_category?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
        }
        Returns: {
          category: string
          description: string
          featured: boolean
          id: string
          partner_name: string
          rank: number
          start_date: string
          title: string
          venue_name: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_profile_from_auth: { Args: { user_id?: string }; Returns: boolean }
      update_event_attendance: {
        Args: { event_id: string; increment?: boolean }
        Returns: number
      }
      update_profile_role: {
        Args: { new_role: string; user_id: string }
        Returns: boolean
      }
      update_section_content: {
        Args: { new_payload: Json; section_slug: string; user_id?: string }
        Returns: boolean
      }
      validate_user_session: {
        Args: { session_token_param: string }
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
