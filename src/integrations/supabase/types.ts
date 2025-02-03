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
          owner_id: string
          state: string
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
          owner_id: string
          state: string
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
          owner_id?: string
          state?: string
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
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
