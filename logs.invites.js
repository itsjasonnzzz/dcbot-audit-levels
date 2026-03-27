const invites = new Map();

export function trackInvites(client){

client.on('ready', async ()=>{
    client.guilds.cache.forEach(async guild=>{
        const guildInvites = await guild.invites.fetch();
        invites.set(guild.id, guildInvites);
    });
});

client.on('guildMemberAdd', async member=>{
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    const invite = newInvites.find(i =>
        oldInvites.get(i.code)?.uses < i.uses
    );

    invites.set(member.guild.id, newInvites);

    if(!invite) return;

    member.guild.client.emit('inviteUsed',{
        member,
        invite
    });
});

}