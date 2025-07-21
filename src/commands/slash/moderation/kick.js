// commands/kick.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for kicking the user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const { guild, client, member: invokerMember } = interaction;

        // Check if bot has Kick Members
        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply({
                content: 'I do not have the "Kick Members" permission.',
            });
        }

        // Check if invoker has Kick Members
        if (!invokerMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply({
                content: 'You do not have permission to kick members.',
            });
        }

        // Prevent kicking the bot or invoker themselves
        if (targetUser.id === client.user.id)
            return interaction.editReply({ content: 'I cannot kick myself!' });

        if (targetUser.id === interaction.user.id)
            return interaction.editReply({ content: 'You cannot kick yourself!' });

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
                content: `I cannot kick ${targetUser.tag} because their top role is equal to or higher than mine.`,
            });
        }

        // Role hierarchy: invoker vs. target
        if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
            return interaction.editReply({
                content: `You cannot kick ${targetUser.tag} because their top role is equal to or higher than yours.`,
            });
        }

        // Try to DM the user about the kick (optional, catches errors silently)
        try {
            await targetUser.send(
                `You have been kicked from **${guild.name}**.\nReason: ${reason}`,
            );
        } catch (err) {
            // Could not DM user (they have DMs off); ignore
        }

        // Kick the user
        try {
            await targetMember.kick({ reason });
            // Send info in the channel (this message is not ephemeral)
            await interaction.followUp({
                content: `:hammer: **${targetUser.tag}** was kicked.\n**Reason:** ${reason}`,
                ephemeral: false,
            });
            await interaction.editReply({
                content: `You have successfully kicked ${targetUser.tag}.`,
            });
            console.log(
                `Kicked ${targetUser.tag} (${targetUser.id}) for: "${reason}" by ${interaction.user.tag}`,
            );
        } catch (error) {
            console.error(`Error Kicking ${targetUser.tag}:`, error);
            await interaction.editReply({
                content: `Failed to kick ${targetUser.tag}. An unexpected error occurred.`,
            });
        }
    },
};
