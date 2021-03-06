const { assert } = require('chai');

const { emailFinder } = require('../helper.js');

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

describe('emailFinder', function() {
  it('should return a user with valid email', function() {
    const user = emailFinder("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});
describe('emailFinder', function() {
    it('should return a user with valid email', function() {
      const user = emailFinder("user@example.com", testUsers)
      const expectedOutput = "userRandomID";
      // Write your assert statement here
      assert.strictEqual(user, expectedOutput);
    });
});
describe('emailFiner', function() {
    it('should return undefined', function() {
      const user = getUserByEmail("", testUsers)
      const expectedOutput = undefined;
      // Write your assert statement here
      assert.strictEqual(user, expectedOutput);
    });
  });