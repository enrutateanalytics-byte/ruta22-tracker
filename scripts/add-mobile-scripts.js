#!/usr/bin/env node

/**
 * Script to add mobile build commands to package.json
 * Run this once to set up mobile development scripts
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add mobile-specific scripts
const mobileScripts = {
  "build:mobile": "node scripts/build-mobile.js",
  "sync:android": "npx cap sync android",
  "sync:ios": "npx cap sync ios", 
  "open:android": "npx cap open android",
  "open:ios": "npx cap open ios",
  "run:android": "npx cap run android",
  "run:ios": "npx cap run ios",
  "run:android:prod": "npm run build && npx cap sync android && npx cap run android --prod",
  "run:ios:prod": "npm run build && npx cap sync ios && npx cap run ios --prod",
  "assets:generate": "npx capacitor-assets generate",
  "mobile:clean": "rm -rf android ios dist node_modules && npm install"
};

// Merge scripts
packageJson.scripts = {
  ...packageJson.scripts,
  ...mobileScripts
};

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Mobile scripts added to package.json successfully!');
console.log('\nAvailable commands:');
Object.keys(mobileScripts).forEach(script => {
  console.log(`   npm run ${script}`);
});