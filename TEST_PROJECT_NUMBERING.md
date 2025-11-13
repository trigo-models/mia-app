# How to Test Project Numbering

## Setup Factory Names with Numbers

Your factory names must end with a number, like:
- `מפעל גיבוש - 62`
- `מפעל XYZ - 63`
- `Factory Name 64`

## How It Works

1. When you create a project for factory "מפעל גיבוש - 62":
   - System extracts: `62`
   - Looks for existing projects: `62.1`, `62.2`, etc.
   - Creates next project: `62.1` (or `62.2` if one exists, etc.)

2. When you create a project for factory "Factory Name 63":
   - System extracts: `63`
   - Creates: `63.1`, `63.2`, etc.

## Test Steps

1. **Update factory names** to include numbers (if they don't already)
2. **Create a new project**
3. **Check the card** - you should see the unique ID displayed prominently
4. **Create another project** for the same factory
5. **Check the unique ID** - should be `.2` now

## Check Terminal Logs

When you create a project, watch the terminal for:
```
Factory name: מפעל גיבוש - 62
Extracted factory number: 62
Generated project number: 62.1
Final insert data: { factory_name, project_number: "62.1", ... }
```

If you see "No factory number found in factory name", the factory name doesn't have a number at the end.






