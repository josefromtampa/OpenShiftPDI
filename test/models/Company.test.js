'use strict';

var assert = require('assert');
var Sails = require('sails');


describe('Company Model Test', function () {

    //this.timeout(6000);


    it('should create a company', function (done) {

        var company = new sails.models.company.class('Test Company 1');
        company.id = '1234567890';
        company.address = '123 South St.';
        company.city = 'Tampa';
        company.state = 'FL';
        company.zipcode = '12312';

        
        sails.log.debug('Creating company ' + JSON.stringify(company));

        sails.models.company.create(company)
            .exec(function (e, results) {

                if (e) {
                    assert(false, 'Company create failed');
                } else {
                    assert(true, 'Company created');
                }// if

                done();
            });


    });

    it('should create test company 2', function (done) {

        var company = new sails.models.company.class('Test Company 2');
        company.id = '0987654321';
        company.address = '123 South St.';
        company.city = 'Tampa';
        company.state = 'FL';
        company.zipcode = '12312';


        sails.log.debug('Creating company ' + JSON.stringify(company));

        sails.models.company.create(company)
            .exec(function (e, results) {

                if (e) {
                    assert(false, 'Company create failed');
                } else {
                    assert(true, 'Company created');
                }// if

                done();
            });


    });


    it('should search for test company', function (done) {

        sails.log.debug('Search for company by query');

        sails.models.company.findOne({ name: 'Test Company 1' })
            .exec(function (e, co) {

                if (e || co == null || co === undefined) {
                    assert(false, 'Company search failed');
                } else {
                    sails.log.debug('Company found - ' + JSON.stringify(co));
                    assert(true, 'Company found ' );
                }// if

                done();
            });

    });

    it('should find test company by name', function (done) {

        sails.log.debug('Search for company by name');

        sails.models.company.findByName('Test Company')
            .exec(function (e, co) {

                if (e || co == null || co === undefined) {
                    assert(false, 'Company search failed');
                } else {
                    sails.log.debug('Company found - ' + JSON.stringify(co));
                    assert(true, 'Company found ');
                }// if

                done();
            });

    });


    it('should find all companies', function (done) {

        sails.log.debug('Search for all companies');

        sails.models.company.find()
            .exec(function (e, co) {

                if (e || co == null || co === undefined) {
                    assert(false, 'Company search failed');
                } else {
                    sails.log.debug('Company found - ' + JSON.stringify(co));
                    assert(true, 'Company found ');
                }// if

                done();
            });

    });

  

    

});