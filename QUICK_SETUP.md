# Quick Setup Guide - Complete the Migration

## Current Status
- ✅ Supabase credentials configured
- ✅ Code updated to use Supabase
- ✅ Reference data migrated (factories, leaders, team)
- ❌ Database tables need to be created in Supabase
- ❌ Main data (46 records) needs migration

## Action Required

### Step 1: Create Tables in Supabase (5 minutes)

1. **Go to Supabase SQL Editor:**
   https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new

2. **Open the schema file:**
   Open `migration/create-supabase-schema.sql` in your editor

3. **Copy all SQL and run it** in Supabase SQL Editor

4. This creates all necessary tables

### Step 2: Migrate Your Data (2 minutes)

After tables are created, run:
```bash
node migration/simple-migrate.js
```

Or just visit: http://localhost:3000/api/migrate-now

### Step 3: Done! 🎉

Your app is now using Supabase!

## What Changed?

All database operations now use Supabase:
- ✅ Viewing records in admin panel
- ✅ Viewing individual record details
- ✅ Editing records
- ✅ Deleting records
- ✅ Getting dropdown options (factories, leaders, team)

Only form submissions (`app/api/save-form/route.ts`) still use Airtable temporarily.

## Need Help?

Check `MIGRATION_STATUS.md` for detailed status and next steps.





