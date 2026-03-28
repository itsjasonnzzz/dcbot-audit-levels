// commands/rank.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevels, getXPForLevel } from '../levels.js';

export const data = new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show your rank');

export async function execute(interaction) {

    const db = getLevels();
    const user = db?.[interaction.guild.id]?.[interaction.user.id];

    if (!user)
        return interaction.reply("No XP progress yet.");

    const total = user.chatXP + user.voiceXP;
    const nextXP = getXPForLevel(user.level + 1);
    const percent = Math.floor((total / nextXP) * 100);

    const barLength = 20;
    const filled = Math.round((percent / 100) * barLength);
    const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

    const embed = new EmbedBuilder()
        .setColor("#12C2E9")
        .setTitle("🦖 Rank Info")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: "Player", value: `<@${interaction.user.id}>`, inline: true },
            { name: "Level", value: `${user.level}`, inline: true },
            { name: "💬 Chat XP", value: `${user.chatXP}`, inline: true },
            { name: "🎤 Voice XP", value: `${user.voiceXP}`, inline: true },
            { name: "⭐ Total XP", value: `${total}`, inline: true },
            { name: "Next Level XP", value: `${nextXP}`, inline: true },
            { name: "Progress", value: `${percent}%\n${bar}`, inline: false }
        );

    await interaction.reply({ embeds: [embed] });
}