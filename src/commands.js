const logger = require('./logger.js');

module.exports = Commands;

function Commands(prefix) {
    this.prefix = prefix;
    this.commands = {
        "help": (args, ctx) => {
            ctx.channel.send(`Commands: [${Object.keys(this.commands).join(', ')}]`);
        }
    };
}

Commands.prototype.handle = function(msg) {
    let args = msg.content.split(' ');
    let command = args[0].replace(this.prefix, "");

    if(command in this.commands) {
        this.commands[command](args.slice(1), msg);
    }
};

// Probably a better way to do this but it works so fucc me
Commands.prototype.add = function(name, command) {
    if(name in this.commands) {
        logger.error(`Command ${name} is already defined`);
    }
    else {
        this.commands[name] = command;
        logger.info(`Added command ${name}`);
    }
};
