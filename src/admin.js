exports.adminf = function(vars){
  const tools = require('./tools.js').tools();
  const flagf = require('./flag.js').flagf(vars);
  const dbf = require('./db.js').dbf(vars);
  const rmf = require('./rm.js').rmf(vars);
  const rolef = require('./role.js').rolef(vars);
  const testf = require('./testing.js');

  const colFlags = vars['db'].collection('flags');
  const colUsers = vars['db'].collection('users');

  async function adminCommands(args, msg){
    await checkAdmin(msg.author, function(perm){
      if(!perm){
        msg.reply("Nice try ;)"); //IMPLEMENT DYNAMIC FAIL POINT HERE
        console.log(`User (${msg.author.username}) does not have admin privlege.`);
        return false;
      }
      // WORK NEEDS DONE HERE, CONDITION AND STANDARDIZE INPUTS
      switch(args[1].toUpperCase()){
      case('FLAG'):
        flagf.flagCommands(args, msg);
        break;
      case('DB'):
        dbf.dbCommands(args, msg);
        break;
      case('CREATE'):
        flagf.createChallenge(args, msg);
        break;
      case('PERM'):
        rolef.permCommands(args, msg);
        break;
      case('RM'):
        rmf.rm(args, msg);
        break;
      case('TEMP'):
        testf.testCommands(args, msg);
        break;
      default:

      }
    });
    return true;
  }

  function checkAdmin(user, cb){
    colUsers.find({"id": user.id}).toArray(function(err, res){
      var perm = false;
      if(res.length != 1);
      else if(res[0]["permission"].includes("A")){
        perm = true;
      }
      cb(perm);
    });
  }
}
