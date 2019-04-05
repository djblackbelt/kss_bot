const Discord = require('discord.js');

const db = require('./db.js');
const logger = require('./logger.js');
const commands = require('./commands.js');

module.exports = KSSBot;

function KSSBot(config) {
    this.config = config;
    this.db = null;
    this.log = logger;
    this.client = new Discord.Client();

    this.prefix = "!";

    this.commands = new commands(this.prefix);

    db.connect(this.config)
    .then(db => {
        this.db = db;

        bot.client.login(config.discord_token);
    })
    .catch(err => {
        console.error(`Error initializing bot: ${err}`);
    });

    this.client.on('ready', () => {
        this.guild = this.client.guilds.get(this.config.guild);

        this.client.user.setActivity('hackthebox.eu');

        this.log.info(`Logged in as ${this.client.user.tag} on ${this.guild.name}!`);
    });

    this.client.on('message', ctx => {
        if(ctx.author.id != this.client.user.id && !ctx.guild) this.log.debug(`(${ctx.author.tag}): ${ctx.content}`);
        var args = ctx.content.split(' ');

        if(ctx.content.startsWith(this.prefix)) {
            this.commands.handle(ctx);
        }
    });
}
