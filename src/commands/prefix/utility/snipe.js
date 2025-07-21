const { EmbedBuilder } = require('discord.js');
const { snipes } = require('../../../events/messageDelete');

module.exports = {
  name: 'snipe',
  description: 'Snipe the most recently deleted message in this channel.',
  aliases: [],
  async execute(message) {
    const snipe = snipes.get(message.channel.id);

    if (!snipe) {
      return message.channel.send('❌ There is no message to snipe!');
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${snipe.author.tag}`, iconURL: snipe.author.displayAvatarURL() })
      .setDescription(snipe.content)
      .setFooter({ text: `Deleted at` })
      .setTimestamp(snipe.time)
      .setColor('#ff474c');

    if (snipe.image) {
      embed.setImage(snipe.image);
    }

    return message.channel.send({ embeds: [embed] });
  },
};
