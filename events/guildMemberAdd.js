const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setTitle('🪐 Bienvenue sur Gravity Voice !')
      .setDescription(
        `Hey ${member} ! 👋\n\n` +
        `Tu es le **${memberCount}ème membre** à rejoindre le serveur !\n\n` +
        `**Gravity Voice** est un jeu Roblox unique où la gravité n'a plus de limites.\n\n` +
        `📜 Lis le **#règlement** avant tout\n` +
        `✅ Rends-toi dans **#vérification** pour accéder au serveur\n` +
        `🎮 Rejoins-nous sur Roblox et vis l'expérience Gravity Voice !`
      )
      .setColor(0x5865F2)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage('https://i.imgur.com/gravity_banner.png')
      .setFooter({ text: 'Gravity Voice • Roblox Game' })
      .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [embed] });
  },
};
