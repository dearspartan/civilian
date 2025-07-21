module.exports = {
  name: 'resetnick',
  description: 'Reset a user\'s nickname to default.',
  usage: '<@user>',
  category: 'moderation',
  async execute(message, args) {
    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send('⚠ Please mention a user to reset nickname.');
    }

    const isSelf = target.id === message.author.id;

    if (isSelf && !message.member.permissions.has('ChangeNickname') && !message.member.permissions.has('ManageNicknames')) {
      return message.channel.send('❌ You do not have permission to reset your nickname.');
    }

    if (!isSelf && !message.member.permissions.has('ManageNicknames')) {
      return message.channel.send('❌ You do not have permission to reset others\' nicknames.');
    }

    try {
      await target.setNickname(null, `Reset by ${message.author.tag}`);
      message.channel.send(`✅ Nickname for **${target.user.tag}** has been reset.`);
    } catch (err) {
      console.error('Nickname reset error:', err);
      message.channel.send('❌ Failed to reset nickname. The bot may lack permissions.');
    }
  }
};
