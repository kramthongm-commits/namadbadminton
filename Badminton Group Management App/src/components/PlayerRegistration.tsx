import React, { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, User, CreditCard, Clock, Trophy } from 'lucide-react';

interface PlayerRegistrationProps {
  group: any;
  accessToken: string;
  onGroupUpdate: (group: any) => void;
}

const SKILL_LEVELS = [
  { value: 'BB', label: 'BB - Beginner Basic', color: 'bg-gray-100 text-gray-800' },
  { value: 'BG', label: 'BG - Beginner Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'NB', label: 'NB - Novice Basic', color: 'bg-green-100 text-green-800' },
  { value: 'N', label: 'N - Novice', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'S', label: 'S - Skilled', color: 'bg-orange-100 text-orange-800' },
  { value: 'P', label: 'P - Professional', color: 'bg-red-100 text-red-800' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Bank Transfer' }
];

export function PlayerRegistration({ group, accessToken, onGroupUpdate }: PlayerRegistrationProps) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterPlayer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistering(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const level = formData.get('level') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const paymentAmount = parseFloat(formData.get('paymentAmount') as string);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/players`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, level, paymentMethod, paymentAmount })
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
          setIsRegisterDialogOpen(false);
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to register player: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while registering player');
      console.error('Error registering player:', err);
    } finally {
      setRegistering(false);
    }
  };

  const getLevelInfo = (levelValue: string) => {
    return SKILL_LEVELS.find(level => level.value === levelValue) || SKILL_LEVELS[0];
  };

  const formatPlaytime = (milliseconds: number) => {
    const minutes = Math.round(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Player Registration</h3>
          <p className="text-sm text-gray-600">Manage player registration with skill levels and payment tracking</p>
        </div>
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Register Player</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Player</DialogTitle>
              <DialogDescription>
                Add a new player to the group with skill level and payment information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterPlayer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Player Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter player's full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Skill Level</Label>
                <select
                  id="level"
                  name="level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                <Input
                  id="paymentAmount"
                  name="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
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
                  onClick={() => setIsRegisterDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registering}
                  className="flex-1"
                >
                  {registering ? 'Registering...' : 'Register Player'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {group.players?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Registered</h3>
            <p className="text-gray-600 mb-6">
              Start by registering the first player for this group.
            </p>
            <Button
              onClick={() => setIsRegisterDialogOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Register First Player</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {group.players.map((player: any) => {
            const levelInfo = getLevelInfo(player.level);
            return (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    {player.inActiveMatch && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Playing
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    <Badge className={levelInfo.color}>
                      {levelInfo.label}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard size={16} className="mr-2" />
                    <span className="capitalize">{player.paymentMethod}</span>
                    <span className="mx-2">•</span>
                    <span>${player.paymentAmount}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy size={16} className="mr-2" />
                    <span>{player.gamesPlayed || 0} games played</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>{formatPlaytime(player.totalPlaytime || 0)} total playtime</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Registered: {new Date(player.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}