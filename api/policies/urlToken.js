/**
 * Allow any authenticated user.
 */

module.exports = function (req, res, next) {

    try {

        var accessToken = (req.params.access_token || req.query.access_token);
        
        // validate token
        Session.validateSession(accessToken).then(function (results) {

            if (results.success) {
                req.tokenSession = results.session;
                return next();
            } else {

                sails.log.warn('Access token ' + req.params.access_token + ' invalid');
                return res.forbidden({ message: 'Not authorized' });
            }// if-else
        }, function (e) {
            return res.serverError({ error: e });
        });


    } catch (e) {
        return res.serverError({ error: e.message });
    }// try-catch

};