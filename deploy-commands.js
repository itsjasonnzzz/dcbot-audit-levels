import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [

    new SlashCommandBuilder()
        .setName('utc')
        .setDescription('Shows current UTC time'),

    new SlashCommandBuilder()
        .setName('utcconvert')
        .setDescription('Convert your local time to UTC')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Your time in HH:MM format')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your level and XP'),

    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View server XP leaderboard'),

    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily XP bonus'),

    new SlashCommandBuilder()
        .setName('givexp')
        .setDescription('Give XP to a user (Admin only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to give XP to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of XP to give')
                .setRequired(true)
        )

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
    console.log('🚀 Deploying slash commands...');

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log('✅ Slash commands deployed successfully');

} catch (error) {
    console.error(error);
}
