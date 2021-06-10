const GetMyURL = function(id,urlDatabase) {
  const keys = Object.keys(urlDatabase);
  let returnArray = [];
  for (const key of keys) {
    const shortURL = urlDatabase[key];
    if (shortURL.userID === id) {
      returnArray.push(key);
    }
  }
  return returnArray;
};

const emailFinder = function(email, users) {
  const keys = Object.keys(users);
  for (const key of keys) {
    const user = users[key];
    if (user.email === email) {
      return user.id;
    }
  }
  return undefined;
};

const generateRandomString = function(length) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const getUserPassword = function(user, users) {
  return users[user].password;
};

const getUserId = function(user,users) {
  return users[user].id;
};

const fetchShortUrl = function(req) {
  return req.params.shortURL;
};

const fetchSessionId = function(req) {
  return req.session.myUserId;
};

const fetchIdFromDatabase = function(urlDatabase, url) {
  return urlDatabase[url].userID;
};

const userDataExtraction = function(req) {
  const body = req.body;
  const userEmail = body.email;
  const userPassword = body.password;
  return {email: userEmail, password: userPassword};
};

module.exports =
  {
    GetMyURL,
    emailFinder,
    generateRandomString,
    getUserPassword,
    getUserId,
    fetchShortUrl,
    fetchSessionId,
    fetchIdFromDatabase,
    userDataExtraction
  };