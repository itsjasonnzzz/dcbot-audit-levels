import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';

import { registerLevels } from './levels.js';
import { startUTC } from './commands/utc.js';

import { registerMessageLogs } from './logs.messages.js';
import { registerTrackingLogs } from './logs.tracking.js';
import { registerRoleLogs } from './logs.roles.js';
import { registerServerLogs } from './logs.server.js';
import { registerVoiceLogs } from './logs.voice.js';

import { antiRaid, massDelete } from './security.js';
import { antiNuke } from './antinuke.js';

dotenv.config();

if (global.__BOT_RUNNING__) {
    console.log("Another instance detected. Exiting.");
    process.exit(0);
}
global.__BOT_RUNNING__ = true;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});

client.commands = new Collection();

// LOAD COMMAND FILES
client.commands = new Map();

const commandsPath = './commands';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);

    if (!command.data || !command.execute) {
        console.log(`⚠️ Skipping invalid command: ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
}


// REGISTER LISTENERS ONCE
registerMessageLogs(client);
registerTrackingLogs(client);
registerRoleLogs(client);
registerServerLogs(client);
registerVoiceLogs(client);
registerLevels(client);

antiRaid(client);
massDelete(client);
antiNuke(client);


// SLASH COMMAND HANDLER
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "❌ Error executing command",
            ephemeral: true
        });
    }
});


// ROTATING PRESENCE
const activities = [
    { name: "🦖 Dino Storm", type: 0 },
    { name: "🏆 Tracking Levels", type: 3 },
    { name: "🎤 Voice XP Farming", type: 2 },
    { name: "⚡ Ultra Premium Logs", type: 3 }
];


// READY
client.once('ready', () => {

    console.log(`🛡️ Security Logger Ready: ${client.user.tag}`);

    startUTC(client);

    let i = 0;
    setInterval(() => {
        const activity = activities[i++ % activities.length];
        client.user.setActivity(activity.name, { type: activity.type });
    }, 15000);

});

client.login(process.env.TOKEN);