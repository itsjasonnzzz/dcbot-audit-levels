import fs from 'fs';
import { EmbedBuilder } from 'discord.js';

const DB_FILE = './levels.json';

let db = {};
if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE));
}

function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const LEVEL_UP_CHANNEL = "1487207549257388072";

const LEVEL_ROLES = {
    5: "1486850975921606787",
    10: "1486850994079006730",
    15: "1486850999363571832",
    20: "1486851034528743619",
    30: "1486851060453867701",
    40: "1486851063842869388",
    50: "1486851066955038792",
    100: "1486851069807169627"
};

// Slower XP formula
function xpForLevel(level) {
    return 10 * level * level + 75 * level + 200;
}

// Double XP on weekends
function isDoubleXP() {
    const day = new Date().getDay();
    return day === 6 || day === 0;
}

function getUser(guildId, userId) {
    if (!db[guildId]) db[guildId] = {};
    if (!db[guildId][userId]) {
        db[guildId][userId] = {
            chatXP: 0,
            voiceXP: 0,
            level: 0,
            lastMessage: 0,
            streak: 0
        };
    }
    return db[guildId][userId];
}

export function registerLevels(client) {

    const cooldown = new Map();

    // CHAT XP
    client.on('messageCreate', async msg => {
        if (!msg.guild || msg.author.bot) return;

        const key = msg.author.id;
        if (cooldown.has(key)) return;

        cooldown.set(key, true);
        setTimeout(() => cooldown.delete(key), 30000); // 30s cooldown

        const user = getUser(msg.guild.id, msg.author.id);

        let xp = Math.floor(Math.random() * 4) + 2; // 2-5 XP
        if (isDoubleXP()) xp *= 2;

        // Chat streak bonus
        const now = Date.now();
        if (user.lastMessage && now - user.lastMessage < 60000) { // within 1 min
            user.streak = (user.streak || 0) + 1;
            xp += Math.min(user.streak, 3); // max +3 XP bonus
        } else {
            user.streak = 0;
        }
        user.lastMessage = now;

        user.chatXP += xp;

        await checkLevelUp(client, msg.guild, msg.member, user);
        save();
    });

    // VOICE XP & AFK detection
    setInterval(async () => {
        client.guilds.cache.forEach(async guild => {
            guild.channels.cache
                .filter(c => c.type === 2) // voice channels
                .forEach(channel => {
                    const members = channel.members.filter(m => !m.user.bot);
                    if (members.size < 2) return; // minimum 2 humans

                    members.forEach(async member => {
                        const user = getUser(guild.id, member.id);

                        // Reset chat streak if fully AFK
                        if (member.voice.selfMute && member.voice.selfDeaf) {
                            user.streak = 0;
                            return;
                        }

                        let xp = 5; // base voice XP per minute
                        if (isDoubleXP()) xp *= 2;

                        user.voiceXP += xp;
                        await checkLevelUp(client, guild, member, user);
                    });
                });
        });

        save();
    }, 60000); // every 1 minute
}

async function checkLevelUp(client, guild, member, user) {

    const totalXP = user.chatXP + user.voiceXP;
    const nextLevel = user.level + 1;

    if (totalXP < xpForLevel(nextLevel)) return;

    user.level++;

    let roleUnlocked = null;

    if (LEVEL_ROLES[user.level]) {
        const roleId = LEVEL_ROLES[user.level];

        // remove previous level roles
        Object.values(LEVEL_ROLES).forEach(async r => {
            if (member.roles.cache.has(r)) {
                await member.roles.remove(r).catch(() => {});
            }
        });

        await member.roles.add(roleId).catch(() => {});
        roleUnlocked = guild.roles.cache.get(roleId);
    }

    const channel = guild.channels.cache.get(LEVEL_UP_CHANNEL);
    if (!channel) return;

    // Visual chat streak display
    const maxStreakDisplay = 5;
    const flames = "🔥".repeat(Math.min(user.streak, maxStreakDisplay));
    const streakText = flames ? `${flames} (${user.streak})` : "None";

    const embed = new EmbedBuilder()
        .setColor(isDoubleXP() ? "#ff9900" : "#00ffaa")
        .setTitle("🦖 LEVEL UP!")
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: "User", value: `${member}`, inline: true },
            { name: "New Level", value: `${user.level}`, inline: true },
            { name: "Unlocked Role", value: roleUnlocked ? roleUnlocked.name : "None", inline: false },
            { name: "💬 Chat XP", value: `${user.chatXP}`, inline: true },
            { name: "🎤 Voice XP", value: `${user.voiceXP}`, inline: true },
            { name: "⭐ Total XP", value: `${totalXP}`, inline: true },
            { name: "🔥 Chat Streak", value: streakText, inline: false }
        )
        .setTimestamp();

    if (isDoubleXP()) {
        embed.addFields({
            name: "🔥 Event",
            value: "Double XP Weekend Active",
            inline: false
        });
    }

    channel.send({ embeds: [embed] });
}

export function getLevels() {
    return db;
}

export function getXPForLevel(level) {
    return xpForLevel(level);
}
