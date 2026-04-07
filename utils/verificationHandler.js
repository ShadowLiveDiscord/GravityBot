const { EmbedBuilder } = require('discord.js');

async function startVerification(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const member = interaction.member;

  // Vérifier si déjà vérifié
  if (process.env.VERIFIED_ROLE_ID && member.roles.cache.has(process.env.VERIFIED_ROLE_ID)) {
    return interaction.editReply({ content: '✅ Tu es déjà vérifié !' });
  }

  const clientId   = process.env.CLIENT_ID;
  const apiUrl     = process.env.API_URL || 'http://localhost:3000';
  const siteUrl    = process.env.SITE_URL || apiUrl;
  const redirectUri = `${apiUrl}/callback`;

  // Construire l'URL OAuth2 Discord
  const oauthUrl = `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=identify%20email%20guilds.join`;

  // Lien vers le site de vérification avec l'URL OAuth2 en paramètre
  const verifyPageUrl = `${siteUrl}?oauth=${encodeURIComponent(oauthUrl)}`;

  try {
    const dmEmbed = new EmbedBuilder()
      .setTitle('🔐 Vérification Gravity Voice')
      .setDescription(
        `Clique sur le bouton ci-dessous pour te vérifier sur **${interaction.guild.name}** :\n\n` +
        `🔗 **[Cliquer ici pour se vérifier](${verifyPageUrl})**\n\n` +
        `> ⚠️ Ne partage jamais ce lien avec quelqu'un d'autre.`
      )
      .setColor(0x57F287)
      .setFooter({ text: 'Gravity Voice • Vérification OAuth2 Discord' })
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] });
    await interaction.editReply({
      content: '📩 Un lien de vérification t\'a été envoyé en message privé !',
    });
  } catch {
    await interaction.editReply({
      content: `❌ Impossible de t'envoyer un MP. Active tes messages privés !\n\nOu clique directement ici : ${verifyPageUrl}`,
    });
  }
}

module.exports = { startVerification };
