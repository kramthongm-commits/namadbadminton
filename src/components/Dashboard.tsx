import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PlayerRegistration } from './PlayerRegistration';
import { CourtManagement } from './CourtManagement';
import { MatchSystem } from './MatchSystem';
import { Reports } from './Reports';
import { AdminPanel } from './AdminPanel';
import { Users, MapPin, Trophy, BarChart3, Settings } from 'lucide-react';

interface DashboardProps {
  group: any;
  user: any;
  accessToken: string;
  onGroupUpdate: (group: any) => void;
}

export function Dashboard({ group, user, accessToken, onGroupUpdate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('players');
  const [groupData, setGroupData] = useState(group);

  useEffect(() => {
    setGroupData(group);
  }, [group]);

  const handleGroupUpdate = (updatedGroup: any) => {
    setGroupData(updatedGroup);
    onGroupUpdate(updatedGroup);
  };

  const isAdmin = user.role === 'admin' || groupData.adminId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Players</p>
                <p className="text-2xl font-semibold">{groupData.players?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 p-2 rounded">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Courts</p>
                <p className="text-2xl font-semibold">{groupData.courts?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Matches</p>
                <p className="text-2xl font-semibold">
                  {groupData.courts?.filter((court: any) => court.isOccupied).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Games</p>
                <p className="text-2xl font-semibold">
                  {groupData.players?.reduce((total: number, player: any) => total + (player.gamesPlayed || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="players" className="flex items-center space-x-2">
            <Users size={16} />
            <span>Players</span>
          </TabsTrigger>
          <TabsTrigger value="courts" className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>Courts</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center space-x-2">
            <Trophy size={16} />
            <span>Matches</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Reports</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <PlayerRegistration
            group={groupData}
            accessToken={accessToken}
            onGroupUpdate={handleGroupUpdate}
          />
        </TabsContent>

        <TabsContent value="courts" className="space-y-6">
          <CourtManagement
            group={groupData}
            accessToken={accessToken}
            onGroupUpdate={handleGroupUpdate}
          />
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <MatchSystem
            group={groupData}
            accessToken={accessToken}
            onGroupUpdate={handleGroupUpdate}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Reports
            group={groupData}
            accessToken={accessToken}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <AdminPanel
              accessToken={accessToken}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}