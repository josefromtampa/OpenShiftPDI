/**
* Session.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Promise = require('bluebird');
var uuid = require('uuid');

module.exports = {

  attributes: {
      user: {
          type: 'json',
          required: true
      },
      type: {
          type: 'string',
          required: true
      },
      token: {
          type: 'string',
          required: true
      },
      expiry: {
          type: 'datetime'
      },
      active: {
          type: 'boolean',
          required: true
      }
  },

  validateSession: function (token, type) {

      return Promise.try(function () {

          sails.log.info('Session.validateSession() Validating session =>' + token);

          var param = {
              token: token,
              active: true
          };

          if (type) {
              param.type = type;
          }// if

          // check session
          return Session.findOne(param).then(function (doc) {

              // check for error
              if (doc == undefined || doc == null) {
                  sails.log.warn('Session.validateSession() Session is not valid');
                  return Promise.resolve({ success: false, session: null, message: 'Session is invalid' });
              } else {

                  // check if session is expired
                  var now = new Date();
                  var expired = doc.expiry < now;

                  if (expired) {
                      sails.log.warn('Session.validateSession() Session ' + token + ' is expired');
                      Session.update({ token: token }, { active: false });

                      return Promise.resolve({ success: false, session: null, message: 'Session is expired' });
                  } else {
                      sails.log.info('Session.validateSession() Session ' + token + ' is valid');

                      // extend session
                      Session.extend(token);

                      return Promise.resolve({ success: true, session: doc, message: 'Valid session' });
                  }// if-else

              }// if-else

          });

      });
  },

  expire: function (token, remove) {

      return Promise.try(function () {


          if (remove) {

              sails.log.info('Session.expire() Destroying session ' + token);

              // destroy session
              return Session.destroy({ token: token })
                        .then(function (doc) {

                            return Promise.resolve({ success: true, message: 'Session destroyed', session: null });

                        }, function (e) {
                            
                            sails.log.error('Session.expireSession() Exception destroying session - ' + e);
                            return Promise.reject(e);
                       
                        });

          } else {

              sails.log.info('Session.expire() Expiring session ' + token);

              // set active flag to false
              return Session.update({ token: token }, { active: false })
                        .then(function (results) {

                            if (results) {

                                return Promise.resolve({ success: true, message: 'Session expired', session: (results && results.length > 0 ? results[0] : null) });
                                
                            } else {
                                sails.log.error('Session.expireSession() Exception expiring session - ' + JSON.stringify(e));
                                return Promise.reject(e);
                            }// if-else

                        });
          }// if-else


      });

  },

  expireUserSessions: function(id){

      sails.log.info('Session.expireUserSessions() Destroying session for ' + id);

      return Promise.try(function () {

          // expire any existing tokens by user
          return Session.destroy({ "user.id": id })
            .then(function () {
                sails.log.info('User sessions cleard for ' + id);
                return Promise.resolve(true);
            }, function (e) {

                sails.log.error('Session.expireUserSessions() Failed - ' + e);
                return Promise.reject('Unable to expire user sessions');
            });
      });


  },

  grant: function (type, user) {


      return Promise.try(function () {

          sails.log.debug('Session.grant() Granting access to ' + JSON.stringify(user));
          
          // generate new token
          var token = uuid.v4();
          var expiry = new Date();
          expiry.setDate(expiry.getDate() + 10);

          var session = {
              user: user,
              token: token,
              type: type,
              expiry: expiry,
              active: true
          };

          // create
          return Session.create(session)
                    .then(function (results) {

                        return Promise.resolve(session);
                    });

      }, function (e) {
          sails.log.error('unable to clear sessions ' + e);
      });


  },

  extend: function (session) {


      return Promise.try(function () {

          sails.log.debug('Session.extend() Extending ' + session);

          var expiry = new Date();
          expiry.setDate(expiry.getDate() + 1);
          
          // create
          return Session.update({ token: session, active: true }, { expiry: expiry  })
                    .then(function (results) {

                        return Promise.resolve(session);
                    });

      }, function (e) {
          sails.log.error('unable to extend session ' + e);
      });


  },

  

  clean: function (id) {

      return Promise.try(function () {

          sails.log.info('Session.clean() Clearing all expired sessions');

          var now = new Date();
          var filter = {
              $or: [{
                  active: false
              },
                {
                    expiry: { $lt: now }
                }]
          };

          if (id) {
              filter["user.id"] = id;
          }// if


          // destroy session
          return Session.destroy(filter).then(function (e) {

            return Promise.resolve({ success: true, message: 'Sessions cleaned', session: null });

          });
      });

  }



};

