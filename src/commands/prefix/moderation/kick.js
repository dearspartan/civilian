module.exports = {
  name: 'kick',
  description: 'Kick a user from the server.',
  category: 'moderation',
  usage: '<@user> [reason]',
  execute: async (message, args) => {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('❌ You do not have permission to kick members.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('⚠ Please mention a valid user to kick.');
    }

    if (!target.kickable) {
      return message.reply('❌ I cannot kick this user. They may have a higher role or I lack permissions.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.kick(reason);
      message.channel.send(`✅ Kicked ${target.user.tag}.\nReason: ${reason}`);
    } catch (err) {
      console.error('Kick Error:', err);
      message.reply('❌ Failed to kick the user. Check my permissions and role hierarchy.');
    }
  },
};
