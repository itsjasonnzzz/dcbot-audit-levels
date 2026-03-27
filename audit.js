export async function getExecutor(guild, type, targetId){
    try{
        const logs = await guild.fetchAuditLogs({limit:5});
        const entry = logs.entries.find(e =>
            e.target?.id === targetId &&
            e.action.toString().includes(type)
        );

        return entry?.executor || null;
    }catch{
        return null;
    }
}