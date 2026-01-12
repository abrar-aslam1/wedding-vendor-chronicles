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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activity_logs_archive: {
        Row: {
          action: string | null
          archived_at: string
          created_at: string | null
          id: string | null
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          archived_at?: string
          created_at?: string | null
          id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          archived_at?: string
          created_at?: string | null
          id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_notification_queue: {
        Row: {
          created_at: string
          data: Json
          id: string
          notification_type: string
          processed: boolean | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          notification_type: string
          processed?: boolean | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          notification_type?: string
          processed?: boolean | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_approvals: {
        Row: {
          approval_date: string
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: number
          job_name: string
          rejection_reason: string | null
          request_details: string | null
          requested_at: string | null
          status: string
        }
        Insert: {
          approval_date: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: number
          job_name: string
          rejection_reason?: string | null
          request_details?: string | null
          requested_at?: string | null
          status?: string
        }
        Update: {
          approval_date?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: number
          job_name?: string
          rejection_reason?: string | null
          request_details?: string | null
          requested_at?: string | null
          status?: string
        }
        Relationships: []
      }
      availability_requests: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          event_date: string
          event_type: string | null
          guest_count: number | null
          id: string
          message: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vendor_email: string | null
          vendor_phone: string | null
          vendor_place_id: string | null
          vendor_title: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          event_date: string
          event_type?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_email?: string | null
          vendor_phone?: string | null
          vendor_place_id?: string | null
          vendor_title: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          event_date?: string
          event_type?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_email?: string | null
          vendor_phone?: string | null
          vendor_place_id?: string | null
          vendor_title?: string
        }
        Relationships: []
      }
      bride_preferences: {
        Row: {
          aesthetic_preferences: Json | null
          budget_range: string | null
          ceremony_types: string[] | null
          color_preferences: string[] | null
          completed_at: string | null
          created_at: string | null
          cultural_background: string[] | null
          cultural_requirements: Json | null
          dietary_restrictions: string[] | null
          guest_count: number | null
          id: string
          importance_cultural_knowledge: number | null
          importance_language: number | null
          importance_price: number | null
          importance_style_match: number | null
          location: string | null
          modesty_preferences: string | null
          must_have_cultural_experience: boolean | null
          preferred_languages: string[] | null
          quiz_completed: boolean | null
          religious_tradition: string[] | null
          requires_bilingual: boolean | null
          updated_at: string | null
          user_id: string | null
          venue_name: string | null
          wedding_date: string | null
          wedding_style: string[] | null
        }
        Insert: {
          aesthetic_preferences?: Json | null
          budget_range?: string | null
          ceremony_types?: string[] | null
          color_preferences?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          cultural_background?: string[] | null
          cultural_requirements?: Json | null
          dietary_restrictions?: string[] | null
          guest_count?: number | null
          id?: string
          importance_cultural_knowledge?: number | null
          importance_language?: number | null
          importance_price?: number | null
          importance_style_match?: number | null
          location?: string | null
          modesty_preferences?: string | null
          must_have_cultural_experience?: boolean | null
          preferred_languages?: string[] | null
          quiz_completed?: boolean | null
          religious_tradition?: string[] | null
          requires_bilingual?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          venue_name?: string | null
          wedding_date?: string | null
          wedding_style?: string[] | null
        }
        Update: {
          aesthetic_preferences?: Json | null
          budget_range?: string | null
          ceremony_types?: string[] | null
          color_preferences?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          cultural_background?: string[] | null
          cultural_requirements?: Json | null
          dietary_restrictions?: string[] | null
          guest_count?: number | null
          id?: string
          importance_cultural_knowledge?: number | null
          importance_language?: number | null
          importance_price?: number | null
          importance_style_match?: number | null
          location?: string | null
          modesty_preferences?: string | null
          must_have_cultural_experience?: boolean | null
          preferred_languages?: string[] | null
          quiz_completed?: boolean | null
          religious_tradition?: string[] | null
          requires_bilingual?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          venue_name?: string | null
          wedding_date?: string | null
          wedding_style?: string[] | null
        }
        Relationships: []
      }
      business_claims: {
        Row: {
          admin_notes: string | null
          claim_status: string | null
          claimant_email: string
          claimant_name: string
          claimed_at: string | null
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string | null
          vendor_id: string | null
          verification_documents: Json | null
          verification_method: string | null
        }
        Insert: {
          admin_notes?: string | null
          claim_status?: string | null
          claimant_email: string
          claimant_name: string
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
        }
        Update: {
          admin_notes?: string | null
          claim_status?: string | null
          claimant_email?: string
          claimant_name?: string
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_metadata: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      cuisine_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuisine_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          recipients: number
          sent_at: string
          status: string
          subject: string | null
          test_mode: boolean | null
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          recipients?: number
          sent_at?: string
          status?: string
          subject?: string | null
          test_mode?: boolean | null
          type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          recipients?: number
          sent_at?: string
          status?: string
          subject?: string | null
          test_mode?: boolean | null
          type?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      entertainment_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "entertainment_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
      florist_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "florist_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
      instagram_vendors: {
        Row: {
          address: string | null
          bio: string | null
          business_name: string
          category: string
          city: string | null
          created_at: string
          email: string | null
          follower_count: number | null
          id: string
          instagram_handle: string
          instagram_url: string | null
          is_business_account: boolean | null
          is_verified: boolean | null
          key_differentiator: string | null
          phone: string | null
          post_count: number | null
          price_tier: string | null
          profile_image_url: string | null
          response_time: string | null
          state: string | null
          subcategory: string | null
          turnaround_time: string | null
          updated_at: string
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          business_name: string
          category: string
          city?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          id?: string
          instagram_handle: string
          instagram_url?: string | null
          is_business_account?: boolean | null
          is_verified?: boolean | null
          key_differentiator?: string | null
          phone?: string | null
          post_count?: number | null
          price_tier?: string | null
          profile_image_url?: string | null
          response_time?: string | null
          state?: string | null
          subcategory?: string | null
          turnaround_time?: string | null
          updated_at?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          business_name?: string
          category?: string
          city?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          id?: string
          instagram_handle?: string
          instagram_url?: string | null
          is_business_account?: boolean | null
          is_verified?: boolean | null
          key_differentiator?: string | null
          phone?: string | null
          post_count?: number | null
          price_tier?: string | null
          profile_image_url?: string | null
          response_time?: string | null
          state?: string | null
          subcategory?: string | null
          turnaround_time?: string | null
          updated_at?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      location_metadata: {
        Row: {
          average_rating: number | null
          city: string | null
          created_at: string
          id: string
          popular_cities: Json | null
          seo_description: string | null
          state: string
          updated_at: string
          vendor_count: number | null
        }
        Insert: {
          average_rating?: number | null
          city?: string | null
          created_at?: string
          id?: string
          popular_cities?: Json | null
          seo_description?: string | null
          state: string
          updated_at?: string
          vendor_count?: number | null
        }
        Update: {
          average_rating?: number | null
          city?: string | null
          created_at?: string
          id?: string
          popular_cities?: Json | null
          seo_description?: string | null
          state?: string
          updated_at?: string
          vendor_count?: number | null
        }
        Relationships: []
      }
      match_analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          referrer: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_analytics_request"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      match_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          inquiries_sent: number | null
          last_inquiry_at: string | null
          max_inquiries: number | null
          request_id: string
          updated_at: string | null
          vendors_contacted: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiries_sent?: number | null
          last_inquiry_at?: string | null
          max_inquiries?: number | null
          request_id: string
          updated_at?: string | null
          vendors_contacted?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiries_sent?: number | null
          last_inquiry_at?: string | null
          max_inquiries?: number | null
          request_id?: string
          updated_at?: string | null
          vendors_contacted?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_rate_limits_request"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      match_requests: {
        Row: {
          accessibility: string[] | null
          alcohol_policy: string | null
          budget_by_category: Json | null
          budget_mode: string
          budget_overall: number | null
          categories: string[]
          category_filters: Json | null
          created_at: string | null
          cultural_needs: string[] | null
          date: string | null
          date_flexible: boolean | null
          date_season: string | null
          guest_count_band: string
          id: string
          ip_address: unknown
          language_mc: string[] | null
          location_city: string
          location_radius_miles: number | null
          location_state: string
          quiz_completion_time_seconds: number | null
          session_id: string
          style_vibe: string[] | null
          travel_willingness: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          venue_type: string | null
        }
        Insert: {
          accessibility?: string[] | null
          alcohol_policy?: string | null
          budget_by_category?: Json | null
          budget_mode: string
          budget_overall?: number | null
          categories: string[]
          category_filters?: Json | null
          created_at?: string | null
          cultural_needs?: string[] | null
          date?: string | null
          date_flexible?: boolean | null
          date_season?: string | null
          guest_count_band: string
          id?: string
          ip_address?: unknown
          language_mc?: string[] | null
          location_city: string
          location_radius_miles?: number | null
          location_state: string
          quiz_completion_time_seconds?: number | null
          session_id: string
          style_vibe?: string[] | null
          travel_willingness?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          venue_type?: string | null
        }
        Update: {
          accessibility?: string[] | null
          alcohol_policy?: string | null
          budget_by_category?: Json | null
          budget_mode?: string
          budget_overall?: number | null
          categories?: string[]
          category_filters?: Json | null
          created_at?: string | null
          cultural_needs?: string[] | null
          date?: string | null
          date_flexible?: boolean | null
          date_season?: string | null
          guest_count_band?: string
          id?: string
          ip_address?: unknown
          language_mc?: string[] | null
          location_city?: string
          location_radius_miles?: number | null
          location_state?: string
          quiz_completion_time_seconds?: number | null
          session_id?: string
          style_vibe?: string[] | null
          travel_willingness?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          venue_type?: string | null
        }
        Relationships: []
      }
      match_results: {
        Row: {
          availability_signal: string | null
          badges: string[] | null
          category: string
          created_at: string | null
          id: string
          rank_in_category: number
          rationale: Json
          request_id: string
          response_time_sla: string | null
          review_avg: number | null
          review_count: number | null
          score: number
          score_breakdown: Json | null
          starting_price: string | null
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          availability_signal?: string | null
          badges?: string[] | null
          category: string
          created_at?: string | null
          id?: string
          rank_in_category: number
          rationale?: Json
          request_id: string
          response_time_sla?: string | null
          review_avg?: number | null
          review_count?: number | null
          score: number
          score_breakdown?: Json | null
          starting_price?: string | null
          vendor_id: string
          vendor_name: string
        }
        Update: {
          availability_signal?: string | null
          badges?: string[] | null
          category?: string
          created_at?: string | null
          id?: string
          rank_in_category?: number
          rationale?: Json
          request_id?: string
          response_time_sla?: string | null
          review_avg?: number | null
          review_count?: number | null
          score?: number
          score_breakdown?: Json | null
          starting_price?: string | null
          vendor_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_results_request"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      match_vendor_projection: {
        Row: {
          accessibility_features: string[] | null
          active: boolean | null
          books_months_advance: number | null
          business_name: string
          category: string
          city: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          cultural_specialties: string[] | null
          description: string | null
          features: Json | null
          id: string
          images: string[] | null
          languages_supported: string[] | null
          last_synced: string | null
          price_range_max: number | null
          price_range_min: number | null
          price_tier: string | null
          response_time_hours: number | null
          review_avg: number | null
          review_count: number | null
          starting_price: number | null
          state: string
          style_keywords: string[] | null
          sync_source: string | null
          sync_version: number | null
          typical_capacity_max: number | null
          typical_capacity_min: number | null
          updated_at: string | null
          vendor_id: string
          verification_badges: string[] | null
          website_url: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          active?: boolean | null
          books_months_advance?: number | null
          business_name: string
          category: string
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          cultural_specialties?: string[] | null
          description?: string | null
          features?: Json | null
          id?: string
          images?: string[] | null
          languages_supported?: string[] | null
          last_synced?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_tier?: string | null
          response_time_hours?: number | null
          review_avg?: number | null
          review_count?: number | null
          starting_price?: number | null
          state: string
          style_keywords?: string[] | null
          sync_source?: string | null
          sync_version?: number | null
          typical_capacity_max?: number | null
          typical_capacity_min?: number | null
          updated_at?: string | null
          vendor_id: string
          verification_badges?: string[] | null
          website_url?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          active?: boolean | null
          books_months_advance?: number | null
          business_name?: string
          category?: string
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          cultural_specialties?: string[] | null
          description?: string | null
          features?: Json | null
          id?: string
          images?: string[] | null
          languages_supported?: string[] | null
          last_synced?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_tier?: string | null
          response_time_hours?: number | null
          review_avg?: number | null
          review_count?: number | null
          starting_price?: number | null
          state?: string
          style_keywords?: string[] | null
          sync_source?: string | null
          sync_version?: number | null
          typical_capacity_max?: number | null
          typical_capacity_min?: number | null
          updated_at?: string | null
          vendor_id?: string
          verification_badges?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          processed_at: string | null
          status: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          accessibility_score: number | null
          best_practices_score: number | null
          collected_at: string
          cumulative_layout_shift: number | null
          first_contentful_paint: number | null
          id: string
          largest_contentful_paint: number | null
          metric_date: string
          page_url: string
          performance_score: number | null
          seo_score: number | null
          speed_index: number | null
          total_blocking_time: number | null
        }
        Insert: {
          accessibility_score?: number | null
          best_practices_score?: number | null
          collected_at?: string
          cumulative_layout_shift?: number | null
          first_contentful_paint?: number | null
          id?: string
          largest_contentful_paint?: number | null
          metric_date: string
          page_url: string
          performance_score?: number | null
          seo_score?: number | null
          speed_index?: number | null
          total_blocking_time?: number | null
        }
        Update: {
          accessibility_score?: number | null
          best_practices_score?: number | null
          collected_at?: string
          cumulative_layout_shift?: number | null
          first_contentful_paint?: number | null
          id?: string
          largest_contentful_paint?: number | null
          metric_date?: string
          page_url?: string
          performance_score?: number | null
          seo_score?: number | null
          speed_index?: number | null
          total_blocking_time?: number | null
        }
        Relationships: []
      }
      photographer_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "photographer_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
      plan_board_columns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          position: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      plan_board_items: {
        Row: {
          budget: number | null
          column_id: string
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          position: number
          title: string
          user_id: string
          vendor_data: Json | null
          vendor_id: string | null
        }
        Insert: {
          budget?: number | null
          column_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          position: number
          title: string
          user_id: string
          vendor_data?: Json | null
          vendor_id?: string | null
        }
        Update: {
          budget?: number | null
          column_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          position?: number
          title?: string
          user_id?: string
          vendor_data?: Json | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_board_items_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "plan_board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json
          id: string
          is_featured: boolean | null
          max_photos: number | null
          name: string
          price_monthly: number
          priority_ranking: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json
          id?: string
          is_featured?: boolean | null
          max_photos?: number | null
          name: string
          price_monthly: number
          priority_ranking?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json
          id?: string
          is_featured?: boolean | null
          max_photos?: number | null
          name?: string
          price_monthly?: number
          priority_ranking?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_generated: boolean | null
          template_id: string | null
          title: string
          user_id: string
          vendor_category: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_generated?: boolean | null
          template_id?: string | null
          title: string
          user_id: string
          vendor_category?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_generated?: boolean | null
          template_id?: string | null
          title?: string
          user_id?: string
          vendor_category?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          updated_at: string
          user_id: string | null
          vendor_updates: boolean | null
          weekly_reports: boolean | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          updated_at?: string
          user_id?: string | null
          vendor_updates?: boolean | null
          weekly_reports?: boolean | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          updated_at?: string
          user_id?: string | null
          vendor_updates?: boolean | null
          weekly_reports?: boolean | null
        }
        Relationships: []
      }
      vendor_analytics: {
        Row: {
          contact_clicks: number | null
          created_at: string | null
          date: string
          id: string
          phone_clicks: number | null
          profile_views: number | null
          vendor_id: string
          website_clicks: number | null
        }
        Insert: {
          contact_clicks?: number | null
          created_at?: string | null
          date: string
          id?: string
          phone_clicks?: number | null
          profile_views?: number | null
          vendor_id: string
          website_clicks?: number | null
        }
        Update: {
          contact_clicks?: number | null
          created_at?: string | null
          date?: string
          id?: string
          phone_clicks?: number | null
          profile_views?: number | null
          vendor_id?: string
          website_clicks?: number | null
        }
        Relationships: []
      }
      vendor_analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          referrer: string | null
          user_agent: string | null
          user_location: Json | null
          user_session_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          user_agent?: string | null
          user_location?: Json | null
          user_session_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          user_agent?: string | null
          user_location?: Json | null
          user_session_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_analytics_events_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_analytics_summary: {
        Row: {
          contact_clicks: number | null
          created_at: string | null
          date: string
          email_clicks: number | null
          favorites_added: number | null
          id: string
          phone_reveals: number | null
          photo_views: number | null
          profile_views: number | null
          search_impressions: number | null
          updated_at: string | null
          vendor_id: string | null
          website_clicks: number | null
        }
        Insert: {
          contact_clicks?: number | null
          created_at?: string | null
          date: string
          email_clicks?: number | null
          favorites_added?: number | null
          id?: string
          phone_reveals?: number | null
          photo_views?: number | null
          profile_views?: number | null
          search_impressions?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          website_clicks?: number | null
        }
        Update: {
          contact_clicks?: number | null
          created_at?: string | null
          date?: string
          email_clicks?: number | null
          favorites_added?: number | null
          id?: string
          phone_reveals?: number | null
          photo_views?: number | null
          profile_views?: number | null
          search_impressions?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          website_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_analytics_summary_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_auth: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          password_hash: string
          reset_token: string | null
          reset_token_expires: string | null
          updated_at: string | null
          vendor_id: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          password_hash: string
          reset_token?: string | null
          reset_token_expires?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          password_hash?: string
          reset_token?: string | null
          reset_token_expires?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_auth_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          booking_reference: string | null
          ceremony_types: string[] | null
          client_name: string | null
          created_at: string | null
          date: string
          day_number: number | null
          event_type: string | null
          id: string
          internal_notes: string | null
          is_multi_day_event: boolean | null
          multi_day_event_id: string | null
          notes: string | null
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          booking_reference?: string | null
          ceremony_types?: string[] | null
          client_name?: string | null
          created_at?: string | null
          date: string
          day_number?: number | null
          event_type?: string | null
          id?: string
          internal_notes?: string | null
          is_multi_day_event?: boolean | null
          multi_day_event_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          booking_reference?: string | null
          ceremony_types?: string[] | null
          client_name?: string | null
          created_at?: string | null
          date?: string
          day_number?: number | null
          event_type?: string | null
          id?: string
          internal_notes?: string | null
          is_multi_day_event?: boolean | null
          multi_day_event_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_cache: {
        Row: {
          category: string
          city: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          location_code: number
          search_results: Json | null
          state: string | null
          subcategory: string | null
        }
        Insert: {
          category: string
          city?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          location_code: number
          search_results?: Json | null
          state?: string | null
          subcategory?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          location_code?: number
          search_results?: Json | null
          state?: string | null
          subcategory?: string | null
        }
        Relationships: []
      }
      vendor_cultural_expertise: {
        Row: {
          ceremony_experience: Json | null
          certifications: string | null
          created_at: string | null
          cultural_decor_expertise: string[] | null
          cultural_portfolio_images: Json | null
          cultural_types: string[] | null
          dietary_expertise: string[] | null
          gender_segregation_experience: boolean | null
          id: string
          languages: string[] | null
          modesty_services: boolean | null
          religious_traditions: string[] | null
          total_cultural_events: number | null
          traditional_dress_knowledge: string[] | null
          updated_at: string | null
          vendor_id: string | null
          years_cultural_experience: number | null
        }
        Insert: {
          ceremony_experience?: Json | null
          certifications?: string | null
          created_at?: string | null
          cultural_decor_expertise?: string[] | null
          cultural_portfolio_images?: Json | null
          cultural_types?: string[] | null
          dietary_expertise?: string[] | null
          gender_segregation_experience?: boolean | null
          id?: string
          languages?: string[] | null
          modesty_services?: boolean | null
          religious_traditions?: string[] | null
          total_cultural_events?: number | null
          traditional_dress_knowledge?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          years_cultural_experience?: number | null
        }
        Update: {
          ceremony_experience?: Json | null
          certifications?: string | null
          created_at?: string | null
          cultural_decor_expertise?: string[] | null
          cultural_portfolio_images?: Json | null
          cultural_types?: string[] | null
          dietary_expertise?: string[] | null
          gender_segregation_experience?: boolean | null
          id?: string
          languages?: string[] | null
          modesty_services?: boolean | null
          religious_traditions?: string[] | null
          total_cultural_events?: number | null
          traditional_dress_knowledge?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          years_cultural_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_cultural_expertise_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_email_discovery_log: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          discovered_emails: string[] | null
          discovery_metadata: Json | null
          discovery_method: string | null
          id: string
          processed: boolean | null
          updated_at: string | null
          vendor_business_name: string
          vendor_id: string | null
          vendor_source: string
          verification_status: string | null
          website_url: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          discovered_emails?: string[] | null
          discovery_metadata?: Json | null
          discovery_method?: string | null
          id?: string
          processed?: boolean | null
          updated_at?: string | null
          vendor_business_name: string
          vendor_id?: string | null
          vendor_source: string
          verification_status?: string | null
          website_url?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          discovered_emails?: string[] | null
          discovery_metadata?: Json | null
          discovery_method?: string | null
          id?: string
          processed?: boolean | null
          updated_at?: string | null
          vendor_business_name?: string
          vendor_id?: string | null
          vendor_source?: string
          verification_status?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      vendor_favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_data: Json
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_data: Json
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_data?: Json
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_inquiries: {
        Row: {
          created_at: string | null
          id: string
          inquiry_data: Json
          is_multi_inquiry: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vendor_ids: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_data?: Json
          is_multi_inquiry?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_ids: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_data?: Json
          is_multi_inquiry?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_ids?: string[]
        }
        Relationships: []
      }
      vendor_lead_notifications: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          email_message_id: string | null
          email_provider: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          lead_customer_email: string
          lead_customer_name: string
          lead_customer_phone: string | null
          lead_event_date: string | null
          lead_inquiry_id: string | null
          lead_message: string | null
          max_retries: number | null
          metadata: Json | null
          notification_status: string | null
          notification_type: string | null
          retry_count: number | null
          sent_at: string | null
          updated_at: string | null
          vendor_business_name: string
          vendor_email: string
          vendor_id: string | null
          vendor_phone: string | null
          vendor_source: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          email_message_id?: string | null
          email_provider?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          lead_customer_email: string
          lead_customer_name: string
          lead_customer_phone?: string | null
          lead_event_date?: string | null
          lead_inquiry_id?: string | null
          lead_message?: string | null
          max_retries?: number | null
          metadata?: Json | null
          notification_status?: string | null
          notification_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          updated_at?: string | null
          vendor_business_name: string
          vendor_email: string
          vendor_id?: string | null
          vendor_phone?: string | null
          vendor_source: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          email_message_id?: string | null
          email_provider?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          lead_customer_email?: string
          lead_customer_name?: string
          lead_customer_phone?: string | null
          lead_event_date?: string | null
          lead_inquiry_id?: string | null
          lead_message?: string | null
          max_retries?: number | null
          metadata?: Json | null
          notification_status?: string | null
          notification_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          updated_at?: string | null
          vendor_business_name?: string
          vendor_email?: string
          vendor_id?: string | null
          vendor_phone?: string | null
          vendor_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_lead_notifications_lead_inquiry_id_fkey"
            columns: ["lead_inquiry_id"]
            isOneToOne: false
            referencedRelation: "vendor_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_leads: {
        Row: {
          budget: string | null
          created_at: string | null
          email: string
          event_date: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string | null
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          email: string
          event_date?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          email?: string
          event_date?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_match_scores: {
        Row: {
          availability_score: number | null
          bride_preference_id: string | null
          calculated_at: string | null
          ceremony_experience_score: number | null
          cultural_expertise_score: number | null
          cultural_highlights: Json | null
          id: string
          is_current: boolean | null
          language_match_score: number | null
          match_reasons: Json | null
          price_match_score: number | null
          style_alignment_score: number | null
          total_score: number | null
          vendor_id: string | null
        }
        Insert: {
          availability_score?: number | null
          bride_preference_id?: string | null
          calculated_at?: string | null
          ceremony_experience_score?: number | null
          cultural_expertise_score?: number | null
          cultural_highlights?: Json | null
          id?: string
          is_current?: boolean | null
          language_match_score?: number | null
          match_reasons?: Json | null
          price_match_score?: number | null
          style_alignment_score?: number | null
          total_score?: number | null
          vendor_id?: string | null
        }
        Update: {
          availability_score?: number | null
          bride_preference_id?: string | null
          calculated_at?: string | null
          ceremony_experience_score?: number | null
          cultural_expertise_score?: number | null
          cultural_highlights?: Json | null
          id?: string
          is_current?: boolean | null
          language_match_score?: number | null
          match_reasons?: Json | null
          price_match_score?: number | null
          style_alignment_score?: number | null
          total_score?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_match_scores_bride_preference_id_fkey"
            columns: ["bride_preference_id"]
            isOneToOne: false
            referencedRelation: "bride_preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_match_scores_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notification_preferences: {
        Row: {
          bounce_count: number | null
          claimed_status: string | null
          created_at: string | null
          email_notifications_enabled: boolean | null
          id: string
          instant_notifications: boolean | null
          last_contacted_at: string | null
          lead_notifications: boolean | null
          multi_inquiry_notifications: boolean | null
          notification_frequency: string | null
          subscription_tier: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          vendor_email: string
          vendor_id: string | null
          vendor_source: string
          weekly_summary: boolean | null
        }
        Insert: {
          bounce_count?: number | null
          claimed_status?: string | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          instant_notifications?: boolean | null
          last_contacted_at?: string | null
          lead_notifications?: boolean | null
          multi_inquiry_notifications?: boolean | null
          notification_frequency?: string | null
          subscription_tier?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          vendor_email: string
          vendor_id?: string | null
          vendor_source: string
          weekly_summary?: boolean | null
        }
        Update: {
          bounce_count?: number | null
          claimed_status?: string | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          instant_notifications?: boolean | null
          last_contacted_at?: string | null
          lead_notifications?: boolean | null
          multi_inquiry_notifications?: boolean | null
          notification_frequency?: string | null
          subscription_tier?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          vendor_email?: string
          vendor_id?: string | null
          vendor_source?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      vendor_pricing_packages: {
        Row: {
          available_months: string[] | null
          ceremony_duration: string | null
          ceremony_types: string[] | null
          created_at: string | null
          cultural_type: string | null
          description: string | null
          display_order: number | null
          exclusions: Json | null
          guest_capacity_max: number | null
          guest_capacity_min: number | null
          id: string
          inclusions: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          is_starting_price: boolean | null
          package_name: string
          package_type: string | null
          price_max: number | null
          price_min: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          available_months?: string[] | null
          ceremony_duration?: string | null
          ceremony_types?: string[] | null
          created_at?: string | null
          cultural_type?: string | null
          description?: string | null
          display_order?: number | null
          exclusions?: Json | null
          guest_capacity_max?: number | null
          guest_capacity_min?: number | null
          id?: string
          inclusions?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_starting_price?: boolean | null
          package_name: string
          package_type?: string | null
          price_max?: number | null
          price_min?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          available_months?: string[] | null
          ceremony_duration?: string | null
          ceremony_types?: string[] | null
          created_at?: string | null
          cultural_type?: string | null
          description?: string | null
          display_order?: number | null
          exclusions?: Json | null
          guest_capacity_max?: number | null
          guest_capacity_min?: number | null
          id?: string
          inclusions?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_starting_price?: boolean | null
          package_name?: string
          package_type?: string | null
          price_max?: number | null
          price_min?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_pricing_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_searches: {
        Row: {
          created_at: string | null
          id: string
          keyword: string
          location_code: number
          search_results: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          location_code: number
          search_results?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          location_code?: number
          search_results?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      vendor_subcategories: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      vendor_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_name: string
          category: string
          city: string
          claim_date: string | null
          claim_status: string | null
          claimed_by: string | null
          contact_info: Json
          created_at: string
          description: string
          id: string
          images: string[]
          is_featured: boolean | null
          max_photos: number | null
          owner_id: string
          priority_ranking: number | null
          state: string
          subscription_tier: string | null
          verification_status: string | null
        }
        Insert: {
          business_name: string
          category: string
          city: string
          claim_date?: string | null
          claim_status?: string | null
          claimed_by?: string | null
          contact_info: Json
          created_at?: string
          description: string
          id?: string
          images: string[]
          is_featured?: boolean | null
          max_photos?: number | null
          owner_id: string
          priority_ranking?: number | null
          state: string
          subscription_tier?: string | null
          verification_status?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          city?: string
          claim_date?: string | null
          claim_status?: string | null
          claimed_by?: string | null
          contact_info?: Json
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_featured?: boolean | null
          max_photos?: number | null
          owner_id?: string
          priority_ranking?: number | null
          state?: string
          subscription_tier?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
          {
            foreignKeyName: "vendors_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "vendor_auth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors_google: {
        Row: {
          address: string | null
          business_hours: Json | null
          business_name: string
          categories: string[] | null
          category: string
          city: string
          coordinates: unknown
          created_at: string
          data_source: string
          description: string | null
          email: string | null
          id: string
          images: string[] | null
          key_differentiator: string | null
          last_updated: string
          latitude: number | null
          longitude: number | null
          payment_methods: string[] | null
          phone: string | null
          place_id: string
          postal_code: string | null
          price_range: string | null
          price_tier: string | null
          rating: Json | null
          response_time: string | null
          reviews_count: number | null
          service_area: string[] | null
          state: string
          state_code: string
          turnaround_time: string | null
          website_url: string | null
          year_established: number | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          business_name: string
          categories?: string[] | null
          category: string
          city: string
          coordinates?: unknown
          created_at?: string
          data_source?: string
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          key_differentiator?: string | null
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          place_id: string
          postal_code?: string | null
          price_range?: string | null
          price_tier?: string | null
          rating?: Json | null
          response_time?: string | null
          reviews_count?: number | null
          service_area?: string[] | null
          state: string
          state_code: string
          turnaround_time?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          business_name?: string
          categories?: string[] | null
          category?: string
          city?: string
          coordinates?: unknown
          created_at?: string
          data_source?: string
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          key_differentiator?: string | null
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          place_id?: string
          postal_code?: string | null
          price_range?: string | null
          price_tier?: string | null
          rating?: Json | null
          response_time?: string | null
          reviews_count?: number | null
          service_area?: string[] | null
          state?: string
          state_code?: string
          turnaround_time?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Relationships: []
      }
      vendors_google_business: {
        Row: {
          address: string | null
          business_name: string
          category: string | null
          cid: string | null
          city: string | null
          country: string | null
          created_at: string | null
          dataforseo_rank: number | null
          description: string | null
          email: string | null
          google_categories: string[] | null
          hours: Json | null
          id: string
          is_open_now: boolean | null
          latitude: number | null
          location_searched: string | null
          logo_url: string | null
          longitude: number | null
          permanently_closed: boolean | null
          phone: string | null
          photos: string[] | null
          place_id: string | null
          rating: number | null
          reviews_count: number | null
          reviews_data: Json | null
          search_keyword: string | null
          state: string | null
          temporarily_closed: boolean | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string | null
          cid?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dataforseo_rank?: number | null
          description?: string | null
          email?: string | null
          google_categories?: string[] | null
          hours?: Json | null
          id?: string
          is_open_now?: boolean | null
          latitude?: number | null
          location_searched?: string | null
          logo_url?: string | null
          longitude?: number | null
          permanently_closed?: boolean | null
          phone?: string | null
          photos?: string[] | null
          place_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_data?: Json | null
          search_keyword?: string | null
          state?: string | null
          temporarily_closed?: boolean | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string | null
          cid?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dataforseo_rank?: number | null
          description?: string | null
          email?: string | null
          google_categories?: string[] | null
          hours?: Json | null
          id?: string
          is_open_now?: boolean | null
          latitude?: number | null
          location_searched?: string | null
          logo_url?: string | null
          longitude?: number | null
          permanently_closed?: boolean | null
          phone?: string | null
          photos?: string[] | null
          place_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_data?: Json | null
          search_keyword?: string | null
          state?: string | null
          temporarily_closed?: boolean | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      vendors_instagram: {
        Row: {
          bio: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          external_urls: string[] | null
          followers: number | null
          followers_count: number | null
          google_search_description: string | null
          google_search_rank: number | null
          google_search_title: string | null
          has_contact: boolean | null
          has_location: boolean | null
          id: string
          ig_user_id: string | null
          ig_username: string
          is_business_account: boolean | null
          phone: string | null
          posts_count: number | null
          profile_pic_url: string | null
          profile_url: string | null
          source: string | null
          state: string | null
          tags: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          external_urls?: string[] | null
          followers?: number | null
          followers_count?: number | null
          google_search_description?: string | null
          google_search_rank?: number | null
          google_search_title?: string | null
          has_contact?: boolean | null
          has_location?: boolean | null
          id?: string
          ig_user_id?: string | null
          ig_username: string
          is_business_account?: boolean | null
          phone?: string | null
          posts_count?: number | null
          profile_pic_url?: string | null
          profile_url?: string | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          external_urls?: string[] | null
          followers?: number | null
          followers_count?: number | null
          google_search_description?: string | null
          google_search_rank?: number | null
          google_search_title?: string | null
          has_contact?: boolean | null
          has_location?: boolean | null
          id?: string
          ig_user_id?: string | null
          ig_username?: string
          is_business_account?: boolean | null
          phone?: string | null
          posts_count?: number | null
          profile_pic_url?: string | null
          profile_url?: string | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      venue_types: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_types_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["category"]
          },
        ]
      }
    }
    Views: {
      all_vendors: {
        Row: {
          address: string | null
          business_name: string | null
          category: string | null
          city: string | null
          description: string | null
          email: string | null
          images: string[] | null
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          rating: Json | null
          source_type: string | null
          state: string | null
          url: string | null
          vendor_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_vendor_analytics: { Args: never; Returns: undefined }
      get_vendor_collection_stats: {
        Args: never
        Returns: {
          categories_count: number
          champagne_vendors: number
          cities_count: number
          cocktail_vendors: number
          coffee_vendors: number
          dessert_vendors: number
          flower_vendors: number
          matcha_vendors: number
          total_vendors: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
A new version of Supabase CLI is available: v2.58.5 (currently installed v2.30.4)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
