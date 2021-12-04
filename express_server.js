const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  generateRandomString,
  isEmailAvailable,
  logUserIn,
  urlsForUser
} = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.get("/register", (req, res) => {
  res.render("register_page", { userID: req.session.user_id });
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      status: "unsuccessful",
      message: "email and password must not be blank"
    });
  }

  if (!isEmailAvailable(req.body.email, users)) {
    res.status(400).json({
      status: "unsuccessful",
      message: "email already taken"
    });
  }
  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPass
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = logUserIn(req.body.email, req.body.password, users);
  if (!user) {
    res.status(403).json({
      status: "unsuccessful",
      message: "invalid credentials"
    });
  } else {
    req.session.user_id = user.id;
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login_page", { userID: req.session.user_id });
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", { userID: req.session.user_id });
  } else {
    res.render("no_user", { userID: req.session.user_id });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const shortLink = generateRandomString();
  urlDatabase[shortLink] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render("no_user", { userID: req.session.user_id });
  } else {
    let urlObject = urlsForUser(req.session.user_id, urlDatabase);
    const templateVars = {
      title: 'My URLs',
      urls: urlObject,
      userID: req.session.user_id,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    userID: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const link = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(link);
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id]["userID"]) {
    urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.user_id};
  } else {
    console.log('permission denied');
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
  } else {
    console.log("permission denied");
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

