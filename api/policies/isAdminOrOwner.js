/**
 * Allow admin or params.id == user.id
 */
var passport = require('passport');

module.exports = function (req, res, next) {
  passport.authenticate('token', {
      session: true
    },
    function (err, response) {
      if (err) {
        return res.serverError({success: false, message: err});
      } else if (!response
        || !response.success
        || !response.session.user.active
        || ('admin' != response.session.user.role && req.params.id != response.session.user.id)) {
        return res.forbidden({success: false, message: 'Not Authorized'});
      }
      req.tokenSession = response.session;
      next();
    }
  )(req, res, next);

};
