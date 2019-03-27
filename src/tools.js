function userToString(user){
  var returnStr = `{
    id = ${user["id"]}
    username = ${user["username"]}
    tag = ${user["tag"]}
    challenges = ${user["challenges"]}
    completed = ${user["completed"]}
    permission = ${user["permission"]}
  }`
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

function debug(msg){
  console.log(`DEBUG: ${msg}`);
}
