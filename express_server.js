const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const _ = require("./helper.js");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret key'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
/*
get request that redirects users to /urls 
*/
app.get("/", (req, res) => {
  res.redirect(302,'/urls');
});
/**
 *  get request for when any user enters in /u/:shortURL
 *  They will be redirected to the long url
 */
app.get("/u/:shortURL", (req, res) => {
  const miniURL = _.fetchShortUrl(req);
  if (urlDatabase[miniURL]) {
    const longURL = urlDatabase[miniURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(404).send("URL does not exist, please use a valid URL.");
  }
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/**
 * Get request for /urls page.
 * If the user is authenticated, if will render urls_index
 * else it will promp the user to login.
 */
app.get("/urls", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = { urls: urlDatabase, myUserId: id, users};
  if (id) {
    res.render("urls_index", templateVars);
  } else {
    return res.status(404).send("Cannot access page, please login.");
  }
});
/**
 * Get request ofr /urls/new
 * checks if the user is authentiated, if they are, it will render the urls_new page
 * else if will send the user to the login page
 */
app.get("/urls/new", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = {myUserId: id, users};
  if (id) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

/**
 * Get request for /urls/:shortURL
 * It will find out if the user is authenticated, if the user is authenticated, it will show 
 * all the urls and will show them their tiny urls
 * else, it will return you do not have permission to edit the url
 */
app.get("/urls/:shortURL", (req, res) => {
  const miniURL = _.fetchShortUrl(req);
  let bigURL;
  if (urlDatabase[miniURL]) {
    bigURL = urlDatabase[miniURL].longURL;
  } else {
    return res.status(404).send("Please enter a valid tiny URL.");
  }
  
  const id = _.fetchSessionId(req);
  const dbUserID = _.fetchIdFromDatabase(urlDatabase, miniURL);
  const templateVars = { shortURL: miniURL, longURL: bigURL, myUserId: id, users};
  if (id === dbUserID) {
    res.render("urls_show", templateVars);
  } else {
    return res.status(404).send("You don't have permission to edit the URL");
  }
  
});

/**
 * Get request for /register
 * it will get their id from the session and render the registration page
 */
app.get("/register", (req, res) => {
  const id = _.fetchSessionId(req);
  if (id) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {myUserId: id, users};
    res.render("urls_register", templateVars);
  }
});
/**
 * get request for /login
 * It will get the session id and redirect the user to the login page. 
 */
app.get("/login", (req, res) => {
  const id = _.fetchSessionId(req);
  if (id) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {myUserId: id, users};
    res.render("urls_login", templateVars);
  }
});

/**
 * Post request for /urls
 * 
 * It will check if the user is authenticated and then will allow them to add information into
 * the data base, else it will prompt the user to login.
 */
app.post("/urls", (req, res) => {
  const urlID = _.generateRandomString(6);
  const id = _.fetchSessionId(req);
  if(id) {
    urlDatabase[urlID] = {longURL: req.body.longURL, userID: id };
    res.redirect(`/urls/${urlID}`);
  } else {
    res.status(400).send("Please login");
  }
});
/**
 * Post request for /urls/:shortURL/delete
 * 
 * It will see if the users id matches the id of the creator of the url
 * If there is a match, it will allow the user to delete their URL else it will
 * display a message to the user. 
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = _.fetchSessionId(req);
  const miniURL = _.fetchShortUrl(req);
  const dbUserID = _.fetchIdFromDatabase(urlDatabase, miniURL);
  if (id === dbUserID) {
    delete urlDatabase[miniURL];
  } else {
    return res.status(400).send("You don't have permission to delete this url");
  }
  res.redirect(302, "/urls");
});

/**
 * Post request for /urls/:shortURL/update
 * 
 * It will see if the users id matches the id of the creator of the url
 * If there is a match, it will allow the user to update their URL else it will
 * display a message to the user. 
 */
app.post("/urls/:shortURL/update", (req, res) => {
  const id = _.fetchSessionId(req);
  const miniURL = _.fetchShortUrl(req);
  const newURL = req.body.new;
  const dbUserID = _.fetchIdFromDatabase(urlDatabase, miniURL);
  if (id === dbUserID) {
    urlDatabase[miniURL].longURL = newURL;
  } else {
    return res.status(404).send("You don't have permission to edit the URL");
  }
  res.redirect("/urls");
});

/**
 * Post request for /login
 * It will get the information of the user and ensure that all the fields are filled out correctly
 * If will then check for if the user exists in the data base and return an error message if they don't exist
 * Finally, if will get their password from the database and compare it to the enetered password
 *  If the passwords match, the user will be authenticated and redirect them to the main page.
 */
app.post("/login", (req, res) => {
  const userData = _.userDataExtraction(req);
  const user = _.emailFinder(userData.email, users);
  if (!userData.password || !userData.email) {
    return res.status(404).send("must fill out required fields");
  }
  if (!user) {
    return res.status(403).send("User does not exists");
  }
  const dbPassword = _.getUserPassword(user, users);
  if (!bcrypt.compareSync(userData.password, dbPassword)) {
    return res.status(403).send("Password is incorrect");
  }
  const currentId = _.getUserId(user, users);
  req.session.myUserId = currentId;
  res.redirect(302, "/urls");
});
/**
 * Post request for logout
 * This clears the cookie session and redirects the user to the main page which will
 *  redirect the user to the login page. 
 */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/login");
});
/**
 * Post request for /register/
 * If will ensure that all the user data is filled in appropriately
 * then it will check if the user exists in the data base, if the user exists, it will return an error message
 * 
 * It will encrupy the passwords and store the user information in the data base
 * Sets the session cookie and redirects the user to the main page.
 */
app.post("/register", (req, res) => {
  const userData = _.userDataExtraction(req);
  if (!userData.email || !userData.password) {
    return res.status(400).send("400 error, fields cannot be empty");
  }
  const userExists = _.emailFinder(userData.email, users);
  if (userExists) {
    return res.status(400).send("400 error, user exists in database");
  }
  const newId = _.generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(userData.password, 10);
  const newUser = {id: newId, email: userData.email, password:hashedPassword};
  users[newId] = newUser;
  req.session.myUserId = newId;
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});