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

// ─── API Candidature ─────────────────────────────────────────────────────────
const postesLabels = {
  moderateur: '🛡️ Modérateur',
  helper:     '🎮 Helper',
  graphiste:  '🎨 Graphiste',
  testeur:    '🧪 Testeur',
};

const postesColors = {
  moderateur: 0x5865F2,
  helper:     0x57F287,
  graphiste:  0xEB459E,
  testeur:    0xFEE75C,
};

app.post('/api/candidature', async (req, res) => {
  const { poste, userId, username, age, anciennete, disponibilite, motivation, experience, specifique, sanctions, extra } = req.body;

  if (!poste || !username || !motivation) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
  }

  try {
    const clientModule = require('../clientInstance');
    const client = clientModule.getClient();

    const channelId = process.env.CANDIDATURE_CHANNEL_ID;
    if (!channelId) return res.status(500).json({ success: false, message: 'Salon de candidatures non configuré.' });

    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.status(500).json({ success: false, message: 'Salon introuvable.' });

    const ancienneteLabels = {
      moins_1_semaine: 'Moins d\'une semaine',
      '1_4_semaines': '1 à 4 semaines',
      '1_3_mois': '1 à 3 mois',
      plus_3_mois: 'Plus de 3 mois',
      plus_6_mois: 'Plus de 6 mois',
    };
    const dispoLabels = {
      '1_5h': '1 à 5h / semaine',
      '5_10h': '5 à 10h / semaine',
      '10_20h': '10 à 20h / semaine',
      plus_20h: 'Plus de 20h / semaine',
    };
    const sanctionLabels = {
      non: '✅ Aucune sanction',
      oui_ancienne: '⚠️ Oui, ancienne',
      oui_recente: '❌ Oui, récente',
    };

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const embed = new EmbedBuilder()
      .setTitle(`📋 Nouvelle candidature — ${postesLabels[poste] || poste}`)
      .setColor(postesColors[poste] || 0xEB459E)
      .addFields(
        { name: '👤 Candidat', value: userId ? `<@${userId}> (${username})` : username, inline: true },
        { name: '🎂 Âge', value: age ? `${age} ans` : 'Non précisé', inline: true },
        { name: '📅 Ancienneté', value: ancienneteLabels[anciennete] || anciennete || '—', inline: true },
        { name: '⏱️ Disponibilité', value: dispoLabels[disponibilite] || disponibilite || '—', inline: true },
        { name: '⚠️ Sanctions', value: sanctionLabels[sanctions] || sanctions || '—', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '💬 Motivation', value: motivation.substring(0, 1024) },
        { name: '🏆 Expérience', value: experience ? experience.substring(0, 1024) : '*Non renseigné*' },
        { name: '❓ Question spécifique', value: specifique ? specifique.substring(0, 1024) : '*Non renseigné*' },
      )
      .setFooter({ text: `Gravity Voice • Candidature reçue` })
      .setTimestamp();

    if (extra && extra.trim()) {
      embed.addFields({ name: '📝 Informations supplémentaires', value: extra.substring(0, 512) });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`candidature_accept_${userId || 'unknown'}`)
        .setLabel('✅ Accepter')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`candidature_refuse_${userId || 'unknown'}`)
        .setLabel('❌ Refuser')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [row] });
    return res.json({ success: true, message: 'Candidature envoyée !' });

  } catch (err) {
    console.error('Erreur candidature:', err);
    return res.status(500).json({ success: false, message: 'Erreur interne. Contacte un admin.' });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur de vérification démarré sur le port ${PORT}`);
});

module.exports = app;
