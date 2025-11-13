# Migration Instructions

## Step 1: Create Database Tables in Supabase

1. Go to your Supabase project: https://tcuzxchvkuryprwnljqfl.supabase.co
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy and paste the contents of `create-supabase-schema.sql`
5. Click "Run" or press Ctrl+Enter

This will create all necessary tables in your Supabase database.

## Step 2: Run the Migration Script

Once the tables are created, run the migration script:

```bash
npx ts-node migration/migrate-to-supabase.ts
```

This will:
- Transfer all factories from Airtable to Supabase
- Transfer all team leaders to Supabase
- Transfer all team members to Supabase
- Transfer all Mia-data records to Supabase

## Step 3: Verify the Migration

After running the migration, you can check the status at:
http://localhost:3000/api/migration/status

Or manually check your Supabase dashboard:
https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/editor





