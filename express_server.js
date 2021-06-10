const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const _ = require("./helper.js")
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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
  let userID = req.params.id;
  if(urlDatabase[userID] === false) {
    return res.status(400).send("You do not have permission to delete URL")
  }
  const miniURL = req.params.shortURL;
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
  const id = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user_id: id, users};
  if(id){
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = {user_id: id, users};
  if(id){
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const miniURL = req.params.shortURL;
  const bigURL = urlDatabase[miniURL].longURL;
  const id = req.cookies['user_id'];
  const templateVars = { shortURL: miniURL, longURL: bigURL, user_id: id, users};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = {user_id: id, users};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = {user_id: id, users};
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const urlID = _.generateRandomString(6);
  const id = req.cookies['user_id'];
  urlDatabase[urlID] = {longURL: req.body.longURL, userID: id };  
  res.redirect(`/urls/${urlID}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies['user_id'];
  const urlId = req.params.shortURL;
  if(id){
    delete urlDatabase[urlId];
  }
  res.redirect(302, "/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const id = req.cookies['user_id'];
  const miniURL = req.params.shortURL;
  const newURL = req.body.new;
  if(id){
    urlDatabase[miniURL].longURL = newURL;
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const body = req.body;
  const userEmail = body.email;
  const userPassword = body.password;
  const user = _.emailFinder(userEmail, users);
  if(!user){
    return res.status(403).send("User does not exists");
  }
  const dbPassword = _.getUserPassword(user, users);
  if(dbPassword !== userPassword){
    return res.status(403).send("Password is incorrect");
  }
  const currentId = _.getUserId(user, users);
  res.cookie('user_id', currentId);
  res.redirect(302, "/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect(302, "/urls");
});

app.post("/register", (req, res) => {
  const body = req.body;
  const userEmail = body.email;
  const userPassword = body.password;
  if(!userEmail || !userPassword){
    return res.status(400).send("400 error, fields cannot be empty");
  }
  const userExists = _.emailFinder(userEmail, users)
  if(userExists){
    return res.status(400).send("400 error, user exists in database");
  }
  const newId = _.generateRandomString(6);
  const newUser = {id: newId, email: userEmail, password:userPassword};
  users[newId] = newUser;
  res.cookie('user_id', newId);
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});