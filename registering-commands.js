// deploy-commands.js
require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_TOKEN;

const commands = [];

// Function to recursively read command files from a directory
function readCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true }); // Read with file types
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            // If it's a directory, recurse into it
            readCommands(filePath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            // If it's a JavaScript file, load it as a command
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`Loaded command: ${command.data.name} from ${filePath}`); // Debug log
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                console.log(`Command object structure:`, command); // Debug log
            }
        }
    }
}

// Start reading commands from the base 'commands' directory
const baseCommandsPath = path.join(__dirname, 'commands');
console.log(`Starting to read commands from base directory: ${baseCommandsPath}`); // Debug log
readCommands(baseCommandsPath);

console.log(`Finished loading ${commands.length} commands.`); // Debug log

const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
