const { clientID, guildID, botKey } = require('./config.json');
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]})

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const commands = [
    new SlashCommandBuilder().setName('muted').setDescription('Checks how long Jordan has been muted for!')
]

const rest = new REST({version: '10'}).setToken(botKey)

rest.put(Routes.applicationCommands(clientID), {body: commands}).then(() => {
    console.log('Commands registered globally.')
}).catch(console.error)

rest.put(Routes.applicationGuildCommands(clientID, guildID), {body: commands}).then(() => {
    console.log('Commands registered locally.')
}).catch(console.error)


//vars
var guildid = '702949768607039529'
var channelid = '703019741010198639'
var userid = '238009545794781184'

var totalTime = 0
var currDeaf = false
//

client.once('ready', () => {
    console.log('Deafen Updates Online.');
    const msgId = client.channels.cache.get(channelid).lastMessageId
    client.channels.cache.get(channelid).messages.fetch(msgId).then((li) => {
       totalTime = parseInt(li.content)
    })
    startTimer()
})

cron.schedule('10 * * * * *', () => {
    client.channels.cache.get(channelid).send(`${totalTime}`)
});

const startTimer = () => {
    setTimeout(() => {
        totalTime += (1 * currDeaf)
        startTimer()
    }, [1000])
}

client.on('voiceStateUpdate', (oldState, newState) => {
    var acMute = (oldState.channelId !== null && newState.channelId !== null)
    if (newState.guild.id === guildid && newState.member.id === userid && acMute) {
        var hour = `${(Math.ceil(totalTime / 3600) - 1) < 10 ? `${(Math.ceil(totalTime / 3600) - 1)}0` : (Math.ceil(totalTime / 3600) - 1) }`
        var minute = `${(Math.ceil(totalTime / 60) - 1) < 10 ? `${(Math.ceil(totalTime / 60) - 1)}0` : (Math.ceil(totalTime / 60) - 1) }`
        var second = `${(Math.ceil(totalTime % 60) - 1) < 10 ? `${(Math.ceil(totalTime % 60) - 1)}0` : (Math.ceil(totalTime % 60) - 1) }`
        client.channels.cache.get(channelid).send(`Jordan has updated his voice state to: ${newState.selfDeaf ? 'Muted' : `UNMUTED!!!!. He is now at ***${hour}:${minute}:${second}*** of muted time.`}`)
        currDeaf = newState.selfDeaf
    }
})

client.on("interactionCreate", async (interaction) => {
    if (interaction.commandName === 'muted') {
        await interaction.deferReply();
        if (interaction.user.id === userid) {
            interaction.editReply({"content": `wouldn't you like to know, weatherboy`})
        } else {
            var hour = `${(Math.ceil(totalTime / 3600) - 1) < 10 ? `${(Math.ceil(totalTime / 3600) - 1)}0` : (Math.ceil(totalTime / 3600) - 1) }`
            var minute = `${(Math.ceil(totalTime / 60) - 1) < 10 ? `${(Math.ceil(totalTime / 60) - 1)}0` : (Math.ceil(totalTime / 60) - 1) }`
            var second = `${(Math.ceil(totalTime % 60) - 1) < 10 ? `${(Math.ceil(totalTime % 60) - 1)}0` : (Math.ceil(totalTime % 60) - 1) }`
            interaction.editReply({"content": `Jordan has been muted for a grand total of: ***${hour}:${minute}:${second}***`})
        }
    }
})

client.login(botKey);