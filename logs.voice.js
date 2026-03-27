import { log, baseEmbed } from './logger.js';

export function registerVoiceLogs(client){

client.on('voiceStateUpdate',(oldState,newState)=>{

const user = newState.member?.user || oldState.member?.user;
if(!user) return;

if(!oldState.channel && newState.channel){
    log(client,'tracking','voice-join',
        baseEmbed('🎤 Voice Join','Green')
        .setDescription(`${user} joined ${newState.channel}`)
    );
}

if(oldState.channel && !newState.channel){
    log(client,'tracking','voice-leave',
        baseEmbed('📤 Voice Leave','Red')
        .setDescription(`${user} left ${oldState.channel}`)
    );
}

if(oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id){
    log(client,'tracking','voice-move',
        baseEmbed('🔁 Voice Move','Blue')
        .setDescription(`${user} moved`)
        .addFields(
            {name:'From', value: oldState.channel.name, inline:true},
            {name:'To', value: newState.channel.name, inline:true}
        )
    );
}

});

}