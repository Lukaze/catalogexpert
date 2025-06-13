# Microsoft Teams App Catalog Explorer - Development Server
# This script builds the production version and serves it locally
#
# Usage:
#   .\start-server.ps1                    # Build and serve (default)
#   .\start-server.ps1 -Clean             # Clean build and serve
#   .\start-server.ps1 -NoBuild           # Skip build, serve existing docs
#   .\start-server.ps1 -Port 3000         # Use custom port
#   .\start-server.ps1 -Clean -Port 3000  # Clean build with custom port

param(
    [switch]$NoBuild = $false,
    [switch]$Clean = $false,
    [int]$Port = 8080
)

$url = "http://localhost:$Port"
$DocsDir = Join-Path $PSScriptRoot "docs"

# Function to check if port is already in use
function Test-Port {
    param($Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Run build process first (unless skipped)
if (-not $NoBuild) {
    Write-Host "🔨 Building production version..." -ForegroundColor Blue
    
    $BuildScript = Join-Path $PSScriptRoot "build-production.ps1"
    
    if (Test-Path $BuildScript) {
        $BuildArgs = @()
        if ($Clean) { $BuildArgs += "-Clean" }
        
        try {
            & $BuildScript @BuildArgs
            Write-Host "✅ Build completed successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Aborting server start..." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Build script not found: $BuildScript" -ForegroundColor Red
        Write-Host "Aborting server start..." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
} else {
    Write-Host "⚡ Skipping build process..." -ForegroundColor Yellow
}

# Verify docs directory exists
if (-not (Test-Path $DocsDir)) {
    Write-Host "❌ Docs directory not found: $DocsDir" -ForegroundColor Red
    Write-Host "Please run the build process first or remove the -NoBuild flag." -ForegroundColor Red
    exit 1
}

# Check if server is already running on the port
if (Test-Port -Port $Port) {
    Write-Host "🌐 Server is already running on $url" -ForegroundColor Green
    Write-Host "Using existing server..." -ForegroundColor Cyan
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process $url
    Write-Host "Browser opened. Server is ready to use." -ForegroundColor Green
    exit 0
}

Write-Host "🚀 Starting production server on $url" -ForegroundColor Green
Write-Host "📁 Serving from: $DocsDir" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "Opening browser..." -ForegroundColor Cyan

# Start the server in background and open browser
Start-Process $url

# Simple HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")
try {
    $listener.Start()
    Write-Host "✅ Production server started successfully!" -ForegroundColor Green
    Write-Host "🌍 Access your application at: $url" -ForegroundColor Green
}
catch {
    Write-Host "Failed to start server on port $Port. Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
          $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
          # Serve files from the docs directory
        $filePath = Join-Path $DocsDir $path.TrimStart('/')
        
        if (Test-Path $filePath) {
            try {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $response.ContentType = switch ([System.IO.Path]::GetExtension($filePath)) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    default { "text/plain; charset=utf-8" }
                }
                
                if ($content -ne $null) {
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                    $response.ContentLength64 = $buffer.Length
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                } else {
                    $response.StatusCode = 500
                    $errorContent = "Error reading file: $path"
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
                    $response.ContentLength64 = $buffer.Length
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                }
            }
            catch {
                $response.StatusCode = 500
                $errorContent = "Error processing file: $path - $($_.Exception.Message)"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        } else {
            $response.StatusCode = 404
            $errorContent = "File not found: $path"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.OutputStream.Close()
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $($request.Url.LocalPath) - $($response.StatusCode)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Server error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    if ($listener) {
        $listener.Close()
    }
    Write-Host "Server stopped." -ForegroundColor Red
}
