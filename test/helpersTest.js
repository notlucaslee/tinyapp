const expect = require('chai').expect;

const {
  generateRandomString,
  isEmailAvailable,
  logUserIn,
  bcrypt
} = require('../helpers.js');

const testUsers = {
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

describe('generateRandomString', () => {

  it('generate a six letter string', () => {
    const id = generateRandomString();
    expect(id.length).to.equal(6);
  });

  it('generates only chars', () => {
    const id = generateRandomString();
    expect(typeof id).to.equal('string');
  });

});

describe('isEmailAvailable', () => {

  it('returns false if email taken', () => {
    expect(isEmailAvailable('user@example.com', testUsers)).to.equal(false);
  });

  it('returns true if email available', () => {
    expect(isEmailAvailable('user3@example.com', testUsers)).to.equal(true);
  });

});

describe('logUserIn', () => {

  //must encrypt password in testUser object to get function to work
  const hashedPass = bcrypt.hashSync('purple-monkey-dinosaur', 10);
  testUsers["userRandomID"].password = hashedPass;

  it('returns user object if email and pw are valid', ()=> {
    expect(logUserIn('user@example.com', 'purple-monkey-dinosaur', testUsers)).to.deep.equal({
      id: "userRandomID",
      email: "user@example.com",
      password: hashedPass
    });
  });

  it('returns null if email is wrong', () => {
    expect(logUserIn('user3@example.com', 'purple-monkey-dinosaur', testUsers)).to.deep.equal(null);
  });

  it('returns null if password is wrong', () => {
    expect(logUserIn('user@example.com', 'purplemonkeydinosaur', testUsers)).to.deep.equal(null);
  });

});
