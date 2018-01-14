/*
    Name: UserAuth.js
    Description: This module contains http handlers for user authentication
*/

var passport = require('passport');

module.exports = {

    login: function (req, res, next) {

        try {
            passport.authenticate('user',
                    function (err, session, info) {

                        // check if authentication succeeded
                        if (err) {
                            res.serverError({ error: err });
                        } else {
                            if (session) {
                                res.jsonp({
                                    access_token: session.token,
                                    success: true,
                                    user: session.user,
                                    expiry: session.expiry                                    
                                });
                            } else {
                                res.forbidden({
                                    success: false,
                                    message: 'Login Failed'
                                });
                            }// if-else
                        }// if-else

                    })(req, res, next);
        } catch (e) {
            sails.log.error('AuthService.user.handler.login() Exception - ' + e.message);
            res.serverError({ error: e.message });
        }// try-catch
    },


    logout: function (req, res) {

        try {
            // get user object
            var token = (req.params.access_token || req.query.access_token);

            sails.log.info('UserAuth.logout() Expiring session ' + token);

            // deactivate session
            Session.expire(token, true).then(function (results) {

                try {
                    if (results && results.success) {
                        res.jsonp({ success: true, message: 'User logged out' });
                    } else {
                        res.jsonp({ success: false, message: 'Session not found' });
                    }// if-else
                } catch (e) {
                    sails.log.error('UserAuth.logout() Response exception - ' + e.message);
                    res.serverError({ error: e.message });
                }// try-catch

            }, function (e) {
                res.serverError({ error: e });
            });

        } catch (e) {
            sails.log.error('UserAuth.logout() Exception - ' + e.message);
            res.serverError({ error: e.message });
        }// try-catch

    }
};