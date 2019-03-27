function tempCommands(args, msg){
  switch(args[2].toUpperCase()){
  case('GUILDS'):
    getGuilds(msg);
    break;
  case('PROMOTE'):
    testPromote(msg);
    break;
  case('1'):
    test1(msg);
    break;
  }
}

function test1(msg){
  let channel = kssGuild.channels.find('name', 'news')
  channel.send('Test')
  debug('test1 executed')
}

async function testPromote(msg){
  var member;
  await kssGuild.fetchMember(msg.author)
            .then(function(value){
              member = value;
              debug(`value = ${value}`)
            });
  member.addRole(hrole);
}
