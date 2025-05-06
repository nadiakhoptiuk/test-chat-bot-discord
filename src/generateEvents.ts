import path from "path";
import fs from "fs";
import { getClientWithCommands } from "../config/client";

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

export const setUpEvents = () => {
  const client = getClientWithCommands();

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    const eventModule = event.default || event;
    
    if (eventModule.once) {
      client.once(eventModule.name, (...args) => eventModule.execute(...args));
    } else {
      client.on(eventModule.name, (...args) => eventModule.execute(...args));
    }
  }
}
