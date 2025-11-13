# How to See the Project Assignment Field

## The Field IS There! 

The project assignment field is already implemented in the main form where employees submit daily work.

## Where to Find It

**Location:** Main form, Step 1 ("פרטים כלליים")

**Order of Fields:**
1. שם הממלא (Owner) *
2. שם המפעל (Factory Name) *
3. **שיוך לפרויקט (Project Assignment)** ← HERE!
4. איזור ספציפי (Specific Area) *
5. תאריך ביצוע (Date) *
6. Time fields

## Field Label
- **Hebrew:** "שיוך לפרויקט (אופציונלי) *"
- **English:** "Project Assignment (Optional)"

## What You'll See

When you open the dropdown, you'll see:
- "ללא פרויקט" (No Project)
- "62.1 - Project Name" (if project number exists)
- "63.2 - Another Project"
- etc.

## Make It Visible

### Step 1: Run SQL (if not done)
Run the SQL from `migration/add-numbering-system.sql` in Supabase.

### Step 2: Create Projects
1. Go to `/admin/projects`
2. Create at least one project
3. The field will appear automatically on the main form

### Step 3: Refresh
- Refresh the browser
- Go to main form
- The field should appear after factory selection

## If It Still Doesn't Show

1. Check browser console for errors
2. Verify projects table has `project_number` column
3. Make sure at least one active project exists
4. Try hard refresh: Ctrl+Shift+R

## Test

1. Create a project in admin panel
2. Go to main form (homepage)
3. Click "הוסף דיווח עבודה" or similar
4. Look for "שיוך לפרויקט" field in Step 1






