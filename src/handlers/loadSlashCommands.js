// src/handlers/loadSlashCommands.js
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands/slash');
  const commandFiles = fs.readdirSync(commandsPath, { withFileTypes: true });

  const load = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        load(filePath);
      } else if (file.name.endsWith('.js')) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`Loaded slash command: ${command.data.name}`);
        } else {
          console.warn(`Missing data or execute in slash command: ${filePath}`);
        }
      }
    }
  };

  load(commandsPath);

};
  console.log("Commands Loaded!")