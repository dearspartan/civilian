// src/handlers/loadPrefixCommands.js
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands/prefix');

  client.prefixCommands = new Map();      // Main commands
  client.prefixAliases = new Map();       // Aliases

  const load = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        load(filePath);
      } else if (file.name.endsWith('.js')) {
        const command = require(filePath);
        if ('name' in command && 'execute' in command) {
          client.prefixCommands.set(command.name, command);
          console.log(`✅ Loaded prefix command: ${command.name}`);

          // Register aliases if they exist
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              client.prefixAliases.set(alias, command.name);
              console.log(`↪️ Registered alias: ${alias} -> ${command.name}`);
            }
          }

        } else {
          console.warn(`⚠️ Invalid prefix command at: ${filePath}`);
        }
      }
    }
  };

  load(commandsPath);
};
