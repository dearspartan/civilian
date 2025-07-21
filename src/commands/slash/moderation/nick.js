// commands/changenick.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Changes the nickname of a user (or yourself).')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User whose nickname you want to change')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('New nickname to assign')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target') || interaction.user;
        const newNickname = interaction.options.getString('nickname');
        const invoker = interaction.member;
        const isSelf = targetUser.id === interaction.user.id;

        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        // Check if trying to change other's nickname
        if (!isSelf && !invoker.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.editReply({
                content: '❌ You can only change your own nickname unless you have the "Manage Nicknames" permission.',
            });
        }

        // Check if user has permission to change own nickname
        if (isSelf && !invoker.permissions.has(PermissionFlagsBits.ChangeNickname) && !invoker.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.editReply({
                content: '❌ You do not have permission to change your own nickname.',
            });
        }

        // Try changing nickname
        try {
            await targetMember.setNickname(newNickname, `Changed by ${interaction.user.tag}`);
            await interaction.editReply({
                content: `✅ Nickname of **${targetUser.tag}** changed to **${newNickname}**.`,
            });
        } catch (error) {
            console.error('Nickname change error:', error);
            await interaction.editReply({
                content: '❌ Failed to change the nickname. The bot might lack permissions or role hierarchy prevents it.',
            });
        }
    },
};
