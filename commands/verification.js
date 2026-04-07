const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Envoie le panneau de vérification')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🔐 | Vérification Gravity Voice')
      .setDescription(
        '**Bienvenue sur Gravity Voice !**\n\n' +
        'Pour accéder au serveur, tu dois d\'abord te vérifier.\n\n' +
        '**Comment se vérifier ?**\n' +
        '1️⃣ Clique sur le bouton **"Se vérifier"** ci-dessous\n' +
        '2️⃣ Tu recevras un lien en message privé\n' +
        '3️⃣ Complète la vérification sur le site\n' +
        '4️⃣ Tu recevras automatiquement ton accès !\n\n' +
        '> ⚠️ Assure-toi d\'avoir les MP activés pour recevoir le lien.'
      )
      .setColor(0x57F287)
      .setFooter({ text: 'Gravity Voice • Vérification anti-bot' })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start_verification')
        .setLabel('Se vérifier')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅')
    );

    await interaction.channel.send({ embeds: [embed], components: [button] });
    await interaction.editReply({ content: '✅ Panneau de vérification posté !' });
  },
};
