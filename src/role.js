exports.rolef = function(vars){
  var client = vars['client'];

  const tools = require('./tools.js');
  const kssGuild = client.guilds.get("520241835348721684");
  const skrole = kssGuild.roles.find("name", "Script Kiddie");
  const hrole = kssGuild.roles.find("name", "Hacker");
  const newsChannel = kssGuild.channels.find("name", "news");

  var colUsers = vars['db'].collection('users');
  var colFlags = vars['db'].collection('flags');


  function checkPromotion(usr){
    tools.debug(`checking promotion for ${usr.tag}`)
    colUsers.find({"username": usr.username}).toArray(async function(err, res){
      if(res.length != 1) return false;
      if(res[0]["completed"] == undefined){
        colUsers.updateOne({"username": usr.username}, {$set: {completed: 0}}, function(err, res){
          if (err) throw err;
          else console.log(`${usr.username} has had their completed field added.`);
        });
      }
      else if(res[0]["completed"] >= 1){
        //PROMOTE TO SCRIPT KIDDIE
        tools.debug(`user ${usr.tag} has completed at least 1 challenge`);
        await kssGuild.fetchMember(usr)
                  .then(function(value){
                    value.addRole(skrole);
                  });
        console.log(`${usr} has been promoted to Script Kiddie.`)
        newsChannel.send(`${usr} has been promoted to Script Kiddie! Congrats!!`);
      }
      else if(res[0]["completed"] == challengeCount){
        //PROMOTE TO HACKER
        kssGuild.fetchMember(usr)
                  .then(function(value){
                    value.addRole(hrole);
                  });
        console.log(`${usr} has been promoted to Hacker.`);
        newsChannel.send(`${usr} has been promoted to Hacker! Congrats!!`);
      }
    });
  }

  function incrementCompleted(usr){
    var count;
    colUsers.find // NEEDS FINISHING HERE
  }
};