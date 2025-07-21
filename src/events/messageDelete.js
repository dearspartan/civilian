const { Collection } = require('discord.js');
const snipes = new Collection();

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.partial || message.author?.bot) return;

    snipes.set(message.channel.id, {
      content: message.content || '[No Text]',
      author: message.author,
      image: message.attachments.first()?.proxyURL || null,
      time: new Date(),
    });

    setTimeout(() => snipes.delete(message.channel.id), 60 * 60 * 1000);
  },
  snipes,
};
