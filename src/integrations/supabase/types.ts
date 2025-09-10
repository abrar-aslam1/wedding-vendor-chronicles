export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: []
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
          }
        ]
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
          }
        ]
      }
      vendor_analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          }
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
          }
        ]
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
          }
        ]
      }
      vendor_completions: {
        Row: {
          category: string
          city: string
          completion_data: Json
          created_at: string
          id: string
          location_code: number
          state: string
          subcategory: string | null
        }
        Insert: {
          category: string
          city: string
          completion_data: Json
          created_at?: string
          id?: string
          location_code: number
          state: string
          subcategory?: string | null
        }
        Update: {
          category?: string
          city?: string
          completion_data?: Json
          created_at?: string
          id?: string
          location_code?: number
          state?: string
          subcategory?: string | null
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

// Subscription-specific types
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']
export type VendorSubscription = Database['public']['Tables']['vendor_subscriptions']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorAuth = Database['public']['Tables']['vendor_auth']['Row']
export type BusinessClaim = Database['public']['Tables']['business_claims']['Row']
export type VendorAnalyticsEvent = Database['public']['Tables']['vendor_analytics_events']['Row']
export type VendorAnalyticsSummary = Database['public']['Tables']['vendor_analytics_summary']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type VendorInquiry = Database['public']['Tables']['vendor_inquiries']['Row']

export type SubscriptionTier = 'free' | 'professional' | 'premium'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'under_review'
export type VendorClaimStatus = 'unclaimed' | 'claimed' | 'pending_claim'

export interface SubscriptionFeatures {
  basic_listing?: boolean
  contact_info?: boolean
  basic_photos?: boolean
  unlimited_photos?: boolean
  priority_placement?: boolean
  basic_analytics?: boolean
  enhanced_profile?: boolean
  featured_placement?: boolean
  lead_contact_access?: boolean
  advanced_analytics?: boolean
  top_priority?: boolean
}

export interface VendorAnalytics {
  totals: {
    profile_views: number
    contact_clicks: number
    phone_reveals: number
    email_clicks: number
    website_clicks: number
    photo_views: number
    favorites_added: number
    search_impressions: number
  }
  basic_metrics: {
    profile_views: number
    contact_clicks: number
    conversion_rate: string
  }
  professional_metrics?: {
    daily_breakdown: VendorAnalyticsSummary[]
    hourly_breakdown: any[]
    location_breakdown: any[]
    referrer_breakdown: any[]
    peak_hours: any[]
    engagement_rate: string
  }
  premium_metrics?: {
    competitor_comparison: any
    conversion_funnel: any
    lead_quality_score: any
    roi_metrics: any
    advanced_insights: string[]
  }
}
