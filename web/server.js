const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.WEB_PORT || 3000;

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── OAuth2 Callback ────────────────────────────────────────────────────────
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  const clientId     = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri  = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;

  try {
    // 1. Échanger le code contre un access_token
    const tokenData = await exchangeCode(code, clientId, clientSecret, redirectUri);
    if (!tokenData.access_token) {
      return res.redirect('/?error=token_failed');
    }

    // 2. Récupérer les infos de l'utilisateur Discord
    const userInfo = await getDiscordUser(tokenData.access_token);
    if (!userInfo.id) {
      return res.redirect('/?error=user_failed');
    }

    // 3. Attribuer le rôle via le bot
    const clientModule = require('../clientInstance');
    const client = clientModule.getClient();
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(userInfo.id).catch(() => null);

    if (!member) {
      return res.redirect(`/?error=not_in_server&username=${encodeURIComponent(userInfo.username)}`);
    }

    if (process.env.VERIFIED_ROLE_ID) {
      await member.roles.add(process.env.VERIFIED_ROLE_ID);
    }

    // 4. Rediriger vers la page de succès
    return res.redirect(`/?success=1&username=${encodeURIComponent(userInfo.username)}&avatar=${encodeURIComponent(userInfo.avatar || '')}&id=${userInfo.id}`);

  } catch (err) {
    console.error('Erreur OAuth2 callback:', err);
    return res.redirect('/?error=internal');
  }
});

// ─── Helpers HTTP ────────────────────────────────────────────────────────────
function exchangeCode(code, clientId, clientSecret, redirectUri) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString();

    const options = {
      hostname: 'discord.com',
      path: '/api/v10/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getDiscordUser(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: '/api/v10/users/@me',
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

app.listen(PORT, () => {
  console.log(`🌐 Serveur de vérification démarré sur le port ${PORT}`);
});

module.exports = app;
