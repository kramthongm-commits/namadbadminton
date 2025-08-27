import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Shuffle, Play, Square, Clock, Users, Zap } from 'lucide-react';

interface MatchSystemProps {
  group: any;
  accessToken: string;
  onGroupUpdate: (group: any) => void;
}

export function MatchSystem({ group, accessToken, onGroupUpdate }: MatchSystemProps) {
  const [autoMatches, setAutoMatches] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [preferSameLevel, setPreferSameLevel] = useState(true);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [matchTimers, setMatchTimers] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Update active matches when group changes
    const matches = (group.courts || [])
      .filter((court: any) => court.isOccupied && court.currentMatch)
      .map((court: any) => ({
        courtName: court.name,
        matchId: court.currentMatch,
        courtId: court.id
      }));
    setActiveMatches(matches);
  }, [group]);

  useEffect(() => {
    // Timer for active matches
    const interval = setInterval(() => {
      setMatchTimers(prev => {
        const updated = { ...prev };
        activeMatches.forEach(match => {
          updated[match.matchId] = (updated[match.matchId] || 0) + 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMatches]);

  const generateAutoMatches = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/auto-match`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ preferSameLevel })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAutoMatches(data.matches || []);
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to generate matches: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while generating matches');
      console.error('Error generating matches:', err);
    } finally {
      setGenerating(false);
    }
  };

  const startMatch = async (team1: string[], team2: string[], courtId: string) => {
    const matchKey = `${team1.join(',')}-${team2.join(',')}`;
    setStarting(matchKey);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/matches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ team1, team2, courtId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Initialize timer for this match
        setMatchTimers(prev => ({ ...prev, [data.match.id]: 0 }));
        
        // Refresh group data
        refreshGroupData();
        
        // Remove this match from auto matches if it was generated
        setAutoMatches(prev => prev.filter(match => 
          !(match.team1.some((p: any) => team1.includes(p.id)) &&
            match.team2.some((p: any) => team2.includes(p.id)))
        ));
      } else {
        const errorData = await response.json();
        setError(`Failed to start match: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while starting match');
      console.error('Error starting match:', err);
    } finally {
      setStarting(null);
    }
  };

  const endMatch = async (matchId: string) => {
    setEnding(matchId);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/matches/${matchId}/end`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ groupId: group.id })
        }
      );

      if (response.ok) {
        // Remove timer for this match
        setMatchTimers(prev => {
          const updated = { ...prev };
          delete updated[matchId];
          return updated;
        });
        
        // Refresh group data
        refreshGroupData();
      } else {
        const errorData = await response.json();
        setError(`Failed to end match: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while ending match');
      console.error('Error ending match:', err);
    } finally {
      setEnding(null);
    }
  };

  const refreshGroupData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        onGroupUpdate(data.group);
      }
    } catch (err) {
      console.error('Error refreshing group data:', err);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = group.players?.find((p: any) => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const getPlayerLevel = (playerId: string) => {
    const player = group.players?.find((p: any) => p.id === playerId);
    return player ? player.level : 'N';
  };

  const availableCourts = group.courts?.filter((court: any) => !court.isOccupied) || [];
  const availablePlayers = group.players?.filter((player: any) => !player.inActiveMatch) || [];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Match System</h3>
          <p className="text-sm text-gray-600">Auto-generate matches or create them manually</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="auto" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">Auto Match</TabsTrigger>
          <TabsTrigger value="active">Active Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap size={20} />
                <span>Automatic Match Generation</span>
              </CardTitle>
              <CardDescription>
                Generate optimal 2v2 matches based on skill levels and game history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="prefer-same-level"
                  checked={preferSameLevel}
                  onCheckedChange={setPreferSameLevel}
                />
                <Label htmlFor="prefer-same-level">Prefer same skill level matching</Label>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={generateAutoMatches}
                  disabled={generating || availablePlayers.length < 4}
                  className="flex items-center space-x-2"
                >
                  {generating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Shuffle size={16} />
                  )}
                  <span>{generating ? 'Generating...' : 'Generate Matches'}</span>
                </Button>
                
                <div className="text-sm text-gray-600 flex items-center">
                  <Users size={16} className="mr-1" />
                  {availablePlayers.length} players available
                </div>
              </div>

              {availablePlayers.length < 4 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                  Need at least 4 available players to generate matches
                </div>
              )}
            </CardContent>
          </Card>

          {autoMatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Matches</CardTitle>
                <CardDescription>
                  Preview matches before starting them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {autoMatches.map((match: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Match {index + 1}</h4>
                        <Badge variant="secondary">Score: {Math.round(match.score)}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-blue-600">Team 1</h5>
                          {match.team1.map((player: any) => (
                            <div key={player.id} className="flex items-center space-x-2">
                              <span>{player.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {player.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-red-600">Team 2</h5>
                          {match.team2.map((player: any) => (
                            <div key={player.id} className="flex items-center space-x-2">
                              <span>{player.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {player.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {availableCourts.length > 0 ? (
                        <div className="flex space-x-2">
                          {availableCourts.map((court: any) => (
                            <Button
                              key={court.id}
                              size="sm"
                              onClick={() => startMatch(
                                match.team1.map((p: any) => p.id),
                                match.team2.map((p: any) => p.id),
                                court.id
                              )}
                              disabled={starting === `${match.team1.map((p: any) => p.id).join(',')}-${match.team2.map((p: any) => p.id).join(',')}`}
                              className="flex items-center space-x-1"
                            >
                              <Play size={14} />
                              <span>Start on {court.name}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No courts available to start this match
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock size={20} />
                <span>Active Matches</span>
              </CardTitle>
              <CardDescription>
                Monitor and end active matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeMatches.length === 0 ? (
                <div className="text-center py-8">
                  <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Matches</h3>
                  <p className="text-gray-600">All courts are currently available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMatches.map((match) => (
                    <div key={match.matchId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {match.courtName}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span className="font-mono text-lg">
                              {formatTimer(matchTimers[match.matchId] || 0)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => endMatch(match.matchId)}
                          disabled={ending === match.matchId}
                          className="flex items-center space-x-1"
                        >
                          {ending === match.matchId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Square size={14} />
                          )}
                          <span>End Match</span>
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Match ID: {match.matchId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Match Generation Algorithm</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Prioritizes players with fewer games played</li>
          <li>• Balances skill levels when "prefer same level" is enabled</li>
          <li>• Ensures no player is in multiple active matches</li>
          <li>• Generates optimal team combinations based on history</li>
        </ul>
      </div>
    </div>
  );
}