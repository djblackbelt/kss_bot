function rm(args, msg){
  if(args[2].toUpperCase() === 'FLAG'){
    if(args.length != 4) msg.reply('Invalid format. Try \'!admin rm flag format\'');
    else{
      if (args[3].toUpperCase() === 'FORMAT') msg.reply('rm Format: \'!admin rm flag <flag name:format>\'');
      else rmFlag(args[3], msg);
    }
  }
  else if(args[2].toUpperCase() === 'DUP'){
    if(args.length == 4 && args[3].toUpperCase() === 'FORMAT') msg.reply('rm dup Format: \'!admin rm dup <flag name> <flag index>\'');
    else if(args.length != 5) msg.reply('Invalid format. Try \'!admin rm dup format\'');
    else rmDupFlag(args[3], args[4], msg);
  }
  else if(args[2].toUpperCase() === 'CMPL'){
    if(args.length == 4 && args[3].toUpperCase() === 'FORMAT') msg.reply('rm cmpl Format: \'!admin rm cmpl <username> <challenge name>\'');
    else if(args.length != 5) msg.reply('Invalid format. Try \'!admin rm cmpl format\'');
    else rmCmpl(args[3], args[4], msg);
  }
  else if(args[2].toUpperCase() === 'USER'){
    if(args.length == 4 && args[3].toUpperCase() === 'FORMAT') msg.reply('rm user Format: \'!admin rm user <username>\'');
    else if(args.length != 4) msg.reply('Invalid format. Try \'!admin rm user format\'');
    else rmUser()
  }
}

function rmDupFlag(flagName, index, msg){
  colFlags.find({name: flagName}).toArray(function(err, res){
    if(res.length == 0) msg.reply(`No flags found with name (${flagName})`);
    else if(res.length == 1) rmFlag(flagName, msg);
    else{
      colFlags.remove({name: flagName, _id: res[index]["_id"]}, function(err, obj){
        if (err) console.log('ERROR: rm dup threw an error');
        else console.log(`LOG: Flag (${flagName}:${index}) has been removed by (${msg.author.tag})`);
      });
    }
  });
}

function rmFlag(flagName, msg){
  colFlags.find({name: flagName}).toArray(function(err, res){
    if(res.length == 0) msg.reply(`No flag named (${flagName}) could be found!`);
    else if(res.length >= 2) rmListDupes(res, msg);
    else{
      colFlags.remove({name: flagName}, function(err, obj){
        if (err) console.log('ERROR: rm threw an error');
        else console.log(`LOG: Flag named (${flagName}) removed by (${msg.author.tag})!`);
      });
    }
  });
}

function rmListDupes(res, msg){
  let out = ``;
  for (var i = 0; i < res.length; i++){
    out += `${i})
    name = ${res[i]["name"]}
    author = ${res[i]["author"]}
    flag = ${res[i]["flag"]}\n`;
  }
  msg.reply(`Duplicates flags found with the name (${res[0]["name"]}), do !admin rm dupe ${res[0]["name"]} <flag number>\n${out}`);
}
