# Project Assignment System - How It Works

## Overview
Employees can now assign their daily work reports to specific projects, and each form gets a unique ID based on the project.

## How the Numbering System Works

### Projects Get Unique IDs
- Factory name ending with number → Extracts the number
- Example: "מפעל גיבוש - 62" → Extracts `62`
- First project for factory 62 → `62.1`
- Second project → `62.2`
- Third project → `62.3`

### Forms Get Unique IDs Based on Project
- When submitting a form, employee selects a project
- System generates form number based on project number
- Example for project `62.1`:
  - First form → `62.1.1`
  - Second form → `62.1.2`
  - Third form → `62.1.3`

## Using the System

### For Admins - Creating Projects
1. Go to `/admin/projects`
2. Click "הוסף פרויקט חדש"
3. Select factory (make sure it ends with a number like "מפעל XYZ - 62")
4. Fill in project details
5. Click "שמור"
6. The project will automatically get a unique ID (e.g., `62.1`, `62.2`)

### For Employees - Submitting Work Reports
1. Go to the main form
2. Fill in factory name, dates, etc.
3. **Select a project** from the "שיוך לפרויקט" dropdown
4. Complete the rest of the form
5. Submit
6. The form will automatically get a unique ID like `62.1.1`, `62.1.2`, etc.

## Display in UI

### Project Cards
- Display project number prominently
- Shows: Project Name
- Badge: **62.1**
- In card: "מזהה ייחודי: 62.1"

### Form Dropdown
- Shows all active projects
- Display format: "62.1 - Project Name"
- Employees can see project number when selecting

## Requirements

1. **Factory names must end with a number**
   - Good: "מפעל גיבוש - 62"
   - Good: "Factory XYZ 63"
   - Bad: "מפעל ללא מספר"

2. **Project table must have `project_number` column**
   - Run the SQL migration: `migration/add-numbering-system.sql`

3. **Forms must have `form_number` and `project_id` columns**
   - Already included in the migration

## Complete Number Example
```
Factory 62 (מפעל גיבוש - 62)
└── Project 62.1
    ├── Form 62.1.1 (first day)
    ├── Form 62.1.2 (second day)
    └── Form 62.1.3 (third day)
└── Project 62.2
    ├── Form 62.2.1
    └── Form 62.2.2

Factory 63
└── Project 63.1
    └── Form 63.1.1
```

## Database Fields

### projects table
- `project_number` (TEXT) - Auto-generated like "62.1"
- Stores the unique project ID

### mia_data table (forms)
- `project_id` (UUID) - Links to project
- `form_number` (TEXT) - Auto-generated like "62.1.1"
- Stores the unique form ID






