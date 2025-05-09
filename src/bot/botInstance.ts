import { Client, Collection, GatewayIntentBits, VoiceBasedChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import path from "path";
import fs from "fs";

export interface ClientWithCommands extends Client {
  commands: Collection<string, any>;
}

export class Bot {
  public client: ClientWithCommands;
  private _busy: boolean = false;
  private _connection: VoiceConnection | null = null;
  public id: string;

  constructor(token: string, id: string) {
    this.client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
      ] 
    }) as ClientWithCommands;

    this.client.commands = new Collection();

    this.id = id;
    this._setupCommands();
    this._setupEvents();
    this.connectClient(token);
  }


  private _setupCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    this.client['commands'] = new Collection();

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const imported = require(filePath);
      const command = imported.default || imported;
      if ('data' in command && 'execute' in command) {
        this.client['commands'].set(command.data.name, command);
      }
    }
  }


  private _setupEvents() {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      const eventModule = event.default || event;
      if (eventModule.once) {
        this.client.once(eventModule.name, (...args) => eventModule.execute(...args));
      } else {
        this.client.on(eventModule.name, (...args) => eventModule.execute(...args));
      }
    }
  }


  private async connectClient(token: string) {
    await this.client.login(token);
  }


  get isBusy() {
    return this._busy;
  }

  
  // TODO check
  async joinChannel(channel: VoiceBasedChannel): Promise<boolean> {
    if (this._busy) return false;

    try {
      this._connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      this._busy = true;

      this._connection.on('error', (e) => {
        console.error(`❌ Connection error for bot ${this.id}:`, e);
        this._busy = false;
        this._connection = null;
      });

      this._connection.on('stateChange', (oldState, newState) => {
        if (newState.status === 'disconnected') {
          this._busy = false;
          this._connection = null;
        }
      });

      return true;
    } catch (e) {
      console.error(`❌ Failed to join for bot ${this.id}:`, e);
      return false;
    }
  }

  // TODO check
  leaveChannel() {
    if (this._connection) {
      this._connection.destroy();
      this._connection = null;
    }
    this._busy = false;
  }
}
