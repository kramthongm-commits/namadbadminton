import React, { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, MapPin, Trash2, Activity } from 'lucide-react';

interface CourtManagementProps {
  group: any;
  accessToken: string;
  onGroupUpdate: (group: any) => void;
}

export function CourtManagement({ group, accessToken, onGroupUpdate }: CourtManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAddCourt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdding(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/courts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        }
      );

      if (response.ok) {
        // Fetch updated group data
        const groupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          onGroupUpdate(groupData.group);
          setIsAddDialogOpen(false);
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to add court: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while adding court');
      console.error('Error adding court:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCourt = async (courtId: string) => {
    setRemoving(courtId);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/courts/${courtId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Fetch updated group data
        const groupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          onGroupUpdate(groupData.group);
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to remove court: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while removing court');
      console.error('Error removing court:', err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Court Management</h3>
          <p className="text-sm text-gray-600">Add and remove badminton courts for your group</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Add Court</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Court</DialogTitle>
              <DialogDescription>
                Add a new badminton court to your group
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Court Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Court 1, Main Court, East Court"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="flex-1"
                >
                  {adding ? 'Adding...' : 'Add Court'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {group.courts?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courts Available</h3>
            <p className="text-gray-600 mb-6">
              Add your first court to start organizing matches.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add First Court</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {group.courts.map((court: any) => (
            <Card key={court.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${court.isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{court.name}</CardTitle>
                      <CardDescription>
                        <Badge 
                          variant={court.isOccupied ? "destructive" : "secondary"}
                          className={court.isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                        >
                          {court.isOccupied ? 'Occupied' : 'Available'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCourt(court.id)}
                    disabled={removing === court.id || court.isOccupied}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removing === court.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {court.isOccupied && court.currentMatch ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Activity size={16} className="mr-2" />
                      <span>Match in progress</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Match ID: {court.currentMatch}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    Ready for matches
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Court Management Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Courts cannot be removed while occupied by an active match</li>
          <li>• Give courts descriptive names to help players identify them</li>
          <li>• Available courts will automatically be shown when creating matches</li>
        </ul>
      </div>
    </div>
  );
}