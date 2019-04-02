const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('utils');

const adminIn = require('./src/admin.js');
const flagIn = require('./src/flag.js');
const permIn = require('./src/perm.js');
const rootIn = require('./src/root.js');
const tools = require('./src/tools.js').tools();

const rootTag = 'DeeJay#9425';

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/db";
var vars;
var db;
var challengeCount;
// var colFlags;
// var colUsers;
// var kssGuild;
// var skrole;
// var hrole;
// var newsChannel;


function getVars(){
  return vars;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // kssGuild = client.guilds.get("520241835348721684");
  // skrole = kssGuild.roles.find("name", "Script Kiddie");
  // hrole = kssGuild.roles.find("name", "Hacker");
  // newsChannel = kssGuild.channels.find("name", "news");
  vars = {
    db: db,
    client: client,
    chalCount: challengeCount
  };
  var flagf = flagIn.flagf(vars);
  var adminf = adminIn.adminf(vars);
  var permf = permIn.permf(vars);
  var rootf = rootIn.rootf(vars);
  console.log(`Variables declared.`);
});

client.on('message', msg => {
  if(msg.author.username != 'KSS Bot') console.log(`(${msg.author.username}): ${msg.content}`)
  var args = msg.content.split(' ');
  switch(args[0]){
    case("!ping"):
      msg.reply('pong');
      break;
    case("!flag"):
      flagf.flagSub(args[1], msg);
      break;
    case("!admin"):
      adminf.adminCommands(args, msg);
      break;
    // case("!perm"):
    //   permf.permCommand(args, msg);
    //   break;
    case("$dj"):
      tools.debug('$dj called');
      rootf.rootCommands(args, msg);
      break;
  }
});


MongoClient.connect(url, function(err, cl) {
  if (err) throw err;
  else{
    console.log("Database connection successful!");
    db = cl.db("db");
    challengeCount = db.collection('users').find({}).toArray().length;
  }
});

//KSS BOT
client.login('NTUzNzY4MTQ5NTYwODUyNTAw.D2o-XA.xNCEo51oYjmdd2kjneFg5aAvNuM');

//KSS TEST
//client.login('NTYwMjM3MDk1NTg3Njc2MTcx.D3xEIw.89XmY8hr8eQRmSd11zWSFM-sPn8');
