# Projects Management Setup Guide

## מה נוצר

נוצר מערכת ניהול פרויקטים חדשה בפאנל הניהול עם כל הנתונים בעברית.

## שלבים ליצירת הטבלה ב-Supabase

### אופציה 1: דרך Supabase Dashboard (מומלץ)

1. **פתח את Supabase SQL Editor:**
   - לך לכתובת: https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new

2. **העתק את הקוד מSQL:**
   - פתח את הקובץ: `migration/create-supabase-schema.sql`
   - העתק את כל התוכן מהשורה 96 עד השורה 126 (זה הקוד של טבלת projects בלבד)

3. **העתק רק את הקוד הזה לתוך Supabase SQL Editor:**

```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  factory_name TEXT NOT NULL,
  specific_area TEXT,
  project_name TEXT NOT NULL,
  project_description TEXT,
  start_date DATE,
  status TEXT DEFAULT 'active',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_factory FOREIGN KEY (factory_name) REFERENCES factory_name(name)
);

-- Create index for projects
CREATE INDEX IF NOT EXISTS idx_projects_factory_name ON projects(factory_name);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. **לחץ על RUN** ליצירת הטבלה

### אופציה 2: דרך Command Line (אם יש לך Service Role Key)

אם יש לך את ה-Service Role Key, תוכל להריץ:

```bash
node migration/execute-sql.js
```

## איך להשתמש

### כניסה לממשק ניהול הפרויקטים:

1. פתח את האפליקציה: http://localhost:3000
2. היכנס לפאנל הניהול: http://localhost:3000/admin
3. לחץ על הכפתור **"ניהול פרויקטים"** בחלק העליון של המסך
4. תועבר למסך ניהול הפרויקטים

### יצירת פרויקט חדש:

1. לחץ על **"הוסף פרויקט חדש"**
2. מלא את הפרטים:
   - **שם המפעל** (חובה) - בחר מהרשימה
   - **איזור ספציפי** - טקסט חופשי
   - **שם הפרויקט** (חובה) - טקסט חופשי
   - **תיאור הפרויקט** - טקסט חופשי
   - **תאריך התחלה** - תאריך
3. לחץ על **"שמור"**

### צפייה בפרויקטים:

כל הפרויקטים מוצגים בכרטיסים עם הפרטים הבאים:
- שם הפרויקט
- שם המפעל
- איזור ספציפי
- תיאור הפרויקט
- תאריך התחלה
- תאריך יצירה

### מחיקת פרויקט:

לחץ על סמל המחיקה בפינה השמאלית העליונה של כרטיס הפרויקט

## תכונות נוספות

- כל הממשק בעברית
- בחירת מפעל מרשימת המפעלים הקיימים
- תמיכה בתאריכים בעברית
- טעינת רשימת פרויקטים מהשרת
- הוספת, הצגה, ומחיקת פרויקטים

## הערות

- הפרויקטים נשמרים בטבלת `projects` ב-Supabase
- רק פרויקטים עם סטטוס `active` מוצגים (ניתן לשנות בקוד)
- כל פרויקט מקושר למפעל דרך Foreign Key






