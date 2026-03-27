import { log, baseEmbed } from './logger.js';

export function registerTrackingLogs(client) {

client.on('guildMemberAdd', member=>{
    log(client,'tracking','join',
        baseEmbed('Member Joined','Green')
        .setDescription(member.user.tag)
    );
});

client.on('guildMemberRemove', member=>{
    log(client,'tracking','leave',
        baseEmbed('Member Left','Red')
        .setDescription(member.user.tag)
    );
});

client.on('userUpdate',(oldUser,newUser)=>{
    if(oldUser.displayAvatarURL() === newUser.displayAvatarURL()) return;

    log(client,'tracking','avatar',
        baseEmbed('🖼️ Avatar Changed','Blue')
        .setThumbnail(newUser.displayAvatarURL())
        .addFields(
            userField(newUser),
            {name:'New Avatar', value:newUser.displayAvatarURL()}
        )
    );
});

client.on('guildMemberUpdate',(oldM,newM)=>{
    if(oldM.nickname !== newM.nickname){
        log(client,'tracking','nick',
            baseEmbed('Nickname Changed','Blue')
            .setDescription(`${oldM.nickname || 'none'} → ${newM.nickname || 'none'}`)
        );
    }
});

}