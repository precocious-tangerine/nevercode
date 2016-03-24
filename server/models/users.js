'use strict';
const Promise = require('bluebird');
let mongoose = require('mongoose');
let bcrypt = Promise.promisifyAll(require('bcrypt'));
let Snippets = Promise.promisifyAll(require('./snippets.js'));

let userSchema = mongoose.Schema({
  _password: { type: String },
  _createdAt: { type: Date, default: new Date() },
  _updatedAt: { type: Date, default: new Date() },
  github: {type: String},
  avatar_url: { type: String },
  username: { type: String },
  email: { type: String, required: true, unique: true, dropDups: true },
  theme: { type: String, default: 'eclipse' },
  selectedSnippet: { type: String }
});

let User = mongoose.model('User', userSchema);

User.makeUser = (userObj, callback) => {
  let pw = userObj._password;
  // email based login
  if (typeof pw === 'string' && pw !== '') {
    return bcrypt.genSaltAsync(13)
      .then((salt) => bcrypt.hashAsync(pw, salt))
      .then((hash) => {
        userObj._password = hash;
        return Snippets.makeRootFolderAsync(userObj.email, userObj.username);
      })
      .then((success) => {
        return User.create(userObj);
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  } else if (typeof userObj.id === 'number') {
    // OAuth based login (no supplied password)
    return User.create(userObj)
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  } else {
    callback(new Error('must login via github or local session'), null);
  }
};

User.getUser = (email, callback) => {
  return User.findOne({ email: email })
    .then((userObj) => {
      userObj = userObj.toObject();
      callback(null, userObj);
    })
    .catch(callback);
};

User.updateUser = (email, newProps, callback) => {
  newProps._updatedAt = new Date();
  User.update({ email }, newProps, { multi: false }, callback);
};

User.removeUser = (email, callback) => {
  User.findOne({ email }).remove(callback);
};

User.checkCredentials = (email, attempt, callback) => {
  // TODO password verification
  let userData = {};
  return User.findOne({ email: email })
    .then((foundUser) => {
      if (foundUser) {
        userData = foundUser.toObject();
        return bcrypt.compareAsync(attempt, foundUser._password)
          .then((success) => {
            if (success) {
              delete userData._password;
              callback(null, userData);
            } else {
              callback(new Error('Incorrect Password'), null);
            }
          }).catch(callback);
      } else {
        callback(new Error('Email not found'), null);
      }
    });
};

module.exports = User;
