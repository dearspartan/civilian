const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Changes the nickname of a user.'),
  async execute(interaction) {
    // Your nickname logic here
    await interaction.reply(`Your nickname has been changed to <nickname>!`);
  }
};
