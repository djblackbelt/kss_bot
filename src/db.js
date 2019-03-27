function dbCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('GET'):
    if (args[3].toUpperCase() == 'FLAGS') getFlags(msg);
    else if(args[3].toUpperCase() === 'USERS') getUsers(msg);
    break;
  }
}

function getUsers(msg){
  colUsers.find({}).toArray(function(err, res){
    let retMsg = ``;
    for(var i = 0; i < res.length; i++){
      retMsg += flagToString(res[i]);
    }
    msg.reply(retMsg);
  });
}

function getFlags(msg){
  colFlags.find({}).toArray(function(err, res){
    let retMsg = ``;
    for(var i = 0; i < res.length; i++){
      retMsg += flagToString(res[i]);
    }
    msg.reply(retMsg);
  });
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
