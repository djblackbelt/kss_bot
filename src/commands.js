const logger = require('./logger.js');
const { CommandArgException } = require('./exceptions');

// Welcome to the spaghetti factory

var prefix = "";

module.exports = (bot, _prefix) => {
    bot.prefix = _prefix;
    prefix = _prefix;

    base_group = new CommandGroup();

    bot._addMessagehandler(ctx => {
        if(ctx.content.startsWith(_prefix)) {
            let args = ctx.content.split(' ');
            args[0] = args[0].replace(prefix, ""); // remove the prefix or it fuccs up
            base_group.handle(ctx, args);
        }
    });

    return base_group;
};

function Command(parent, name, opts, func) {
    opts = opts ? opts : {};

    this.name = name;
    this.func = func;

    this.description = opts.description || "";
    this.usage = opts.usage || "";

    this.context = `${parent.context}${name}`;
}

function CommandGroup(parent, name, opts) {
    opts = opts ? opts : {};

    this._children = {};
    this.name = name;

    // Readability 100
    let pre_invoke = opts.pre_invoke ? opts.pre_invoke : ctx => new Promise(resolve => resolve(ctx));
    this.pre_invoke = ctx => parent && parent.pre_invoke ? parent.pre_invoke(ctx).then(() => pre_invoke(ctx)) : pre_invoke(ctx);

    this.on_error = opts.on_error ? opts.on_error : parent ? parent.on_error : err => { throw err; };

    this.description = opts.description || "";

    this.context = parent ? `${parent.context}${name} ` : prefix;
}

CommandGroup.prototype.handle = function(ctx, args) {
    let name = args[0];
    args = args.slice(1);

    if(!name) ctx.channel.send(this.getUsage());

    else if(name in this._children) {
        let child = this._children[name];
        if(child instanceof CommandGroup) child.handle(ctx, args);
        else if((child instanceof Command)) {
            this.pre_invoke(ctx)
            .then(() => {
                if(args.length < child.usage.split(" ").filter(el => el != '').length) throw new CommandArgException();

                return child.func(ctx, args);
            }).catch(err => {
                if (err instanceof CommandArgException) return ctx.channel.send(`\`\`\`${child.context.trim()} ${child.usage}\`\`\``);
                else return this.on_error(ctx, err);
            });
        }
    }
};

CommandGroup.prototype.add = function(name, opts, func) {
    if(name in this._children) {
        logger.error(`Command ${name} is already defined`);
    }
    else {
        let command = new Command(this, name, opts, func);
        this._children[name] = command;

        logger.info(`Added command ${command.context}`);

        return command;
    }
};

CommandGroup.prototype.group = function(name, opts) {
    if(name in this._children) {
        logger.error(`Group ${name} is already defined in ${this.name}`);
    }
    else {
        let group = new CommandGroup(this, name, opts);
        this._children[name] = group;

        logger.info(`Added group ${group.context}`);

        return group;
    }
};

CommandGroup.prototype.getUsage = function() {
    let usage = [];
    for(let name in this._children) {
        let child = this._children[name];
        usage.push(`${child.context.trim()}${child instanceof Command ? ` ` + child.usage : ` - ` + child.description}`);
    }
    return `
        \`\`\`${usage.join('\r\n')}\`\`\`
    `;
};
