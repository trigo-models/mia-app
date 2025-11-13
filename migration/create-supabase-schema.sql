-- Create main Mia-data table
CREATE TABLE IF NOT EXISTS mia_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fac_name TEXT,
  element TEXT,
  r_comments TEXT,
  r_leaders TEXT,
  r_team TEXT,
  r_owner TEXT,
  number TEXT,
  date_made DATE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_construction BOOLEAN DEFAULT false,
  contruction_tons NUMERIC,
  is_greetings BOOLEAN DEFAULT false,
  greetings_dim TEXT,
  is_handrail BOOLEAN DEFAULT false,
  handrail_length TEXT,
  job_desc TEXT,
  disconnected_tons NUMERIC,
  is_steps BOOLEAN DEFAULT false,
  steps_qty TEXT,
  step_size TEXT,
  is_bolts BOOLEAN DEFAULT false,
  bolt_qty TEXT,
  bolt_type TEXT,
  is_distons BOOLEAN DEFAULT false,
  r_status TEXT,
  airtable_id TEXT UNIQUE, -- Store original Airtable ID for migration
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create factory_name table
CREATE TABLE IF NOT EXISTS factory_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  Name TEXT UNIQUE NOT NULL
);

-- Create leaders table
CREATE TABLE IF NOT EXISTS leaders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  Name TEXT UNIQUE NOT NULL
);

-- Create team table
CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  Name TEXT UNIQUE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mia_data_fac_name ON mia_data(fac_name);
CREATE INDEX IF NOT EXISTS idx_mia_data_date_made ON mia_data(date_made);
CREATE INDEX IF NOT EXISTS idx_mia_data_created_at ON mia_data(created_at);
CREATE INDEX IF NOT EXISTS idx_mia_data_airtable_id ON mia_data(airtable_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE mia_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on mia_data" ON mia_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on factory_name" ON factory_name
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on leaders" ON leaders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on team" ON team
  FOR ALL USING (true) WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_mia_data_updated_at
  BEFORE UPDATE ON mia_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
