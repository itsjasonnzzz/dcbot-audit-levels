import { SECURITY } from './config.js';
import { log, baseEmbed } from './logger.js';
import { lockdown } from './lockdown.js';

const joins = [];
const deletes = [];

export function antiRaid(client) {
    client.on('guildMemberAdd', member => {
        const now = Date.now();
        joins.push(now);

        while (joins.length && now - joins[0] > SECURITY.antiRaidTime) {
            joins.shift();
        }

        if (joins.length >= SECURITY.antiRaidJoins) {
            log(client, 'server', 'raid',
                baseEmbed('🚨 RAID DETECTED', 'Red')
                .setDescription(`${joins.length} joins in ${SECURITY.antiRaidTime/1000}s`)
            );

            lockdown(member.guild, client);
        }
    });
}

export function massDelete(client) {
    client.on('messageDelete', () => {
        const now = Date.now();
        deletes.push(now);

        while (deletes.length && now - deletes[0] > 5000) {
            deletes.shift();
        }

        if (deletes.length >= SECURITY.massDeleteThreshold) {
            log(client, 'messages', 'mass-delete',
                baseEmbed('⚠️ MASS DELETE DETECTED', 'Orange')
                .setDescription(`${deletes.length} messages deleted quickly`)
            );
        }
    });
}