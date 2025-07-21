// src/models/prefix.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/prefix.json');

// Ensure file exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}));
}

const getPrefixes = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const savePrefixes = (prefixes) => {
  fs.writeFileSync(filePath, JSON.stringify(prefixes, null, 2));
};

const getPrefix = (guildId) => {
  const prefixes = getPrefixes();
  return prefixes[guildId] || '!';
};

const setPrefix = (guildId, newPrefix) => {
  const prefixes = getPrefixes();
  prefixes[guildId] = newPrefix;
  savePrefixes(prefixes);
};

const resetPrefix = (guildId) => {
  const prefixes = getPrefixes();
  delete prefixes[guildId];
  savePrefixes(prefixes);
};

module.exports = {
  getPrefix,
  setPrefix,
  resetPrefix
};
