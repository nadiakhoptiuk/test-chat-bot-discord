import { ButtonBuilder, ButtonStyle } from "discord.js";

export const botStatus = new ButtonBuilder()
			.setCustomId('botStatus')
			.setLabel('Bot Status')
			.setStyle(ButtonStyle.Primary); 