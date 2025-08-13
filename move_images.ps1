# Create destination directory if it doesn't exist
$destination = "client/src/assets/images"
if (-not (Test-Path -Path $destination)) {
    New-Item -ItemType Directory -Path $destination -Force
}

# Move all image files from client/src/assets/ to client/src/assets/images/
Get-ChildItem -Path "client/src/assets" -Include @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.svg", "*.webp") -File | 
    Where-Object { $_.DirectoryName -notlike "*images*" } |
    ForEach-Object {
        $newPath = Join-Path $destination $_.Name
        Move-Item -Path $_.FullName -Destination $newPath -Force
        Write-Host "Moved $($_.Name) to $newPath"
    }

Write-Host "All images have been moved to $destination"
