'use strict';

var assert = require('assert');
var Sails = require('sails');


describe('Event Factory Test', function () {

    //this.timeout(6000);

    it('should log a single event', function (done) {

        sails.log.info('Logging a single test event');

        var metadata = {
            type: 'test',
            name: 'Yeng',
            level: 3
        };

        sails.services.eventservice.logEvent('test', metadata)
            .then(function (results) {

                if (results.success) {
                    sails.log.debug('UNITTEST: Event log succeeded');
                    assert(true, 'Event log successful');
                } else {
                    assert(false, 'Event log failed');
                }// if-else

                done();

            }, function (e) {

                sails.log.error('UNITTEST: Event logging failed ' + JSON.stringify(e));
                assert(false, 'Event logging failed');
                done(e);
            });

    });

    it('should log multiple events', function (done) {

        var events = [];

        for (var i = 0; i < 10; i++) {
            events.push({
                type: 'test',
                value: {
                    name: 'Yeng',
                    value: i
                }
            });
        }// for

        for (var j = 0; j < 10; j++) {
            events.push({
                type: 'error',
                value: {
                    user: 'Batman',
                    issue: 'I have no powers'
                }
            });

        }// for

        sails.services.eventservice.logEvents(events)
           .then(function (results) {

               if (results.success) {
                   sails.log.debug('UNITTEST: Multiple event log succeeded');
                   assert(true, results.message);
               } else {
                   assert(false, results.message);
               }// if-else

               done();

           }, function (e) {

               sails.log.error('UNITTEST: Multiple event logging failed ' + JSON.stringify(e));
               assert(false, 'Multiple event logging failed');
               done(e);
           });

    });


});