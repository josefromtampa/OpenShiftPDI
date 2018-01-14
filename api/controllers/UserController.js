var _ = require("lodash"),
  MongoFactory = require("../lib/factories/MongoFactory"),
  Hash = require('password-hash-and-salt'),
  Promise = require("bluebird"),
  UserCtrl = require("../lib/factories/User")

module.exports = UserCtrl
