const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "123456": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "987654": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/register", (req, res) => {
  res.render("register_page");
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
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("userID", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login_page");
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { userID: req.cookies["userID"] });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    title: 'My URLs',
    urls: urlDatabase,
    userID: req.cookies["userID"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies["userID"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

