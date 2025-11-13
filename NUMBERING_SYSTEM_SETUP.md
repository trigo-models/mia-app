# Automatic Numbering System Setup Guide

## מה נוצר - מערכת אוטומטית למספרים

נוצרה מערכת אוטומטית ליצירת מספרים לפרויקטים ודוחות:
- **מפעל 62** → פרויקט **62.1**, **62.2** וכו'
- **פרויקט 62.2** → דוחות **62.2.1**, **62.2.2** וכו'

## שלב 1: עדכון הטבלאות ב-Supabase

### הפעל את ה-SQL הבא ב-Supabase SQL Editor:

```sql
-- Add factory number to factory_name table
ALTER TABLE factory_name ADD COLUMN IF NOT EXISTS factory_number INTEGER;

-- Add project_number field to projects table  
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number TEXT;

-- Create index for project_number
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);

-- Add form_number and project_id to mia_data table
ALTER TABLE mia_data ADD COLUMN IF NOT EXISTS form_number TEXT;
ALTER TABLE mia_data ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Create index for form_number and project_id
CREATE INDEX IF NOT EXISTS idx_mia_data_form_number ON mia_data(form_number);
CREATE INDEX IF NOT EXISTS idx_mia_data_project_id ON mia_data(project_id);
```

**איך לעשות זאת:**
1. פתח: https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new
2. הדבק את ה-SQL לעיל
3. לחץ על RUN

## שלב 2: הוסף מספרי מפעלים

עכשיו צריך להוסיף את המספרים למפעלים הקיימים.

### אפשרות 1: דרך Supabase Dashboard
1. פתח את Table Editor ב-Supabase
2. בחר את הטבלה `factory_name`
3. עבור כל מפעל, הוסף מספר ב-`factory_number` (למשל: 61, 62, 63 וכו')

### אפשרות 2: דרך SQL
```sql
-- עדכן את המפעלים עם מספרים
UPDATE factory_name SET factory_number = 61 WHERE Name = 'שם מפעל א';
UPDATE factory_name SET factory_number = 62 WHERE Name = 'שם מפעל ב';
UPDATE factory_name SET factory_number = 63 WHERE Name = 'שם מפעל ג';
-- וכו'...
```

## איך זה עובד

### יצירת פרויקט חדש:
1. אדמין בוחר מפעל (למשל: מפעל 62)
2. המערכת בודקת מה הפרויקט האחרון של המפעל
3. אם זה פרויקט ראשון → יוצר **62.1**
4. אם קיים **62.1** → יוצר **62.2**
5. וכך הלאה...

### יצירת דוח עבודה:
1. עובד בוחר פרויקט (למשל: **62.2**)
2. המערכת בודקת מה הדוח האחרון של הפרויקט
3. אם זה דוח ראשון → יוצר **62.2.1**
4. אם קיים **62.2.1** → יוצר **62.2.2**
5. וכך הלאה...

## דוגמה למערכת המספרים:

```
מפעל 62
├── 62.1 (פרויקט ראשון)
│   ├── 62.1.1 (דוח ראשון)
│   ├── 62.1.2 (דוח שני)
│   └── 62.1.3 (דוח שלישי)
├── 62.2 (פרויקט שני)
│   ├── 62.2.1 (דוח ראשון)
│   └── 62.2.2 (דוח שני)
└── 62.3 (פרויקט שלישי)
    └── 62.3.1 (דוח ראשון)

מפעל 63
├── 63.1 (פרויקט ראשון)
├── 63.2 (פרויקט שני)
└── 63.3 (פרויקט שלישי)
```

## חשוב לדעת

- המספר נוצר **אוטומטית** - לא צריך להכניס אותו ידנית
- כל פרויקט מקבל מספר ייחודי לפי המפעל
- כל דוח מקבל מספר ייחודי לפי הפרויקט
- אם לא בחרת פרויקט, המערכת תמשיך להשתמש במספרים הישנים

## בדיקה

1. פתח את `/admin/projects`
2. צור פרויקט חדש
3. התפריט יציג אוטומטית את המספר (למשל: **62.1**)
4. כשיוצרים דוח עבודה לפרויקט זה, המספר יהיה **62.1.1**, ואז **62.1.2** וכו'






