const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unbans a user by ID or mention.',
  usage: '<@user | userID> [reason]',
  category: 'moderation',
  async execute(message, args) {
    const { guild, client, member: invokerMember } = message;
    const botMember = guild.members.me;

    if (!invokerMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send('❌ You do not have permission to unban members.');
    }

    if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send('❌ I do not have the "Ban Members" permission.');
    }

    const userInput = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!userInput) {
      return message.channel.send('⚠ Please mention a user or provide their user ID.');
    }

    let targetUser;

    const mention = message.mentions.users.first();
    if (mention) {
      targetUser = mention;
    } else {
      try {
        targetUser = await client.users.fetch(userInput);
      } catch {
        return message.channel.send('❌ Could not find a user with that ID.');
      }
    }

    if (targetUser.id === client.user.id)
      return message.channel.send('❌ I cannot unban myself.');
    if (targetUser.id === message.author.id)
      return message.channel.send('❌ You cannot unban yourself.');

    // Check if banned
    const banInfo = await guild.bans.fetch(targetUser.id).catch(() => null);
    if (!banInfo) {
      return message.channel.send(`❌ ${targetUser.tag} is not currently banned.`);
    }

    // Try DM
    try {
      await targetUser.send(`🔓 You have been unbanned from **${guild.name}**.\n**Reason:** ${reason}`);
    } catch {
      // DM failed, ignore
    }

    try {
      await guild.members.unban(targetUser.id, reason);

      return message.channel.send(
        `✅ **${targetUser.tag}** has been unbanned.\n**Reason:** ${reason}`
      );
    } catch (err) {
      console.error('Unban Error:', err);
      return message.channel.send('❌ Failed to unban the user. They may not be banned or an error occurred.');
    }
  },
};
