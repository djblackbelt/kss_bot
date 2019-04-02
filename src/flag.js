exports.flagf = function(vars){
  const tools = require('./tools.js').tools();
  colFlags = vars['db'].collection('flags');
  colUsers = vars['db'].collection('users');


  function flagCommands(args, msg){
    switch(args[2].toUpperCase()){
    case('EDIT'):
      if(args.length != 5) msg.reply("Invalid format, \'!admin flag edit <challenge name> <new flag>\' seeked.");
      else editFlag(args[3], args[4]);
      break;
    }
  }

  function incrementCompleted(usr){
    vars['chalCount'] = vars['chalCount'] + 1;
    var count;
    colUsers.find
  }

  function editFlag(name, newFlag){
    colFlags.updateOne({"name": name}, { $set : {"flag": newFlag}});
  } //

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
      checkPromotion(msg.author);
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
  }
}
