const bcrypt = require('bcrypt');

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

const isEmailAvailable = function(newEmail, users) {
  for (let user in users) {
    if (users[user]["email"] === newEmail) {
      return false;
    }
  }
  return true;
};

const logUserIn = function(email, password, users) {
  for (let user in users) {
    if (users[user]["email"] === email && bcrypt.compareSync(password, users[user]["password"])) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let resultObject = {};
  for (let link in urlDatabase) {
    if (id === urlDatabase[link]["userID"]) {
      resultObject[link] = urlDatabase[link]["longURL"];
    }
  }
  return resultObject;
};

module.exports = {
  generateRandomString,
  isEmailAvailable,
  logUserIn,
  urlsForUser,
  bcrypt
};