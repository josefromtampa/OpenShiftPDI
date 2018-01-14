/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var userAuth = require('../lib/handlers/UserAuth.js'),
  passport = require('passport');

module.exports = {

  login: function (req, res, next) {
    try {
      passport.authenticate('admin',
        function (err, response, info) {

          if (err || !response) {
            return res.forbidden({success: false, message: err || 'Login Failed'});
          }

          res.json({
            access_token: response.token,
            success: true,
            user: response.user,
            expiry: response.expiry
          });

        })(req, res, next);

    } catch (e) {
      sails.log.error('AuthService.user.handler.login() Exception - ' + e.message);
      res.serverError({success: false, message: e.message});
    }
  },
  logout: userAuth.logout

};
