const GetMyURL = function (id,urlDatabase) {
  const keys = Object.keys(urlDatabase);
  let returnArray = [];
  for(const key of keys){
    const shortURL = urlDatabase[key];
    if (shortURL.userID === id){
      returnArray.push(key);
    }
  }
  return returnArray;
}

const emailFinder = function (email, users){
  const keys = Object.keys(users);
  for(const key of keys){
    const user = users[key];
    if (user.email === email){
      return user.id;
    }
  }
  return undefined;
}

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;  
}

function getUserPassword(user, users){
  return users[user].password
}

function getUserId(user,users){
  return users[user].id;
}

function fetchShortUrl(req) {
  return req.params.shortURL;
}

function fetchSessionId(req) {
  return req.session.user_id;
}

function fetchIdFromDatabase(urlDatabase, url) {
  return urlDatabase[url].userID;
}

function userDataExtraction(req) {
  const body = req.body;
  const userEmail = body.email;
  const userPassword = body.password;
  return {email: userEmail, password: userPassword};
}

module.exports = 
  {GetMyURL, 
    emailFinder,
    generateRandomString, 
    getUserPassword, 
    getUserId,
    fetchShortUrl,
    fetchSessionId,
    fetchIdFromDatabase,
    userDataExtraction
  }  