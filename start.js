const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lecture manuelle du .env (contourne dotenvx global)
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.substring(0, eqIndex).trim();
  const value = trimmed.substring(eqIndex + 1).trim();
  process.env[key] = value; // force l'écrasement
}

console.log('✅ .env chargé :', Object.keys(process.env).filter(k => ['DISCORD_TOKEN','CLIENT_ID','CLIENT_SECRET','API_URL','SITE_URL'].includes(k)).map(k => `${k}=${process.env[k]?.substring(0,15)}...`).join(' | '));

const PORT = process.env.WEB_PORT || 3000;

async function startNgrok() {
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken || authtoken === 'TON_NGROK_TOKEN_ICI') {
    console.warn('⚠️  NGROK_AUTHTOKEN non défini dans .env');
    console.warn('   1. Crée un compte gratuit sur https://ngrok.com');
    console.warn('   2. Copie ton authtoken depuis https://dashboard.ngrok.com/get-started/your-authtoken');
    console.warn('   3. Colle-le dans .env : NGROK_AUTHTOKEN=ton_token');
    console.warn('   → Démarrage en mode local (localhost:' + PORT + ')\n');
    return null;
  }

  try {
    const ngrok = require('ngrok');
    console.log('🌐 Démarrage de ngrok...');
    const url = await ngrok.connect({ addr: PORT, authtoken });

    console.log(`✅ ngrok actif : ${url}`);

    // Mettre à jour API_URL et REDIRECT_URI dans le .env automatiquement
    let envFile = fs.readFileSync(envPath, 'utf8');
    envFile = envFile.replace(/^API_URL=.*/m, `API_URL=${url}`);
    envFile = envFile.replace(/^SITE_URL=.*/m, `SITE_URL=${url}`);
    envFile = envFile.replace(/^REDIRECT_URI=.*/m, `REDIRECT_URI=${url}/callback`);
    fs.writeFileSync(envPath, envFile);
    process.env.API_URL = url;
    process.env.SITE_URL = url;
    process.env.REDIRECT_URI = `${url}/callback`;

    console.log(`\n📋 Variables mises à jour automatiquement :`);
    console.log(`   API_URL      = ${url}`);
    console.log(`   REDIRECT_URI = ${url}/callback`);
    console.log(`\n⚠️  Ajoute cette URL dans Discord Developer Portal → OAuth2 → Redirects :`);
    console.log(`   ${url}/callback\n`);

    return url;
  } catch (err) {
    console.warn('⚠️  Erreur ngrok :', err.message);
    console.warn('   Démarrage en mode local (localhost:' + PORT + ')\n');
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
