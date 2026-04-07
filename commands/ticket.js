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
      .setTitle('🎫 Support — Gravity Voice')
      .setDescription(
        '> Bienvenue dans le support de **Gravity Voice** !\n\n' +
        '**Comment ouvrir un ticket ?**\n' +
        '╔ Choisis une catégorie dans le menu déroulant\n' +
        '╠ Un salon privé sera créé pour toi\n' +
        '╚ Notre équipe te répondra rapidement\n\n' +
        '```\n⏱️  Temps de réponse moyen : < 24h\n```'
      )
      .setColor(0x5865F2)
      .addFields(
        {
          name: '╔══════════════════════╗',
          value:
            '🐛 **Bug Report** — Signaler un bug\n' +
            '💡 **Suggestion** — Proposer une idée\n' +
            '⚖️ **Sanction** — Contester une sanction\n' +
            '🤝 **Partenariat** — Proposer un partenariat\n' +
            '❓ **Question** — Poser une question\n' +
            '🛠️ **Autre** — Toute autre demande\n' +
            '╚══════════════════════╝',
        },
      )
      .setImage('https://i.imgur.com/gravity_banner.png')
      .setFooter({
        text: '⚠️ Gravity Voice • Merci de ne pas abuser du système de tickets',
      })
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
