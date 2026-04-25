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

    const guild  = interaction.guild;
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const openTickets = guild.channels.cache.filter(
      c => c.name.startsWith('ticket-') && c.parentId === process.env.TICKET_CATEGORY_ID
    ).size;

    const mem = process.memoryUsage();

    const embed = new EmbedBuilder()
      .setTitle('<:gravity:0> ⚙️  GravityBot — Panneau Admin')
      .setDescription(
        `> Connecté en tant que **${client.user.tag}**\n` +
        `> Serveur : **${guild.name}**`
      )
      .setColor(0x5865F2)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '╔══ 📊 STATUT ══════════════════╗',
          value:
            `> 🟢 En ligne  •  🏓 \`${client.ws.ping}ms\`\n` +
            `> ⏱️ Uptime : \`${h}h ${m}m ${s}s\`\n` +
            `> 💾 RAM : \`${Math.round(mem.heapUsed / 1024 / 1024)} MB\`\n` +
            `> 👥 Membres : \`${guild.memberCount}\`  •  🎫 Tickets : \`${openTickets}\`\n` +
            `╚══════════════════════════════╝`,
        },
        {
          name: '╔══ 📢 PANNEAUX ════════════════╗',
          value:
            `> 📜 Poster le règlement dans un salon\n` +
            `> 🎫 Poster le panneau de tickets\n` +
            `> 📋 Poster le panneau de candidatures\n` +
            `╚══════════════════════════════╝`,
        },
        {
          name: '╔══ 🎫 GESTION DES TICKETS ════╗',
          value:
            `> 📂 Lister tous les tickets ouverts\n` +
            `> ➕ Ajouter un membre dans un ticket\n` +
            `> ➖ Retirer un membre d'un ticket\n` +
            `> 🔒 Fermer un ticket à distance\n` +
            `╚══════════════════════════════╝`,
        },
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}  •  ${new Date().toLocaleString('fr-FR')}` });

    // ── Ligne 1 : Panneaux ─────────────────────────────────────────────────
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reglement')
        .setLabel('Règlement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📜'),
      new ButtonBuilder()
        .setCustomId('panel_ticket')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId('panel_candidature')
        .setLabel('Candidatures')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
    );

    // ── Ligne 2 : Gestion tickets ──────────────────────────────────────────
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_ticket_list')
        .setLabel('Voir tickets')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📂'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_add')
        .setLabel('Ajouter')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_remove')
        .setLabel('Retirer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('➖'),
      new ButtonBuilder()
        .setCustomId('panel_ticket_close_one')
        .setLabel('Fermer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
    );

    // ── Ligne 3 : Utilitaires ──────────────────────────────────────────────
    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_refresh')
        .setLabel('Actualiser')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId('panel_info')
        .setLabel('Infos bot')
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
