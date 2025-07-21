// src/commands/prefix/utility/resetPrefix.js
const { PermissionsBitField } = require('discord.js');
const { resetPrefix } = require('../../../models/prefix');

module.exports = {
  name: 'resetprefix',
  description: 'Reset the prefix to default (!)',
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You don't have permission to reset the prefix.");
    }

    resetPrefix(message.guild.id);
    message.channel.send('✅ Prefix has been reset to default `!`');
  }
};
