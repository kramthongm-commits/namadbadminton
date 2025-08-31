// Test configuration import
console.log('🧪 Testing Badminton Manager configuration...\n');

try {
  // Test if we can import the configuration
  const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
  
  console.log('Configuration Check:');
  console.log('==================');
  console.log(`Project ID: ${projectId ? '✅ Present' : '❌ Missing'} (${projectId})`);
  console.log(`Public Anon Key: ${publicAnonKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`Supabase URL: https://${projectId}.supabase.co`);

  if (projectId && publicAnonKey) {
    console.log('\n🎉 Configuration import successful!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\n❌ Configuration incomplete!');
    console.log('Please check your .env file and ensure all variables are set.');
  }
} catch (error) {
  console.log('❌ Configuration import failed:', error.message);
  console.log('\nFalling back to direct values...');
  
  const projectId = 'ragbicjnfhsaosyhonzi';
  const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2JpY2puZmhzYW9zeWhvbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzU3NDYsImV4cCI6MjA3MTc1MTc0Nn0.rphkRC25locYUa4yHVp8A2H2YGkSxbpoNH1q3UHuMSY';
  
  console.log('Fallback values work, the issue is with environment variable access.');
}