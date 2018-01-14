'use strict';

var assert = require('assert');
var Sails = require('sails');



describe('Test Clean-Up', function () {

    //this.timeout(6000);

    it('should clean-up test company', function (done) {

        sails.log.debug('Clearing test company');

        sails.models.company.destroy({ name: /Test Company/i })
            .then(function () {

                assert(true, 'Test company cleaned up');
                done();
            }, function (e) {
                assert(false, 'Company cleanup errored ' + JSON.stringify(e));
                done();
            });



    });

    it('should clean-up test users', function (done) {

        sails.log.debug('Clearing test users');

        sails.models.user.destroy({ type: 'test' })
            .then(function () {

                assert(true, 'Test users cleaned up');
                done();
            }, function (e) {
                assert(false, 'User cleanup errored ' + JSON.stringify(e));
                done();
            });
    });


    it('should clean test sessions', function (done) {

        sails.models.session.destroy({ "user.lname": 'test' }).exec(function (e) {

            if (e) {
                sails.log.error('UNITTEST: Session clean failed');
                assert(false, 'Token clean failed');
            } else {
                sails.log.info('UNITTEST: Session clean succeeded ');
                assert(true, 'Token clean succeeded');
            }// if-else

            done();

        }, function (e) {
            throw 'Token clean failed ' + e;
        });
    });

    it('should clean-up test form templates', function (done) {

        sails.log.debug('Clearing test forms');

        sails.models.form.destroy({ name: /Test Form/i })
            .then(function () {

                assert(true, 'Test forms cleaned up');
                done();
            }, function (e) {
                assert(false, 'Form cleanup errored ' + JSON.stringify(e));
                done();
            });



    });
    
    it('should clean-up test user forms', function (done) {

        try {

            sails.log.debug('Cleaning up test user forms');

            sails.models.userform.destroy({ name: /Test User Form/i })
                .then(function (results) {
                  
                    assert(true, 'Clean-up done');                 
                    done();
                }, function (e) {

                    sails.log.error(JSON.stringify(e));
                    assert(false, 'Clean-up failed');
                    done();
                });


        } catch (e) {

            sails.log.error('UNITTEST: Exception - ' + e.message);
            assert(false, e.message);
            done();
        }

    });
  



});