const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const _ = require("./helper.js")
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret key'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
}

app.get("/", (req, res) => {
  res.redirect(302,'/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const miniURL = _.fetchShortUrl(req);
  const longURL = urlDatabase[miniURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = { urls: urlDatabase, user_id: id, users};
  if(id){
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = {user_id: id, users};
  if(id){
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const miniURL = _.fetchShortUrl(req);
  const bigURL = urlDatabase[miniURL].longURL;
  const id = _.fetchSessionId(req);
  const templateVars = { shortURL: miniURL, longURL: bigURL, user_id: id, users};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = {user_id: id, users};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const id = _.fetchSessionId(req);
  const templateVars = {user_id: id, users};
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const urlID = _.generateRandomString(6);
  const id = _.fetchSessionId(req);
  urlDatabase[urlID] = {longURL: req.body.longURL, userID: id };  
  res.redirect(`/urls/${urlID}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = _.fetchSessionId(req);
  const miniURL = _.fetchShortUrl(req);
  const dbUserID = _.fetchIdFromDatabase(urlDatabase, miniURL);
  if(id === dbUserID){
    delete urlDatabase[miniURL];
  } else {
    return res.status(400).send("You don't have permission to delete this url");
  }
  res.redirect(302, "/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const id = _.fetchSessionId(req);
  const miniURL = _.fetchShortUrl(req);
  const newURL = req.body.new;
  const dbUserID = _.fetchIdFromDatabase(urlDatabase, miniURL);
  if(id === dbUserID){
    urlDatabase[miniURL].longURL = newURL;
  } else {
    return res.status(404).send("You don't have permission to edit the URL");
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userData = _.userDataExtraction(req);
  const user = _.emailFinder(userData.email, users);
  if (!user){
    return res.status(403).send("User does not exists");
  }
  const dbPassword = _.getUserPassword(user, users);
  if (!bcrypt.compareSync(userData.password, dbPassword)){
    return res.status(403).send("Password is incorrect");
  }
  if (!userData.password || !userData.email) {
    return res.status(404).send("must fill out required fields");
  }
  const currentId = _.getUserId(user, users);
  req.session.user_id = currentId;
  res.redirect(302, "/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/urls");
});

app.post("/register", (req, res) => {
  const userData = _.userDataExtraction(req);
  if(!userData.email || !userData.password){
    return res.status(400).send("400 error, fields cannot be empty");
  }
  const userExists = _.emailFinder(userData.email, users)
  if(userExists){
    return res.status(400).send("400 error, user exists in database");
  }
  const newId = _.generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(userData.password, 10);
  const newUser = {id: newId, email: userData.email, password:hashedPassword};
  users[newId] = newUser;
  req.session.user_id = newId;
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});