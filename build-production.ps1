# Microsoft Teams App Catalog Explorer - Production Build Script
# This script minifies all web assets and creates a production-ready release

param(
    [switch]$Clean = $false,
    [switch]$Verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths
$SourceRoot = $PSScriptRoot
$ReleaseDir = Join-Path $SourceRoot "release"
$TempDir = Join-Path $SourceRoot "temp-build"

Write-Host "🚀 Starting Microsoft Teams App Catalog Explorer build process..." -ForegroundColor Green
Write-Host "Source: $SourceRoot" -ForegroundColor Cyan
Write-Host "Output: $ReleaseDir" -ForegroundColor Cyan

# Always clean the release folder first for a fresh build
if (Test-Path $ReleaseDir) {
    Write-Host "🧹 Cleaning release folder..." -ForegroundColor Yellow
    Remove-Item $ReleaseDir -Recurse -Force
}

# Additional clean if requested (for backwards compatibility)
if ($Clean) {
    Write-Host "🧹 Additional cleanup requested..." -ForegroundColor Yellow
}

# Create output directories
Write-Host "📁 Creating output directories..." -ForegroundColor Blue
$Directories = @(
    $ReleaseDir,
    (Join-Path $ReleaseDir "css"),
    (Join-Path $ReleaseDir "js"),
    (Join-Path $ReleaseDir "js\modules"),
    $TempDir
)

foreach ($Dir in $Directories) {
    if (!(Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        if ($Verbose) { Write-Host "  Created: $Dir" -ForegroundColor Gray }
    }
}

# Function to minify HTML (remove ALL comments first, then minify)
function Minify-Html {
    param([string]$Content)
    
    # STEP 1: Remove HTML comments FIRST (except IE conditionals)
    $Content = $Content -replace '<!--(?!\[if).*?-->', ''
    
    # STEP 2: Remove JavaScript comments within script tags
    $Content = [regex]::Replace($Content, '(<script[^>]*>)(.*?)(</script>)', {
        param($match)
        $openTag = $match.Groups[1].Value
        $scriptContent = $match.Groups[2].Value
        $closeTag = $match.Groups[3].Value
        
        # Remove JavaScript single-line comments from script content
        $cleanScript = $scriptContent -replace '//.*?(?=\r?\n|$)', ''
        # Remove JavaScript multi-line comments from script content
        $cleanScript = $cleanScript -replace '/\*.*?\*/', ''
        
        return $openTag + $cleanScript + $closeTag
    }, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # STEP 3: Now safely minify without ANY comment interference
    # Remove extra whitespace between tags
    $Content = $Content -replace '>\s+<', '><'
    
    # Remove whitespace at start and end of lines
    $Lines = $Content -split "`r?`n"
    $CleanedLines = @()
    
    foreach ($Line in $Lines) {
        $TrimmedLine = $Line.Trim()
        if ($TrimmedLine -ne '') {
            $CleanedLines += $TrimmedLine
        }
    }
    
    # Join lines with spaces to ensure JavaScript doesn't break
    $Content = $CleanedLines -join " "
    
    # Clean up multiple spaces
    $Content = $Content -replace '\s{2,}', ' '
    
    return $Content.Trim()
}

# Function to minify CSS
function Minify-Css {
    param([string]$Content)
    
    # Remove comments
    $Content = $Content -replace '/\*.*?\*/', ''
    
    # Remove extra whitespace
    $Content = $Content -replace '\s+', ' '
    
    # Remove whitespace around specific characters
    $Content = $Content -replace '\s*{\s*', '{'
    $Content = $Content -replace '\s*}\s*', '}'
    $Content = $Content -replace '\s*:\s*', ':'
    $Content = $Content -replace '\s*;\s*', ';'
    $Content = $Content -replace '\s*,\s*', ','
    
    # Remove trailing semicolons before }
    $Content = $Content -replace ';+}', '}'
    
    return $Content.Trim()
}

# Function to minify JavaScript (clean first, then minify)
function Minify-JavaScript {
    param([string]$Content)
    
    # STEP 1: Clean the file first - remove everything that's not JavaScript code
    
    # Remove single-line comments (// comments)
    $Content = $Content -replace '(?m)^\s*//.*$', ''  # Full line comments
    $Content = $Content -replace '(?<!:)//.*?(?=\r?\n|$)', ''  # End of line comments (but preserve URLs)
    
    # Remove multi-line comments (/* comments */)
    $Content = $Content -replace '/\*[\s\S]*?\*/', ''
    
    # Remove JSDoc comments (/** comments */)
    $Content = $Content -replace '/\*\*[\s\S]*?\*/', ''
    
    # STEP 2: Now minify the clean JavaScript
    
    # Remove empty lines
    $Lines = $Content -split "`r?`n"
    $CleanedLines = @()
    
    foreach ($Line in $Lines) {
        $TrimmedLine = $Line.Trim()
        if ($TrimmedLine -ne '' -and $TrimmedLine -ne '{}' -and $TrimmedLine -ne ';') {
            $CleanedLines += $TrimmedLine
        }
    }
      # Join lines back together with Windows line endings
    $Content = $CleanedLines -join "`r`n"
    
    # Safe minification - only remove obviously safe whitespace
    $Content = $Content -replace '\s*{\s*', '{'     # Remove spaces around opening braces
    $Content = $Content -replace '\s*}\s*', '}'     # Remove spaces around closing braces  
    $Content = $Content -replace '\s*;\s*', ';'     # Remove spaces around semicolons
    $Content = $Content -replace '\s*,\s*', ','     # Remove spaces around commas
    $Content = $Content -replace '\s*=\s*', '='     # Remove spaces around equals
    $Content = $Content -replace '\s*\+\s*', '+'    # Remove spaces around plus
    $Content = $Content -replace '\s*-\s*', '-'     # Remove spaces around minus (careful with --)
    $Content = $Content -replace '\s*\*\s*', '*'    # Remove spaces around multiply
    $Content = $Content -replace '\s*\/\s*', '/'    # Remove spaces around divide
    $Content = $Content -replace '\s*\(\s*', '('    # Remove spaces around opening parentheses
    $Content = $Content -replace '\s*\)\s*', ')'    # Remove spaces around closing parentheses
    $Content = $Content -replace '\s*\[\s*', '['    # Remove spaces around opening brackets
    $Content = $Content -replace '\s*\]\s*', ']'    # Remove spaces around closing brackets
    
    # Remove excessive whitespace but preserve single spaces where needed
    $Content = $Content -replace '\n{2,}', "`n"     # Multiple newlines to single
    $Content = $Content -replace '[ \t]{2,}', ' '   # Multiple spaces/tabs to single space
    
    return $Content.Trim()
}

# Function to resolve CSS imports and create concatenated CSS
function Resolve-CssImports {
    param(
        [string]$MainCssPath,
        [string]$SourceDir
    )
    
    $MainContent = Get-Content $MainCssPath -Raw
    $ResolvedContent = ""
    
    # Find all @import statements
    $ImportMatches = [regex]::Matches($MainContent, "@import\s+url\('([^']+)'\);")
    
    foreach ($Match in $ImportMatches) {
        $ImportPath = $Match.Groups[1].Value
        $FullImportPath = Join-Path $SourceDir $ImportPath
        
        if (Test-Path $FullImportPath) {
            $ImportContent = Get-Content $FullImportPath -Raw
            $ResolvedContent += "`n/* $ImportPath */`n"
            $ResolvedContent += $ImportContent
            $ResolvedContent += "`n"
        } else {
            Write-Warning "CSS import not found: $FullImportPath"
        }
    }
    
    # Add any remaining CSS content (non-import rules)
    $RemainingContent = $MainContent -replace "@import\s+url\('[^']+'\);", ""
    $ResolvedContent += $RemainingContent
    
    return $ResolvedContent
}

# Process HTML files
Write-Host "📄 Processing HTML files..." -ForegroundColor Blue
$HtmlFiles = Get-ChildItem -Path $SourceRoot -Filter "*.html" -File

foreach ($HtmlFile in $HtmlFiles) {
    Write-Host "  Minifying: $($HtmlFile.Name)" -ForegroundColor White
    
    $Content = Get-Content $HtmlFile.FullName -Raw -Encoding UTF8
    $MinifiedContent = Minify-Html $Content
    
    $OutputPath = Join-Path $ReleaseDir $HtmlFile.Name
    Set-Content -Path $OutputPath -Value $MinifiedContent -Encoding UTF8
    
    $OriginalSize = $HtmlFile.Length
    $NewSize = (Get-Item $OutputPath).Length
    $Savings = [math]::Round((1 - $NewSize / $OriginalSize) * 100, 1)
    
    if ($Verbose) {
        Write-Host "    Original: $OriginalSize bytes | Minified: $NewSize bytes | Saved: $Savings%" -ForegroundColor Gray
    }
}

# Process main CSS file (resolve imports and minify)
Write-Host "🎨 Processing CSS files..." -ForegroundColor Blue
$MainCssFile = Join-Path $SourceRoot "main.css"

if (Test-Path $MainCssFile) {
    Write-Host "  Resolving CSS imports and minifying main.css..." -ForegroundColor White
    
    $ResolvedCss = Resolve-CssImports $MainCssFile $SourceRoot
    $MinifiedCss = Minify-Css $ResolvedCss
    
    $OutputPath = Join-Path $ReleaseDir "main.css"
    Set-Content -Path $OutputPath -Value $MinifiedCss -Encoding UTF8
    
    $OriginalSize = (Get-Content $MainCssFile -Raw).Length
    $NewSize = $MinifiedCss.Length
    $Savings = [math]::Round((1 - $NewSize / $OriginalSize) * 100, 1)
    
    if ($Verbose) {
        Write-Host "    Combined and minified CSS: $NewSize bytes | Estimated savings: $Savings%" -ForegroundColor Gray
    }
}

# Process individual CSS files
$CssFiles = Get-ChildItem -Path (Join-Path $SourceRoot "css") -Filter "*.css" -File

foreach ($CssFile in $CssFiles) {
    Write-Host "  Minifying: css\$($CssFile.Name)" -ForegroundColor White
    
    $Content = Get-Content $CssFile.FullName -Raw -Encoding UTF8
    $MinifiedContent = Minify-Css $Content
    
    $OutputPath = Join-Path $ReleaseDir "css" $CssFile.Name
    Set-Content -Path $OutputPath -Value $MinifiedContent -Encoding UTF8
    
    $OriginalSize = $CssFile.Length
    $NewSize = (Get-Item $OutputPath).Length
    $Savings = [math]::Round((1 - $NewSize / $OriginalSize) * 100, 1)
    
    if ($Verbose) {
        Write-Host "    Original: $OriginalSize bytes | Minified: $NewSize bytes | Saved: $Savings%" -ForegroundColor Gray
    }
}

# Process JavaScript files
Write-Host "⚡ Processing JavaScript files..." -ForegroundColor Blue

# Main JS files
$JsFiles = Get-ChildItem -Path (Join-Path $SourceRoot "js") -Filter "*.js" -File

foreach ($JsFile in $JsFiles) {
    Write-Host "  Minifying: js\$($JsFile.Name)" -ForegroundColor White
    
    $Content = Get-Content $JsFile.FullName -Raw -Encoding UTF8
    $MinifiedContent = Minify-JavaScript $Content
    
    $OutputPath = Join-Path $ReleaseDir "js" $JsFile.Name
    Set-Content -Path $OutputPath -Value $MinifiedContent -Encoding UTF8
    
    $OriginalSize = $JsFile.Length
    $NewSize = (Get-Item $OutputPath).Length
    $Savings = [math]::Round((1 - $NewSize / $OriginalSize) * 100, 1)
    
    if ($Verbose) {
        Write-Host "    Original: $OriginalSize bytes | Minified: $NewSize bytes | Saved: $Savings%" -ForegroundColor Gray
    }
}

# JS modules
$ModulesDir = Join-Path $SourceRoot "js\modules"
if (Test-Path $ModulesDir) {
    $ModuleFiles = Get-ChildItem -Path $ModulesDir -Filter "*.js" -File
    
    foreach ($ModuleFile in $ModuleFiles) {
        Write-Host "  Minifying: js\modules\$($ModuleFile.Name)" -ForegroundColor White
        
        $Content = Get-Content $ModuleFile.FullName -Raw -Encoding UTF8
        $MinifiedContent = Minify-JavaScript $Content
        
        $OutputPath = Join-Path $ReleaseDir "js\modules" $ModuleFile.Name
        Set-Content -Path $OutputPath -Value $MinifiedContent -Encoding UTF8
        
        $OriginalSize = $ModuleFile.Length
        $NewSize = (Get-Item $OutputPath).Length
        $Savings = [math]::Round((1 - $NewSize / $OriginalSize) * 100, 1)
        
        if ($Verbose) {
            Write-Host "    Original: $OriginalSize bytes | Minified: $NewSize bytes | Saved: $Savings%" -ForegroundColor Gray
        }
    }
}

# Clean up temporary directory
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}

# Calculate total size savings
$OriginalTotalSize = 0
$NewTotalSize = 0

Get-ChildItem -Path $SourceRoot -Include "*.html", "*.css", "*.js" -File -Recurse | ForEach-Object {
    if ($_.FullName -notlike "*release*" -and $_.FullName -notlike "*temp-build*") {
        $OriginalTotalSize += $_.Length
    }
}

Get-ChildItem -Path $ReleaseDir -Include "*.html", "*.css", "*.js" -File -Recurse | ForEach-Object {
    $NewTotalSize += $_.Length
}

$TotalSavings = [math]::Round((1 - $NewTotalSize / $OriginalTotalSize) * 100, 1)

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  Original size: $([math]::Round($OriginalTotalSize / 1KB, 1)) KB" -ForegroundColor White
Write-Host "  Minified size: $([math]::Round($NewTotalSize / 1KB, 1)) KB" -ForegroundColor White
Write-Host "  Total savings: $TotalSavings%" -ForegroundColor Green
Write-Host "  Output directory: $ReleaseDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Production build ready for deployment!" -ForegroundColor Green