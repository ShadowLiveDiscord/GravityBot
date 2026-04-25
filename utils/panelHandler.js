const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// ── Embed règlement ──────────────────────────────────────────────────────────
async function postReglement(channel) {
  const embed = new EmbedBuilder()
    .setTitle('📜 | Règlement du serveur')
    .setDescription('Bienvenue sur **Gravity Voice** ! Merci de lire et respecter les règles suivantes.\nEn cliquant sur **"J\'accepte le règlement"**, tu accèdes au reste du serveur.')
    .setColor(0x5865F2)
    .addFields(
      { name: '🔒 1 | Respect absolu', value: '➡️ Le respect entre membres est obligatoire. Aucun propos haineux, insultant, raciste, sexiste ou homophobe ne sera toléré.' },
      { name: '🗣️ 2 | Language approprié', value: '➡️ Pas de spam, flood ou langage inapproprié. Restez clairs et amusants dans vos échanges.' },
      { name: '🎤 3 | Bonne utilisation du vocal', value: '➡️ Le micro doit être utilisé correctement : pas de cris, bruits parasites ou insultes. Pensez aux autres !' },
      { name: '📢 4 | Pas de pub non autorisée', value: '➡️ La publicité (Discord, réseaux sociaux, serveurs, etc.) est interdite sauf accord du staff.' },
      { name: '👮 5 | Respect du staff', value: '➡️ Les décisions des modérateurs doivent être respectées. Si un problème persiste, contactez un admin.' },
      { name: '🎮 6 | Contenu adapté', value: '➡️ Pas de contenu NSFW, gore ou illégal. Gardons une ambiance saine et fun.' },
      { name: '⚠️ 7 | Sanctions', value: '➡️ Tout non-respect de ces règles peut entraîner un mute, un kick ou un ban, selon la gravité.' },
    )
    .setFooter({ text: 'Gravity Voice • Clique sur le bouton ci-dessous pour accéder au serveur.' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_reglement')
      .setLabel('✅  J\'accepte le règlement')
      .setStyle(ButtonStyle.Success),
  );

  await channel.send({ embeds: [embed], components: [row] });
}

// ── Embed tickets ────────────────────────────────────────────────────────────
async function postTickets(channel) {
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
    .addFields({
      name: '╔══════════════════════╗',
      value:
        '🐛 **Bug Report** — Signaler un bug\n' +
        '💡 **Suggestion** — Proposer une idée\n' +
        '⚖️ **Sanction** — Contester une sanction\n' +
        '🤝 **Partenariat** — Proposer un partenariat\n' +
        '❓ **Question** — Poser une question\n' +
        '🛠️ **Autre** — Toute autre demande\n' +
        '╚══════════════════════╝',
    })
    .setFooter({ text: '⚠️ Gravity Voice • Merci de ne pas abuser du système de tickets' })
    .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('ticket_select')
    .setPlaceholder('📂 Sélectionne une catégorie...')
    .addOptions([
      { label: 'Bug Report',           description: 'Signaler un bug dans le jeu Gravity Voice', value: 'bug_report',   emoji: '🐛' },
      { label: 'Suggestion',           description: 'Proposer une idée ou amélioration',          value: 'suggestion',  emoji: '💡' },
      { label: 'Contester une sanction', description: 'Tu penses avoir été sanctionné injustement ?', value: 'sanction', emoji: '⚖️' },
      { label: 'Partenariat',          description: 'Proposer un partenariat avec Gravity Voice', value: 'partenariat', emoji: '🤝' },
      { label: 'Question générale',    description: "Poser une question à l'équipe",              value: 'question',    emoji: '❓' },
      { label: 'Autre',                description: 'Toute autre demande non listée',             value: 'autre',       emoji: '🛠️' },
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);
  await channel.send({ embeds: [embed], components: [row] });
}

// ── Embed candidatures ───────────────────────────────────────────────────────
async function postCandidatures(channel) {
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

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('candidature_moderateur').setLabel('Modérateur').setStyle(ButtonStyle.Primary).setEmoji('🛡️'),
    new ButtonBuilder().setCustomId('candidature_helper').setLabel('Helper').setStyle(ButtonStyle.Success).setEmoji('🎮'),
    new ButtonBuilder().setCustomId('candidature_graphiste').setLabel('Graphiste').setStyle(ButtonStyle.Secondary).setEmoji('🎨'),
    new ButtonBuilder().setCustomId('candidature_testeur').setLabel('Testeur').setStyle(ButtonStyle.Secondary).setEmoji('🧪'),
  );

  await channel.send({ embeds: [embed], components: [row] });
}

module.exports = { postReglement, postTickets, postCandidatures };
