import { Events, Message } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: false,
  execute: (message: Message) => {
    if (message.content.trim().toLowerCase() === "ping") {
      message.reply("Pong!");
    }
  }
};