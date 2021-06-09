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
  const templateVars = {urls: urlDatabase, currentUser: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});
app.set("view engine", "ejs");
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, currentUser: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
});
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {
    currentUser: users[id],
  };
  //console.log(templateVars);
  res.render("urls_login", templateVars);
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.render("urls_index", {urls: urlDatabase, currentUser: users[req.body.user_id]});
 });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase,  currentUser: req.cookies.user_id};
  res.render("urls_show", templateVars);
});
app.post("/tologin", (req, res) => {
  res.redirect(302,`/login`);
});
app.post("/toregister", (req, res) => {
  res.redirect(302,`/register`);
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
function getID(email) {
  const objKeys = Object.keys(users);
  for (const keys of objKeys) {
    const userKey = users[keys];
    if (userKey.email === email) {
      return userKey.id;
    }
  }
}
app.post("/login", (req, res) => {
  let currentUser = req.body;
  let email = currentUser.email;
  let password = currentUser.password;
  console.log(email, password);
  console.log(users);
  if (!email || !password) {
    return res.status(400).send("Fields can't be empty");
  }
  const user = getID(email);
  console.log(user);
  if (!user) {
    return res.status(403).send("User cannot be found");
  }
  if(users[user].password !== password) {
    return res.status(403).send("password is incorrect");
  }
  let id = users[user].id;
  console.log("this is the id",id);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, currentUser: users[req.cookies.user_id]};
  res.render("urls_register", templateVars);
});



app.post("/register", (req, res) => {
  let body = req.body;
  let userEmail = body.email;
  let userPassword = body.password;
  if (!userEmail || !userPassword) {
    return res.status(400).send("400 error, fields can't be empty");
  } 
  for (let user in users) {
    if (users[user].email === userEmail) {
      return res.status(400).send("400 error, user exists");
    }
  }
  // if (exists(userEmail)) {
  //   return res.status(400).send("400 error, user exists");
  // }
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
