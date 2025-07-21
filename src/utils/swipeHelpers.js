// utils/swipeHelpers.js
function parseEmojisFromContent(content = '') {
  const regex = /<(a)?:(\w+):(\d+)>/g;
  const found = [];
  for (const [, anim, name, id] of content.matchAll(regex)) {
    found.push({ type: 'emoji', name, id, animated: Boolean(anim) });
  }
  return found;
}

function parseStickersFromMessage(message) {
  return message.stickers.map(s => ({
    type: 'sticker',
    id: s.id,
    name: s.name,
    format: s.format
  }));
}

function getURLFromItem(item) {
  if (item.type === 'emoji') {
    const ext = item.animated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/emojis/${item.id}.${ext}`;
  } else {
    return `https://cdn.discordapp.com/stickers/${item.id}.png`;
  }
}

async function checkSlots(guild, type) {
  if (type === 'emoji') {
    const emojis = await guild.emojis.fetch();
    if (emojis.size >= guild.maximumEmojis) return { ok: false, reason: 'No emoji slots left' };
  } else {
    const stickers = await guild.stickers.fetch();
    if (stickers.size >= guild.maximumStickers)
      return { ok: false, reason: 'No sticker slots left' };
  }
  return { ok: true };
}

module.exports = {
  parseEmojisFromContent,
  parseStickersFromMessage,
  getURLFromItem,
  checkSlots
};
