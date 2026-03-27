import { log, baseEmbed, userField, channelField } from './logger.js';

export function registerMessageLogs(client){

// MESSAGE SENT
client.on('messageCreate', async msg=>{
    if(!msg.guild) return;
    if(msg.author.bot) return;

    const embed = baseEmbed('💬 Message Sent', 'Green')
        .setDescription(msg.content || '*No text content*')
        .addFields(
            userField(msg.author),
            channelField(msg.channel)
        );

    if(msg.attachments.size > 0){
        embed.addFields({
            name: 'Attachments',
            value: msg.attachments.map(a => a.url).join('\n')
        });
    }

    if(msg.reference){
        embed.addFields({
            name: 'Replying To',
            value: `Message ID: ${msg.reference.messageId}`
        });
    }

    log(client,'messages','create',embed);
});


// MESSAGE DELETE
client.on('messageDelete', async msg=>{
    if(!msg.guild) return;
    if(!msg.author) return;
    if(msg.author.bot) return;

    const embed = baseEmbed('🗑️ Message Deleted', 'Red')
        .setDescription(msg.content || '*No text content*')
        .addFields(
            userField(msg.author),
            channelField(msg.channel)
        );

    log(client,'messages','delete',embed);
});


// MESSAGE EDIT
client.on('messageUpdate', async (oldMsg,newMsg)=>{
    if(!newMsg.guild) return;
    if(!newMsg.author) return;
    if(newMsg.author.bot) return;
    if(oldMsg.content === newMsg.content) return;

    const embed = baseEmbed('✏️ Message Edited', 'Yellow')
        .addFields(
            userField(newMsg.author),
            channelField(newMsg.channel),
            {
                name: 'Before',
                value: oldMsg.content || '*empty*'
            },
            {
                name: 'After',
                value: newMsg.content || '*empty*'
            }
        );

    log(client,'messages','edit',embed);
});


// REACTION ADD
client.on('messageReactionAdd', async (reaction,user)=>{
    if(user.bot) return;

    const embed = baseEmbed('😄 Reaction Added','Blue')
        .setDescription(`Emoji: ${reaction.emoji}`)
        .addFields(
            userField(user),
            channelField(reaction.message.channel)
        );

    log(client,'messages','reactAdd',embed);
});


// REACTION REMOVE
client.on('messageReactionRemove', async (reaction,user)=>{
    if(user.bot) return;

    const embed = baseEmbed('😐 Reaction Removed','Orange')
        .setDescription(`Emoji: ${reaction.emoji}`)
        .addFields(
            userField(user),
            channelField(reaction.message.channel)
        );

    log(client,'messages','reactRemove',embed);
});

}