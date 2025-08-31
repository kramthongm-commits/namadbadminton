import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { AuthScreen } from './components/AuthScreen';
import { GroupSelection } from './components/GroupSelection';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import { LogOut, User, AlertCircle } from 'lucide-react';

// Debug configuration in development
try {
  if (import.meta?.env?.DEV) {
    console.log('Supabase Configuration:', {
      projectId: projectId || 'missing',
      publicAnonKey: publicAnonKey ? '✓ loaded' : 'missing',
      supabaseUrl: `https://${projectId}.supabase.co`,
      import_meta_env_available: !!import.meta?.env
    });
  }
} catch (error) {
  console.log('Debug configuration failed:', error);
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if Supabase is properly configured
  if (!projectId || !publicAnonKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Supabase configuration is missing. Please check your environment variables.
          </p>
          <div className="text-left text-sm bg-gray-50 p-3 rounded">
            <div>Project ID: {projectId || '❌ Missing'}</div>
            <div>Anon Key: {publicAnonKey ? '✅ Present' : '❌ Missing'}</div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.access_token);
      } else {
        setUser(null);
        setSelectedGroup(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.profile);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <AuthScreen />;
  }

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <User size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Badminton Manager</h1>
                  <p className="text-sm text-gray-500">Welcome, {user.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </header>
        
        <GroupSelection 
          user={user} 
          accessToken={session.access_token}
          onGroupSelected={setSelectedGroup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedGroup.name}</h1>
                <p className="text-sm text-gray-500">Group Admin: {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setSelectedGroup(null)}
              >
                Change Group
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <Dashboard 
        group={selectedGroup}
        user={user}
        accessToken={session.access_token}
        onGroupUpdate={setSelectedGroup}
      />
    </div>
  );
}