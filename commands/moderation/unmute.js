// commands/mute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes mutes (timeouts) from a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmuting')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const durationInput = interaction.options.getString('duration');

        const { guild, client, member: invokerMember } = interaction;
        const botMember = guild.members.me;


        if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: 'I do not have the "Moderate Members" permission.',
            });
        }

        if (!invokerMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: 'You do not have permission to unmute members.',
            });
        }

        if (targetUser.id === client.user.id) {
            return interaction.editReply({ content: 'I cannot unmute myself!' });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.editReply({ content: 'You cannot unmute yourself!' });
        }

        let targetMember;
        try {
            targetMember = await guild.members.fetch(targetUser.id);
        } catch {
            return interaction.editReply({ content: 'That user is not in the server.' });
        }

        if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.editReply({
                content: `I cannot unmute ${targetUser.tag} because their top role is equal to or higher than mine.`,
            });
        }

        if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
            return interaction.editReply({
                content: `You cannot unmute ${targetUser.tag} because their top role is equal to or higher than yours.`,
            });
        }

        try {
            await targetUser.send(
                `You have been unmuted in **${guild.name}** for ${durationInput}.\nReason: ${reason}`
            );
        } catch {
            // Ignore DM failures
        }

        try {
            await targetMember.timeout(null);

            await interaction.followUp({
                content: `🔇 **${targetUser.tag}** has been unmuted.\n**Reason:** ${reason}`,
                ephemeral: false,
            });

            await interaction.editReply({
                content: `You successfully unmuted ${targetUser.tag}.`,
            });

            console.log(
                `Unmuted ${targetUser.tag} (${targetUser.id}). Reason: "${reason}". By: ${interaction.user.tag}`
            );
        } catch (error) {
            console.error(`Error unmuting ${targetUser.tag}:`, error);
            await interaction.editReply({
                content: `Failed to unmute ${targetUser.tag}. An unexpected error occurred.`,
            });
        }
    },
};
