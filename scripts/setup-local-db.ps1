# GoalGhost local PostgreSQL setup
# Default credentials after PostgreSQL 17 install via winget

$env:PGPASSWORD = "postgres"
$dbUrl = "postgresql://postgres:postgres@localhost:5432/goalghost"
# Default password after winget PostgreSQL 17 install is typically "postgres"

Write-Host "Creating goalghost database..."
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE goalghost;" 2>$null

Write-Host "DATABASE_URL=$dbUrl"
Write-Host "Add the above to .env and .env.local"