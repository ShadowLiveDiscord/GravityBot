const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const handleTicket  = require('../utils/ticketHandler');
const panelHandler  = require('../utils/panelHandler');

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

      // ── Panel admin ──────────────────────────────────────────────────────
      if (interaction.customId.startsWith('panel_')) {
        if (!interaction.member.permissions.has('Administrator')) {
          await interaction.reply({ content: '❌ Réservé aux administrateurs.', ephemeral: true });
          return;
        }

        const action = interaction.customId.replace('panel_', '');

        // Fermer
        if (action === 'close') {
          await interaction.message.delete().catch(() => {});
          await interaction.reply({ content: '🔒 Panel fermé.', ephemeral: true });
          return;
        }

        // Actualiser les stats
        if (action === 'refresh') {
          const guild  = interaction.guild;
          const uptime = process.uptime();
          const h = Math.floor(uptime / 3600);
          const m = Math.floor((uptime % 3600) / 60);
          const s = Math.floor(uptime % 60);
          const mem = process.memoryUsage();
          const openTickets = guild.channels.cache.filter(
            c => c.name.startsWith('ticket-') && c.parentId === process.env.TICKET_CATEGORY_ID
          ).size;

          const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .spliceFields(0, 1, {
              name: '╔══ 📊 STATUT ══════════════════╗',
              value:
                `> 🟢 En ligne  •  🏓 \`${client.ws.ping}ms\`\n` +
                `> ⏱️ Uptime : \`${h}h ${m}m ${s}s\`\n` +
                `> 💾 RAM : \`${Math.round(mem.heapUsed / 1024 / 1024)} MB\`\n` +
                `> 👥 Membres : \`${guild.memberCount}\`  •  🎫 Tickets : \`${openTickets}\`\n` +
                `╚══════════════════════════════╝`,
            })
            .setFooter({ text: `Actualisé par ${interaction.user.tag}  •  ${new Date().toLocaleString('fr-FR')}` });

          await interaction.update({ embeds: [embed] });
          return;
        }

        // Infos détaillées
        if (action === 'info') {
          const guild = interaction.guild;
          const uptime = process.uptime();
          const h = Math.floor(uptime / 3600);
          const m = Math.floor((uptime % 3600) / 60);
          const s = Math.floor(uptime % 60);
          const mem = process.memoryUsage();

          const embed = new EmbedBuilder()
            .setTitle('📊 Informations — GravityBot')
            .setColor(0x5865F2)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: '🤖 Bot',       value: `\`${client.user.tag}\``,                                      inline: true },
              { name: '🆔 ID',        value: `\`${client.user.id}\``,                                       inline: true },
              { name: '📅 Créé le',   value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`,    inline: true },
              { name: '⏱️ Uptime',    value: `\`${h}h ${m}m ${s}s\``,                                      inline: true },
              { name: '🏓 Ping',      value: `\`${client.ws.ping}ms\``,                                     inline: true },
              { name: '💾 RAM',       value: `\`${Math.round(mem.heapUsed / 1024 / 1024)}MB\``,             inline: true },
              { name: '👥 Membres',   value: `\`${guild.memberCount}\``,                                    inline: true },
              { name: '💬 Salons',    value: `\`${guild.channels.cache.size}\``,                            inline: true },
              { name: '🎭 Rôles',     value: `\`${guild.roles.cache.size}\``,                               inline: true },
              { name: '📦 Node.js',   value: `\`${process.version}\``,                                      inline: true },
              { name: '📚 discord.js',value: `\`v${require('discord.js').version}\``,                       inline: true },
            )
            .setFooter({ text: 'Gravity Voice • GravityBot' })
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        // ── Gestion des tickets depuis le panel ──────────────────────────

        // Lister les tickets ouverts
        if (action === 'ticket_list') {
          const tickets = interaction.guild.channels.cache.filter(
            c => c.name.startsWith('ticket-') && c.parentId === process.env.TICKET_CATEGORY_ID
          );
          if (tickets.size === 0) {
            await interaction.reply({ content: '📂 Aucun ticket ouvert en ce moment.', ephemeral: true });
            return;
          }
          const list = tickets.map(c => `> ${c} — \`${c.name}\``).join('\n');
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`📂 Tickets ouverts (${tickets.size})`)
                .setDescription(list)
                .setColor(0x5865F2),
            ],
            ephemeral: true,
          });
          return;
        }

        // Ajouter un membre dans un ticket
        if (action === 'ticket_add') {
          const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
          const modal = new ModalBuilder()
            .setCustomId('panel_modal_ticket_add')
            .setTitle('➕ Ajouter un membre dans un ticket');
          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('ticket_channel_input')
                .setLabel('Nom ou ID du salon ticket')
                .setPlaceholder('Ex: ticket-shadow ou 123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('ticket_user_input')
                .setLabel('ID ou @mention du membre à ajouter')
                .setPlaceholder('Ex: 123456789012345678 ou @pseudo')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
          );
          await interaction.showModal(modal);
          return;
        }

        // Retirer un membre d'un ticket
        if (action === 'ticket_remove') {
          const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
          const modal = new ModalBuilder()
            .setCustomId('panel_modal_ticket_remove')
            .setTitle('➖ Retirer un membre d\'un ticket');
          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('ticket_channel_input')
                .setLabel('Nom ou ID du salon ticket')
                .setPlaceholder('Ex: ticket-shadow ou 123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('ticket_user_input')
                .setLabel('ID ou @mention du membre à retirer')
                .setPlaceholder('Ex: 123456789012345678 ou @pseudo')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
          );
          await interaction.showModal(modal);
          return;
        }

        // Fermer un ticket depuis le panel
        if (action === 'ticket_close_one') {
          const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
          const modal = new ModalBuilder()
            .setCustomId('panel_modal_ticket_close')
            .setTitle('🔒 Fermer un ticket');
          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('ticket_channel_input')
                .setLabel('Nom ou ID du salon ticket')
                .setPlaceholder('Ex: ticket-shadow ou 123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
          );
          await interaction.showModal(modal);
          return;
        }

        // Poster règlement, tickets, candidatures — demande le salon cible
        if (['reglement', 'ticket', 'candidature'].includes(action)) {
          const labels = { reglement: 'règlement', ticket: 'panneau de tickets', candidature: 'panneau de candidatures' };
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`panel_post_${action}_here`)
              .setLabel(`Dans ce salon (#${interaction.channel.name})`)
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`panel_post_${action}_cancel`)
              .setLabel('Annuler')
              .setStyle(ButtonStyle.Secondary),
          );
          await interaction.reply({
            content: `📍 Où veux-tu poster le **${labels[action]}** ?`,
            components: [row],
            ephemeral: true,
          });
          return;
        }

        return;
      }

      // ── Confirmation de post depuis le panel ─────────────────────────────
      if (interaction.customId.startsWith('panel_post_')) {
        if (!interaction.member.permissions.has('Administrator')) {
          await interaction.reply({ content: '❌ Réservé aux administrateurs.', ephemeral: true });
          return;
        }

        if (interaction.customId.endsWith('_cancel')) {
          await interaction.update({ content: '❌ Action annulée.', components: [] });
          return;
        }

        // ex: panel_post_reglement_here
        const parts = interaction.customId.replace('panel_post_', '').replace('_here', '').replace('_cancel', '');
        const action = parts; // reglement | ticket | candidature

        try {
          await interaction.deferUpdate();
          if (action === 'reglement')   await panelHandler.postReglement(interaction.channel);
          if (action === 'ticket')      await panelHandler.postTickets(interaction.channel);
          if (action === 'candidature') await panelHandler.postCandidatures(interaction.channel);

          const labels = { reglement: 'Règlement', ticket: 'Panneau de tickets', candidature: 'Panneau de candidatures' };
          await interaction.followUp({ content: `✅ **${labels[action] || action}** posté avec succès !`, ephemeral: true });
        } catch (err) {
          console.error('Erreur panel post:', err);
          await interaction.followUp({ content: `❌ Erreur : ${err.message}`, ephemeral: true });
        }
        return;
      }

      // ── Acceptation règlement → rôle membre ─────────────────────────────
      if (interaction.customId === 'accept_reglement') {
        const roleId = process.env.VERIFIED_ROLE_ID;
        if (!roleId) {
          await interaction.reply({ content: '❌ Rôle membre non configuré.', ephemeral: true });
          return;
        }
        if (interaction.member.roles.cache.has(roleId)) {
          await interaction.reply({ content: '✅ Tu as déjà accepté le règlement !', ephemeral: true });
          return;
        }
        try {
          await interaction.member.roles.add(roleId);
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription('✅ **Bienvenue sur Gravity Voice !**\nTu as accepté le règlement et accèdes maintenant à tous les salons. Amuse-toi bien 🪐')
                .setColor(0x57F287),
            ],
            ephemeral: true,
          });
        } catch (err) {
          console.error('Erreur attribution rôle:', err);
          await interaction.reply({ content: '❌ Impossible d\'attribuer le rôle. Vérifie les permissions du bot.', ephemeral: true });
        }
        return;
      }

      // ── Ticket : fermer / ajouter / retirer ─────────────────────────────
      if (interaction.customId === 'close_ticket') {
        await handleTicket.closeTicket(interaction, client);
        return;
      }
      if (interaction.customId === 'add_to_ticket') {
        await handleTicket.openAddModal(interaction);
        return;
      }
      if (interaction.customId === 'remove_from_ticket') {
        await handleTicket.openRemoveModal(interaction);
        return;
      }

      // ── Boutons candidature → lien formulaire ────────────────────────────
      const postesMap = {
        candidature_moderateur: 'moderateur',
        candidature_helper:     'helper',
        candidature_graphiste:  'graphiste',
        candidature_testeur:    'testeur',
      };
      if (postesMap[interaction.customId]) {
        const poste    = postesMap[interaction.customId];
        const apiUrl   = process.env.API_URL  || 'http://localhost:3000';
        const siteUrl  = process.env.SITE_URL || 'http://localhost:3000';
        const formUrl  = `${siteUrl}/candidature.html?poste=${poste}&user_id=${interaction.user.id}&username=${encodeURIComponent(interaction.user.username)}&api=${encodeURIComponent(apiUrl)}`;

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('📋 Formulaire de candidature')
              .setDescription(`Clique sur le lien ci-dessous pour remplir ta candidature :\n\n🔗 **[Accéder au formulaire](${formUrl})**`)
              .setColor(0xEB459E)
              .setFooter({ text: 'Gravity Voice • Candidatures' }),
          ],
          ephemeral: true,
        });
        return;
      }

      // ── Accepter / Refuser candidature (staff) ───────────────────────────
      if (interaction.customId.startsWith('candidature_accept_') || interaction.customId.startsWith('candidature_refuse_')) {
        const staffRoleId = process.env.STAFF_ROLE_ID;
        if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
          await interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });
          return;
        }
        const accepted = interaction.customId.startsWith('candidature_accept_');
        const targetId = interaction.customId.replace('candidature_accept_', '').replace('candidature_refuse_', '');

        const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(accepted ? 0x57F287 : 0xED4245)
          .setFooter({ text: `${accepted ? '✅ Acceptée' : '❌ Refusée'} par ${interaction.user.tag}` });

        await interaction.message.edit({ embeds: [originalEmbed], components: [] });

        if (targetId && targetId !== 'unknown') {
          try {
            const user = await client.users.fetch(targetId);
            await user.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(accepted ? '✅ Candidature acceptée !' : '❌ Candidature refusée')
                  .setDescription(
                    accepted
                      ? `Félicitations ! Ta candidature sur **Gravity Voice** a été **acceptée** ! 🎉\nUn membre du staff te contactera très prochainement.`
                      : `Ta candidature sur **Gravity Voice** n'a pas été retenue cette fois.\nTu pourras repostuler dans 30 jours. Courage ! 💪`
                  )
                  .setColor(accepted ? 0x57F287 : 0xED4245)
                  .setTimestamp(),
              ],
            });
          } catch { /* MP désactivés */ }
        }

        await interaction.reply({
          content: `${accepted ? '✅' : '❌'} Candidature **${accepted ? 'acceptée' : 'refusée'}**. Candidat notifié.`,
          ephemeral: true,
        });
        return;
      }
    }

    // ── Menus déroulants ─────────────────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_select') {
        await handleTicket.createTicket(interaction, client);
        return;
      }
    }

    // ── Modales ──────────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {

      // Modales depuis le ticket lui-même
      if (interaction.customId === 'modal_add_to_ticket') {
        await handleTicket.handleAddToTicket(interaction, client);
        return;
      }
      if (interaction.customId === 'modal_remove_from_ticket') {
        await handleTicket.handleRemoveFromTicket(interaction, client);
        return;
      }

      // ── Modales depuis le panel admin ────────────────────────────────────
      if (interaction.customId.startsWith('panel_modal_ticket_')) {
        const guild = interaction.guild;
        const rawChannel = interaction.fields.getTextInputValue('ticket_channel_input').trim();

        // Trouver le salon ticket (par nom ou ID)
        const channelId = rawChannel.replace(/[<#>]/g, '');
        const ticketChannel = guild.channels.cache.get(channelId) ||
          guild.channels.cache.find(c => c.name === rawChannel || c.name === `ticket-${rawChannel}`);

        if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
          await interaction.reply({ content: `❌ Salon ticket introuvable : \`${rawChannel}\`\n\nUtilise le bouton **📂 Voir les tickets** pour connaître les noms exacts.`, ephemeral: true });
          return;
        }

        // Ajouter un membre
        if (interaction.customId === 'panel_modal_ticket_add') {
          const rawUser = interaction.fields.getTextInputValue('ticket_user_input').trim();
          const userId  = rawUser.replace(/[<@!>]/g, '');
          try {
            const member = await guild.members.fetch(userId);
            await ticketChannel.permissionOverwrites.edit(member, {
              ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
            });
            await ticketChannel.send({ content: `👋 ${member} a été ajouté à ce ticket par <@${interaction.user.id}>.` });
            await interaction.reply({
              embeds: [new EmbedBuilder().setDescription(`✅ **${member.user.tag}** ajouté dans ${ticketChannel}.`).setColor(0x57F287)],
              ephemeral: true,
            });
          } catch {
            await interaction.reply({ content: `❌ Membre introuvable : \`${rawUser}\``, ephemeral: true });
          }
          return;
        }

        // Retirer un membre
        if (interaction.customId === 'panel_modal_ticket_remove') {
          const rawUser = interaction.fields.getTextInputValue('ticket_user_input').trim();
          const userId  = rawUser.replace(/[<@!>]/g, '');
          try {
            const member = await guild.members.fetch(userId);
            if (process.env.STAFF_ROLE_ID && member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
              await interaction.reply({ content: `❌ Impossible de retirer un membre du staff.`, ephemeral: true });
              return;
            }
            await ticketChannel.permissionOverwrites.delete(member);
            await ticketChannel.send({ content: `🚪 **${member.user.tag}** a été retiré de ce ticket par <@${interaction.user.id}>.` });
            await interaction.reply({
              embeds: [new EmbedBuilder().setDescription(`✅ **${member.user.tag}** retiré de ${ticketChannel}.`).setColor(0xED4245)],
              ephemeral: true,
            });
          } catch {
            await interaction.reply({ content: `❌ Membre introuvable : \`${rawUser}\``, ephemeral: true });
          }
          return;
        }

        // Fermer un ticket
        if (interaction.customId === 'panel_modal_ticket_close') {
          const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
          if (logChannel) {
            await logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle('🔒 Ticket fermé')
                  .addFields(
                    { name: 'Salon',     value: ticketChannel.name,      inline: true },
                    { name: 'Fermé par', value: interaction.user.tag,    inline: true },
                    { name: 'Depuis',    value: 'Panel admin',           inline: true },
                  )
                  .setColor(0xED4245)
                  .setTimestamp(),
              ],
            });
          }
          await interaction.reply({ content: `🔒 Fermeture de \`${ticketChannel.name}\` dans 5 secondes...`, ephemeral: true });
          setTimeout(() => ticketChannel.delete().catch(console.error), 5000);
          return;
        }
      }
    }
  },
};
