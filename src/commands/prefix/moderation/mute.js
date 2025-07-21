module.exports = {
  name: 'mute',
  description: 'Temporarily mute (timeout) a user.',
  usage: '<@user> <duration> [reason]',
  category: 'moderation',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send('❌ You lack permission to mute members.');
    }

    const target = message.mentions.members.first();
    const durationStr = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided.';

    if (!target || !durationStr) {
      return message.channel.send('⚠ Usage: `mute @user <10s|5m|1h|2d> [reason]`');
    }

    const parseDuration = (str) => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return null;
      const [ , num, unit ] = match;
      const factor = { s: 1, m: 60, h: 3600, d: 86400 }[unit];
      return parseInt(num) * factor * 1000;
    };

    const duration = parseDuration(durationStr);
    if (!duration || duration < 10000 || duration > 28 * 86400000) {
      return message.channel.send('⏱ Duration must be between 10 seconds and 28 days (e.g., `10s`, `5m`, `1h`, `2d`).');
    }

    if (!target.moderatable) {
      return message.channel.send('❌ I cannot mute this user. Check role hierarchy or permissions.');
    }

    try {
      await target.timeout(duration, reason);
      await message.channel.send(`🔇 Muted **${target.user.tag}** for ${durationStr}.\nReason: ${reason}`);
    } catch (err) {
      console.error('Mute error:', err);
      message.channel.send('❌ Failed to mute the user.');
    }
  }
};
