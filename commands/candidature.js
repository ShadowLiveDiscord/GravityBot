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
    .setName('candidature')
    .setDescription('Envoie le panneau de candidature staff')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('📋 Candidatures — Gravity Voice')
      .setDescription(
        '> Tu souhaites rejoindre l\'équipe de **Gravity Voice** ?\n\n' +
        '**Postes disponibles :**\n' +
        '╔ 🛡️ **Modérateur** — Gérer le serveur Discord\n' +
        '╠ 🎮 **Helper** — Aider les membres\n' +
        '╠ 🎨 **Graphiste** — Créer des visuels pour le jeu\n' +
        '╚ 🧪 **Testeur** — Tester les nouvelles mises à jour\n\n' +
        '**Conditions requises :**\n' +
        '```\n✅  Être actif sur le serveur\n✅  Avoir au moins 13 ans\n✅  Être vérifié sur le serveur\n✅  Pas de sanctions récentes\n```\n' +
        'Clique sur le bouton correspondant au poste souhaité pour accéder au formulaire.'
      )
      .setColor(0xEB459E)
      .setFooter({ text: 'Gravity Voice • Les candidatures sont examinées sous 7 jours' })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('candidature_moderateur')
        .setLabel('Modérateur')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛡️'),
      new ButtonBuilder()
        .setCustomId('candidature_helper')
        .setLabel('Helper')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎮'),
      new ButtonBuilder()
        .setCustomId('candidature_graphiste')
        .setLabel('Graphiste')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('candidature_testeur')
        .setLabel('Testeur')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🧪'),
    );

    await interaction.channel.send({ embeds: [embed], components: [row1] });
    await interaction.editReply({ content: '✅ Panneau de candidatures posté !' });
  },
};
