module.exports = {
  name: 'nick',
  description: 'Change a user\'s nickname.',
  usage: '<@user> <new nickname>',
  category: 'moderation',
  async execute(message, args) {
    const target = message.mentions.members.first();
    const nickname = args.slice(1).join(' ');

    if (!target || !nickname) {
      return message.channel.send('⚠ Usage: `nick @user <new nickname>`');
    }

    const isSelf = target.id === message.author.id;

    if (isSelf && !message.member.permissions.has('ChangeNickname') && !message.member.permissions.has('ManageNicknames')) {
      return message.channel.send('❌ You do not have permission to change your own nickname.');
    }

    if (!isSelf && !message.member.permissions.has('ManageNicknames')) {
      return message.channel.send('❌ You do not have permission to change others\' nicknames.');
    }

    try {
      await target.setNickname(nickname, `Changed by ${message.author.tag}`);
      message.channel.send(`✅ Changed nickname of **${target.user.tag}** to **${nickname}**.`);
    } catch (err) {
      console.error('Nickname change error:', err);
      message.channel.send('❌ Failed to change nickname. The bot may lack permissions.');
    }
  }
};
