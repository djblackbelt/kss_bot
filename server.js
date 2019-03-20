const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('utils')

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var url = "mongodb://localhost:27017/db";
var db;
var colFlags;
var colUsers;

function flagSub(flag, msg){
  colFlags.find({"flag": flag}).toArray(function(err, result){
    if (err) throw err;
    console.log(result);
    if (result.length == 0) msg.reply("Flag not found!");
    else{
      console.log("Flag found...");
      //colFlags.updateOne({"flag": flag}, {$push: {usersCompleted : msg.author.id}})
      //colUsers.updateOne({""})
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
          var temp = {
            id: msg.author.id,
            username: msg.author.username,
            tag: msg.author.tag,
            challenges: [],
            permission: 'Z'
          }
          colUsers.insert(temp, function(err, result){
            if (err) throw err;
            else{
              msg.reply(`User added ${msg.author.tag}`)
              console.log(`User added ${msg.author.tag}`);
            }
          });
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
                msg.reply(`Player (${args[2]})updated.`);
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
