const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = function() {
  let letterCount = 0;
  let randString = "";
  while (letterCount < 6) {
    if (Math.random() > 0.5) {
      randString += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } else {
      randString += String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    letterCount++;
  }
  return randString;
};

const isEmailAvailable = function(newEmail) {
  for (let user in users) {
    if (users[user]["email"] === newEmail) {
      return false;
    }
  }
  return true;
};

const logUserIn = function(email, password) {
  for (let user in users) {
    if (users[user]["email"] === email && bcrypt.compareSync(password, users[user]["password"])) {
      return users[user];
    }
  }
  return null;
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "987654" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "987654" },
  "RzwGPJ": { longURL: 'https://theuselessweb.com/', userID: '123456' }
};

const urlsForUser = function(id) {
  let resultObject = {};
  for (let link in urlDatabase) {
    if (id === urlDatabase[link]["userID"]) {
      resultObject[link] = urlDatabase[link]["longURL"];
    }
  }
  return resultObject;
};

const users = {

};

app.get("/register", (req, res) => {
  res.render("register_page", { userID: req.cookies["userID"] });
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      status: "unsuccessful",
      message: "email and password must not be blank"
    });
  }

  if (!isEmailAvailable(req.body.email)) {
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
  console.log(users)
  res.cookie("userID", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login_page", { userID: req.cookies["userID"] });
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["userID"]) {
    res.render("urls_new", { userID: req.cookies["userID"] });
  } else {
    res.render("no_user", { userID: req.cookies["userID"] });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const shortLink = generateRandomString();
  urlDatabase[shortLink] = {
    longURL: req.body.longURL,
    userID: req.cookies["userID"]
  };
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.cookies["userID"]) {
    res.render("no_user", { userID: req.cookies["userID"] });
  } else {
    let urlObject = urlsForUser(req.cookies["userID"]);
    const templateVars = {
      title: 'My URLs',
      urls: urlObject,
      userID: req.cookies["userID"],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    userID: req.cookies["userID"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const link = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(link);
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["userID"] === urlDatabase[req.params.id]["userID"]) {
  urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.cookies["userID"]}
  } else {
    console.log('permission denied');
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["userID"] === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
  } else {
    console.log("permission denied");
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = logUserIn(req.body.email, req.body.password);
  if (!user) {
    res.status(403).json({
      status: "unsuccessful",
      message: "invalid credentials"
    });
  } else {
  res.cookie('userID', user.id);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

