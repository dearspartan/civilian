
// index.js
require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.DirectMessagePolls,
    ]
});

client.commands = new Collection();

// Function to recursively read command files from a directory
function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(filePath); // Recurse into subdirectories
        } else if (file.isFile() && file.name.endsWith('.js')) {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`Loaded command: ${command.data.name} from ${filePath}`); // Debug log
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

// Start loading commands from the base 'commands' directory
const baseCommandsPath = path.join(__dirname, 'commands');
console.log(`Starting to load commands from base directory: ${baseCommandsPath}`); // Debug log
loadCommands(baseCommandsPath);
console.log(`Finished loading ${client.commands.size} commands into client.commands.`); // Debug log


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready and listening for slash commands!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Error: DISCORD_TOKEN environment variable not set.");
    console.error("Please ensure your .env file is correctly configured.");
} else {
    client.login(token)
        .catch(error => {
            console.error("Failed to log in to Discord:", error);
            console.error("Please check your bot token and internet connection.");
        });
}
