/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var passwordhash = require('password-hash-and-salt');
var Promise = require('bluebird');
var extend = require('extend');
var MongoFactory = require('../lib/factories/MongoFactory.js');

module.exports = {

    attributes: {

        type: {
            type: 'string',
            defaultsTo: 'user',
            required: true
        },

        role: {
            type: 'string',
            defaultsTo: 'agent',
            required: true
        },

        username: {
            type: 'string',
            unique: true,
            required: true,
            primaryKey: true
        },

        password: {
            type: 'string',
            required: true
        },

        email: {
            type: 'string'
        },

        firstName: {
            type: 'string'
        },

        lastName: {
            type: 'string'
        },

        companies: {
            type: 'array'
        },

        active: {
            type: 'boolean',
            defaultsTo: true
        },

        validation: {
            type: 'json'
        },

        toJSON: function() {
          var user = this.toObject()
          delete user.password
          return user
        }

    },

    class: function(type, role, username, password, email){

        this.type = type || 'user';
        this.role = role || 'agent';
        this.username = username || '';
        this.password = password || '';
        this.email = email || '';
        this.firstName = '';
        this.lastName = '';
        this.companies = [];
        this.active = true;

    },

    validateUser: function (username, password) {

        return Promise.try(function () {

            sails.log.info('User.validateUser() Validating user ' + username);

            // check session
            return User.findOne({ username: username, active: true }).then(function (user) {

                // check for error
                if (user == undefined || user == null) {
                    sails.log.warn('User.validateUser() No user found');
                    return Promise.resolve({ success: false, message: 'Invalid login' });
                } else {

                    sails.log.info('Found user');
                    return new Promise(function (resolve, reject) {
                        try {
                            passwordhash(password).verifyAgainst(user.password, function (error, verified) {

                                try {
                                    if (error || !verified) {
                                        sails.log.warn('User.validateUser() Vaildation failed ');
                                        resolve({ success: false, message: 'Invalid login' });
                                    } else {

                                        if (user && user.password) {
                                            // remove password from user obj
                                            delete user.password;
                                        }// if

                                        sails.log.info('User.validateUser() User ' + username + ' is valid');
                                        resolve({ success: true, user: user, message: 'Valid user' });
                                    }// if-else

                                } catch (e) {
                                    sails.log.error('Password verificatin failed ' + e.message);
                                    reject(e);
                                }
                            });
                        } catch (e) {
                            sails.log.error('User.validateUser() Exception - ' + e.message);
                            reject(e);
                        }
                    });
                }// if-else


            }, function (e) {
                sails.log.error('User.FindOne() Error - ' + e);
            });




        });
    }

};

// extend with mongofactory
extend(false, module.exports, MongoFactory);


