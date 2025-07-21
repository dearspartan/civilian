// src/events/messageDelete.js
const { Collection } = require('discord.js');
const snipes = new Collection();

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    // If the message is partial, try to fetch it
    if (message.partial) {
      try {
        message = await message.fetch();
      } catch (err) {
        return console.warn('Could not fetch partial message on delete:', err);
      }
    }

    snipes.set(message.channel.id, {
      content: message.content || '[No Text]',
      author: message.author,
      image: message.attachments.first()?.proxyURL || null,
      time: new Date(),
    });

    setTimeout(() => snipes.delete(message.channel.id), 60 * 60 * 1000); // 1 hour
  },
  snipes,
};
