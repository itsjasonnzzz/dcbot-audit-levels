import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLevels } from '../levels.js';
import fs from 'fs';

export const data = new SlashCommandBuilder()
.setName('daily')
.setDescription('Claim daily XP bonus');

const DAILY_FILE = './daily.json';
let daily = {};

if(fs.existsSync(DAILY_FILE))
    daily = JSON.parse(fs.readFileSync(DAILY_FILE));

function save(){
    fs.writeFileSync(DAILY_FILE, JSON.stringify(daily,null,2));
}

export async function execute(interaction){

    const id = interaction.user.id;
    const now = Date.now();

    if(daily[id] && now - daily[id] < 86400000){
        return interaction.reply({content:"⏳ You already claimed today.", ephemeral:true});
    }

    const db = getLevels();
    if(!db[interaction.guild.id]) db[interaction.guild.id]={};
    if(!db[interaction.guild.id][id])
        db[interaction.guild.id][id]={chatXP:0,voiceXP:0,level:0};

    db[interaction.guild.id][id].chatXP += 150;

    daily[id]=now;
    save();

    const embed = new EmbedBuilder()
    .setColor("#FFD200")
    .setTitle("🎁 Daily Bonus")
    .setDescription("You received **150 XP**")
    .setTimestamp();

    interaction.reply({embeds:[embed]});
}
