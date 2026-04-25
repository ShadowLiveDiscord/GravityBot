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
    .setName('reglement')
    .setDescription('Affiche le règlement du serveur Gravity Voice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('📜 | Règlement du serveur')
      .setDescription('Bienvenue sur **Gravity Voice** ! Merci de lire et respecter les règles suivantes.\nEn cliquant sur **"J\'accepte le règlement"**, tu accèdes au reste du serveur.')
      .setColor(0x5865F2)
      .addFields(
        {
          name: '🔒 1 | Respect absolu',
          value: '➡️ Le respect entre membres est obligatoire. Aucun propos haineux, insultant, raciste, sexiste ou homophobe ne sera toléré.',
        },
        {
          name: '🗣️ 2 | Language approprié',
          value: '➡️ Pas de spam, flood ou langage inapproprié. Restez clairs et amusants dans vos échanges.',
        },
        {
          name: '🎤 3 | Bonne utilisation du vocal',
          value: '➡️ Le micro doit être utilisé correctement : pas de cris, bruits parasites ou insultes. Pensez aux autres !',
        },
        {
          name: '📢 4 | Pas de pub non autorisée',
          value: '➡️ La publicité (Discord, réseaux sociaux, serveurs, etc.) est interdite sauf accord du staff.',
        },
        {
          name: '👮 5 | Respect du staff',
          value: '➡️ Les décisions des modérateurs doivent être respectées. Si un problème persiste, contactez un admin.',
        },
        {
          name: '🎮 6 | Contenu adapté',
          value: '➡️ Pas de contenu NSFW, gore ou illégal. Gardons une ambiance saine et fun.',
        },
        {
          name: '⚠️ 7 | Sanctions',
          value: '➡️ Tout non-respect de ces règles peut entraîner un mute, un kick ou un ban, selon la gravité.',
        }
      )
      .setFooter({ text: 'Gravity Voice • Clique sur le bouton ci-dessous pour accéder au serveur.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_reglement')
        .setLabel('✅  J\'accepte le règlement')
        .setStyle(ButtonStyle.Success),
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({ content: '✅ Le règlement a été posté avec succès !' });
  },
};
