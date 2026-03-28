// commands/leaderboard.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show XP leaderboard');

// Helper to read levels.json
function getLevels() {
    const filePath = path.resolve('./levels.json');
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath);
    return JSON.parse(raw);
}

// Export as execute so index.js can call it
export async function execute(interaction) {

    const db = getLevels();
    const guildData = db[interaction.guild.id] || {};

    // Map users and filter out those who left the server
    const users = Object.entries(guildData)
        .map(([id, data]) => ({
            id,
            level: data.level,
            totalXP: data.chatXP + data.voiceXP
        }))
        .filter(u => interaction.guild.members.cache.has(u.id)) // only active members
        .sort((a, b) => b.totalXP - a.totalXP);

    let page = 0;
    const perPage = 5;

    const generate = async () => {
        const slice = users.slice(page * perPage, page * perPage + perPage);

        const desc = await Promise.all(slice.map(async (u, i) => {
            const member = await interaction.guild.members.fetch(u.id).catch(() => null);
            const mention = member ? `<@${u.id}>` : "Unknown";

            return `**${page * perPage + i + 1}.** ${mention}
🎖️ Level: **${u.level}**
⭐ Total XP: **${u.totalXP}**`;
        }));

        return new EmbedBuilder()
            .setColor("#00ffaa")
            .setTitle("🏆 Server Leaderboard")
            .setDescription(desc.join("\n\n") || "No data")
            .setFooter({ text: `Page ${page + 1} / ${Math.max(Math.ceil(users.length / perPage), 1)}` });
    };

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary)
        );

    const msg = await interaction.reply({
        embeds: [await generate()],
        components: [row],
        fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) return i.deferUpdate();

        if (i.customId === 'prev' && page > 0) page--;
        if (i.customId === 'next' && (page + 1) * perPage < users.length) page++;

        await i.update({ embeds: [await generate()] });
    });
}
