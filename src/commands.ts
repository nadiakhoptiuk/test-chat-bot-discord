import path from "path";
import fs from "fs";

const getCommands = () => {
  const commandsData = [];
  const commandsObjects = [];
  
  const foldersPath = path.join(__dirname, 'commands');

  const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.ts'));
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(foldersPath, file);
      // Use require for CommonJS instead of dynamic import
      const imported = require(filePath);
      
      // Handle default export
      const command = imported.default || imported;
      
      if ('data' in command && 'execute' in command) {
        commandsData.push(command.data.toJSON());
        commandsObjects.push(command);
      } else {
        console.log(`[WARNING] The command at '${file}' is missing a required "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load command at ${file}:`, error);
    }
  }

  console.log(`Loaded ${commandsObjects.length} commands`);

  return { commandsData, commandsObjects };
}

const { commandsData, commandsObjects } = getCommands();
export const commands = commandsData;
export const commandObjects = commandsObjects;