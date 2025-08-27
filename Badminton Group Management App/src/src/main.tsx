import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../styles/globals.css'

// Debug environment variables in development
try {
  if (import.meta?.env?.DEV) {
    console.log('Environment variables loaded:', {
      VITE_SUPABASE_PROJECT_ID: import.meta?.env?.VITE_SUPABASE_PROJECT_ID || 'using fallback',
      VITE_SUPABASE_ANON_KEY: import.meta?.env?.VITE_SUPABASE_ANON_KEY ? '✓ loaded' : 'using fallback',
      import_meta_env_available: !!import.meta?.env
    });
  }
} catch (error) {
  console.log('Environment check failed:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)