#!/usr/bin/env python3
"""
Check if scraping_runs table exists and create it if needed
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def check_and_create_table():
    """Check if scraping_runs table exists and create it if needed"""
    
    # Initialize Supabase client
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        # Try to query the table to see if it exists
        result = supabase.table('scraping_runs').select('*', count='exact').limit(1).execute()
        print("✓ scraping_runs table already exists")
        return True
        
    except Exception as e:
        if "relation" in str(e) and "does not exist" in str(e):
            print("! scraping_runs table does not exist, creating it...")
            
            # Create the table using SQL
            create_table_sql = """
            -- Create table for tracking Instagram scraping runs
            CREATE TABLE IF NOT EXISTS scraping_runs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                run_id TEXT UNIQUE,
                category TEXT,
                location TEXT,
                status TEXT,
                profiles_discovered INTEGER DEFAULT 0,
                profiles_validated INTEGER DEFAULT 0,
                started_at TIMESTAMPTZ DEFAULT NOW(),
                completed_at TIMESTAMPTZ,
                error_message TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Add indexes for performance
            CREATE INDEX IF NOT EXISTS idx_scraping_runs_status ON scraping_runs(status);
            CREATE INDEX IF NOT EXISTS idx_scraping_runs_category ON scraping_runs(category);
            CREATE INDEX IF NOT EXISTS idx_scraping_runs_started_at ON scraping_runs(started_at);

            -- Add RLS policies
            ALTER TABLE scraping_runs ENABLE ROW LEVEL SECURITY;

            -- Allow service role full access (use IF NOT EXISTS equivalent)
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = 'scraping_runs' 
                    AND policyname = 'Service role can manage scraping runs'
                ) THEN
                    CREATE POLICY "Service role can manage scraping runs" ON scraping_runs
                        FOR ALL USING (auth.role() = 'service_role');
                END IF;
            END
            $$;
            """
            
            # Execute the SQL
            supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
            print("✓ scraping_runs table created successfully")
            return True
            
        else:
            print(f"✗ Error checking table: {e}")
            return False

def create_stats_function():
    """Create the stats function used by the Python script"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        function_sql = """
        CREATE OR REPLACE FUNCTION get_vendor_stats_by_category()
        RETURNS TABLE(category TEXT, count BIGINT)
        LANGUAGE sql
        STABLE
        AS $$
            SELECT category, COUNT(*) as count
            FROM instagram_vendors
            GROUP BY category
            ORDER BY count DESC;
        $$;
        """
        
        supabase.rpc('exec_sql', {'sql': function_sql}).execute()
        print("✓ get_vendor_stats_by_category function created")
        return True
        
    except Exception as e:
        print(f"! Note: Could not create stats function: {e}")
        return False

if __name__ == "__main__":
    print("Checking database setup for Instagram scraper...")
    
    if check_and_create_table():
        create_stats_function()
        print("\n✓ Database setup complete! You can now run the Instagram scraper.")
    else:
        print("\n✗ Database setup failed. Please check your Supabase credentials.")