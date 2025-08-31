import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart3, Users, Clock, Trophy, Download } from 'lucide-react';

interface ReportsProps {
  group: any;
  accessToken: string;
}

export function Reports({ group, accessToken }: ReportsProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerReport, setPlayerReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlayerReport = async (playerId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4728142a/groups/${group.id}/players/${playerId}/reports`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlayerReport(data.report);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch report: ${errorData.error}`);
      }
    } catch (err) {
      setError('Network error while fetching report');
      console.error('Error fetching player report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: any) => {
    setSelectedPlayer(player);
    fetchPlayerReport(player.id);
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const generateGroupSummary = () => {
    const players = group.players || [];
    const totalGames = players.reduce((sum: number, player: any) => sum + (player.gamesPlayed || 0), 0);
    const totalPlaytime = players.reduce((sum: number, player: any) => sum + (player.totalPlaytime || 0), 0);
    const averageGames = players.length > 0 ? Math.round(totalGames / players.length) : 0;
    const averagePlaytime = players.length > 0 ? Math.round(totalPlaytime / (players.length * 1000 * 60)) : 0;

    return {
      totalPlayers: players.length,
      totalGames,
      totalPlaytime: Math.round(totalPlaytime / (1000 * 60)), // Convert to minutes
      averageGames,
      averagePlaytime
    };
  };

  const exportGroupReport = () => {
    const summary = generateGroupSummary();
    const players = group.players || [];
    
    let csvContent = "Player Name,Level,Games Played,Total Playtime (minutes),Payment Method,Payment Amount\n";
    
    players.forEach((player: any) => {
      const playtime = Math.round((player.totalPlaytime || 0) / (1000 * 60));
      csvContent += `${player.name},${player.level},${player.gamesPlayed || 0},${playtime},${player.paymentMethod},${player.paymentAmount}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${group.name}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const groupSummary = generateGroupSummary();
  const levelDistribution = (group.players || []).reduce((acc: any, player: any) => {
    acc[player.level] = (acc[player.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
          <p className="text-sm text-gray-600">View detailed statistics and player performance</p>
        </div>
        <Button
          onClick={exportGroupReport}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <Download size={16} />
          <span>Export Report</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Group Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-semibold">{groupSummary.totalPlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 p-2 rounded">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Games</p>
                <p className="text-2xl font-semibold">{groupSummary.totalGames}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Playtime</p>
                <p className="text-2xl font-semibold">{formatPlaytime(groupSummary.totalPlaytime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Games/Player</p>
                <p className="text-2xl font-semibold">{groupSummary.averageGames}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Level Distribution</CardTitle>
          <CardDescription>
            Distribution of players across different skill levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(levelDistribution).map(([level, count]) => (
              <div key={level} className="text-center">
                <Badge variant="outline" className="mb-2">
                  {level}
                </Badge>
                <p className="text-2xl font-semibold">{count as number}</p>
                <p className="text-sm text-gray-600">players</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player List */}
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
            <CardDescription>
              Click on a player to view detailed statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(group.players || []).length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No players registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(group.players || []).map((player: any) => (
                  <div
                    key={player.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlayer?.id === player.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{player.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {player.level}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {player.gamesPlayed || 0} games
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPlaytime(Math.round((player.totalPlaytime || 0) / (1000 * 60)))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
            <CardDescription>
              {selectedPlayer ? `Statistics for ${selectedPlayer.name}` : 'Select a player to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading report...</p>
              </div>
            ) : selectedPlayer && playerReport ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-semibold">{playerReport.gamesPlayed}</p>
                    <p className="text-sm text-gray-600">Games Played</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-semibold">{formatPlaytime(playerReport.totalPlaytime)}</p>
                    <p className="text-sm text-gray-600">Total Playtime</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skill Level</h4>
                  <Badge variant="outline">{playerReport.level}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Partners ({playerReport.partners.length})</h4>
                  {playerReport.partners.length > 0 ? (
                    <div className="space-y-1">
                      {playerReport.partners.map((partner: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {partner}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No partners yet</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Opponents ({playerReport.opponents.length})</h4>
                  {playerReport.opponents.length > 0 ? (
                    <div className="space-y-1">
                      {playerReport.opponents.map((opponent: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {opponent}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No opponents yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Select a player to view their detailed statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">Report Features</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Track individual player performance and statistics</li>
          <li>• View partnership and opponent history</li>
          <li>• Export group data to CSV for external analysis</li>
          <li>• Monitor skill level distribution across the group</li>
        </ul>
      </div>
    </div>
  );
}