# 🪐 GravityBot — Bot Discord pour Gravity Voice (Roblox)

Bot Discord complet pour le serveur **Gravity Voice**, un jeu Roblox.

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📜 `/reglement` | Poste l'embed du règlement du serveur |
| 🎫 `/ticket` | Poste le panneau de tickets à choix multiple |
| 🔐 `/verification` | Poste le panneau de vérification anti-bot |
| 👋 Message d'arrivée | Message de bienvenue automatique pour les nouveaux membres |
| 🌐 Site de vérification | Site web pour valider les membres via un token unique |

---

## 🚀 Installation

### 1. Prérequis
- [Node.js](https://nodejs.org) v18 ou supérieur
- Un bot Discord créé sur le [Portail Développeur](https://discord.com/developers/applications)

### 2. Cloner / télécharger le projet
```bash
cd "Gravity Bot"
npm install
```

### 3. Configurer le fichier `.env`
Renomme `.env` et remplis toutes les valeurs :

```env
DISCORD_TOKEN=ton_token_bot
CLIENT_ID=id_application_discord
GUILD_ID=id_serveur_discord
REGLEMENT_CHANNEL_ID=id_salon_reglement
WELCOME_CHANNEL_ID=id_salon_bienvenue
TICKET_CATEGORY_ID=id_categorie_tickets
TICKET_LOG_CHANNEL_ID=id_salon_logs
STAFF_ROLE_ID=id_role_staff
VERIFIED_ROLE_ID=id_role_verifie
WEB_PORT=3000
WEB_URL=http://localhost:3000
SECRET_KEY=cle_secrete_longue
```

### 4. Déployer les commandes slash
```bash
npm run deploy
```

### 5. Démarrer le bot
```bash
npm start
```

---

## 📁 Structure du projet

```
Gravity Bot/
├── index.js                  # Point d'entrée principal
├── deploy-commands.js        # Script de déploiement des commandes
├── clientInstance.js         # Partage l'instance du client Discord
├── .env                      # Variables d'environnement (à configurer)
├── commands/
│   ├── reglement.js          # Commande /reglement
│   ├── ticket.js             # Commande /ticket
│   └── verification.js       # Commande /verification
├── events/
│   ├── ready.js              # Événement de connexion
│   ├── guildMemberAdd.js     # Message de bienvenue
│   └── interactionCreate.js  # Gestion des interactions
├── utils/
│   ├── ticketHandler.js      # Logique de création/fermeture de tickets
│   └── verificationHandler.js# Logique de vérification
└── web/
    ├── server.js             # Serveur Express (vérification)
    └── public/
        └── verify.html       # Page web de vérification
```

---

## ⚙️ Permissions Discord requises

Le bot a besoin des permissions suivantes :
- `Manage Channels` (créer les salons de tickets)
- `Manage Roles` (attribuer le rôle vérifié)
- `Send Messages`
- `Read Message History`
- `View Channels`

**Intents à activer sur le portail développeur :**
- ✅ Server Members Intent
- ✅ Message Content Intent

---

## 🌐 Site de vérification

Le serveur web tourne sur le port défini dans `.env` (par défaut `3000`).

Pour le rendre accessible publiquement, utilise :
- [ngrok](https://ngrok.com) pour les tests : `ngrok http 3000`
- Un VPS avec un domaine pour la production

---

## 📝 Commandes disponibles

| Commande | Permission requise | Description |
|---|---|---|
| `/reglement` | Manage Server | Poste l'embed règlement dans le salon actuel |
| `/ticket` | Manage Server | Poste le panneau de tickets |
| `/verification` | Manage Server | Poste le panneau de vérification |
