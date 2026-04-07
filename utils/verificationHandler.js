const { EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

// Stockage en mémoire des tokens de vérification (en prod, utiliser une base de données)
const pendingVerifications = new Map();

async function startVerification(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const member = interaction.member;
  const guild = interaction.guild;

  // Vérifier si déjà vérifié
  if (member.roles.cache.has(process.env.VERIFIED_ROLE_ID)) {
    return interaction.editReply({ content: '✅ Tu es déjà vérifié !' });
  }

  // Générer un token unique
  const token = uuidv4();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  pendingVerifications.set(token, {
    userId: member.id,
    guildId: guild.id,
    expiresAt,
  });

  // Nettoyer les tokens expirés
  for (const [t, data] of pendingVerifications.entries()) {
    if (Date.now() > data.expiresAt) pendingVerifications.delete(t);
  }

  // Le lien pointe vers le site GitHub Pages avec le token ET l'URL de l'API en paramètre
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const verifyUrl = `${siteUrl}?token=${token}&api=${encodeURIComponent(apiUrl)}`;

  // Envoyer le lien en MP
  try {
    const dmEmbed = new EmbedBuilder()
      .setTitle('🔐 Vérification Gravity Voice')
      .setDescription(
        `Clique sur le lien ci-dessous pour te vérifier sur **${guild.name}** :\n\n` +
        `🔗 **[Cliquer ici pour se vérifier](${verifyUrl})**\n\n` +
        `> ⏳ Ce lien expire dans **10 minutes**.\n` +
        `> ⚠️ Ne partage jamais ce lien avec quelqu'un d'autre.`
      )
      .setColor(0x57F287)
      .setFooter({ text: 'Gravity Voice • Vérification anti-bot' })
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] });
    await interaction.editReply({
      content: '📩 Un lien de vérification t\'a été envoyé en message privé ! Vérifie tes MP.',
    });
  } catch {
    await interaction.editReply({
      content: `❌ Impossible de t'envoyer un MP. Active tes messages privés !\n\nOu utilise ce lien directement : ${verifyUrl}`,
    });
  }
}

function getPendingVerifications() {
  return pendingVerifications;
}

module.exports = { startVerification, getPendingVerifications };
