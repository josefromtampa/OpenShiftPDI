'use strict';

var assert = require('assert');
var Sails = require('sails');

function buildDummyUserForm(id, username) {

    var userForm = {
        name: 'Test User Form ' + id,
        identifier: 'Form Id ' + id,
        gps: {
            long: 123,
            lat: 321
        },
        progress: {
            percent: 70,
            progressPosition: 8,
            currentPosition: 6
        },
        status: {
            value: 'saved'
        },
        submitDate: new Date(),
        user: {
            username: username,
            firstName: 'Agent',
            lastName: 'Agent'
        },
        form: {
            name: 'Test Form 1',
            description: 'This is a test form 1',
            companies: [],
            sections: []
        }

    };

    //var section = null;
    //var card = null;
    //var type = null;
    //for (var i = 0; i < 5; i++) {

    //    section = new sails.services.domain.Section('Test Section ' + i
    //        , 'This is a test section for a user form');
        
    //    for (var j = 0; j < sails.services.constants.questionTypes.length; j++) {
    //        card = new sails.services.domain.Card('Card ' + i + '-' + j);
    //        type = sails.services.constants.questionTypes[j];

    //        card.questions.push(new sails.services.domain.Question(type, j + ' What is the world made of?'));

    //        section.cards.push(card);

    //    }// for

    //    userForm.form.sections.push(section);

    //}// for

    return userForm;

}




describe('UserForm Model Test', function () {

    //this.timeout(6000);

    var username = '';
    var testUserForm = null;

    
    it('should build a test userform', function (done) {

        try {

            sails.log.debug('Creating user form');

            testUserForm = buildDummyUserForm(1, 'agent1');

            //sails.log.debug(JSON.stringify(testUserForm));

            assert(true, 'Test user form created');
       
            done();
        } catch (e) {
            sails.log.error('UNITTEST: Exception - ' + e.message);
            assert(false, e.message);
            done();
        }// try-catch


    });

    it('should flatten the test userform', function (done) {

        try {

            sails.log.debug('Flattening user form');

            var flat = sails.models.userform.flatten(testUserForm);

            //sails.log.debug(JSON.stringify(flat));

            assert(true, 'Test user form flattened');

            done();
        } catch (e) {
            sails.log.error('UNITTEST: Exception - ' + e.message);
            assert(false, e.message);
            done();
        }// try-catch


    });


    //it('should insert test user forms', function (done) {

    //    try {

    //        sails.log.debug('Building test user forms');

    //        var forms = [];

    //        for (var i = 0; i < 10; i++) {
    //            forms.push(buildDummyUserForm(i, i%2 == 0 ? 'agent2' : 'agent1'));
    //        }// for

    //        sails.models.userform.create(forms).then(function (results) {

    //            sails.log.debug('UserForms created');
    //            //sails.log.debug('Created ' + JSON.stringify(results));
    //            assert(true, 'UserForm created');

    //            done();
    //        }, function (e) {

    //            sails.log.error('Failed to create user form - ' + e);
    //            assert(false, 'UserForm create failed');
    //            done();
    //        });


    //    } catch (e) {
    //        sails.log.error('UNITTEST: Exception - ' + e.message);
    //        assert(false, e.message);
    //        done();
    //    }// try-catch


    //});
    
  
  



});