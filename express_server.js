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

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;  
}

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});
app.set("view engine", "ejs");
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
});
app.get("/login", (req, res) => {
  console.log("cookies", req.cookies);
  const id = req.cookies.user_id;
  const templateVars = {
    userName: users[id],
  };
  console.log(templateVars);
  res.render("user_login", templateVars);
  //res.cookie("username", req.body.username);
  //res.render("urls_index", {urls: urlDatabase, username: req.body.username});
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.render("urls_index", {urls: urlDatabase, username: users[req.body.user_id]});
 });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase,  username: req.cookies.user_id};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(5);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302,`/urls/:${shortURL}`);
});


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
  res.cookie('username', req.body.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies.user_id]};
  res.render("urls_register", templateVars);
});



app.post("/register", (req, res) => {
  let body = req.body;
  let userEmail = body.email;
  let userPassword = body.password;
  let userID = generateRandomString(10);
  res.cookie('user_id', userID);
  let newUser = {
    id: userID,
    email: userEmail,
    password: userPassword
  }
  users[userID] = newUser;
  console.log(users)
  res.redirect('/urls');
})
// app.get("/register/submit", (req, res) => {
//   // let id = req.params.shortURL;
//   // let newURL = req.body.newURL;
//   console.log(req);
//   // urlDatabase[id] = newURL;
//   // res.redirect(302, "/urls");
// })
