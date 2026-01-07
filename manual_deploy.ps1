# Manual Deployment Script for Levant Events
# Usage: Right-click > Run with PowerShell

Write-Host "Starting manual deployment..." -ForegroundColor Cyan

# 1. Try to find Git
$gitPath = "git"
if (Get-Command "git" -ErrorAction SilentlyContinue) {
    Write-Host "Git found in PATH." -ForegroundColor Green
} else {
    Write-Host "Git not in PATH. Searching known locations..." -ForegroundColor Yellow
    $possiblePaths = @(
        "$env:ProgramFiles\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\bin\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $gitPath = "& `"$path`""
            Write-Host "Found Git at: $path" -ForegroundColor Green
            break
        }
    }
}

# Define a function to run git commands
function Run-Git {
    param([string]$args)
    $cmd = "$gitPath $args"
    Invoke-Expression $cmd
}

# 2. Build the project
Write-Host "Building project..." -ForegroundColor Cyan
cmd /c npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit }

# 3. Deploy
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Cyan

# Ensure dist exists
if (-not (Test-Path "dist")) { Write-Error "Dist folder not found!"; exit }

# Add all changes
Run-Git "add ."
Run-Git "commit -m ""chore: save work before deploy"""

# Force add dist
Run-Git "add dist -f"
Run-Git "commit -m ""deploy: manual deploy"""

# Push subtree
Run-Git "subtree push --prefix dist origin gh-pages"

Write-Host "Deployment info sent to GitHub!" -ForegroundColor Green
Write-Host "Check your site in a few minutes." -ForegroundColor Green
Read-Host -Prompt "Press Enter to exit"
