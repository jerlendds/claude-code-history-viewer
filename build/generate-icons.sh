#!/bin/bash

# This script converts the SVG icon to PNG format for electron-builder
# Requires: librsvg (install with: brew install librsvg)

echo "Converting SVG to PNG (1024x1024)..."

# Check if rsvg-convert is installed
if ! command -v rsvg-convert &> /dev/null; then
    echo "Error: rsvg-convert not found"
    echo "Please install it with: brew install librsvg"
    exit 1
fi

# Convert SVG to PNG
rsvg-convert -w 1024 -h 1024 build/icon.svg -o build/icon.png

echo "Icon generated successfully at build/icon.png"
echo ""
echo "For macOS, electron-builder will automatically generate .icns from the PNG"
echo "For Windows, it will generate .ico"
echo "For Linux, it will use the PNG directly"
