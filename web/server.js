const express = require('express');
const path = require('path');
const { getPendingVerifications } = require('../utils/verificationHandler');

const app = express();
const PORT = process.env.WEB_PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route principale de vérification
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

// API : valider un token de vérification
app.post('/api/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token manquant.' });
  }

  const pending = getPendingVerifications();
  const data = pending.get(token);

  if (!data) {
    return res.status(404).json({ success: false, message: 'Token invalide ou expiré.' });
  }

  if (Date.now() > data.expiresAt) {
    pending.delete(token);
    return res.status(410).json({ success: false, message: 'Ce lien a expiré. Recommence la vérification.' });
  }

  // Récupérer le client Discord (importé dynamiquement pour éviter les dépendances circulaires)
  try {
    const { Client } = require('discord.js');
    // Le client est accessible via le module principal
    const clientModule = require('../clientInstance');
    const client = clientModule.getClient();

    const guild = await client.guilds.fetch(data.guildId);
    const member = await guild.members.fetch(data.userId);

    if (process.env.VERIFIED_ROLE_ID) {
      await member.roles.add(process.env.VERIFIED_ROLE_ID);
    }

    pending.delete(token);

    return res.json({ success: true, message: 'Vérification réussie ! Tu peux retourner sur Discord.' });
  } catch (error) {
    console.error('Erreur vérification:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne. Contacte un admin.' });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur de vérification démarré sur le port ${PORT}`);
});

module.exports = app;
