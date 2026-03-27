import { log, baseEmbed, userField, roleField } from './logger.js';
import { getExecutor } from './audit.js';

export function registerRoleLogs(client){

// ROLE CREATED
client.on('roleCreate', async role=>{
    const executor = await getExecutor(role.guild,"ROLE_CREATE",role.id);

    log(client,'roles','create',
        baseEmbed('🟢 Role Created','Green')
        .addFields(
            roleField(role),
            {name:'Created By', value: executor ? executor.tag : 'Unknown'}
        )
    );
});

// ROLE DELETED
client.on('roleDelete', async role=>{
    const executor = await getExecutor(role.guild,"ROLE_DELETE",role.id);

    log(client,'roles','delete',
        baseEmbed('🔴 Role Deleted','Red')
        .addFields(
            roleField(role),
            {name:'Deleted By', value: executor ? executor.tag : 'Unknown'}
        )
    );
});

// ROLE UPDATED
client.on('roleUpdate', async (oldRole,newRole)=>{

    const changes = [];

    if(oldRole.name !== newRole.name)
        changes.push(`Name: ${oldRole.name} → ${newRole.name}`);

    if(oldRole.color !== newRole.color)
        changes.push(`Color: ${oldRole.hexColor} → ${newRole.hexColor}`);

    if(oldRole.permissions.bitfield !== newRole.permissions.bitfield)
        changes.push(`Permissions changed`);

    if(changes.length === 0) return;

    const executor = await getExecutor(newRole.guild,"ROLE_UPDATE",newRole.id);

    log(client,'roles','update',
        baseEmbed('🟡 Role Updated','Yellow')
        .setDescription(changes.join('\n'))
        .addFields(
            roleField(newRole),
            {name:'Updated By', value: executor ? executor.tag : 'Unknown'}
        )
    );

});

// ROLE GIVEN / REMOVED
client.on('guildMemberUpdate', async (oldMember,newMember)=>{

    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removed = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if(!added.size && !removed.size) return;

    const executor = await getExecutor(newMember.guild,"MEMBER_ROLE_UPDATE",newMember.id);

    added.forEach(role=>{
        log(client,'roles','given',
            baseEmbed('➕ Role Given','Green')
            .addFields(
                userField(newMember.user),
                roleField(role),
                {name:'Given By', value: executor ? executor.tag : 'Unknown'}
            )
        );
    });

    removed.forEach(role=>{
        log(client,'roles','removed',
            baseEmbed('➖ Role Removed','Orange')
            .addFields(
                userField(newMember.user),
                roleField(role),
                {name:'Removed By', value: executor ? executor.tag : 'Unknown'}
            )
        );
    });

});

}