#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

console.log('🚀 Badminton Manager Setup\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
    console.log('📝 Please edit .env file with your Supabase credentials');
  } else {
    console.log('⚠️  .env.example not found, creating basic .env...');
    const basicEnv = `# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=ragbicjnfhsaosyhonzi
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Configuration
NODE_ENV=development`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created');
  }
} else {
  console.log('✅ .env file already exists');
}

// Check environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const hasProjectId = envContent.includes('VITE_SUPABASE_PROJECT_ID=');
const hasAnonKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

console.log('\n🔍 Environment Check:');
console.log(`Project ID: ${hasProjectId ? '✅' : '❌'}`);
console.log(`Anon Key: ${hasAnonKey ? '✅' : '❌'}`);

if (!hasProjectId || !hasAnonKey) {
  console.log('\n⚠️  Please configure your .env file with Supabase credentials');
  console.log('   You can find these in your Supabase dashboard under Settings > API');
} else {
  console.log('\n🎉 Setup complete! Run `npm run dev` to start the development server');
}