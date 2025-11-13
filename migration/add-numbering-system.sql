-- Add factory number to factory_name table
ALTER TABLE factory_name ADD COLUMN IF NOT EXISTS factory_number INTEGER;

-- Add project_number field to projects table  
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number TEXT;

-- Create index for project_number
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);

-- Create a sequence to track form numbers per project
-- We'll use the mia_data table to store the form_number
ALTER TABLE mia_data ADD COLUMN IF NOT EXISTS form_number TEXT;
ALTER TABLE mia_data ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Create index for form_number and project_id
CREATE INDEX IF NOT EXISTS idx_mia_data_form_number ON mia_data(form_number);
CREATE INDEX IF NOT EXISTS idx_mia_data_project_id ON mia_data(project_id);





