const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Panneau de gestion du bot GravityBot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${m}m ${s}s`;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Panneau de gestion — GravityBot')
      .setDescription(`Bienvenue dans le panneau de contrôle de **GravityBot**.\nUtilise les boutons ci-dessous pour gérer le serveur.`)
      .setColor(0x5865F2)
      .addFields(
        {
          name: '📊 Statut du bot',
          value:
            `> 🟢 **En ligne**\n` +
            `> ⏱️ Uptime : \`${uptimeStr}\`\n` +
            `> 👥 Membres : \`${guild.memberCount}\`\n` +
            `> 🏓 Ping : \`${client.ws.ping}ms\``,
          inline: false,
        },
        {
          name: '📋 Actions disponibles',
          value:
            '> 📜 **Poster le règlement** — Envoie l\'embed règlement + bouton\n' +
            '> 🎫 **Poster les tickets** — Envoie le panneau de tickets\n' +
            '> 📋 **Poster les candidatures** — Envoie le panneau de candidatures\n' +
            '> 🔄 **Actualiser le statut** — Met à jour les infos du panel\n' +
            '> 🔒 **Fermer le panel** — Supprime ce message',
          inline: false,
        },
      )
      .setFooter({ text: `GravityBot • Panneau admin • Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reglement')
        .setLabel('Poster le règlement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📜'),
      new ButtonBuilder()
        .setCustomId('panel_ticket')
        .setLabel('Poster les tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId('panel_candidature')
        .setLabel('Poster les candidatures')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_refresh')
        .setLabel('Actualiser')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId('panel_info')
        .setLabel('Infos du bot')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId('panel_close')
        .setLabel('Fermer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
    );

    await interaction.editReply({ embeds: [embed], components: [row1, row2] });
  },
};
