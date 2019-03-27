function permCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('ADD'):
    var targ = client.users.get("name", args[3]);
    debug(targ);
    createUser(targ.id, targ.usersname, targ.tag);
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
