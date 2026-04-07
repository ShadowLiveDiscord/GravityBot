const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ GravityBot connecté en tant que ${client.user.tag}`);
    client.user.setPresence({
      activities: [
        {
          name: '🪐 Gravity Voice | Roblox',
          type: ActivityType.Playing,
        },
      ],
      status: 'online',
    });
  },
};
