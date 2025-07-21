// commands/mute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function parseDuration(durationStr) {
    const regex = /^(\d+)(s|m|h|d)$/;
    const match = durationStr.match(regex);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Temporarily mutes (timeouts) a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g. 10s, 5m, 1h, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for muting')
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

        const duration = parseDuration(durationInput);
        if (!duration) {
            return interaction.editReply({
                content: 'Invalid duration format. Use values like `10s`, `5m`, `1h`, or `2d`.',
            });
        }

        const MIN_DURATION = 10 * 1000; // 10 seconds
        const MAX_DURATION = 28 * 24 * 60 * 60 * 1000; // 28 days

        if (duration < MIN_DURATION || duration > MAX_DURATION) {
            return interaction.editReply({
                content: 'Duration must be between 10 seconds and 28 days.',
            });
        }

        if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: 'I do not have the "Moderate Members" permission.',
            });
        }

        if (!invokerMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: 'You do not have permission to mute members.',
            });
        }

        if (targetUser.id === client.user.id) {
            return interaction.editReply({ content: 'I cannot mute myself!' });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.editReply({ content: 'You cannot mute yourself!' });
        }

        let targetMember;
        try {
            targetMember = await guild.members.fetch(targetUser.id);
        } catch {
            return interaction.editReply({ content: 'That user is not in the server.' });
        }

        if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.editReply({
                content: `I cannot mute ${targetUser.tag} because their top role is equal to or higher than mine.`,
            });
        }

        if (targetMember.roles.highest.position >= invokerMember.roles.highest.position) {
            return interaction.editReply({
                content: `You cannot mute ${targetUser.tag} because their top role is equal to or higher than yours.`,
            });
        }

        try {
            await targetUser.send(
                `You have been muted in **${guild.name}** for ${durationInput}.\nReason: ${reason}`
            );
        } catch {
            // Ignore DM failures
        }

        try {
            await targetMember.timeout(duration, reason);

            await interaction.followUp({
                content: `🔇 **${targetUser.tag}** has been muted for ${durationInput}.\n**Reason:** ${reason}`,
                ephemeral: false,
            });

            await interaction.editReply({
                content: `You successfully muted ${targetUser.tag}.`,
            });

            console.log(
                `Muted ${targetUser.tag} (${targetUser.id}) for ${durationInput}. Reason: "${reason}". By: ${interaction.user.tag}`
            );
        } catch (error) {
            console.error(`Error muting ${targetUser.tag}:`, error);
            await interaction.editReply({
                content: `Failed to mute ${targetUser.tag}. An unexpected error occurred.`,
            });
        }
    },
};
