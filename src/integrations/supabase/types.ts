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
        }
        Relationships: []
      }
      // ... other existing tables would be here
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

export type SubscriptionTier = 'free' | 'professional' | 'premium'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'

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
