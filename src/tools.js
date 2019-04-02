exports.tools = function(vars){
  exports.userToString = function(user){
    var returnStr = `{
      id = ${user["id"]}
      username = ${user["username"]}
      tag = ${user["tag"]}
      challenges = ${user["challenges"]}
      completed = ${user["completed"]}
      permission = ${user["permission"]}
    }`
    return returnStr;
  }

  function flagToString(flg){
    var returnStr = `{
      name = ${flg["name"]}
      author = ${flg["author"]}
      difficulty = ${flg["diff"]}
      category = ${flg["cat"]}
      flag = ${flg["flag"]}
      Users Completed = ${flg["usersCompleted"]}
    }\n`;
    return returnStr;
  }

  exports.debug = function(msg){
    console.log(`DEBUG: ${msg}`);
  }
  return this;
}
