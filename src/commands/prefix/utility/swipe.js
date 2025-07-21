// commands/prefix/utility/swipe.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');
const {
  parseEmojisFromContent,
  parseStickersFromMessage,
  getURLFromItem,
  checkSlots
} = require('../../../utils/swipeHelpers');

module.exports = {
  name: 'swipe',
  description: 'Steal emojis or stickers from a message or argument.',
  usage: 'swipe [emoji] (or replied message)',

  async execute(message, args) {
    if (!message.guild) return message.reply('❌ This only works in servers.');

    const me = await message.guild.members.fetchMe();
    const invoker = message.member;

    const perm = PermissionsBitField.Flags.ManageEmojisAndStickers;
    if (!me.permissions.has(perm) || !invoker.permissions.has(perm)) {
      return message.reply('❌ I or you lack `Manage Emojis & Stickers` permission.');
    }

    let emojis = [];
    let stickers = [];

    const targetMsg = message.reference
      ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null)
      : null;

    if (args[0]) {
      emojis = parseEmojisFromContent(args.join(' '));
    } else if (targetMsg) {
      emojis = parseEmojisFromContent(targetMsg.content);
      stickers = parseStickersFromMessage(targetMsg);
    }

    if (emojis.length === 0 && stickers.length === 0) {
      return message.reply('❌ No emojis or stickers found.');
    }

    const items = [...emojis, ...stickers];
    let idx = 0;

    const buildEmbed = (item) => {
      return new EmbedBuilder()
        .setTitle(`Preview: ${item.name}`)
        .setImage(getURLFromItem(item))
        .setColor('#2892D7')
        .setFooter({ text: `${idx + 1}/${items.length}` });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(items.length === 1),
      new ButtonBuilder().setCustomId('addEmoji').setLabel('Add Emoji').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('addSticker').setLabel('Add Sticker').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(items.length === 1),
    );

    const sent = await message.channel.send({ embeds: [buildEmbed(items[idx])], components: [row] });

    const collector = sent.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== message.author.id) {
        return i.reply({ content: '⚠️ Not your interaction.', ephemeral: true });
      }

      const item = items[idx];

      switch (i.customId) {
        case 'prev':
          idx = (idx - 1 + items.length) % items.length;
          await i.update({ embeds: [buildEmbed(items[idx])] });
          break;

        case 'next':
          idx = (idx + 1) % items.length;
          await i.update({ embeds: [buildEmbed(items[idx])] });
          break;

        case 'addEmoji':
        case 'addSticker': {
          const type = i.customId === 'addEmoji' ? 'emoji' : 'sticker';
          const { ok, reason } = await checkSlots(message.guild, type);
          if (!ok) {
            return i.reply({ content: `❌ ${reason}`, ephemeral: true });
          }

          try {
            if (type === 'emoji') {
              await message.guild.emojis.create({
                attachment: getURLFromItem(item),
                name: item.name,
              });
            } else {
              await message.guild.stickers.create({
                file: getURLFromItem(item),
                name: item.name,
                description: `Swiped by ${message.author.tag}`,
                format: item.format
              });
            }

            await i.reply({ content: `✅ ${type} added: \`${item.name}\``, ephemeral: true });
          } catch (err) {
            console.error(err);
            await i.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
          }
          break;
        }
      }
    });

    collector.on('end', () => {
      sent.edit({ components: [] }).catch(() => null);
    });
  }
};
