// iopn-backend/discord-auth.mjs
// Separate Discord OAuth module - won't affect your existing code

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Discord OAuth configuration from environment
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1412968580584312903';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'DZeXfwdzr25QEiEy0wGAmuvhArm2vJux';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/discord/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';

// Store active sessions (in production, use Redis or a database)
const activeSessions = new Map();

// Generate JWT token with expiry
function generateToken(userData) {
  return jwt.sign(
    {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      email: userData.email,
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to check Discord authentication
export function authenticateDiscord(req, res, next) {
  const token = req.cookies?.['discord_token'] || req.headers['x-discord-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Discord authentication required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    res.clearCookie('discord_token');
    return res.status(401).json({ error: 'Discord token expired or invalid' });
  }
  
  req.discordUser = decoded;
  next();
}

// Setup Discord OAuth routes
export function setupDiscordAuth(app) {
  console.log('🎮 Setting up Discord OAuth...');

  // Initiate Discord OAuth flow
  app.get('/auth/discord', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification (expires in 10 minutes)
    activeSessions.set(state, {
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000 // 10 minutes
    });
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email guilds',
      state: state
    });
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params}`;
    console.log('📤 Redirecting to Discord OAuth...');
    res.redirect(discordAuthUrl);
  });

  // Discord OAuth callback
  app.get('/auth/discord/callback', async (req, res) => {
    const { code, state, error } = req.query;
    
    // Handle errors
    if (error) {
      console.error('❌ Discord OAuth error:', error);
      return res.redirect(`${FRONTEND_URL}?discord=error`);
    }
    
    // Verify state
    const stateData = activeSessions.get(state);
    if (!stateData || stateData.expiresAt < Date.now()) {
      activeSessions.delete(state);
      console.error('❌ Invalid or expired state');
      return res.redirect(`${FRONTEND_URL}?discord=invalid_state`);
    }
    activeSessions.delete(state);
    
    try {
      console.log('🔄 Exchanging code for access token...');
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: DISCORD_REDIRECT_URI
        })
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('❌ Token exchange failed:', error);
        return res.redirect(`${FRONTEND_URL}?discord=token_error`);
      }
      
      const tokenData = await tokenResponse.json();
      const { access_token, refresh_token } = tokenData;
      
      console.log('👤 Fetching user information...');
      
      // Fetch user information
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      if (!userResponse.ok) {
        console.error('❌ Failed to fetch user data');
        return res.redirect(`${FRONTEND_URL}?discord=user_error`);
      }
      
      const discordUser = await userResponse.json();
      console.log(`✅ Got Discord user: ${discordUser.username}#${discordUser.discriminator}`);
      
      // Fetch user's guilds (servers)
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      let userGuilds = [];
      if (guildsResponse.ok) {
        userGuilds = await guildsResponse.json();
        console.log(`📋 User is in ${userGuilds.length} servers`);
      }
      
      // Create session data
      const sessionId = Math.random().toString(36).substring(7);
      const sessionData = {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email,
        verified: discordUser.verified,
        banner: discordUser.banner,
        accent_color: discordUser.accent_color,
        premium_type: discordUser.premium_type,
        public_flags: discordUser.public_flags,
        guilds: userGuilds.map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          owner: g.owner,
          permissions: g.permissions
        })),
        access_token: access_token, // Store encrypted in production
        refresh_token: refresh_token, // Store encrypted in production
        connected_at: new Date().toISOString()
      };
      
      // Generate JWT token
      const jwtToken = generateToken(sessionData);
      
      // Store session
      activeSessions.set(sessionId, {
        ...sessionData,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      // Set cookies
      res.cookie('discord_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.cookie('discord_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      console.log('✅ Discord authentication successful!');
      
      // Redirect with success
      res.redirect(`${FRONTEND_URL}?discord=success&token=${jwtToken}`);
      
    } catch (error) {
      console.error('❌ Discord OAuth error:', error);
      res.redirect(`${FRONTEND_URL}?discord=error`);
    }
  });

  // Get current Discord user
  app.get('/auth/discord/user', authenticateDiscord, (req, res) => {
    const sessionId = req.cookies?.['discord_session'];
    const session = activeSessions.get(sessionId);
    
    if (!session || session.expiresAt < Date.now()) {
      res.clearCookie('discord_token');
      res.clearCookie('discord_session');
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Don't send tokens to frontend
    const { access_token, refresh_token, ...userData } = session;
    
    res.json({
      user: userData,
      expiresAt: session.expiresAt
    });
  });

  // Refresh Discord token
  app.post('/auth/discord/refresh', async (req, res) => {
    const sessionId = req.cookies?.['discord_session'];
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'No session found' });
    }
    
    try {
      console.log('🔄 Refreshing Discord token...');
      
      // Use refresh token to get new access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: session.refresh_token
        })
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const tokenData = await tokenResponse.json();
      
      // Update session
      session.access_token = tokenData.access_token;
      session.refresh_token = tokenData.refresh_token || session.refresh_token;
      session.expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
      
      // Generate new JWT
      const jwtToken = generateToken(session);
      
      res.cookie('discord_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      console.log('✅ Token refreshed successfully');
      
      res.json({ 
        success: true,
        expiresAt: session.expiresAt 
      });
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      res.status(401).json({ error: 'Failed to refresh token' });
    }
  });

  // Logout Discord
  app.post('/auth/discord/logout', (req, res) => {
    const sessionId = req.cookies?.['discord_session'];
    
    if (sessionId) {
      const session = activeSessions.get(sessionId);
      if (session) {
        console.log(`👋 User ${session.username} logged out`);
      }
      activeSessions.delete(sessionId);
    }
    
    res.clearCookie('discord_token');
    res.clearCookie('discord_session');
    
    res.json({ success: true });
  });

  // Check Discord session status
  app.get('/auth/discord/status', (req, res) => {
    const token = req.cookies?.['discord_token'];
    const sessionId = req.cookies?.['discord_session'];
    
    if (!token || !sessionId) {
      return res.json({ 
        authenticated: false,
        message: 'No Discord session' 
      });
    }
    
    const decoded = verifyToken(token);
    const session = activeSessions.get(sessionId);
    
    if (!decoded || !session) {
      res.clearCookie('discord_token');
      res.clearCookie('discord_session');
      return res.json({ 
        authenticated: false,
        message: 'Invalid or expired session' 
      });
    }
    
    const timeRemaining = session.expiresAt - Date.now();
    const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    
    res.json({
      authenticated: true,
      username: decoded.username,
      expiresIn: timeRemaining,
      daysRemaining: daysRemaining,
      shouldRefresh: daysRemaining <= 1 // Suggest refresh if 1 day or less remaining
    });
  });

  // Clean up expired sessions periodically
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.expiresAt < now) {
        activeSessions.delete(sessionId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired Discord sessions`);
    }
  }, 60 * 60 * 1000); // Every hour

  console.log('✅ Discord OAuth routes configured');
  console.log(`📎 Redirect URI: ${DISCORD_REDIRECT_URI}`);
}

export default { setupDiscordAuth, authenticateDiscord };