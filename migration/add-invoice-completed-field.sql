-- Add invoice_completed field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS invoice_completed BOOLEAN DEFAULT false;

-- Add comment to the column
COMMENT ON COLUMN projects.invoice_completed IS 'Indicates if invoice has been completed for this project';

