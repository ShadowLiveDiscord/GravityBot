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

    // Compter les tickets ouverts
    const openTickets = guild.channels.cache.filter(
      c => c.name.startsWith('ticket-') && c.parentId === process.env.TICKET_CATEGORY_ID
    ).size;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Panneau de gestion — GravityBot')
      .setDescription('Bienvenue dans le panneau de contrôle de **GravityBot**.\nUtilise les boutons ci-dessous pour gérer le serveur.')
      .setColor(0x5865F2)
      .addFields(
        {
          name: '📊 Statut du bot',
          value:
            `> 🟢 **En ligne**\n` +
            `> ⏱️ Uptime : \`${h}h ${m}m ${s}s\`\n` +
            `> 👥 Membres : \`${guild.memberCount}\`\n` +
            `> 🏓 Ping : \`${client.ws.ping}ms\``,
        },
        {
          name: '🎫 Tickets',
          value:
            `> 📂 Tickets ouverts : \`${openTickets}\`\n` +
            `> ➕ **Ajouter un membre** — Ajouter quelqu'un dans un ticket\n` +
            `> ➖ **Retirer un membre** — Retirer quelqu'un d'un ticket\n` +
            `> 🔒 **Fermer un ticket** — Fermer un ticket depuis le panel`,
        },
        {
          name: '📋 Panneaux',
          value:
            '> 📜 **Règlement** — Poster l\'embed règlement\n' +
            '> 🎫 **Tickets** — Poster le panneau de tickets\n' +
            '> 📋 **Candidatures** — Poster le panneau de candidatures',
        },
      )
      .setFooter({ text: `GravityBot • Panneau admin • ${interaction.user.tag}` })
      .setTimestamp();

    // Ligne 1 : Gestion des tickets
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_ticket_add')
        .setLabel('Ajouter dans un ticket')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_remove')
        .setLabel('Retirer d\'un ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('➖'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_close_one')
        .setLabel('Fermer un ticket')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_list')
        .setLabel('Voir les tickets')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📂'),
    );

    // Ligne 2 : Poster les panneaux
    const row2 = new ActionRowBuilder().addComponents(
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

    // Ligne 3 : Utilitaires
    const row3 = new ActionRowBuilder().addComponents(
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
        .setLabel('Fermer le panel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✖️'),
    );

    await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });
  },
};
