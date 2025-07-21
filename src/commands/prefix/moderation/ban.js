const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server (mention or ID).',
  usage: '<@user | userID> [reason]',
  category: 'moderation',
  async execute(message, args) {
    const { guild, client, member: invokerMember } = message;
    const botMember = guild.members.me;

    if (!invokerMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send('❌ You do not have permission to ban members.');
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

    // Handle mention or ID
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

    // Safety checks
    if (targetUser.id === client.user.id)
      return message.channel.send('❌ I cannot ban myself.');
    if (targetUser.id === message.author.id)
      return message.channel.send('❌ You cannot ban yourself.');

    // If user is in guild, check roles
    let targetMember;
    try {
      targetMember = await guild.members.fetch(targetUser.id);
    } catch (_) {
      // Not in guild — that's okay
    }

    if (targetMember) {
      if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
        return message.channel.send(`❌ I cannot ban ${targetUser.tag} due to role hierarchy.`);
      }

      if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
        return message.channel.send(`❌ You cannot ban ${targetUser.tag} due to role hierarchy.`);
      }
    }

    // Try DM
    try {
      await targetUser.send(`🔨 You have been banned from **${guild.name}**.\n**Reason:** ${reason}`);
    } catch {
      // fail silently
    }

    try {
      await guild.members.ban(targetUser.id, { reason });

      return message.channel.send(
        `✅ **${targetUser.tag}** has been banned.\n**Reason:** ${reason}`
      );
    } catch (err) {
      console.error('Ban Error:', err);
      return message.channel.send('❌ Failed to ban the user. They may already be banned or I lack permission.');
    }
  },
};
