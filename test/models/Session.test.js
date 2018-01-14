'use strict';

var assert = require('assert');
var Sails = require('sails');

describe('Session Model Test', function () {

    this.timeout(6000);

    var curSession = null;
    var session2 = null;

    it('should grant a session', function (done) {

        var user = {
            fname: 'user1',
            lname: 'test',
            address: '123 South Central',
            city: 'Cloud City',
            state: 'FL'
        };


        sails.models.session.grant('user', user).then(function (session) {

            if (session) {
                curSession = session;
                sails.log.info('UNITTEST: Session grant succeeded ' + JSON.stringify(session));
                assert(true, 'Token grant succeeded');
            } else {
                sails.log.error('UNITTEST: Session grant failed');
                assert(false, 'Token grant failed');
            }// if-else

            done();

        }, function (e) {
            throw 'Token grant failed ' + e;
        });



    });

    it('should grant another session', function (done) {

        var user = {
            fname: 'user2',
            lname: 'test',
            address: '123 South Central',
            city: 'Cloud City',
            state: 'FL'
        };


        sails.models.session.grant('user', user).then(function (session) {

            if (session) {
                session2 = session;
                sails.log.info('UNITTEST: Session grant succeeded ' + JSON.stringify(session));
                assert(true, 'Token grant succeeded');
            } else {
                sails.log.error('UNITTEST: Session grant failed');
                assert(false, 'Token grant failed');
            }// if-else

            done();

        }, function (e) {
            throw 'Token grant failed ' + e;
        });

    });

    it('should validate session', function (done) {

        sails.models.session.validateSession(curSession.token).then(function (results) {

            if (results.success) {
                sails.log.info('UNITTEST: Session validation succeeded ');
                assert(true, 'Token validation succeeded');
            } else {
                sails.log.error('UNITTEST: Session validation failed');
                assert(false, 'Token validation failed');
            }// if-else

            done();

        }, function (e) {
            throw 'Token validation failed ' + e;
        });
    });

    it('should expire session without removing', function (done) {

        sails.models.session.expire(curSession.token, false).then(function (results) {

            if (results.success) {
                sails.log.info('UNITTEST: Session expire succeeded ');
                assert(true, 'Token expire succeeded');
            } else {
                sails.log.error('UNITTEST: Session expire failed');
                assert(false, 'Token expire failed');
            }// if-else

            done();

        }, function (e) {
            throw 'Token expire failed ' + e;
        });
    });

    it('should clean expired sessions', function (done) {

        sails.models.session.clean().then(function (results) {

            if (results.success) {
                sails.log.info('UNITTEST: Session clean succeeded ');
                assert(true, 'Token clean succeeded');
            } else {
                sails.log.error('UNITTEST: Session clean failed');
                assert(false, 'Token clean failed');
            }// if-else

            done();

        }, function (e) {
            throw 'Token clean failed ' + e;
        });
    });


});