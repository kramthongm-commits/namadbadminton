import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Helper function to verify user authentication
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Sign up route
app.post('/make-server-4728142a/signup', async (c) => {
  try {
    const { email, password, name, role = 'player' } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { id: data.user.id, email, name, role } 
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get('/make-server-4728142a/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Error getting profile:', error);
    return c.json({ error: 'Internal server error getting profile' }, 500);
  }
});

// Create group
app.post('/make-server-4728142a/groups', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, description } = await c.req.json();
    const groupId = `group:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const group = {
      id: groupId,
      name,
      description,
      adminId: user.id,
      createdAt: new Date().toISOString(),
      courts: [],
      players: []
    };

    await kv.set(groupId, group);
    
    return c.json({ group });
  } catch (error) {
    console.log('Error creating group:', error);
    return c.json({ error: 'Internal server error creating group' }, 500);
  }
});

// Get groups
app.get('/make-server-4728142a/groups', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groups = await kv.getByPrefix('group:');
    return c.json({ groups });
  } catch (error) {
    console.log('Error getting groups:', error);
    return c.json({ error: 'Internal server error getting groups' }, 500);
  }
});

// Register player for group
app.post('/make-server-4728142a/groups/:groupId/players', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const { name, level, paymentMethod, paymentAmount } = await c.req.json();
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const playerId = `player:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const player = {
      id: playerId,
      userId: user.id,
      name,
      level, // BB, BG, NB, N, S, P
      paymentMethod, // cash, transfer
      paymentAmount,
      registeredAt: new Date().toISOString(),
      gamesPlayed: 0,
      totalPlaytime: 0,
      partners: [],
      opponents: []
    };

    group.players.push(player);
    await kv.set(groupId, group);
    
    return c.json({ player });
  } catch (error) {
    console.log('Error registering player:', error);
    return c.json({ error: 'Internal server error registering player' }, 500);
  }
});

// Add court
app.post('/make-server-4728142a/groups/:groupId/courts', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const { name } = await c.req.json();
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const courtId = `court:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const court = {
      id: courtId,
      name,
      isOccupied: false,
      currentMatch: null
    };

    group.courts.push(court);
    await kv.set(groupId, group);
    
    return c.json({ court });
  } catch (error) {
    console.log('Error adding court:', error);
    return c.json({ error: 'Internal server error adding court' }, 500);
  }
});

// Remove court
app.delete('/make-server-4728142a/groups/:groupId/courts/:courtId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const courtId = c.req.param('courtId');
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    group.courts = group.courts.filter((court: any) => court.id !== courtId);
    await kv.set(groupId, group);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error removing court:', error);
    return c.json({ error: 'Internal server error removing court' }, 500);
  }
});

// Auto-match algorithm
function autoMatch(players: any[], preferSameLevel = true) {
  const availablePlayers = players.filter(p => !p.inActiveMatch);
  
  if (availablePlayers.length < 4) {
    return { error: 'Not enough players for a match' };
  }

  // Sort by games played (least played first)
  availablePlayers.sort((a, b) => a.gamesPlayed - b.gamesPlayed);

  const levelPriority = { 'P': 6, 'S': 5, 'N': 4, 'NB': 3, 'BG': 2, 'BB': 1 };
  
  const matches = [];
  const usedPlayers = new Set();

  for (let i = 0; i < availablePlayers.length - 3; i++) {
    if (usedPlayers.has(availablePlayers[i].id)) continue;
    
    const player1 = availablePlayers[i];
    let bestMatch = null;
    let bestScore = -1;

    for (let j = i + 1; j < availablePlayers.length - 2; j++) {
      if (usedPlayers.has(availablePlayers[j].id)) continue;
      
      for (let k = j + 1; k < availablePlayers.length - 1; k++) {
        if (usedPlayers.has(availablePlayers[k].id)) continue;
        
        for (let l = k + 1; l < availablePlayers.length; l++) {
          if (usedPlayers.has(availablePlayers[l].id)) continue;
          
          const players = [player1, availablePlayers[j], availablePlayers[k], availablePlayers[l]];
          const score = calculateMatchScore(players, preferSameLevel, levelPriority);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = players;
          }
        }
      }
    }

    if (bestMatch) {
      const team1 = [bestMatch[0], bestMatch[1]];
      const team2 = [bestMatch[2], bestMatch[3]];
      
      matches.push({
        id: `match:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
        team1,
        team2,
        score: bestScore
      });

      bestMatch.forEach(player => usedPlayers.add(player.id));
      
      if (matches.length >= Math.floor(availablePlayers.length / 4)) break;
    }
  }

  return { matches };
}

function calculateMatchScore(players: any[], preferSameLevel: boolean, levelPriority: any) {
  let score = 0;
  
  // Prefer players with fewer games
  const avgGames = players.reduce((sum, p) => sum + p.gamesPlayed, 0) / 4;
  score += (50 - avgGames) * 2;

  if (preferSameLevel) {
    // Check level compatibility
    const levels = players.map(p => levelPriority[p.level] || 0);
    const levelSpread = Math.max(...levels) - Math.min(...levels);
    score += (6 - levelSpread) * 10;
  }

  return score;
}

// Generate auto matches
app.post('/make-server-4728142a/groups/:groupId/auto-match', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const { preferSameLevel = true } = await c.req.json();
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const result = autoMatch(group.players, preferSameLevel);
    
    return c.json(result);
  } catch (error) {
    console.log('Error generating auto matches:', error);
    return c.json({ error: 'Internal server error generating matches' }, 500);
  }
});

// Start match
app.post('/make-server-4728142a/groups/:groupId/matches', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const { team1, team2, courtId } = await c.req.json();
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const matchId = `match:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const match = {
      id: matchId,
      team1,
      team2,
      courtId,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active'
    };

    // Mark court as occupied
    const court = group.courts.find((c: any) => c.id === courtId);
    if (court) {
      court.isOccupied = true;
      court.currentMatch = matchId;
    }

    // Mark players as in active match
    [...team1, ...team2].forEach((playerId: string) => {
      const player = group.players.find((p: any) => p.id === playerId);
      if (player) {
        player.inActiveMatch = true;
      }
    });

    await kv.set(groupId, group);
    await kv.set(matchId, match);
    
    return c.json({ match });
  } catch (error) {
    console.log('Error starting match:', error);
    return c.json({ error: 'Internal server error starting match' }, 500);
  }
});

// End match
app.put('/make-server-4728142a/matches/:matchId/end', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const matchId = c.req.param('matchId');
    const { groupId } = await c.req.json();
    
    const match = await kv.get(matchId);
    const group = await kv.get(groupId);
    
    if (!match || !group) {
      return c.json({ error: 'Match or group not found' }, 404);
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(match.startTime);
    const duration = new Date(endTime).getTime() - startTime.getTime();

    match.endTime = endTime;
    match.status = 'completed';

    // Update player statistics
    [...match.team1, ...match.team2].forEach((playerId: string) => {
      const player = group.players.find((p: any) => p.id === playerId);
      if (player) {
        player.gamesPlayed += 1;
        player.totalPlaytime += duration;
        player.inActiveMatch = false;
        
        // Update partners and opponents
        const teammates = match.team1.includes(playerId) ? match.team1 : match.team2;
        const opponents = match.team1.includes(playerId) ? match.team2 : match.team1;
        
        teammates.forEach((teammateId: string) => {
          if (teammateId !== playerId && !player.partners.includes(teammateId)) {
            player.partners.push(teammateId);
          }
        });
        
        opponents.forEach((opponentId: string) => {
          if (!player.opponents.includes(opponentId)) {
            player.opponents.push(opponentId);
          }
        });
      }
    });

    // Free up the court
    const court = group.courts.find((c: any) => c.id === match.courtId);
    if (court) {
      court.isOccupied = false;
      court.currentMatch = null;
    }

    await kv.set(matchId, match);
    await kv.set(groupId, group);
    
    return c.json({ match });
  } catch (error) {
    console.log('Error ending match:', error);
    return c.json({ error: 'Internal server error ending match' }, 500);
  }
});

// Get group details
app.get('/make-server-4728142a/groups/:groupId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const group = await kv.get(groupId);
    
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    return c.json({ group });
  } catch (error) {
    console.log('Error getting group details:', error);
    return c.json({ error: 'Internal server error getting group' }, 500);
  }
});

// Get player reports
app.get('/make-server-4728142a/groups/:groupId/players/:playerId/reports', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = c.req.param('groupId');
    const playerId = c.req.param('playerId');
    
    const group = await kv.get(groupId);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const player = group.players.find((p: any) => p.id === playerId);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    // Get partner and opponent names
    const partnerNames = player.partners.map((partnerId: string) => {
      const partner = group.players.find((p: any) => p.id === partnerId);
      return partner ? partner.name : 'Unknown';
    });

    const opponentNames = player.opponents.map((opponentId: string) => {
      const opponent = group.players.find((p: any) => p.id === opponentId);
      return opponent ? opponent.name : 'Unknown';
    });

    const report = {
      playerName: player.name,
      gamesPlayed: player.gamesPlayed,
      totalPlaytime: Math.round(player.totalPlaytime / (1000 * 60)), // in minutes
      partners: partnerNames,
      opponents: opponentNames,
      level: player.level
    };

    return c.json({ report });
  } catch (error) {
    console.log('Error getting player reports:', error);
    return c.json({ error: 'Internal server error getting reports' }, 500);
  }
});

// Admin: Get all users
app.get('/make-server-4728142a/admin/users', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.log('Error getting users for admin:', error);
    return c.json({ error: 'Internal server error getting users' }, 500);
  }
});

Deno.serve(app.fetch)