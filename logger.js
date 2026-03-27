import { EmbedBuilder } from 'discord.js';
import { LOG_CHANNELS } from './config.js';

const sentCache = new Map();

export function baseEmbed(title, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setTimestamp()
        .setFooter({
            text: "Alliance Security • Audit Log"
        });
}

export function userField(user){
    return {
        name: "User",
        value: `${user} (${user.tag})\nID: ${user.id}`,
        inline: false
    };
}

export function channelField(channel){
    return {
        name: "Channel",
        value: `${channel} \nID: ${channel.id}`,
        inline: false
    };
}

export function roleField(role){
    return {
        name: "Role",
        value: `${role.name}\nID: ${role.id}`,
        inline: false
    };
}

export async function log(client, type, key, embed) {
    try {
        const channelId = LOG_CHANNELS[type];
        if (!channelId) return;

        const unique = `${type}-${key}-${embed.data.title}-${embed.data.description || ''}`;
        const now = Date.now();

        if (sentCache.has(unique) && now - sentCache.get(unique) < 2000) return;
        sentCache.set(unique, now);

        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) return;

        embed.setAuthor({
            name: `${client.user.username} • Security`,
            iconURL: client.user.displayAvatarURL()
        });

        await channel.send({ embeds: [embed] });

    } catch (err) {
        console.error('Logger error:', err);
    }
}