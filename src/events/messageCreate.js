// src/events/messageCreate.js
const { getPrefix } = require('../models/prefix');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    let command = client.prefixCommands.get(commandName);

    // If not found, check aliases
    if (!command) {
      const aliasTo = client.prefixAliases.get(commandName);
      if (aliasTo) command = client.prefixCommands.get(aliasTo);
    }

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`❌ Error executing prefix command ${commandName}:`, error);
      message.reply('❌ There was an error executing that command.');
    }
  }
};
