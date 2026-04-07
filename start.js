const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lecture manuelle du .env
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  process.env[trimmed.substring(0, eqIndex).trim()] = trimmed.substring(eqIndex + 1).trim();
}

const PORT = process.env.WEB_PORT || 3000;

async function startNgrok() {
  try {
    const ngrok = require('ngrok');
    console.log('🌐 Démarrage de ngrok...');
    const url = await ngrok.connect({
      addr: PORT,
      onStatusChange: status => {
        if (status === 'closed') console.log('⚠️  ngrok déconnecté');
      },
    });
    console.log(`✅ ngrok actif : ${url}`);
    console.log(`🔗 URL de vérification : ${url}/verify`);

    // Mettre à jour API_URL dans le .env
    let envFile = fs.readFileSync(envPath, 'utf8');
    envFile = envFile.replace(/^API_URL=.*/m, `API_URL=${url}`);
    fs.writeFileSync(envPath, envFile);
    process.env.API_URL = url;

    console.log(`\n📋 Mets à jour SITE_URL dans .env si besoin :`);
    console.log(`   SITE_URL=https://shadowlivediscord.github.io/GravityBot`);
    console.log(`   API_URL=${url}  ← mis à jour automatiquement\n`);

    return url;
  } catch (err) {
    console.warn('⚠️  ngrok non disponible, utilisation de localhost');
    console.warn('   Pour exposer publiquement : npm install -g ngrok && ngrok http ' + PORT);
    return null;
  }
}

async function main() {
  await startNgrok();

  console.log('🤖 Démarrage du bot Discord...\n');
  const bot = spawn('node', ['index.js'], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname,
  });

  bot.on('exit', code => {
    console.log(`Bot arrêté (code ${code})`);
    process.exit(code);
  });
}

main().catch(console.error);
