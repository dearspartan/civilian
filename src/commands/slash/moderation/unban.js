// commands/unban.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Removes ban of a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for unbanning the user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const { guild, client, member: invokerMember } = interaction;

        const botMember = guild.members.me;

        // Permission checks
        if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({
                content: '❌ I do not have the "Ban Members" permission.',
            });
        }

        if (!invokerMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({
                content: '❌ You do not have permission to unban members.',
            });
        }

        if (targetUser.id === client.user.id) {
            return interaction.editReply({ content: '❌ I cannot unban myself!' });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot unban yourself!' });
        }

        // Check if user is banned
        try {
            const banInfo = await guild.bans.fetch(targetUser.id).catch(() => null);
            if (!banInfo) {
                return interaction.editReply({
                    content: `❌ ${targetUser.tag} is not currently banned.`,
                });
            }
        } catch (error) {
            console.error('Error fetching ban list:', error);
            return interaction.editReply({
                content: '❌ Failed to check bans. Try again later.',
            });
        }

        // Try to DM the user
        let dmSuccess = true;
        try {
            await targetUser.send(
                `🔓 You have been unbanned from **${guild.name}**.\n**Reason:** ${reason}`
            );
        } catch (error) {
            dmSuccess = false;
            console.warn(`❗ Could not DM ${targetUser.tag}:`, error);
        }

        // Attempt unban
        try {
            await guild.members.unban(targetUser.id, reason);

            await interaction.followUp({
                content: `✅ **${targetUser.tag}** was unbanned.\n**Reason:** ${reason}` +
                         (dmSuccess ? '' : '\n⚠️ Could not send them a DM.'),
                ephemeral: false,
            });

            await interaction.editReply({
                content: `Successfully unbanned ${targetUser.tag}.`,
            });

            console.log(
                `✅ Unbanned ${targetUser.tag} (${targetUser.id}) — Reason: "${reason}" by ${interaction.user.tag}`
            );
        } catch (error) {
            console.error(`❌ Failed to unban ${targetUser.tag}:`, error);
            await interaction.editReply({
                content: `❌ Failed to unban ${targetUser.tag}. An error occurred.`,
            });
        }
    },
};
