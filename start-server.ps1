# Simple PowerShell HTTP Server for testing
# Run this script to serve the web application locally

$port = 8080
$url = "http://localhost:$port"

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

# Check if server is already running on the port
if (Test-Port -Port $port) {
    Write-Host "Server is already running on $url" -ForegroundColor Green
    Write-Host "Using existing server..." -ForegroundColor Cyan
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process $url
    Write-Host "Browser opened. Server is ready to use." -ForegroundColor Green
    exit 0
}

Write-Host "Starting HTTP server on $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "Opening browser..." -ForegroundColor Cyan

# Start the server in background and open browser
Start-Process $url

# Simple HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")
try {
    $listener.Start()
    Write-Host "HTTP server started successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to start server on port $port. Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
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
