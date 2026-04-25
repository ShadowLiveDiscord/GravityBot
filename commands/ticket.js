const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Envoie le panneau de création de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🎫  Support — Gravity Voice')
      .setDescription(
        '```\n' +
        '  Besoin d\'aide ? Nous sommes là pour toi.\n' +
        '```\n' +
        '> Sélectionne une catégorie dans le menu ci-dessous.\n' +
        '> Un **salon privé** sera créé instantanément.\n\n' +
        '⏱️  Temps de réponse moyen : **moins de 24h**'
      )
      .setColor(0x5865F2)
      .addFields(
        { name: '🐛  Bug Report',   value: '> Signaler un bug dans le jeu',  inline: true },
        { name: '💡  Suggestion',   value: '> Proposer une idée',             inline: true },
        { name: '⚖️  Sanction',     value: '> Contester une sanction',        inline: true },
        { name: '🤝  Partenariat',  value: '> Proposer un partenariat',       inline: true },
        { name: '❓  Question',     value: '> Poser une question',            inline: true },
        { name: '🛠️  Autre',       value: '> Toute autre demande',           inline: true },
      )
      .setFooter({ text: 'Gravity Voice  •  Ne pas abuser du système de tickets' })
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('📂 Sélectionne une catégorie...')
      .addOptions([
        {
          label: 'Bug Report',
          description: 'Signaler un bug dans le jeu Gravity Voice',
          value: 'bug_report',
          emoji: '🐛',
        },
        {
          label: 'Suggestion',
          description: 'Proposer une idée ou amélioration',
          value: 'suggestion',
          emoji: '💡',
        },
        {
          label: 'Contester une sanction',
          description: 'Tu penses avoir été sanctionné injustement ?',
          value: 'sanction',
          emoji: '⚖️',
        },
        {
          label: 'Partenariat',
          description: 'Proposer un partenariat avec Gravity Voice',
          value: 'partenariat',
          emoji: '🤝',
        },
        {
          label: 'Question générale',
          description: "Poser une question à l'équipe",
          value: 'question',
          emoji: '❓',
        },
        {
          label: 'Autre',
          description: 'Toute autre demande non listée',
          value: 'autre',
          emoji: '🛠️',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({ content: '✅ Panneau de tickets posté !' });
  },
};
