#!/usr/bin/env node

/**
 * Simple SVG to PNG converter using canvas
 * This is a fallback if rsvg-convert is not available
 */

const fs = require('fs');
const https = require('https');

console.log('\n🎨 Icon Conversion Helper\n');
console.log('The SVG icon has been created at: build/icon.svg');
console.log('\nTo convert it to PNG, you have several options:\n');

console.log('1. ONLINE (Easiest):');
console.log('   → Visit: https://cloudconvert.com/svg-to-png');
console.log('   → Upload: build/icon.svg');
console.log('   → Set size: 1024x1024');
console.log('   → Save as: build/icon.png\n');

console.log('2. MACOS PREVIEW:');
console.log('   → Open build/icon.svg in Preview');
console.log('   → File → Export → PNG (1024x1024)');
console.log('   → Save as: build/icon.png\n');

console.log('3. COMMAND LINE:');
console.log('   → brew install librsvg');
console.log('   → ./build/generate-icons.sh\n');

console.log('4. AI GENERATED (Custom):');
console.log('   → Use DALL-E or Midjourney');
console.log('   → See build/ICON_SETUP.md for the prompt\n');

console.log('Once you have build/icon.png, run:');
console.log('   → npm run build:mac\n');

// Check if icon.png already exists
if (fs.existsSync('build/icon.png')) {
  const stats = fs.statSync('build/icon.png');
  console.log('✅ build/icon.png already exists!');
  console.log(`   Size: ${Math.round(stats.size / 1024)}KB`);
  console.log('   You can proceed with building the app.\n');
} else {
  console.log('⚠️  build/icon.png not found yet.');
  console.log('   Please convert build/icon.svg using one of the methods above.\n');
}
