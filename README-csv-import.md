# CSV Import System for Wedding Photographers

This document explains how to import photographer data from Excel/CSV files into your Wedding Vendor Chronicles website.

## Overview

The CSV import system allows you to bulk import photographer data from Excel files into your Supabase database. The system includes:

- Database migration to support CSV data fields
- CSV parsing and validation script
- Data cleaning and standardization
- Batch import to handle large datasets
- Error reporting and validation

## Prerequisites

1. **Database Migration**: The database has been updated with new columns to support CSV import
2. **Dependencies**: Required packages (`csv-parser`, `dotenv`) have been installed
3. **Environment**: Your `.env` file must contain valid Supabase credentials

## CSV File Format

Your CSV file must have these **exact** column headers:

```
Instagram Page URL, Business Name, Phone, Business Email, Website, Address, City, State, Zip
```

### Column Descriptions

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Instagram Page URL | Yes | Full Instagram profile URL | `https://www.instagram.com/photographer123/` |
| Business Name | Yes | Name of the photography business | `Smith Photography Studio` |
| Phone | No | Contact phone number | `(555) 123-4567` |
| Business Email | No | Business email address | `info@smithphoto.com` |
| Website | No | Business website URL | `https://smithphoto.com` |
| Address | No | Street address | `123 Main St` |
| City | Yes | City name | `Los Angeles` |
| State | Yes | State (full name or abbreviation) | `CA` or `California` |
| Zip | No | ZIP/postal code | `90210` |

## Data Processing Features

### Automatic Data Cleaning

The import script automatically:

- **Phone Numbers**: Standardizes to `(XXX) XXX-XXXX` format
- **Email Addresses**: Converts to lowercase and validates format
- **Website URLs**: Adds `https://` if missing
- **State Names**: Converts full state names to abbreviations (e.g., "California" → "CA")
- **Instagram Handles**: Extracts username from Instagram URLs

### Validation Rules

Records are validated for:

- **Required Fields**: Business Name, City, State must be present
- **Instagram Data**: Either Instagram URL or handle must be provided
- **Email Format**: Valid email format if provided
- **Data Types**: Proper formatting for all fields

### Error Handling

- Invalid records are skipped with detailed error messages
- Validation errors are reported by row number
- Import continues even if some records fail
- Success/failure summary provided at the end

## How to Import Your Data

### Method 1: Using the Shell Script (Recommended)

```bash
# Make sure you're in the project root directory
./scripts/data-collection/run-csv-import.sh "Wedding Photographer.csv"
```

The script will:
1. Validate your CSV file exists
2. Check for required environment variables
3. Show a preview of what will be imported
4. Ask for confirmation before proceeding
5. Run the import and show progress

### Method 2: Direct Node.js Command

```bash
node scripts/data-collection/import-photographer-csv.js "Wedding Photographer.csv"
```

## Import Process

1. **File Validation**: Checks if file exists and has correct headers
2. **Data Parsing**: Reads CSV and maps columns to database fields
3. **Data Validation**: Validates required fields and data formats
4. **Data Cleaning**: Standardizes phone numbers, emails, URLs, etc.
5. **Batch Import**: Imports data in batches of 50 records
6. **Progress Reporting**: Shows real-time progress and results

## Database Schema

The data is imported into the `instagram_vendors` table with these fields:

```sql
-- Core identification
id (UUID, auto-generated)
instagram_handle (extracted from URL)
instagram_url (full URL from CSV)
business_name (from CSV)
category ('photographers' - auto-set)

-- Contact information
phone (cleaned and formatted)
email (validated and lowercase)
website_url (with protocol added)

-- Location data
address (from CSV)
city (from CSV)
state (standardized abbreviation)
zip_code (from CSV)

-- Default values (can be enriched later)
subcategory (null initially)
follower_count (0)
post_count (0)
bio (empty)
profile_image_url (null)
is_verified (false)
is_business_account (false)

-- Timestamps
created_at (auto-generated)
updated_at (auto-generated)
```

## After Import

### Verify the Import

1. **Check Supabase Dashboard**: Log into your Supabase project and verify the data in the `instagram_vendors` table

2. **View Imported Data**:
   ```bash
   node scripts/data-collection/view-instagram-vendors.js
   ```

3. **Test Search Functionality**:
   ```bash
   npm run dev
   # Visit: http://localhost:5173/search?category=photographers
   ```

### Next Steps

1. **Instagram Enrichment**: Run the Instagram data collection script to get follower counts, bios, and profile images
2. **Subcategory Assignment**: Manually assign photographer subcategories (Traditional, Photojournalistic, Fine Art, etc.)
3. **Data Verification**: Review and clean any data that needs manual correction

## Troubleshooting

### Common Issues

**"Missing required headers" Error**
- Ensure your CSV has the exact column names listed above
- Check for extra spaces or different capitalization
- Make sure you're using a CSV file, not Excel (.xlsx)

**"Missing Supabase environment variables" Error**
- Check that your `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Make sure there are no extra spaces around the values

**"File not found" Error**
- Check the file path is correct
- Use quotes around the file path if it contains spaces
- Make sure you're running the command from the project root

**Import Fails with Database Errors**
- Run the database migration first: `supabase db push`
- Check your Supabase connection
- Verify you have write permissions to the database

### Getting Help

If you encounter issues:

1. Check the error messages carefully - they usually indicate the specific problem
2. Verify your CSV file format matches the requirements exactly
3. Test with a small sample (5-10 rows) first
4. Check the Supabase dashboard for any database-level errors

## File Structure

```
scripts/data-collection/
├── import-photographer-csv.js     # Main import script
├── run-csv-import.sh             # Shell script wrapper
└── view-instagram-vendors.js     # View imported data

supabase/migrations/
└── 20250616000000_add_csv_import_columns.sql  # Database migration
```

## Example CSV Data

```csv
Instagram Page URL,Business Name,Phone,Business Email,Website,Address,City,State,Zip
https://www.instagram.com/smithphoto/,Smith Photography,(555) 123-4567,info@smithphoto.com,smithphoto.com,123 Main St,Los Angeles,CA,90210
https://instagram.com/janedoe_photos,Jane Doe Photography,555-987-6543,jane@janedoephotos.com,https://janedoephotos.com,456 Oak Ave,San Francisco,California,94102
```

This system provides a robust way to import your photographer data while maintaining data quality and providing detailed feedback on the import process.
