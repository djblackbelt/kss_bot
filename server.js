const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('utils');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var url = "mongodb://localhost:27017/db";
var db;
var colFlags;
var colUsers;
var challengeCount;



function adminCommands(args, msg){
  if(!checkAdmin(msg.author)){
    msg.reply("Nice try ;)"); //IMPLEMENT DYNAMIC FAIL POINT HERE
    return false;
  }
  switch(args[1].toUpperCase()){
  case('FLAG'):
    flagCommands(args, msg);
    break;
  case('DB'):
    dbCommands();
    break;
  case('CREATE'):
    createChallenge(args, msg);
    break;
  case('PERM'):
    permCommands(args, msg);
    break;
  }
  return true;
}

function permCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('ADD'):
    createUser(client.users.get("name", args[3]).idP);
    break;
  case('ADMIN'):
    if(args[3].toUpperCase() == 'ADD') permAdminUserById(args[4]);
  }
}

function permAdminUserByTag(tag, add){
  if(add){
    colUsers.find({"tag": tag}).toArray(function(err, res){
      if(res.length != 1) return false;
      if(res[0]["permission"] === 'A') return false;
      colUsers.updateOne({"tag": tag}, { $set : {"permission" : 'A'}}, function(err, res){
        if (err) return false;
        return true;
      });
    });
  }
}

function flagCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('EDIT'):
    if(args.length != 5) msg.reply("Invalid format, \'!admin flag edit <challenge name> <new flag>\' seeked.");
    else editFlag(args[3], args[4]);
    break;
  }
}

function dbCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('GET'):
    if (args[3].toUpperCase() == 'FLAGS') getFlags(msg);
  }
}

function getFlags(msg){
  colFlags.find({}).toArray(function(err, res){
    msg.reply(res);
  });
}

function checkPromotion(usr){
  colUsers.findOne({"username": usr.username}).toArray(function(err, res){
    if(res.length != 1) return false;
    if(res[0]["completed"] == undefined){
      colUsers.updateOne({"username": usr.username}, {$set: {completed: 0}}, function(err, res){
        if (err) throw err;
        else console.log(`${usr.username} has had their completed field added.`);
      });
    }
    else if(res[0]["completed"] <= 1){
      //PROMOTE TO SCRIPT KIDDIE
    }
    else if(res[0]["completed"] == challengeCount){
      //PROMOTE TO HACKER
    }
  });
}

function incremenetCompleted(usr){
  var count;
  colUsers.find
}

function editFlag(name, newFlag){
  colFlags.updateOne({"name": name}, { $set : {"flag": newFlag}});
}

function flagSub(flag, msg){
  colUsers.find({"id": msg.author.id}).toArray(function(err, res){
    if (res.length == 0) {
      msg.reply("User not found, creating entry...");
      createUser(msg.author.id, msg.author.username, msg.author.tag);
    }
  });
  colFlags.find({"flag": flag}).toArray(function(err, result){
    if (err) throw err;
    console.log(result);
    if (result.length == 0) msg.reply("Flag not found!");
    else if (result[0]["usersCompleted"].includes(msg.author.id)) msg.reply("You have already claimed this flag!");
    else{
      colFlags.updateOne({"flag": flag}, {$push: {usersCompleted : msg.author.id}});
      colUsers.updateOne({"id": msg.author.id}, {$push: {challenges : result[0]["name"]}});
      msg.reply(`Congratulations! You have completed ${result[0]["name"]}!`);

    }
  });
}

function createChallenge(args, msg){
  if(args[2].toUpperCase() === 'FORMAT') {
    msg.reply("Format = !create <challenge name> <author> <difficulty> <category> <flag>")
  }else if(args.length == 7){
    var temp = {
      name: args[2],
      author: args[3],
      diff: args[4],
      cat: args[5],
      flag: args[6],
      usersCompleted: []
    }

    colFlags.insert(temp, function(err, result){
      if(err) throw err;
      else{
        console.log("Flag created successfully!");
        msg.reply("Flag created successfully!");
      }
    });
}else{
  msg.reply("Format not accepted, try !create format");
  console.log("ERROR: Argument length != 7");
}

function permCommand(args, msg){
  console.log(`author number tag = ${msg.author.tag.split("#")[1]}`);
  if(msg.author.tag.split("#")[1] == 9425){
    if(args[1] === 'add'){
      colUsers.find({}, {"id": msg.author.id}).toArray(function(err, result){
        if (err) throw err;
        else if(result.length == 0){
          msg.reply("Entry not found, adding entry");
          console.log("Entry not found, adding entry");
          createUser(msg.author.id, msg.author.username, msg.author.tag);
        }
      });
    }
    else if(args[1] === 'admin'){
      colUsers.find({}, {"id": msg.author.id}).toArray(function(err, result){
        if (err) throw err;
        else{
          if(result["permission"] == 'A' || msg.author.tag.split("#")[1] == 9425){
            colUsers.update({"username": args[2]}, { $set: {permission: 'A'}}, function(err, res){
              if (err) throw err;
              else{
                msg.reply(`Player (${args[2]}) updated.`);
                console.log(`Player (${msg.author.tag}) updated (${args[2]})'s permission to admin.'`);
              }
            });
          }
          else if(result["permission"] != 'A') console.log(`You do not have permission.2`)
        }
      });
    }
  }
  else{
    msg.reply(`Fuck you, ${msg.author.username}.`) // INSERT DYNAMIC FUCK YOU
  }
}

function createUser(id, username, tag){
  var temp = {
    id: id,
    username: username,
    tag: tag,
    challenges: [],
    completed: 0,
    permission: 'Z'
  }
  colUsers.insert(temp, function(err, result){
    if (err) return false;
    else{
      console.log(`User added: ${username}`);
      return true;
    }
  });
}

function checkAdmin(user){
  colUsers.find({"id": user.id}).toArray(function(err, res){
    if(res.length != 1) return false;
    if(res[0]["permission"].includes("A")) return true;
    return false;
  });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  console.log(`MESSAGE (${msg.author.username}): ${msg.content}`)
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
  }
});

MongoClient.connect(url, function(err, cl) {
  if (err) throw err;
  else{
    console.log("Database connection successful!");
    db = cl.db("db");
    colFlags = db.collection('flags');
    colUsers = db.collection('users');
    challengeCount = colFlags.findOne({}).toArray().length;
  }
});

client.login('NTUzNzY4MTQ5NTYwODUyNTAw.D2o-XA.xNCEo51oYjmdd2kjneFg5aAvNuM');
