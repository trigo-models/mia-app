# Migration Guide: Airtable to Supabase

This guide will help you migrate your data from Airtable to Supabase.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in Supabase
3. **Supabase Credentials**: Get your project URL and anon key from the Supabase dashboard

## Step 1: Set Up Supabase

### 1.1 Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: MIA-APP
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
4. Click "Create new project"

### 1.2 Get Your Supabase Credentials

1. Go to your project dashboard
2. Click on the "Settings" icon (gear icon) in the sidebar
3. Click on "API"
4. Copy the following:
   - **URL** (Project URL)
   - **anon/public key** (Project API keys → anon public)

### 1.3 Add Credentials to Environment Variables

1. Open `.env.local` in your project root
2. Add your Supabase credentials:

```env
# Airtable Configuration (existing)
AIRTABLE_API_KEY=your_airtable_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Table Names
AIRTABLE_FACTORIES_TABLE=Factory Name
AIRTABLE_TEAM_LEADERS_TABLE=Leaders
AIRTABLE_TEAM_MEMBERS_TABLE=team
AIRTABLE_MIA_DATA_TABLE=Mia-data

# Supabase Configuration (NEW)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 2: Create Database Schema in Supabase

### 2.1 Open Supabase SQL Editor

1. In your Supabase dashboard, click on "SQL Editor" in the sidebar
2. Click "New Query"

### 2.2 Run the Migration SQL

1. Open the file `migration/create-supabase-schema.sql`
2. Copy its contents
3. Paste into the Supabase SQL Editor
4. Click "Run" to execute the SQL

This will create all the necessary tables:
- `mia_data` - Main data table
- `factory_name` - Factory names reference table
- `leaders` - Team leaders reference table
- `team` - Team members reference table

## Step 3: Run the Migration Script

1. Install dependencies (already done):
   ```bash
   npm install @supabase/supabase-js dotenv ts-node
   ```

2. Run the migration script:
   ```bash
   npx ts-node migration/migrate-to-supabase.ts
   ```

This script will:
- Migrate all factories from Airtable to Supabase
- Migrate all team leaders to Supabase
- Migrate all team members to Supabase
- Migrate all Mia-data records to Supabase

The migration will take some time depending on the amount of data you have.

## Step 4: Update Your Application Code

After migrating the data, you need to update your application to use Supabase instead of Airtable.

### 4.1 Update API Routes

The main API routes that need to be updated:
- `app/api/admin/records/route.ts` - List all records
- `app/api/admin/records/[id]/route.ts` - Get/Update/Delete individual records
- `app/api/save-form/route.ts` - Save form submissions
- `app/api/options/route.ts` - Get options for dropdowns

### 4.2 Switch Implementation

I'll help you update these files to use Supabase. The changes involve:
- Replacing Airtable queries with Supabase queries
- Updating authentication from Airtable to Supabase
- Adjusting data structure handling

## Step 5: Test the Migration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the following:
   - View all records in admin panel
   - View individual record details
   - Create a new record
   - Edit an existing record
   - Delete a record
   - Check factory/leader/team dropdowns

## Step 6: Deploy to Production

Once testing is complete:

1. Update your production environment variables with Supabase credentials
2. Deploy your application
3. Monitor for any issues

## Rollback Plan

If you need to rollback:

1. Your Airtable data is still intact
2. Revert the code changes to use Airtable
3. Remove Supabase-related environment variables

## Verification

After migration, verify:

- ✅ All records are in Supabase
- ✅ Reference data (factories, leaders, team) is migrated
- ✅ Application works with Supabase
- ✅ No data loss occurred

## Support

If you encounter any issues during migration:
1. Check the Supabase logs in the dashboard
2. Check the migration script output for errors
3. Verify your environment variables are correct





