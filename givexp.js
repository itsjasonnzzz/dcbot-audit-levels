import { SlashCommandBuilder } from 'discord.js';
import { getLevels } from '../levels.js';

const OWNER_ID = "478609757792370719";

export const data = new SlashCommandBuilder()
.setName('givexp')
.setDescription('Give XP (owner only)')
.addUserOption(o=>o.setName('user').setRequired(true))
.addIntegerOption(o=>o.setName('amount').setRequired(true));

export async function execute(interaction){

    if(interaction.user.id !== OWNER_ID)
        return interaction.reply({content:"Not allowed.", ephemeral:true});

    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const db = getLevels();

    if(!db[interaction.guild.id]) db[interaction.guild.id]={};
    if(!db[interaction.guild.id][user.id])
        db[interaction.guild.id][user.id]={chatXP:0,voiceXP:0,level:0};

    db[interaction.guild.id][user.id].chatXP += amount;

    interaction.reply(`Gave ${amount} XP to ${user}`);
}