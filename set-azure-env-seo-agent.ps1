# ============================================================
# Set environment variables for the SEO AI Agent App Service
# ============================================================
# Usage: .\set-azure-env-seo-agent.ps1
#
# IMPORTANT: Replace <YOUR_APP_SERVICE_NAME> with the actual 
# Azure App Service name for the SEO agent (likely "seo-agent")
# and <YOUR_RESOURCE_GROUP> with the correct resource group.
# ============================================================

$APP_NAME = "seo-agent"                # ← Update this
$RESOURCE_GROUP = "Bitlance_RG"        # ← Update if different

# Required environment variables for the SEO AI Agent
$settings = @(
    "WEBSITES_PORT=8000",
    "PORT=8000",
    "GEMINI_API_KEY=AIzaSyCK-UO7oFEjKIi_QFIIgo3ee1YZyKTu6Z4",
    "OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>",
    "PERPLEXITY_API_KEY=<YOUR_PERPLEXITY_API_KEY>",
    "SERP_API_KEY=<YOUR_SERP_API_KEY>",
    "MOCK_AI=false"
)

Write-Host "Setting $($settings.Count) environment variables for '$APP_NAME'..." -ForegroundColor Cyan

$result = & az webapp config appsettings set `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --settings $settings 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All environment variables set successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error setting environment variables:" -ForegroundColor Red
    Write-Host $result
}
