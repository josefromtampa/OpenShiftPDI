/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var userAuth = require('../lib/handlers/UserAuth.js');

module.exports = {

    login: userAuth.login,
    logout: userAuth.logout
	
};

