import { Client, Intents,Guild,Role,GuildMember } from 'discord.js';
const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS], partials: ["CHANNEL"] });
client.login(process.env.TOKEN);

const start=async()=>{
    try {
        const newClient=await client.login(process.env.TOKEN);
        console.log(newClient);
    } catch (error) {
        console.log(error);
    }
}
export {client,start}