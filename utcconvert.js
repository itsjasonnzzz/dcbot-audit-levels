import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('utcconvert')
    .setDescription('Convert your local time to UTC')
    .addStringOption(option =>
        option.setName('time')
            .setDescription('Time in HH:MM format')
            .setRequired(true)
    );

export async function execute(interaction) {

    const input = interaction.options.getString('time');

    const [h, m] = input.split(':').map(Number);

    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);

    const utc =
        date.getUTCHours().toString().padStart(2,'0') + ":" +
        date.getUTCMinutes().toString().padStart(2,'0');

    await interaction.reply(`🌍 UTC Time: **${utc}**`);
}