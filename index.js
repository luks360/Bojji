const Discord = require("discord.js")
const { MessageActionRow, MessageButton } = require('discord.js');
require('dotenv').config()
// const translate = require("@iamtraction/google-translate");

// const generateImage = require("./generateImage")

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
    ],
});

module.exports = client

client.on('interactionCreate', (interaction) => {

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return interaction.reply(`Error`);

        interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction)

    }
})

const exampleEmbed = {
    color: 0x0099ff,
    title: 'Nos ajude a crescer',
    description: 'A cada 12 horas você pode votar no servidor [clicando aqui](https://top.gg/servers/941875483669331990) para nos ajudar a atrair mais pessoas ao sevidor, você tambem pode avaliar o servidor nesse mesmo link'

};

client.on("ready", () => {
    console.log(`🔥 Estou online em ${client.user.username}!`)

    setInterval(async () => {
        const memberCount = (await client.guilds.cache.get("941875483669331990").members.fetch()).filter(members => !members.bot).size
        let msg = `👥・Já somos ${memberCount} geekers! #600`
        client.user.setActivity(
            `${msg}`, {
            type: Discord.ActivityType.Playing
            }
        )
    }, 60000 * 5);
})

async function translate(lang, text) {

    if (text == "") {
            return ":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!"
    }

    var translation = await fetch("https://api.openai.com/v1/chat/completions", {

        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.CHATGPT_TOKEN,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", //Modelo
            messages: [{"role": "user", "content": `${lang} "${text}"`}], // Texto da pergunta
            max_tokens: 2000,
            temperature: 1
        }),
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.choices[0].text != ''){
                return `${data.choices[0].message.content}`
            }
            else {
                return ":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!"
            }
        })
        .catch((error) => {
            console.log(error)
            return ":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!"
        });
    
    return translation.replace(/\n/g, "")
}

client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.partial) {
        try {
            await reaction.fetch()
        } catch (error) {
            console.error('Alguma coisa está errada quando tento puxar a reação!')
            return
        }
    }

    if(reaction.emoji.name === "🇧🇷") {

        const trad = await translate("traduza para portugues:", reaction.message.content)

        if (reaction.message.content != trad) {
            reaction.message.reply(
                "\nOriginal: " + reaction.message.content +
                "\nTradução: " + trad +
                `\n<@${ user.id }>`
            );
        }
    }

    if(reaction.emoji.name === "🇺🇸") {

        const trad = await translate("traduza para inglês:", reaction.message.content)

        if (reaction.message.content != trad) {
            reaction.message.reply(
                "\nOriginal: " + reaction.message.content +
                "\nTranslation: " + trad +
                `\n<@${ user.id }>`
            );
        }
    }
})

count = 1
const id = "941875484420083715"

client.on("messageCreate", message => {
    if (count == 250) {
        message.guild.channels.cache.get(id).send({ embeds: [exampleEmbed] })
        count = 0
    }
    else if (message.channelId == id) {
        count++
    }
})

const divulEmbed = {
    color: 0xff0000,
    title: 'Regras para divulgar',
    description: '- Não divulgue conteudo ou redes sociais +18\n- Não divulgue convites de outros servidores\n- Divulgue apenas uma rede social por mensagem e um link por mensagem\n- Não divulgue links fakes, enganosos ou perigosos\n- Não divulgue coisas do tipo: "baixe esse app e use meu codigo [...]"\n\nOBS: a Staff irá punir qualquer coisa que considerar errada, mesmo se não estiver nas regras.'

};

countd = 0
idd = '980138920861892638'

client.on("messageCreate", message => {
    if (countd == 2) {
        message.guild.channels.cache.get(idd).send({ embeds: [divulEmbed] })
        countd = 0
    }
    else if (message.channelId == idd) {
        countd++
    }
})

client.on("messageCreate", message => {

    if (message.author.bot) return
    if (!message.content.startsWith(config.prefix+"botao")) return
    if (message.member.permissions.has("ADMINISTRATOR") != true) return message.channel.send(`${message.author} Você precisa ter permissão de administrador para executar esse comando`) 
    const commandBody = message.content.slice(config.prefix.length);
    if (commandBody.includes(" ") == false) {
        return message.channel.send(`${message.author} você precisa passar algum parametro ao usar esse comando`)
    }
    const args = commandBody.split(' ')
    const command = args.shift().toLowerCase()  
    var text = ""

    for(i = 2; i < args.length; i++){
        if(i == args.length - 1)
            text += args[i]
        else
            text += args[i] + " "
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel(text)
                .setURL(args[1])
                .setStyle('LINK'),
        );

        message.guild.channels.cache.get(args[0]).send({ components: [row] });
})

client.on("messageCreate", async message => {

    if (message.author.bot) return
    if (!message.content.startsWith(config.prefix+"cobrar")) return
    if (message.member.permissions.has("ADMINISTRATOR") != true) return message.channel.send(`${message.author} Você precisa ter permissão de administrador para executar esse comando`) 
    const commandBody = message.content.slice(config.prefix.length);
    if (commandBody.includes(" ") == false) {
        return message.channel.send(`${message.author} você precisa passar algum parametro ao usar esse comando`)
    }
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase()

    var cobrarEmbed = {
        color: 0x1099ff,
        title: `Parabens <:ShibeBlushy:948959105349976095>`,
        description: `Você acaba de adquirir o ${args[1]}, ele vai durar até ${args[2]}, então aproveite bem ele e não se esqueça de renovar para manter seus privilegios`
    }

    message.guild.channels.cache.get("953371343779418124").send({content: args[0], embeds: [cobrarEmbed]})

})

client.on("messageCreate", async message => {
    if (message.author.bot) return
    if(message.content.toLowerCase().includes("oi bojji") == true)
        message.reply(':wave_tone1:')
})


client.on("messageCreate", async message => {
    if (message.author.bot) return

    reactions = ["<:PaimonShock:943360802214281256>","<:facepalm:945050303408013443>","<:kannafacepalm:943360799731224668>","<:demonslayernezuko3:943360798846234674>","<:lumithonk:943360802289754172>"]

    const random = Math.floor(Math.random() * (reactions.length - 1)) + 1;
    const reaction = reactions[random]

    if (message.content.toLowerCase().includes("bojji impostor") == true || message.content.toLowerCase().includes("bojji sus") == true)
        message.reply(reaction)
})

client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.login(process.env.TOKEN)