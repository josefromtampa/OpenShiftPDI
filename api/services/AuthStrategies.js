
/*
    Name: auth.js
    Description: This module manages local authentication strategies for users and api clients.
*/

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy

passport.serializeUser(function (session, done) {

    // use token for unique identifier
    done(null, session.token);
});

passport.deserializeUser(function (token, done) {

    // find session by token
    Session.findOne({ token: token, active: true })
        .exec(function (e, doc) {
            done(e, doc);
        });

});

// local user authentication handler
passport.use('user', new LocalStrategy(
  function (username, password, done) {

      try {

          sails.log.debug('AuthStrategies.js - Authenticating user strategy for ' + username + ' password: ' + password);

          // authenticate user at salesforce
          User.validateUser(username, password)
            .then(function (results) {

                if (results.success) {

                    sails.log.debug('AuthStrategies.js - Access authenticated for ' + username);
                    
                    Session.clean(results.user.id || results.user._id)
                        .then(function () {
                            // initailize a new session
                            Session.grant(results.user.role, results.user).then(function (session) {

                                sails.log.debug('AuthStrategies.js - Access granted for user stratgy for ' + username);
                                // return session
                                return done(null, session);

                            }, function (e) {
                                sails.log.debug('AuthStrategies.js - Access NOT granted for user stratgy for ' + username);
                                return done(null, false);
                            });
                        }, function (e) {

                            sails.log.debug('AuthStrategies.js - Faied to clean old sessions for ' + username);
                            return done(null, false);
                        });
                } else {
                    sails.log.debug('AuthStrategies.js - Access authentication failed for ' + username);
                    return done(null, false);
                }// if-else


            }, function (e) {
                return done(e);
            });


      } catch (e) {
          sails.log.error('AuthStrategies.js LocalStrategy authenticate exception for "user" - ' + e.message);
          return done(e.message);
      }// try-catch
  }
));

// local user authentication handler
passport.use('admin', new LocalStrategy(
    function (username, password, done) {

        try {

            sails.log.debug('AuthStrategies.js - Authenticating user strategy for ' + username + ' password: ' + password);

            // authenticate user at salesforce
            User.validateUser(username, password)
              .then(function (results) {

                if (!results || !results.success) {
                    sails.log.debug('AuthStrategies.js - Access authentication failed for ' + username);
                    return done(null, false);
                }
                if ('admin' !== results.user.role) {
                    return done(null, false);
                }

                Session
                  .expireUserSessions(results.user.id || results.user._id)
                  .then(function () {
                      return Session.grant(results.user.role, results.user);
                  })
                  .then(function (session) {
                      sails.log.debug('AuthStrategies.js - Access granted for user strategy for ' + username);
                      return done(null, session);
                  })
                  .catch(function (err) {
                      sails.log.debug('AuthStrategies.js - Access NOT granted for user strategy for ' + username);
                      sails.log.debug(err)
                      return done(null, false);
                  });

              }, function (e) {
                  return done(e);
              });

        } catch (e) {
            sails.log.error('AuthStrategies.js LocalStrategy authenticate exception for "user" - ' + e.message);
            return done(e.message);
        }
    }
));

passport.use('token', new BearerStrategy(
  function (token, done) {
      try {
          sails.log.info('AuthStrategies.js - Authenticating token strategy')
          Session
            .validateSession(token)
            .then(function (response) {
                done(null, response)
            })
            .catch(function (err) {
                done(err)
            })
      } catch (e) {
          sails.log.error('LocalStrategy authenticate exception for "token" - ' + e.message)
          return done(e.message)
      }
  }
));




