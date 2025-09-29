#!/usr/bin/env node

/**
 * Mobile Build Script for TEBSA Ruta 22
 * Builds the project for mobile platforms (Android & iOS)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting TEBSA Ruta 22 mobile build process...\n');

// Check if platforms are added
const hasAndroid = fs.existsSync('android');
const hasIOS = fs.existsSync('ios');

console.log('📱 Platform status:');
console.log(`   Android: ${hasAndroid ? '✅ Added' : '❌ Not added'}`);
console.log(`   iOS: ${hasIOS ? '✅ Added' : '❌ Not added'}\n`);

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Step 2: Build web project
  console.log('📦 Building web project for production...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 3: Sync with Capacitor
  console.log('🔄 Syncing with Capacitor platforms...');
  execSync('npx cap sync', { stdio: 'inherit' });

  // Step 4: Generate app icons and splash screens (if capacitor-assets is available)
  try {
    console.log('🎨 Generating app icons and splash screens...');
    execSync('npx capacitor-assets generate', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  capacitor-assets not found. Install with: npm install -g @capacitor/assets');
  }

  console.log('\n✅ Mobile build completed successfully!');
  console.log('\n📱 Next steps:');
  
  if (hasAndroid) {
    console.log('   Android: npx cap run android --prod');
  } else {
    console.log('   Add Android: npx cap add android');
  }
  
  if (hasIOS) {
    console.log('   iOS: npx cap run ios --prod');
  } else {
    console.log('   Add iOS: npx cap add ios');
  }

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}