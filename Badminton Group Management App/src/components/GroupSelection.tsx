import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Users, Calendar, User } from 'lucide-react';

interface GroupSelectionProps {
  user: any;
  accessToken: string;
  onGroupSelected: (group: any) => void;
}

export function GroupSelection({ user, accessToken, onGroupSelected }: GroupSelectionProps) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch groups: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while fetching groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, description })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGroups([data.group, ...groups]);
        setIsCreateDialogOpen(false);
        // Auto-select the newly created group
        onGroupSelected(data.group);
      } else {
        const errorData = await response.json();
        setError(`Failed to create group: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while creating group');
      console.error('Error creating group:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectGroup = async (groupId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${groupId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        onGroupSelected(data.group);
      } else {
        const errorData = await response.json();
        setError(`Failed to select group: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while selecting group');
      console.error('Error selecting group:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select or Create a Group</h2>
        <p className="text-gray-600">Choose an existing group to manage or create a new one</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Available Groups</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Create New Group</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new badminton group to manage players and sessions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Weekend Warriors Badminton"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of the group"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any groups yet. Create your first group to get started.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Your First Group</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectGroup(group.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.description || 'No description'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-2" />
                    <span>{group.players?.length || 0} players registered</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                  {group.adminId === user.id && (
                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      You are the admin
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}