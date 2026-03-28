import { SlashCommandBuilder } from 'discord.js';

let intervalStarted = false;

export const data = new SlashCommandBuilder()
    .setName('utc')
    .setDescription('Shows current UTC time');

export async function execute(interaction) {

    const now = new Date();

    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    await interaction.reply(`🌍 Current UTC: **${hours}:${minutes}:${seconds}**`);
}

export function startUTC(client) {

    if (intervalStarted) return;
    intervalStarted = true;

    const CHANNEL_ID = "1483240055635050546";

    const updateUTC = async () => {
        try {
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (!channel) return;

            const now = new Date();

            const hours = String(now.getUTCHours()).padStart(2, '0');
            const minutes = String(now.getUTCMinutes()).padStart(2, '0');

            const utc = `${hours}:${minutes}`;

            await channel.setTopic(`🌍 Current UTC: ${utc}`);

        } catch (err) {
            console.log("UTC update error:", err.message);
        }
    };

    // First update immediately
    updateUTC();

    // Calculate delay to sync to next 5-minute mark
    const now = new Date();
    const delay =
        (5 - (now.getUTCMinutes() % 5)) * 60000 -
        now.getUTCSeconds() * 1000 -
        now.getUTCMilliseconds();

    // Start synced interval
    setTimeout(() => {
        updateUTC();
        setInterval(updateUTC, 300000); // every 5 minutes
    }, delay);
}