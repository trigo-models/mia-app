-- Create project_tasks table to store tasks assigned to projects
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_id UUID NOT NULL,
  task_type TEXT NOT NULL, -- construction, stairs, mesh, railing, sheetMetal, equipment, minimumPermit, anchors, manpower
  clause_id TEXT NOT NULL,
  clause_name TEXT,
  
  -- Common fields for most task types
  description TEXT,
  quantity NUMERIC,
  measurement_unit TEXT,
  attachment TEXT, -- URL or base64 string
  
  -- Fields specific to minimumPermit
  title TEXT,
  specific_location TEXT,
  what_was_done TEXT,
  
  -- Fields specific to manpower (stored as JSONB)
  people JSONB, -- Array of {localId, firstName, workHours}
  
  -- Metadata
  created_by TEXT, -- Owner who created this task
  date_created DATE,
  
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_task_type ON project_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_project_tasks_created_at ON project_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_project_tasks_date_created ON project_tasks(date_created);

-- Enable RLS for project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for project_tasks
CREATE POLICY "Allow all operations on project_tasks" ON project_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for project_tasks updated_at
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


