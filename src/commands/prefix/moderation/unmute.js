module.exports = {
  name: 'unmute',
  description: 'Remove a timeout from a user.',
  usage: '<@user> [reason]',
  category: 'moderation',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send('❌ You lack permission to unmute members.');
    }

    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!target) {
      return message.channel.send('⚠ Please mention a valid user to unmute.');
    }

    if (!target.moderatable) {
      return message.channel.send('❌ I cannot unmute this user. Check role hierarchy or permissions.');
    }

    try {
      await target.timeout(null, reason);
      await message.channel.send(`🔊 Unmuted **${target.user.tag}**.\nReason: ${reason}`);
    } catch (err) {
      console.error('Unmute error:', err);
      message.channel.send('❌ Failed to unmute the user.');
    }
  }
};
