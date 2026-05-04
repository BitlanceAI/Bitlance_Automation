$env:AZURE_CONFIG_DIR = "D:\AzureConfig"

# Read .env file - only lines starting with uppercase (skip comments/blanks)
$envLines = Get-Content "d:\bitlance\server\.env" | Where-Object { 
    $_ -match '^\s*[A-Z][A-Z0-9_]+=.+' 
}

Write-Host "Loaded $($envLines.Count) environment variables." -ForegroundColor Green

# Build the settings array as a flat list for az CLI
$settingsArgs = $envLines | ForEach-Object { $_.Trim() }

# Push to Azure - using argument splatting correctly
$result = & az webapp config appsettings set `
    --name bitlance-automation-app `
    --resource-group Bitlance_RG `
    --settings $settingsArgs 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All environment variables set successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error setting environment variables:" -ForegroundColor Red
    Write-Host $result
}
