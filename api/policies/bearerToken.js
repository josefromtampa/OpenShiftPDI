/**
 * Allow any authenticated user.
 */
var passport = require('passport');

module.exports = function (req, res, next) {

    passport.authenticate('token', { session: true },
      function (err, response) {
          if (err) {
              res.serverError({ error: err })
          } else if (!response || !response.success) {
              res.forbidden('Not Authorized')
          } else {
              req.tokenSession = response.session;
              next();
          }
      })(req, res, next);

};
