const logger = require('./logger.js');

// Welcome to the spaghetti factory

var prefix = "";

module.exports = (bot, _prefix) => {
    base_group = new CommandGroup();

    prefix = _prefix;

    bot._addMessagehandler(ctx => {
        if(ctx.content.startsWith(_prefix)) {
            let args = ctx.content.split(' ');
            args[0] = args[0].replace(prefix, ""); // remove the prefix or it fuccs up
            base_group.handle(ctx, args);
        }
    });

    return base_group;
};

function Command(name, func, description="", usage="") {
    this.name = name;
    this.func = func;
    this.description = description;
    this.usage = usage;
    this.parent = null;
}

Command.prototype.getTrace = function() {
    return [...this.parent && this.parent.name ? this.parent.getTrace() : [], ...[this.name]];
};

Command.prototype.getTraceString = function() {
    return this.getTrace().join(' ');
};

Command.prototype.getUsage = function() {
    return `${prefix}${this.getTraceString()} ${this.usage}`;
}

CommandGroup.prototype = Object.create(Command.prototype)

function CommandGroup(name, pre_invoke, on_error, description) {
    this.name = name;
    this.pre_invoke = pre_invoke ? pre_invoke : () => new Promise(resolve => resolve());
    this.on_error = on_error;
    this._commands = {};
}

CommandGroup.prototype.handle = function(ctx, args) {
    let command = args[0];

    if(!command) ctx.channel.send(`\`\`\`${this.getUsage().join('\r\n')}\`\`\``);

    else if(command in this._commands) {
        if(this._commands[command] instanceof CommandGroup) this._commands[command].handle(ctx, args.slice(1));
        else if((this._commands[command] instanceof Command)) {
            this.pre_invoke(ctx)
            .then(() => {
                return this._commands[command].func(ctx, args.slice(1));
            }).catch(err => {
                return this.on_error(ctx, err);
            });
        }
    }
};

CommandGroup.prototype.add = function(name, func, description="", usage="") {
    if(name in this._commands) {
        logger.error(`Command ${name} is already defined`);
    }
    else {
        let command = new Command(name, func, description=description, usage=usage);
        command.parent = this;
        this._commands[name] = command;
        logger.info(`Added command ${prefix}${command.getTraceString()}`);
    }
};

CommandGroup.prototype.group = function(name, pre_invoke=null, on_error=null, description="") {
    if(name in this._commands) {
        logger.error(`Group ${name} is already defined in ${this.name}`);
    }
    else {
        let group = new CommandGroup(name, pre_invoke=pre_invoke, on_error=on_error, description=description);
        group.parent = this;
        this._commands[name] = group;

        logger.info(`Added group ${group.getTraceString()}`);

        return group;
    }
};

CommandGroup.prototype.getUsage = function() {
    let usage = [];
    for(let name in this._commands) {
        let command = this._commands[name];
        usage.push(command.getUsage());
    };
    return usage;
}
