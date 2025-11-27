# Icon Setup Instructions

I've created an SVG icon at `build/icon.svg` and configured the build to use it.

## Quick Setup (Choose One Method)

### Method 1: Online Conversion (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `build/icon.svg`
3. Set output size to 1024x1024 pixels
4. Download and save as `build/icon.png`

### Method 2: Using Preview (macOS)
1. Open `build/icon.svg` in Preview
2. File → Export
3. Format: PNG
4. Resolution: 1024x1024
5. Save as `build/icon.png`

### Method 3: Using Command Line (If you have librsvg)
```bash
brew install librsvg
./build/generate-icons.sh
```

### Method 4: Use AI to Generate a Custom Icon
Use this prompt with DALL-E or Midjourney:
```
A modern app icon for a developer tool called "Claude Code History".
Features a minimalist design with a chat bubble combined with code brackets.
Use a gradient from orange/coral (#FF6B35) to purple/violet (#7B2CBF).
Clean, professional look suitable for macOS.
Square format, 1024x1024px, rounded corners.
```

## What the Icon Looks Like

The SVG icon I created features:
- Gradient background (orange to purple)
- Chat bubble with code brackets `</>` inside
- Small clock icon indicating "history"
- Modern, clean design suitable for a developer tool

## After Creating the PNG

Once you have `build/icon.png`, electron-builder will automatically:
- Convert to `.icns` for macOS
- Convert to `.ico` for Windows
- Use the PNG directly for Linux

The build configuration is already updated in `package.json` to use the icon.

## Testing the Icon

Build the app to see the icon in action:
```bash
npm run build:mac
```

The app icon will appear in the DMG and on the installed app.
