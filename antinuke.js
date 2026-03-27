import { log, baseEmbed } from './logger.js';

const channelDeletes = [];
const roleDeletes = [];

const LIMIT = 3;
const TIME = 8000;

export function antiNuke(client){

client.on('channelDelete', channel=>{
    const now = Date.now();
    channelDeletes.push(now);

    while(channelDeletes.length && now - channelDeletes[0] > TIME)
        channelDeletes.shift();

    if(channelDeletes.length >= LIMIT){
        log(client,'server','antinuke-channel',
            baseEmbed('🚨 Anti-Nuke Triggered','Red')
            .setDescription(`Mass channel deletion detected (${channelDeletes.length})`)
        );
    }
});

client.on('roleDelete', role=>{
    const now = Date.now();
    roleDeletes.push(now);

    while(roleDeletes.length && now - roleDeletes[0] > TIME)
        roleDeletes.shift();

    if(roleDeletes.length >= LIMIT){
        log(client,'server','antinuke-role',
            baseEmbed('🚨 Anti-Nuke Triggered','Red')
            .setDescription(`Mass role deletion detected (${roleDeletes.length})`)
        );
    }
});

}