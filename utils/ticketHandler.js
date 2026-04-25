const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const categoryLabels = {
  bug_report:  { label: '🐛 Bug Report',  color: 0xED4245, envKey: 'TICKET_CAT_BUG' },
  suggestion:  { label: '💡 Suggestion',  color: 0xFEE75C, envKey: 'TICKET_CAT_SUGGESTION' },
  sanction:    { label: '⚖️ Sanction',    color: 0xEB459E, envKey: 'TICKET_CAT_SANCTION' },
  partenariat: { label: '🤝 Partenariat', color: 0x57F287, envKey: 'TICKET_CAT_PARTENARIAT' },
  question:    { label: '❓ Question',    color: 0x5865F2, envKey: 'TICKET_CAT_QUESTION' },
  autre:       { label: '🛠️ Autre',      color: 0x99AAB5, envKey: 'TICKET_CAT_AUTRE' },
};

function getTicketButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Fermer le ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
    new ButtonBuilder()
      .setCustomId('add_to_ticket')
      .setLabel('Ajouter un membre')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➕'),
    new ButtonBuilder()
      .setCustomId('remove_from_ticket')
      .setLabel('Retirer un membre')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➖'),
  );
}

async function createTicket(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const guild  = interaction.guild;
  const member = interaction.member;
  const value  = interaction.values[0];
  const category = categoryLabels[value] || { label: '🛠️ Ticket', color: 0x5865F2 };

  // Vérifier si déjà un ticket ouvert (dans n'importe quelle catégorie ticket)
  const ticketName = `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const allTicketCatIds = [
    process.env.TICKET_CATEGORY_ID,
    process.env.TICKET_CAT_BUG,
    process.env.TICKET_CAT_SUGGESTION,
    process.env.TICKET_CAT_SANCTION,
    process.env.TICKET_CAT_PARTENARIAT,
    process.env.TICKET_CAT_QUESTION,
    process.env.TICKET_CAT_AUTRE,
  ].filter(Boolean);

  const existingChannel = guild.channels.cache.find(
    c => c.name === ticketName && allTicketCatIds.includes(c.parentId)
  );
  if (existingChannel) {
    return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${existingChannel}` });
  }

  // Choisir la catégorie selon le type de ticket
  const specificCatId = category.envKey ? process.env[category.envKey] : null;
  const isValidId = (id) => id && id !== '' && !id.startsWith('ID_CATEGORIE');
  const parentId = isValidId(specificCatId)
    ? specificCatId
    : isValidId(process.env.TICKET_CATEGORY_ID)
      ? process.env.TICKET_CATEGORY_ID
      : null;

  const ticketChannel = await guild.channels.create({
    name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: parentId,
    permissionOverwrites: [
      { id: guild.id,   deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
      {
        id: process.env.STAFF_ROLE_ID,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setTitle(category.label)
    .setDescription(
      `Bonjour ${member} ! 👋\n\n` +
      `Merci d'avoir ouvert un ticket **${category.label}**.\n\n` +
      `📝 **Décris ta demande** en détail et notre équipe te répondra dès que possible.\n\n` +
      `> Utilise les boutons ci-dessous pour gérer ce ticket.`
    )
    .setColor(category.color)
    .setFooter({ text: 'Gravity Voice • Support' })
    .setTimestamp();

  const staffRole = process.env.STAFF_ROLE_ID ? `<@&${process.env.STAFF_ROLE_ID}>` : '@Staff';
  await ticketChannel.send({
    content: `${member} | ${staffRole}`,
    embeds: [embed],
    components: [getTicketButtons()],
  });

  // Log
  const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('📂 Nouveau ticket ouvert')
          .addFields(
            { name: 'Membre',    value: `${member} (${member.user.tag})`, inline: true },
            { name: 'Catégorie', value: category.label,                   inline: true },
            { name: 'Salon',     value: `${ticketChannel}`,               inline: true },
          )
          .setColor(0x57F287)
          .setTimestamp(),
      ],
    });
  }

  await interaction.editReply({ content: `✅ Ton ticket a été créé : ${ticketChannel}` });
}

async function closeTicket(interaction, client) {
  await interaction.deferReply({ ephemeral: true });
  const channel = interaction.channel;
  const guild   = interaction.guild;

  const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔒 Ticket fermé')
          .addFields(
            { name: 'Salon',    value: channel.name,               inline: true },
            { name: 'Fermé par', value: interaction.user.tag,      inline: true },
          )
          .setColor(0xED4245)
          .setTimestamp(),
      ],
    });
  }

  await interaction.editReply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });
  setTimeout(() => channel.delete().catch(console.error), 5000);
}

// Ouvre la modale pour ajouter un membre
async function openAddModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_add_to_ticket')
    .setTitle('➕ Ajouter un membre au ticket');

  const input = new TextInputBuilder()
    .setCustomId('add_user_input')
    .setLabel('ID ou @mention du membre')
    .setPlaceholder('Ex: 123456789012345678 ou @pseudo')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

// Ouvre la modale pour retirer un membre
async function openRemoveModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_remove_from_ticket')
    .setTitle('➖ Retirer un membre du ticket');

  const input = new TextInputBuilder()
    .setCustomId('remove_user_input')
    .setLabel('ID ou @mention du membre')
    .setPlaceholder('Ex: 123456789012345678 ou @pseudo')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

// Traite la soumission du modal "ajouter"
async function handleAddToTicket(interaction, client) {
  const raw    = interaction.fields.getTextInputValue('add_user_input').trim();
  const userId = raw.replace(/[<@!>]/g, '');

  try {
    const guild  = interaction.guild;
    const member = await guild.members.fetch(userId);

    await interaction.channel.permissionOverwrites.edit(member, {
      ViewChannel:        true,
      SendMessages:       true,
      ReadMessageHistory: true,
    });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ **${member.user.tag}** a été ajouté au ticket.`)
          .setColor(0x57F287),
      ],
    });
    await interaction.channel.send({ content: `👋 ${member} a été ajouté à ce ticket.` });

  } catch {
    await interaction.reply({ content: `❌ Membre introuvable. Vérifie l'ID ou la mention.`, ephemeral: true });
  }
}

// Traite la soumission du modal "retirer"
async function handleRemoveFromTicket(interaction, client) {
  const raw    = interaction.fields.getTextInputValue('remove_user_input').trim();
  const userId = raw.replace(/[<@!>]/g, '');

  try {
    const guild  = interaction.guild;
    const member = await guild.members.fetch(userId);

    // Ne pas retirer le staff
    if (process.env.STAFF_ROLE_ID && member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
      await interaction.reply({ content: `❌ Impossible de retirer un membre du staff.`, ephemeral: true });
      return;
    }

    await interaction.channel.permissionOverwrites.delete(member);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ **${member.user.tag}** a été retiré du ticket.`)
          .setColor(0xED4245),
      ],
    });

  } catch {
    await interaction.reply({ content: `❌ Membre introuvable. Vérifie l'ID ou la mention.`, ephemeral: true });
  }
}

module.exports = {
  createTicket,
  closeTicket,
  openAddModal,
  openRemoveModal,
  handleAddToTicket,
  handleRemoveFromTicket,
};
