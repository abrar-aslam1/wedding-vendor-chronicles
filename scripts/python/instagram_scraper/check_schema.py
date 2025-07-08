#!/usr/bin/env python3
"""
Check the actual schema of instagram_vendors table
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def check_table_schema():
    """Check what columns exist in the instagram_vendors table"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        # Get a sample record to see the actual structure
        sample_result = supabase.table('instagram_vendors').select('*').limit(1).execute()
        
        if sample_result.data:
            sample_record = sample_result.data[0]
            print("📊 Existing instagram_vendors table schema:")
            print("=" * 50)
            
            for field, value in sample_record.items():
                print(f"  {field}: {type(value).__name__} = {str(value)[:50]}{'...' if len(str(value)) > 50 else ''}")
        else:
            print("No data found in table")
            
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_table_schema()