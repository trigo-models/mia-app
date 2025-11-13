-- Add project_id and form_number columns to mia_data table if they don't exist
DO $$ 
BEGIN
  -- Add project_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mia_data' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE mia_data ADD COLUMN project_id UUID;
    ALTER TABLE mia_data ADD CONSTRAINT fk_mia_data_project 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_mia_data_project_id ON mia_data(project_id);
  END IF;

  -- Add form_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mia_data' AND column_name = 'form_number'
  ) THEN
    ALTER TABLE mia_data ADD COLUMN form_number TEXT;
    CREATE INDEX IF NOT EXISTS idx_mia_data_form_number ON mia_data(form_number);
  END IF;
END $$;


