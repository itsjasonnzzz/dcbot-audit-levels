import { log, baseEmbed } from './logger.js';

let channelDeletes = [];
let roleGrants = [];
let messageDeletes = [];

export function ultraSecurity(client) {

    // MASS CHANNEL DELETE
    client.on('channelDelete', channel => {
        const now = Date.now();
        channelDeletes.push(now);

        channelDeletes = channelDeletes.filter(t => now - t < 10000);

        if (channelDeletes.length >= 3) {
            log(client,'server','mass-channel-delete',
                baseEmbed('🚨 MASS CHANNEL DELETE','Red')
                .setDescription(`${channelDeletes.length} channels deleted in 10s`)
            );
        }
    });

    // MASS ROLE GRANT
    client.on('guildMemberUpdate',(oldM,newM)=>{
        if(newM.roles.cache.size > oldM.roles.cache.size){
            roleGrants.push(Date.now());
        }

        roleGrants = roleGrants.filter(t=>Date.now()-t<10000);

        if(roleGrants.length >= 5){
            log(client,'roles','mass-role',
                baseEmbed('⚠️ MASS ROLE GRANT','Orange')
                .setDescription('Possible admin abuse')
            );
        }
    });

    // MASS MESSAGE DELETE
    client.on('messageDelete',()=>{
        messageDeletes.push(Date.now());

        messageDeletes = messageDeletes.filter(t=>Date.now()-t<5000);

        if(messageDeletes.length >= 5){
            log(client,'messages','mass-delete',
                baseEmbed('⚠️ MASS MESSAGE DELETE','Orange')
                .setDescription('Possible purge detected')
            );
        }
    });

}