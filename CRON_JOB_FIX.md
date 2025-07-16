# 🔧 Cron Job Fix Guide

## 📋 Current Issue
Your cron job at cron-job.org is failing with **401 Unauthorized** because it's missing authentication headers.

## ✅ Solution Steps

### 1. **Apply Database Migration First**
The notification queue table needs to be created:

1. Go to [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/sql)
2. Copy and paste this SQL:

```sql
-- Create notification queue table
CREATE TABLE IF NOT EXISTS public.admin_notification_queue (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_type text NOT NULL,
  data jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage notifications"
  ON public.admin_notification_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON public.admin_notification_queue(processed);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.admin_notification_queue(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO service_role;
```

3. Click **Run** to execute the migration

### 2. **Update Your Cron Job Configuration**

1. **Go to** [cron-job.org](https://cron-job.org/)
2. **Log in** to your account
3. **Find your disabled cron job** for the notification queue
4. **Edit the cron job** and update the configuration:

#### **Current Configuration (Failing):**
```
URL: https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/process-notification-queue
Method: POST
```

#### **Fixed Configuration:**
```
URL: https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/process-notification-queue
Method: POST
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A
  Content-Type: application/json
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A
```

### 3. **Detailed Steps for Cron-job.org**

1. **Login** to your cron-job.org account
2. **Find** the disabled job (should be listed as "Disabled")
3. **Click Edit** or **Settings** for that job
4. **Navigate to** "Advanced" or "Headers" section
5. **Add these headers:**
   - **Header 1**: `Authorization` = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A`
   - **Header 2**: `Content-Type` = `application/json`
   - **Header 3**: `apikey` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A`
6. **Save** the configuration
7. **Re-enable** the cron job

### 4. **Test Before Re-enabling**

Run this test script to verify everything works:

```bash
./scripts/test-notification-queue.sh
```

You should see:
- ✅ **Status 200** (Success)
- ✅ **Response showing processed notifications**

### 5. **Schedule**
- **Frequency**: Every 5 minutes
- **URL**: `https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/process-notification-queue`
- **Method**: POST
- **Headers**: As specified above

## 🔍 Verification

After fixing:
1. **Check cron job logs** in cron-job.org dashboard
2. **Monitor** the `admin_notification_queue` table in Supabase
3. **Test** by submitting a business and checking for email

## 📞 Support

If you encounter issues:
1. **Check the test script output**: `./scripts/test-notification-queue.sh`
2. **Review Supabase logs**: Dashboard > Functions > Logs
3. **Verify headers** are correctly added in cron-job.org

## 🎯 Expected Results

Once fixed, your cron job should:
- ✅ Run every 5 minutes without errors
- ✅ Process queued notifications
- ✅ Send admin emails for new business submissions
- ✅ Show success logs in both cron-job.org and Supabase