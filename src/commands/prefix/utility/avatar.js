// prefix/avatar.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Displays the avatar of you or a mentioned user.',
  aliases: ['av'],

  async execute(message, args) {
    let user;

    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else if (args[0]) {
      try {
        user = await message.client.users.fetch(args[0]);
      } catch (error) {
        return message.reply('❌ Unable to find that user by ID.');
      }
    } else {
      user = message.author;
    }

    const avatarUrl = user.displayAvatarURL({ size: 4096, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(avatarUrl)
      .setColor('#2892D7');

    await message.channel.send({ embeds: [embed] });
  },
};
