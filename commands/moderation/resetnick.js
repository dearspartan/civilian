// commands/resetnick.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets the nickname of a user (or yourself).')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User whose nickname you want to reset')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target') || interaction.user;
        const invoker = interaction.member;
        const isSelf = targetUser.id === interaction.user.id;

        let targetMember;
        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch {
            return interaction.editReply({
                content: '❌ Could not find the user in this server.',
            });
        }

        // Permission checks
        if (!isSelf && !invoker.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.editReply({
                content: '❌ You can only reset your own nickname unless you have the "Manage Nicknames" permission.',
            });
        }

        if (isSelf && !invoker.permissions.has(PermissionFlagsBits.ChangeNickname) && !invoker.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.editReply({
                content: '❌ You do not have permission to reset your own nickname.',
            });
        }

        // Attempt to reset nickname
        try {
            await targetMember.setNickname(null, `Reset by ${interaction.user.tag}`);
            await interaction.editReply({
                content: `✅ Nickname for **${targetUser.tag}** has been reset.`,
            });
        } catch (error) {
            console.error('Nickname reset error:', error);
            await interaction.editReply({
                content: '❌ Failed to reset the nickname. The bot might lack permissions or role hierarchy prevents it.',
            });
        }
    },
};
