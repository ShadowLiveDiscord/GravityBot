const { Events } = require('discord.js');
const handleTicket = require('../utils/ticketHandler');
const handleVerification = require('../utils/verificationHandler');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Commandes slash
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

    // Bouton de vérification
    if (interaction.isButton()) {
      if (interaction.customId === 'start_verification') {
        await handleVerification.startVerification(interaction, client);
        return;
      }
      if (interaction.customId === 'close_ticket') {
        await handleTicket.closeTicket(interaction, client);
        return;
      }
    }

    // Menu de sélection de ticket
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_select') {
        await handleTicket.createTicket(interaction, client);
        return;
      }
    }
  },
};
