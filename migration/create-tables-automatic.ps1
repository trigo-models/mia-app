# Automatic table creation script for Supabase
# This script will execute SQL on your Supabase instance

$supabaseUrl = "https://tcuzxchvkuryprwnljqfl.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdXp4Y2h2a3VycHJ3bmxqdWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODM0NjksImV4cCI6MjA3NzA1OTQ2OX0.kA0vUpYEKhfew-S2XfxAyHj7EcK9sPx5t1uUJojGHdw"

# Read the SQL file
$sqlContent = Get-Content "migration/create-supabase-schema.sql" -Raw

Write-Host "🚀 Creating tables in Supabase..." -ForegroundColor Green
Write-Host ""

# Since we can't execute SQL directly via the REST API with anon key,
# we'll use the Supabase Dashboard REST API endpoint
# But actually, the best approach is to use the pg_net or similar extension

Write-Host "⚠️  Direct SQL execution via API is restricted for security." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Alternative approach: We'll create a script that you can run" -ForegroundColor Cyan
Write-Host "   OR we can use the Supabase SQL Editor directly." -ForegroundColor Cyan
Write-Host ""
Write-Host "Creating a PowerShell script to execute SQL via Supabase API..." -ForegroundColor Green

# Save SQL content to a temp file
$tempFile = "migration/temp-schema.sql"
$sqlContent | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "✅ SQL content saved to: $tempFile" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Copy the SQL and run it in Supabase Dashboard" -ForegroundColor Yellow
Write-Host "URL: https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new" -ForegroundColor Cyan





