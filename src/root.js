exports.rootf = function(vars){
  const rolef = require('./role.js').rolef(vars);
  const dbf = require('./db.js').dbf(vars);

  const rootTag = "DeeJay#9425"

  let client = vars['client'];

  function rootCommands(args, msg){
    if(msg.author.tag != rootTag){
      console.log('NAH BISH');
    }else{
      switch(args[1].toUpperCase()){
      case('ADD'):
        rolef.createUser(msg.author.id, msg.author.username, msg.author.tag);
        break;
      }
    }
  }
  return this;
}
