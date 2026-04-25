const { Events, EmbedBuilder } = require('discord.js');
const handleTicket = require('../utils/ticketHandler');
const handleVerification = require('../utils/verificationHandler');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {

    // ── Commandes slash ──────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Erreur commande ${interaction.commandName}:`, error);
        const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // ── Boutons ──────────────────────────────────────────────────────────────
    if (interaction.isButton()) {

      // Vérification
      if (interaction.customId === 'start_verification') {
        await handleVerification.startVerification(interaction, client);
        return;
      }

      // Ticket fermer
      if (interaction.customId === 'close_ticket') {
        await handleTicket.closeTicket(interaction, client);
        return;
      }

      // Boutons candidature (ouvre le formulaire web)
      const postesMap = {
        candidature_moderateur: 'moderateur',
        candidature_helper:     'helper',
        candidature_graphiste:  'graphiste',
        candidature_testeur:    'testeur',
      };
      if (postesMap[interaction.customId]) {
        const poste = postesMap[interaction.customId];
        const apiUrl  = process.env.API_URL  || 'http://localhost:3000';
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        const userId   = interaction.user.id;
        const username = encodeURIComponent(interaction.user.username);
        const formUrl  = `${siteUrl}/candidature.html?poste=${poste}&user_id=${userId}&username=${username}&api=${encodeURIComponent(apiUrl)}`;

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('📋 Formulaire de candidature')
              .setDescription(
                `Clique sur le lien ci-dessous pour remplir ta candidature :\n\n` +
                `🔗 **[Accéder au formulaire](${formUrl})**\n\n` +
                `> Le formulaire se ferme une fois ta candidature envoyée.`
              )
              .setColor(0xEB459E)
              .setFooter({ text: 'Gravity Voice • Candidatures' }),
          ],
          ephemeral: true,
        });
        return;
      }

      // Accepter/Refuser une candidature (staff uniquement)
      if (interaction.customId.startsWith('candidature_accept_') || interaction.customId.startsWith('candidature_refuse_')) {
        const staffRoleId = process.env.STAFF_ROLE_ID;
        if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
          await interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });
          return;
        }

        const accepted = interaction.customId.startsWith('candidature_accept_');
        const targetId = interaction.customId.replace('candidature_accept_', '').replace('candidature_refuse_', '');

        // Modifier l'embed original pour indiquer la décision
        const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        originalEmbed
          .setColor(accepted ? 0x57F287 : 0xED4245)
          .setFooter({ text: `${accepted ? '✅ Acceptée' : '❌ Refusée'} par ${interaction.user.tag}` });

        await interaction.message.edit({ embeds: [originalEmbed], components: [] });

        // Notifier le candidat en MP
        if (targetId && targetId !== 'unknown') {
          try {
            const targetUser = await client.users.fetch(targetId);
            const dmEmbed = new EmbedBuilder()
              .setTitle(accepted ? '✅ Candidature acceptée !' : '❌ Candidature refusée')
              .setDescription(
                accepted
                  ? `Félicitations ! Ta candidature sur **Gravity Voice** a été **acceptée** ! 🎉\nUn membre du staff te contactera très prochainement.`
                  : `Ta candidature sur **Gravity Voice** n'a malheureusement pas été retenue cette fois.\nTu pourras repostuler dans 30 jours. Courage ! 💪`
              )
              .setColor(accepted ? 0x57F287 : 0xED4245)
              .setFooter({ text: 'Gravity Voice • Candidatures' })
              .setTimestamp();
            await targetUser.send({ embeds: [dmEmbed] });
          } catch {
            // L'utilisateur a les MP désactivés
          }
        }

        await interaction.reply({
          content: `${accepted ? '✅' : '❌'} Candidature **${accepted ? 'acceptée' : 'refusée'}**. Le candidat a été notifié.`,
          ephemeral: true,
        });
        return;
      }
    }

    // ── Menus ────────────────────────────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_select') {
        await handleTicket.createTicket(interaction, client);
        return;
      }
    }
  },
};
