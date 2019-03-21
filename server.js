const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('utils')

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var url = "mongodb://localhost:27017/db";
var db;
var colFlags;
var colUsers;



function adminCommands(args, msg){
  switch(args[1].toUpperCase()){
  case("flag"):
    flagCommands(args, msg);
    break;
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
  colUsers.find({}, {"id": msg.author.id}).toArray(function(err, result){
    if (err) throw err;
    else{
      if (result[0]["permission"] == 'A'){
        // ADMIN PERMISSIONED COMMANDS
        if(args[1].toUpperCase() === 'FORMAT') {
          msg.reply("Format = !create <challenge name> <author> <difficulty> <category> <flag>")
        }else if(args.length == 6){
          var temp = {
            name: args[1],
            author: args[2],
            diff: args[3],
            cat: args[4],
            flag: args[5],
            usersCompleted: []
          }

          colFlags.insert(temp, function(err, result){
            if(err) throw err;
            else{
              console.log("Flag created successfully!");
              msg.reply("Flag created successfully!");
            }
          });
        }
      }
      else{
        msg.reply('Permission not authorized');
      }
    }
  });
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
          if(result["permission"] != 'A') console.log(`You do not have permission.2`)
        }
      });
    }
  }
  else{
    msg.reply(`Fuck you, ${msg.author.username}.`)
  }
}

function createUser(id, username, tag){
  var temp = {
    id: id,
    username: username,
    tag: tag,
    challenges: [],
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
    case("!create"):
      createChallenge(args, msg);
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
  }
});

client.login('NTUzNzY4MTQ5NTYwODUyNTAw.D2o-XA.xNCEo51oYjmdd2kjneFg5aAvNuM');
