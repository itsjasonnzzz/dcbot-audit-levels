import { getExecutor } from './audit.js';
import { log, baseEmbed, userField } from './logger.js';

export function registerServerLogs(client) {

    // BAN
client.on('guildBanAdd', async ban=>{
    const executor = await getExecutor(ban.guild,"BAN",ban.user.id);

    log(client,'server','ban',
        baseEmbed('🔨 User Banned','Red')
        .addFields(
            userField(ban.user),
            {name:'Banned By', value: executor ? executor.tag : 'Unknown'}
        )
    );
});

// UNBAN
client.on('guildBanRemove', async ban=>{
    log(client,'server','unban',
        baseEmbed('♻️ User Unbanned','Green')
        .addFields(
            userField(ban.user)
        )
    );
});

// KICK
client.on('guildMemberRemove', async member=>{
    const executor = await getExecutor(member.guild,"KICK",member.id);

    if(!executor) return;

    log(client,'server','kick',
        baseEmbed('👢 User Kicked','Orange')
        .addFields(
            userField(member.user),
            {name:'Kicked By', value: executor.tag}
        )
    );
});

// TIMEOUT
client.on('guildMemberUpdate', async (oldMember,newMember)=>{
    if(!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil){
        const executor = await getExecutor(newMember.guild,"MEMBER_UPDATE",newMember.id);

        log(client,'server','timeout',
            baseEmbed('⏱️ User Timed Out','Yellow')
            .addFields(
                userField(newMember.user),
                {name:'By', value: executor ? executor.tag : 'Unknown'}
            )
        );
    }
});


client.on('channelCreate', channel=>{
    if(!channel?.name) return;

    log(client,'server','chcreate',
        baseEmbed('Channel Created','Green')
        .setDescription(channel.name)
    );
});

client.on('channelDelete', channel=>{
    if(!channel?.name) return;

    log(client,'server','chdelete',
        baseEmbed('Channel Deleted','Red')
        .setDescription(channel.name)
    );
});

client.on('channelUpdate',(oldC,newC)=>{
    if(oldC.name !== newC.name){
        log(client,'server','chupdate',
            baseEmbed('Channel Renamed','Blue')
            .setDescription(`${oldC.name} → ${newC.name}`)
        );
    }
});

client.on('guildUpdate',(oldG,newG)=>{
    if(oldG.name !== newG.name){
        log(client,'server','guild',
            baseEmbed('Server Name Changed','Purple')
            .setDescription(`${oldG.name} → ${newG.name}`)
        );
    }
});

}