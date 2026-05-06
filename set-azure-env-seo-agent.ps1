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
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false",
    "WEBSITES_PORT=8000",
    "PORT=8000",
    "GEMINI_API_KEY=AIzaSyCK-UO7oFEjKIi_QFIIgo3ee1YZyKTu6Z4",
    "MOCK_AI=false",
    "OPENAI_API_KEY=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",
    "PERPLEXITY_API_KEY=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",
    "SERP_API_KEY=885eaa5f335b5fefdfcc0d285f2c4735d71b5aa567de0b144a5e91e91668110f"
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
