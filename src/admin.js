async function adminCommands(args, msg){
  await checkAdmin(msg.author, function(perm){
    if(!perm){
      msg.reply("Nice try ;)"); //IMPLEMENT DYNAMIC FAIL POINT HERE
      console.log(`User (${msg.author.username}) does not have admin privlege.`);
      return false;
    }
    switch(args[1].toUpperCase()){
    case('FLAG'):
      flagCommands(args, msg);
      break;
    case('DB'):
      dbCommands(args, msg);
      break;
    case('CREATE'):
      createChallenge(args, msg);
      break;
    case('PERM'):
      permCommands(args, msg);
      break;
    case('RM'):
      rm(args, msg);
      break;
    case('TEMP'):
      tempCommands(args, msg);
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
