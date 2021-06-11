/**
 * 
 * @param {id of current user} id 
 * @param {Data base containing URLS} urlDatabase 
 * @returns An array of all the keys to your URLS
 */
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
/**
 * 
 * @param {current user email} email 
 * @param {Database containing all user information} users 
 * @returns The id of the user if they are found, else returns undefined
 */
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
/**
 * 
 * @param {how long the string should be} length 
 * @returns 
 */
const generateRandomString = function(length) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
/**
 * 
 * @param {userID} user 
 * @param {Database containing user information} users 
 * @returns password of the current user
 */
const getUserPassword = function(user, users) {
  return users[user].password;
};
/**
 * 
 * @param {userID} user 
 * @param {Database containing user information} users 
 * @returns the id number of the user
 */
const getUserId = function(user,users) {
  return users[user].id;
};
/**
 * 
 * @param {generated request} req 
 * @returns shortURL
 */
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