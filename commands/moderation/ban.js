// commands/ban.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for banning the user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const { guild, client, member: invokerMember } = interaction;

        // Check if bot has Ban Members
        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({
                content: 'I do not have the "Ban Members" permission.',
            });
        }

        // Check if invoker has Ban Members
        if (!invokerMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({
                content: 'You do not have permission to ban members.',
            });
        }

        // Prevent banning the bot or invoker themselves
        if (targetUser.id === client.user.id)
            return interaction.editReply({ content: 'I cannot ban myself!' });

        if (targetUser.id === interaction.user.id)
            return interaction.editReply({ content: 'You cannot ban yourself!' });

        // Fetch the target as a GuildMember (might be null if not in guild)
        let targetMember;
        try {
            targetMember = await guild.members.fetch(targetUser.id);
        } catch (e) {
            // User might not be in guild (already left)
            return interaction.editReply({ content: 'That user is not in the server.' });
        }

        // Role hierarchy: bot vs. target
        if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.editReply({
                content: `I cannot ban ${targetUser.tag} because their top role is equal to or higher than mine.`,
            });
        }

        // Role hierarchy: invoker vs. target
        if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
            return interaction.editReply({
                content: `You cannot ban ${targetUser.tag} because their top role is equal to or higher than yours.`,
            });
        }

        // Try to DM the user about the ban (optional, catches errors silently)
        try {
            await targetUser.send(
                `You have been banned from **${guild.name}**.\nReason: ${reason}`,
            );
        } catch (err) {
            // Could not DM user (they have DMs off); ignore
        }

        // Ban the user
        try {
            await targetMember.ban({ reason });
            // Send info in the channel (this message is not ephemeral)
            await interaction.followUp({
                content: `:hammer: **${targetUser.tag}** was banned.\n**Reason:** ${reason}`,
                ephemeral: false,
            });
            await interaction.editReply({
                content: `You have successfully banned ${targetUser.tag}.`,
            });
            console.log(
                `Banned ${targetUser.tag} (${targetUser.id}) for: "${reason}" by ${interaction.user.tag}`,
            );
        } catch (error) {
            console.error(`Error banning ${targetUser.tag}:`, error);
            await interaction.editReply({
                content: `Failed to ban ${targetUser.tag}. An unexpected error occurred.`,
            });
        }
    },
};
