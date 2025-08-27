// Supabase configuration with environment variable support
// Fallback to hardcoded values for development/production compatibility

// Define fallback values
const FALLBACK_PROJECT_ID = 'ragbicjnfhsaosyhonzi';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2JpY2puZmhzYW9zeWhvbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzU3NDYsImV4cCI6MjA3MTc1MTc0Nn0.rphkRC25locYUa4yHVp8A2H2YGkSxbpoNH1q3UHuMSY';

// Getter functions that safely access environment variables
export const getProjectId = (): string => {
  try {
    return import.meta?.env?.VITE_SUPABASE_PROJECT_ID || FALLBACK_PROJECT_ID;
  } catch {
    return FALLBACK_PROJECT_ID;
  }
};

export const getPublicAnonKey = (): string => {
  try {
    return import.meta?.env?.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
  } catch {
    return FALLBACK_ANON_KEY;
  }
};

// Export constants for backward compatibility
export const projectId = getProjectId();
export const publicAnonKey = getPublicAnonKey();