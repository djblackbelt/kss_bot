const Discord = require('discord.js');

const KSSBot = require('./src/bot.js');
const { UserException } = require('./src/exceptions');

const config = require("./config.json");

bot = new KSSBot(config);

// Add commands
// Goddamn decorators would make this so much nicer
bot.commands.add(
    'ping',
    (args, ctx) => {
        ctx.reply('pong');
    }
);

bot.commands.add(
    'flag',
    (args, ctx) => {
        if(!args[0]) return ctx.reply(`Usage: ${bot.prefix}flag <flag>`);

        let user = null;

        bot.db.getUser(ctx.author)
        .then(_user => {
            user = _user; // gross
            return bot.db.getChallengebyFlag(solve=args[0]);
        })
        .then((challenge) => {
            if(!challenge) throw new UserException("This is not a valid flag.");
            else if(user.completed_challenges.includes(challenge.id)) throw new UserException("You have already claimed this flag!");

            return bot.db.solveChallenge(user, challenge);
        })
        .then(challenge => {
            bot.client.channels.find('name', 'bot_dump').send(`${user.tag} has completed ${challenge.name}`);
            ctx.channel.send(`Congratulations! You have completed ${challenge.name}!`);
            bot.client.channels.find('id', 563857408363986954).send(`${user.tag} has completed challenge ${challenge.name}`);
        })
        .catch(err => {
            if(err instanceof UserException) {
                ctx.reply(err.message);
            }
            else {
                bot.log.error(err);
                ctx.channel.send('An error occured, please notify an admin');

            }
        });
    }
);

// This is sorta gross but if it works it works
// Possibly implement a separate admin commands prefix?
bot.commands.add(
    'admin',
    (args, ctx) => {
        bot.db.checkAdmin(ctx.author)
        .then(isAdmin => {
            if(!isAdmin) throw new UserException("Username is not in the sudoers file. This incident will be reported");
        })
        .then(() => {
            if(args[0] == "challenge") {
                if(args[1] == "list") {
                    return bot.db.getChallenges()
                    .then(challenges => {
                        _resp = ["\`\`\`ALL CHALLENGES\`\`\`"]; // big ass fucker title to newline the whole thing
                        challenges.forEach(c => {
                            _resp.push(`\`${c._id} | ${c.name} | ${c.author.tag || `<@${c.author.id}>`} | ${c.difficulty} | ${c.category}\``);
                        });

                        ctx.channel.send(_resp.join('\r\n'));
                    });
                }
                if(args[1] == "create") {
                    args = args.slice(2);
                    if(args.length !== 5) throw new UserException(`Usage: ${bot.prefix}admin challenge create <challenge name> <author id> <difficulty> <category> <flag>`);

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
                else if(args[1] == "delete") {
                    if(args.length !== 3) throw new UserException(`Usage: ${bot.prefix}admin challenge delete <uuid>`);

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
                else throw new UserException(`Usage: ${bot.prefix}admin challenge [list, create, delete]`);
            }
            else if(args[0] == "user") {
                if(args[1] == "get") {
                    // Not sure if listing all users from the db is a good idea
                    // perhaps pull data for users by id or something
                }
            }
            else if(args[0] == "role") {
                // Manage the roles through the database
                // Then we dont have to restart the bot when we add stuff
            }
            else throw new UserException(`Usage: ${bot.prefix}admin [challenge ${Array(5).join(', <not implemented>')}]`); // not implemented kek
        })
        .catch(err => {
            if(err instanceof UserException) {
                ctx.channel.send(err.message);
            }
            else {
                bot.log.error(err);
                ctx.channel.send('An error occured, please notify an admin');
            }
        });
    }
);
