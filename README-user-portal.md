# Wedding Vendor Chronicles - User Portal

This document outlines the implementation of the user portal features for the Wedding Vendor Chronicles application.

## Features Implemented

### 1. Favorites Tab
- Displays vendors that users have favorited
- Shows vendor details including name, description, rating, and address
- Allows users to view vendor details and manage favorites

### 2. Plan Board (Kanban Board)
- Provides a drag-and-drop interface for planning wedding vendors
- Organizes vendors into customizable columns (e.g., Considering, Contacted, Meeting Scheduled, Booked)
- Allows users to add, edit, and delete items in each column
- Supports adding budget information and notes for each vendor
- Enables users to create custom columns to fit their planning workflow
- Includes a Wedding Essentials Guide to help users understand which vendors are essential
- Allows categorizing vendors by type (e.g., Venue, Photographer, Caterer)
- Highlights essential vendors with badges to help with planning
- Features interactive checklists for tracking vendor booking progress
- Supports marking vendors as completed with visual strikethrough styling
- Persists completion status in the database for each user

### 3. Wedding Timeline
- Helps users track important wedding planning milestones and deadlines
- Provides a chronological view of upcoming events
- Allows users to mark events as completed
- Supports filtering events by status (all, upcoming, completed)
- Enables users to add, edit, and delete timeline events

## Technical Implementation

### Database Schema
We've added the following tables to the Supabase database:

1. `plan_board_columns`
   - Stores the columns for the Kanban board
   - Fields: id, user_id, name, position, created_at

2. `plan_board_items`
   - Stores the items within each column
   - Fields: id, user_id, column_id, vendor_id, vendor_data, title, description, budget, notes, category, position, created_at

3. `vendor_completions`
   - Stores the completion status of vendors in the essentials guide
   - Fields: id, user_id, vendor_slug, completed, notes, updated_at, created_at

4. `timeline_events`
   - Stores the timeline events
   - Fields: id, user_id, title, description, date, completed, created_at

### Components Created

1. Portal Components:
   - `PlanBoard.tsx`: Main component for the Kanban board
   - `WeddingTimeline.tsx`: Main component for the timeline

2. Plan Board Components:
   - `Column.tsx`: Represents a column in the Kanban board
   - `Item.tsx`: Represents an item within a column
   - `AddColumnForm.tsx`: Form for adding a new column
   - `AddItemForm.tsx`: Form for adding a new item
   - `EssentialVendorsGuide.tsx`: Guide component showing essential vendors and booking timeline

3. Timeline Components:
   - `TimelineEvent.tsx`: Represents an event in the timeline
   - `AddEventForm.tsx`: Form for adding a new event

4. Demo and Testing:
   - `DemoPortal.tsx`: Demonstrates the portal UI with mock data
   - `TestAuth.tsx`: Provides a simple authentication form with pre-filled credentials

### Authentication and Security

- All database tables have Row Level Security (RLS) policies to ensure users can only access their own data
- The portal components check for authentication and display appropriate messages when users are not signed in
- Foreign key constraints ensure data integrity

## How to Test

1. Demo Portal (No Authentication Required):
   - Visit `/demo-portal` to see a demonstration of the portal UI with mock data
   - The Favorites tab shows mock vendor data
   - The Plan Board and Timeline tabs show authentication required messages

2. Test Authentication:
   - Visit `/test-auth` to use the pre-filled credentials (test@test.com / Hello123!)
   - After signing in, you'll be redirected to the user portal

3. User Portal (Authentication Required):
   - Visit `/portal` to access the full user portal
   - Authentication is required to view and interact with the portal
   - After signing in, you can use all the features of the portal

## Future Enhancements

1. Integration with vendor search results to easily add vendors to the plan board
2. Email notifications for upcoming timeline events
3. Sharing capabilities to collaborate with partners or wedding planners
4. Budget tracking and reporting features
5. Mobile-responsive design improvements for better usability on smaller devices
