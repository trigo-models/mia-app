-- Add invoice_issued field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS invoice_issued BOOLEAN DEFAULT false;

-- Add comment to the column
COMMENT ON COLUMN projects.invoice_issued IS 'Indicates if invoice has been issued for this project';

