'use strict';

var assert = require('assert');
var Sails = require('sails');

var passwordhash = require('password-hash-and-salt');

describe('Form Model Test', function () {

    //this.timeout(6000);

    var user = {

    };

    function createQuestions(count, typeIdx) {

        var questions = [];
        var cur = null;

        for (var i = 0; i < count; i++) {
            var type = sails.services.constants.questionTypes[typeIdx]
            cur = new sails.services.domain.Question(
                    type,
                    (i == 0 ? 'What would you like ' + i + '?' : '')
                );
            cur.answer = type.defaultValue;

            questions.push(cur);
        }

        return questions;

    }

    function createCards(count) {

        var cards = [];
        var cur = null;

        for (var i = 0; i < count; i++) {

            cur = new sails.services.domain.Card('Card ' + i);
            cur.questions = createQuestions(3, i);
            cur.body = 'This card provides information for index ' + i;
            cards.push(cur);
        }

        return cards;

    }

    function createSections() {

        var sections = [];
        var cur = null;

        for (var i = 0; i < 3; i++){

            cur = new sails.services.domain.Section('Section ' + i);
            cur.cards = createCards(11);

            sections.push(cur);

        }

        return sections;

    }

    function createGroups(prefix) {

        var groups = [];
        var cur = null;

        for (var i = 0; i < 5; i++) {
            cur = new sails.services.domain.Group(prefix + ' Group ' + i);
            groups.push(cur);
        }

        return groups;

    }

    function createCompany(id, prefix) {

        prefix = prefix || 'Company';

        var c = new sails.models.company.class(prefix);
        c.id = id;
        c.groups = createGroups(prefix);


        return c;
    }


    it('should create test form template for Company1', function (done) {

        var companies = [];
        companies.push(createCompany('1234567890', 'Test Company 1'));
        var sections = createSections();

        var form = new sails.models.form.class('Test Form Company1', companies, sections);
        form.description = 'This is the description for form company1';

        sails.models.form.create(form)
            .then(function (results) {

                sails.log.debug('Form created ' + JSON.stringify(results));
                assert(true, 'Form created');

                done();
            }, function (e) {
                assert(false, 'Form create errored ' + JSON.stringify(e));
                done();
            });



    });

    it('should create test form template Company2', function (done) {

        var companies = [];
        companies.push(createCompany('0987654321', 'Test Company 2'));
        var sections = createSections();

        var form = new sails.models.form.class('Test Form Company2', companies, sections);
        form.description = 'This is the description for form company2';

        sails.models.form.create(form)
            .then(function (results) {

                sails.log.debug('Form created ' + JSON.stringify(results));
                assert(true, 'Form created');

                done();
            }, function (e) {
                assert(false, 'Form create errored ' + JSON.stringify(e));
                done();
            });



    });
    
    it('should create test form template for Company1 and Company2', function (done) {

        var companies = [];
        companies.push(createCompany('1234567890', 'Test Company 1'));
        companies.push(createCompany('0987654321', 'Test Company 2'));
        var sections = createSections();

        var form = new sails.models.form.class('Test Form Company1 and Company2', companies, sections);
        form.description = 'This form  is for both company 1 and company 2';

        sails.models.form.create(form)
            .then(function (results) {

                sails.log.debug('Form created ' + JSON.stringify(results));
                assert(true, 'Form created');

                done();
            }, function (e) {
                assert(false, 'Form create errored ' + JSON.stringify(e));
                done();
            });



    });
    





});