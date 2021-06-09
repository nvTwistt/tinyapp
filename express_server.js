const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies.username};
  res.render("urls_new", templateVars);
});
app.set("view engine", "ejs");
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
});
app.get("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.render("urls_index", {urls: urlDatabase, username: req.body.username});
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.render("urls_index", {urls: urlDatabase, username: req.body.username});
 });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase,  username: req.cookies.username};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302,`/urls/:${shortURL}`);
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;  
}
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let sURL = req.params.shortURL;
  let cleanURL = sURL.replace(':', "");
  const longURL = urlDatabase[cleanURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
  res.redirect(302, "/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  let redirectURL = req.params.shortURL;
  res.redirect(302, `/urls/${redirectURL}`);
})

app.post("/urls/:shortURL/submit", (req, res) => {
  let id = req.params.shortURL;
  let newURL = req.body.newURL;
  urlDatabase[id] = newURL;
  res.redirect(302, "/urls");
})

app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username};
  res.render("urls_register", templateVars);
});
