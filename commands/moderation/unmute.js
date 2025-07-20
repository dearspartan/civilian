const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('unmutes a user.'),
  async execute(interaction) {
    // Your unmute logic here
    await interaction.reply('User has been unmuted!');
  }
};
