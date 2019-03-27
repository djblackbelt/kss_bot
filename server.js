const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('utils');

// const helpf = require('./src/help.js');
// const adminf = require('./src/admin.js');
// const dbf = require('./src/db.js');
// const flagf = require('./src/flag.js');
// const guildf = require('./src/guildf.js');
// const permf = require('./src/perm.js');
// const rmf = require('./src/rm.js');
// const rolef = require('./src/role.js');
// const testf = require('./src/testing.js');
// const tools = require('./stc/tools.js');

const rootTag = 'DeeJay#9425'

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var url = "mongodb://localhost:27017/db";
var db;
var colFlags;
var colUsers;
var challengeCount;
var kssGuild;
var skrole;
var hrole;
var newsChannel;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  kssGuild = client.guilds.get("520241835348721684");
  skrole = kssGuild.roles.find("name", "Script Kiddie");
  hrole = kssGuild.roles.find("name", "Hacker");
  newsChannel = kssGuild.channels.find("name", "news");
});

client.on('message', msg => {
  if(msg.author.username != 'KSS Bot') console.log(`(${msg.author.username}): ${msg.content}`)
  var args = msg.content.split(' ');
  switch(args[0]){
    case("!ping"):
      msg.reply('pong');
      break;
    case("!flag"):
      flagSub(args[1], msg);
      break;
    case("!admin"):
      adminCommands(args, msg);
      break;
    case("!perm"):
      permCommand(args, msg);
      break;
    case("$dj"):
      rootCommands(args, msg);
      break;
  }
});


MongoClient.connect(url, function(err, cl) {
  if (err) throw err;
  else{
    console.log("Database connection successful!");
    db = cl.db("db");
    colFlags = db.collection('flags');
    colUsers = db.collection('users');
    challengeCount = colFlags.find({}).toArray().length;
  }
});

//KSS BOT
client.login('NTUzNzY4MTQ5NTYwODUyNTAw.D2o-XA.xNCEo51oYjmdd2kjneFg5aAvNuM');

//KSS TEST
//client.login('NTYwMjM3MDk1NTg3Njc2MTcx.D3xEIw.89XmY8hr8eQRmSd11zWSFM-sPn8');
