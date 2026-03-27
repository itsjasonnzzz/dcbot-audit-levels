import { log, baseEmbed } from './logger.js';

export async function lockdown(guild, client) {
    const channels = guild.channels.cache;

    for (const [, channel] of channels) {
        if (!channel.permissionOverwrites) continue;

        await channel.permissionOverwrites.edit(
            guild.roles.everyone,
            { SendMessages: false }
        ).catch(()=>{});
    }

    log(client,'server','lockdown',
        baseEmbed('🔒 AUTO LOCKDOWN','Red')
        .setDescription('Server locked due to suspicious activity')
    );
}