import { Database as OriginalDatabase } from './types';

// Extend the original Database type to include our new tables
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: {
      // Include all original tables
      location_metadata: OriginalDatabase['public']['Tables']['location_metadata'];
      profiles: OriginalDatabase['public']['Tables']['profiles'];
      vendor_cache: OriginalDatabase['public']['Tables']['vendor_cache'];
      vendor_favorites: OriginalDatabase['public']['Tables']['vendor_favorites'];
      vendor_searches: OriginalDatabase['public']['Tables']['vendor_searches'];
      vendor_subcategories: OriginalDatabase['public']['Tables']['vendor_subcategories'];
      vendors: OriginalDatabase['public']['Tables']['vendors'];
      
      // Add new tables
      plan_board_columns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_board_columns_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      
      plan_board_items: {
        Row: {
          id: string;
          user_id: string;
          column_id: string;
          vendor_id?: string;
          vendor_data?: any;
          title: string;
          description?: string;
          budget?: number;
          notes?: string;
          category?: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          column_id: string;
          vendor_id?: string;
          vendor_data?: any;
          title: string;
          description?: string;
          budget?: number;
          notes?: string;
          category?: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          column_id?: string;
          vendor_id?: string;
          vendor_data?: any;
          title?: string;
          description?: string;
          budget?: number;
          notes?: string;
          category?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_board_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_board_items_column_id_fkey";
            columns: ["column_id"];
            isOneToOne: false;
            referencedRelation: "plan_board_columns";
            referencedColumns: ["id"];
          }
        ];
      };
      
      vendor_completions: {
        Row: {
          id: string;
          user_id: string;
          vendor_slug: string;
          completed: boolean;
          notes?: string;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_slug: string;
          completed?: boolean;
          notes?: string;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_slug?: string;
          completed?: boolean;
          notes?: string;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      
      timeline_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          date: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          date: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          date?: string;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Export the extended Database type
export type Database = ExtendedDatabase;
