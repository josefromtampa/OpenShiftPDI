/**
 * Allow any authenticated user.
 */
var passport = require('passport');

module.exports = function (req, res, next) {
  passport.authenticate('token', {
      session: true
    },
    function (err, response) {
      //console.log('isAdmin', err, response)
      if (err) {
        return res.serverError({success: false, message: err});
      } else if (!response
        || !response.success
        || !response.session.user.active
        || 'admin' != response.session.user.role) {
        return res.forbidden({success: false, message: 'Not Authorized'});
      }
      req.tokenSession = response.session;
      next();
    }
  )(req, res, next);

};
