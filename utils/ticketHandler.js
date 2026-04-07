const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const categoryLabels = {
  bug_report: { label: '🐛 Bug Report', color: 0xED4245 },
  suggestion: { label: '💡 Suggestion', color: 0xFEE75C },
  sanction: { label: '⚖️ Sanction', color: 0xEB459E },
  partenariat: { label: '🤝 Partenariat', color: 0x57F287 },
  question: { label: '❓ Question', color: 0x5865F2 },
  autre: { label: '🛠️ Autre', color: 0x99AAB5 },
};

async function createTicket(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const member = interaction.member;
  const value = interaction.values[0];
  const category = categoryLabels[value] || { label: '🛠️ Ticket', color: 0x5865F2 };

  // Vérifier si le membre a déjà un ticket ouvert
  const existingChannel = guild.channels.cache.find(
    c => c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && c.parentId === process.env.TICKET_CATEGORY_ID
  );

  if (existingChannel) {
    return interaction.editReply({
      content: `❌ Tu as déjà un ticket ouvert : ${existingChannel}`,
    });
  }

  // Créer le salon de ticket
  const ticketChannel = await guild.channels.create({
    name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: process.env.TICKET_CATEGORY_ID || null,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: process.env.STAFF_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setTitle(`${category.label}`)
    .setDescription(
      `Bonjour ${member} ! 👋\n\n` +
      `Merci d'avoir ouvert un ticket **${category.label}**.\n\n` +
      `📝 **Décris ta demande** en détail et notre équipe te répondra dès que possible.\n\n` +
      `> Pour fermer ce ticket, clique sur le bouton ci-dessous.`
    )
    .setColor(category.color)
    .setFooter({ text: 'Gravity Voice • Support' })
    .setTimestamp();

  const closeButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Fermer le ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  const staffRole = process.env.STAFF_ROLE_ID ? `<@&${process.env.STAFF_ROLE_ID}>` : '@Staff';
  await ticketChannel.send({
    content: `${member} | ${staffRole}`,
    embeds: [embed],
    components: [closeButton],
  });

  // Log dans le salon de logs
  const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setTitle('📂 Nouveau ticket ouvert')
      .addFields(
        { name: 'Membre', value: `${member} (${member.user.tag})`, inline: true },
        { name: 'Catégorie', value: category.label, inline: true },
        { name: 'Salon', value: `${ticketChannel}`, inline: true },
      )
      .setColor(0x57F287)
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] });
  }

  await interaction.editReply({
    content: `✅ Ton ticket a été créé : ${ticketChannel}`,
  });
}

async function closeTicket(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const guild = interaction.guild;

  // Log de fermeture
  const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setTitle('🔒 Ticket fermé')
      .addFields(
        { name: 'Salon', value: channel.name, inline: true },
        { name: 'Fermé par', value: `${interaction.user.tag}`, inline: true },
      )
      .setColor(0xED4245)
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] });
  }

  await interaction.editReply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });
  setTimeout(() => channel.delete().catch(console.error), 5000);
}

module.exports = { createTicket, closeTicket };
