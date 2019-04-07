const Discord = require('discord.js');

const KSSBot = require('./src/bot.js');
const Commands = require('./src/commands.js');
const { UserException } = require('./src/exceptions');

const config = require("./config.json");

bot = new KSSBot(config);

// ========================================
// COMMANDS
// ========================================

commands = Commands(bot, "!");

// Add commands
// Goddamn decorators would make this so much nicer
commands.add(
    'help',
    {
        description: "show help"
    },
    (ctx) => {
        ctx.reply(commands.getUsage());
    }
);

commands.add(
    'ping',
    {},
    (ctx) => {
        ctx.reply('pong');
    }
);

commands.add(
    'flag',
    {
        description: "submit a challenge flag",
        usage: "<flag>"
    },
    (ctx, args) => {
        if(!args[0]) return ctx.reply(`Usage: ${bot.prefix}flag <flag>`);

        bot.db.getUser(ctx.author)
        .then(user => {
            return bot.db.getChallengebyFlag(solve=args[0])
            .then((challenge) => {
                if(!challenge) throw new UserException("This is not a valid flag.");
                else if(user.completed_challenges.includes(challenge._id.toString())) throw new UserException("You have already claimed this flag!");

                return bot.db.solveChallenge(user, challenge);
            })
            .then(challenge => {
                ctx.channel.send(`Congratulations! You have completed ${challenge.name}!`);
                bot.client.channels.find(x => x.id == "563857408363986954").send(`<@${user.id}> has completed challenge ${challenge.name} (${user.completed_challenges.length + 1} total)`);
            });
        })
        .catch(err => {
            if(err instanceof UserException) {
                ctx.reply(err.message);
            }
            else {
                bot.log.error(err.stack);
                ctx.channel.send('An error occured, please notify an admin');

            }
        });
    },
);

admin = commands.group(
    'admin',
    {
        description: "admin commands",
        pre_invoke: ctx => {
            return bot.db.checkAdmin(ctx.author)
            .then(isAdmin => {
                if(!isAdmin) throw new UserException("Username is not in the sudoers file. This incident will be reported");
            });
        },
        on_error: (ctx, err) => {
            if(err instanceof UserException) {
                ctx.channel.send(err.message);
            }
            else {
                bot.log.error(err.stack);
                ctx.channel.send('An error occured, please notify an admin');
            }
        }
    }
);

// ========================================
// CHALLENGE COMMANDS
// ========================================

challenge = admin.group(
    'challenge',
    {
        description: "challenge commands"
    }
);

challenge.add(
    'list',
    {
        description: "list challenges"
    },
    ctx => {
        return bot.db.getChallenges()
        .then(challenges => {
            _resp = ["\`\`\`ALL CHALLENGES\`\`\`"]; // big ass fucker title to newline the whole thing
            challenges.forEach(c => {
                _resp.push(`\`${c._id} | ${c.name} | ${c.author.tag || `<@${c.author.id}>`} | ${c.difficulty} | ${c.category}\``);
            });

            ctx.channel.send(_resp.join('\r\n'));
        });
    }
);

challenge.add(
    'create',
    {
        description: "add challenge",
        usage: "<challenge name> <author id> <difficulty> <category> <flag>"
    },
    (ctx, args) => {
        return bot.db.createChallenge({
            name: args[0],
            author: ctx.mentions.length ? {
                id: ctx.mentions[0].id,
                tag: ctx.mentions[0].tag,
                avatar: ctx.mentions[0].avatar
            } : {
                tag: args[1]
            },
            difficulty: args[2],
            category: args[3],
            flag: args[4]
        })
        .then(challenge => {
            ctx.channel.send(`Successfully added challenge ${challenge.name}`);
        });
    }
);

challenge.add(
    'delete',
    {
        description: "delete challenge",
        usage: "<uuid>"
    },
    (ctx, args) => {
        return bot.db.getChallenge({_id: args[2]})
        .then(challenge => {
            if(!challenge) throw new UserException('That challenge does not exist');

            return ctx.channel.send(`Are you sure you want to delete the challenge ${challenge.name}?\r\n\r\n(yes/no)`);
        })
        .then(() => {
            return ctx.channel.awaitMessages(res => ["yes", "no"].includes(res.content), { max: 1, time: 30000, errors: ['time', 'max'] });
        })
        .then(res => {
            if(res.first().content === "yes") {
                return bot.db.deleteChallenge({_id: args[2]})
                .then(challenge => {
                    ctx.channel.send(`Successfully deleted challenge ${challenge.name}`);
                });
            }
        });
    }
);
