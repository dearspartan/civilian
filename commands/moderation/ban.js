// commands/ban.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban (can be outside the server)')
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
        const botMember = guild.members.me;

        // ✅ Check permissions
        if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({ content: 'I lack the "Ban Members" permission.' });
        }

        if (!invokerMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({ content: 'You do not have permission to ban members.' });
        }

        if (targetUser.id === client.user.id)
            return interaction.editReply({ content: 'I cannot ban myself!' });

        if (targetUser.id === interaction.user.id)
            return interaction.editReply({ content: 'You cannot ban yourself!' });

        // 🔍 Try to fetch the member from the guild (if present)
        let targetMember = null;
        try {
            targetMember = await guild.members.fetch(targetUser.id);
        } catch (err) {
            // User not found in guild — that's fine
        }

        // 🔒 If the user is in the server, check role hierarchy
        if (targetMember) {
            // Bot vs user
            if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
                return interaction.editReply({
                    content: `I cannot ban ${targetUser.tag} because their role is higher than mine.`,
                });
            }

            // Invoker vs user
            if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
                return interaction.editReply({
                    content: `You cannot ban ${targetUser.tag} because their role is higher or equal to yours.`,
                });
            }
        }

        // Try to DM the user
        let dmSuccess = true;
        try {
            await targetUser.send(
                `🔓 You have been banned from **${guild.name}**.\n**Reason:** ${reason}`
            );
        } catch (error) {
            dmSuccess = false;
            console.warn(`❗ Could not DM ${targetUser.tag}:`, error);
        }

        // 🔨 Ban the user (whether in server or not)
        try {
            await guild.members.ban(targetUser.id, { reason });

            await interaction.followUp({
                content: `🔨 **${targetUser.tag}** has been banned.\n**Reason:** ${reason}`,
                ephemeral: false,
            });

            await interaction.editReply({
                content: `Successfully banned ${targetUser.tag}.`,
            });

            console.log(
                `Banned ${targetUser.tag} (${targetUser.id}) — Reason: "${reason}" by ${interaction.user.tag}`
            );
        } catch (error) {
            console.error(`Ban failed:`, error);
            await interaction.editReply({
                content: `Failed to ban ${targetUser.tag}. They may already be banned or an error occurred.`,
            });
        }
    },
};
