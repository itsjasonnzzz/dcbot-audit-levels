export function handleCommands(client) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'utc') {
            return interaction.reply({
                content: `🕐 ${new Date().toUTCString()}`,
                ephemeral: true
            });
        }

        if (interaction.commandName === 'utcconvert') {
            const time = interaction.options.getString('time');
            const zone = interaction.options.getString('timezone') || 'CET';

            const [h,m] = time.split(':').map(Number);
            const offset = zone === 'CEST' ? 2 : 1;

            const d = new Date();
            d.setUTCHours(h-offset);
            d.setUTCMinutes(m);

            interaction.reply({
                content:`${time} ${zone} → ${d.getUTCHours().toString().padStart(2,'0')}:${d.getUTCMinutes().toString().padStart(2,'0')} UTC`,
                ephemeral:true
            });
        }
    });
}