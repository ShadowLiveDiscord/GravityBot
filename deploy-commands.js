const path = require('path');
const fs = require('fs');

// Lecture manuelle du .env AVANT tout import discord.js
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.substring(0, eqIndex).trim();
  const value = trimmed.substring(eqIndex + 1).trim();
  // Forcer l'écrasement même si dotenvx a déjà défini la variable
  process.env[key] = value;
}

// Vérification que les variables sont bien chargées
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

console.log('🔍 Vérification des variables :');
console.log('  TOKEN    :', token ? token.substring(0, 20) + '...' : '❌ MANQUANT');
console.log('  CLIENT_ID:', clientId || '❌ MANQUANT');
console.log('  GUILD_ID :', guildId || '❌ MANQUANT');

if (!token || token === 'TON_TOKEN_ICI') {
  console.error('❌ DISCORD_TOKEN non défini dans .env !');
  process.exit(1);
}
if (!clientId || clientId === 'TON_CLIENT_ID_ICI') {
  console.error('❌ CLIENT_ID non défini dans .env !');
  process.exit(1);
}
if (!guildId || guildId === 'TON_GUILD_ID_ICI') {
  console.error('❌ GUILD_ID non défini dans .env !');
  process.exit(1);
}

const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`\n🚀 Déploiement de ${commands.length} commande(s)...`);
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('✅ Commandes déployées avec succès !');
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    console.error('URL utilisée :', error.url);
  }
})();
