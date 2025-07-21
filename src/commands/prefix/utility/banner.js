const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Shows banner of a user or the server.',
  aliases: ['userbanner', 'serverbanner'],
  async execute(message, args) {
    const sub = args[0];

    // Server Banner
    if ((sub === 'server' || !args.length) && message.guild) {
      await message.guild.fetch(); // Ensure latest data
      const banner = message.guild.bannerURL({ size: 4096, dynamic: true });

      if (!banner) {
        return message.channel.send('❌ This server has no banner.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${message.guild.name}'s Banner`)
        .setImage(banner)
        .setColor('#2892D7');

      return message.channel.send({ embeds: [embed] });
    }

    // Parse user: support both "user <id/mention>" and just "<id/mention>"
    let userIdOrMention = sub === 'user' ? args[1] : args[0];

    // Fetch user from mention or ID
    const userId = userIdOrMention?.replace(/[<@!>]/g, '');
    if (!userId) {
      return message.channel.send('❌ Usage: `banner <user | server> [user ID or mention]`');
    }

    try {
      const user = await message.client.users.fetch(userId, { force: true });
      const bannerURL = await getUserBannerURL(user);

      if (!bannerURL) {
        return message.channel.send('❌ This user has no banner.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.tag}'s Banner`)
        .setImage(bannerURL)
        .setColor('#2892D7'); // No .setThumbnail()

      return message.channel.send({ embeds: [embed] });

    } catch (err) {
      return message.channel.send(`❌ Couldn't fetch user: \`${err.message}\``);
    }
  }
};

// Helper: fetch user banner via REST
async function getUserBannerURL(user) {
  if (user.banner) {
    return user.bannerURL({ size: 4096, dynamic: true });
  }

  const fetched = await user.client.rest.get(`/users/${user.id}`);
  if (!fetched.banner) return null;

  const format = fetched.banner.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${user.id}/${fetched.banner}.${format}?size=4096`;
}
