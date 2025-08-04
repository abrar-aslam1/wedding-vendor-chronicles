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
          claimed_by: string | null
          claim_status: string | null
          claim_date: string | null
          verification_status: string | null
        }
        Insert: {
          business_name: string
          category: string
          city: string
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
          claimed_by?: string | null
          claim_status?: string | null
          claim_date?: string | null
          verification_status?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          city?: string
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
          claimed_by?: string | null
          claim_status?: string | null
          claim_date?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      vendor_auth: {
        Row: {
          id: string
          email: string
          password_hash: string
          vendor_id: string | null
          email_verified: boolean | null
          verification_token: string | null
          reset_token: string | null
          reset_token_expires: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          vendor_id?: string | null
          email_verified?: boolean | null
          verification_token?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          vendor_id?: string | null
          email_verified?: boolean | null
          verification_token?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          id: string
          vendor_id: string | null
          claimant_email: string
          claimant_name: string
          claim_status: string | null
          verification_documents: Json | null
          verification_method: string | null
          admin_notes: string | null
          claimed_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          claimant_email: string
          claimant_name: string
          claim_status?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
          admin_notes?: string | null
          claimed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          claimant_email?: string
          claimant_name?: string
          claim_status?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
          admin_notes?: string | null
          claimed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          id: string
          vendor_id: string | null
          event_type: string
          event_data: Json | null
          user_session_id: string | null
          user_location: Json | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          event_type: string
          event_data?: Json | null
          user_session_id?: string | null
          user_location?: Json | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          event_type?: string
          event_data?: Json | null
          user_session_id?: string | null
          user_location?: Json | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
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
          id: string
          vendor_id: string | null
          date: string
          profile_views: number | null
          contact_clicks: number | null
          phone_reveals: number | null
          email_clicks: number | null
          website_clicks: number | null
          photo_views: number | null
          favorites_added: number | null
          search_impressions: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          date: string
          profile_views?: number | null
          contact_clicks?: number | null
          phone_reveals?: number | null
          email_clicks?: number | null
          website_clicks?: number | null
          photo_views?: number | null
          favorites_added?: number | null
          search_impressions?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          date?: string
          profile_views?: number | null
          contact_clicks?: number | null
          phone_reveals?: number | null
          email_clicks?: number | null
          website_clicks?: number | null
          photo_views?: number | null
          favorites_added?: number | null
          search_impressions?: number | null
          created_at?: string | null
          updated_at?: string | null
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
          id: string
          email: string
          password_hash: string
          role: string | null
          permissions: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: string | null
          permissions?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: string | null
          permissions?: Json | null
          created_at?: string | null
          updated_at?: string | null
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
