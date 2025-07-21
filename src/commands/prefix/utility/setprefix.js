// src/commands/prefix/utility/setprefix.js
const { PermissionsBitField } = require('discord.js');
const { setPrefix } = require('../../../models/prefix');

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You don't have permission to set the prefix.");
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply("Please provide a new prefix. Example: `!setprefix ?`");
    }

    setPrefix(message.guild.id, newPrefix);
    message.channel.send(`✅ Prefix has been set to \`${newPrefix}\``);
  }
};
