'use strict';

var assert = require('assert');
var Sails = require('sails');


describe('User Form Service Test', function () {

    //this.timeout(6000);
    var testUser = null;
    var _forms = null;

    //it('should get templates for agent1', function (done) {

    //    try {

    //        sails.log.info('Retrieving form templates for agent1');

    //        sails.models.user.findOne({ username: /agent1/i })
    //            .then(function (user) {

    //                testUser = user; // cache to use later

    //                sails.log.debug('Retrieving forms for ' + JSON.stringify(user));

    //                sails.services.userformservice.getTemplates(user)
    //                    .then(function (results) {

    //                        if (results.success) {
    //                            sails.log.debug('Retrieved user templates ' + JSON.stringify(results.data));
    //                            assert(true, 'Retrieved user templates');
    //                        } else {
    //                            sails.log.warn('User templates retrieve failed');
    //                            assert(false, 'Failed to retrieve user templates');
    //                        } // if-else
    //                        done();

    //                    }, function (e) {

    //                        assert(false, 'Unable to retrieve form templates ' + e);
    //                        done();
    //                    });
    //            }, function (e) {

    //                assert(false, 'Unable to find agent1 account ' + JSON.stringify(e));
    //                done();
    //            });

    //    } catch (e) {

    //        sails.log.error('UNITTEST: Exception - ' + e.message);
    //        assert(false, e.message);
    //        done();
    //    }// try-catch

    //});

    //it('should get userforms for agent1', function (done) {

    //    try {
            
    //        sails.log.debug('Retrieving forms for ' + JSON.stringify(testUser));

    //        sails.services.userformservice.getList(testUser)
    //            .then(function (results) {

    //                if (results.success) {

    //                    _forms = results.data;

    //                    sails.log.debug('Retrieved user forms ' + JSON.stringify(results.data));
    //                    assert(true, 'Retrieved user forms');
    //                } else {
    //                    sails.log.warn('User form retrieve failed');
    //                    assert(false, 'Failed to retrieve user forms');
    //                } // if-else
    //                done();

    //            }, function (e) {

    //                assert(false, 'Unable to retrieve form forms ' + e);
    //                done();
    //            });


    //    } catch (e) {

    //        sails.log.error('UNITTEST: Exception - ' + e.message);
    //        assert(false, e.message);
    //        done();
    //    }// try-catch

    //});

    //it('should get a user form by id', function (done) {

    //    try {


    //        var id = 0;
    //        if (_forms && _forms.length > 0) {
    //            id = _forms[0]['_id'];
    //        }// if

    //        sails.log.debug('Retrieving user form id ' + id);

    //        sails.services.userformservice.get(id)
    //            .then(function (results) {

    //                if (results.success) {
    //                    sails.log.debug('Retrieved user form ' + JSON.stringify(results.data));
    //                    assert(true, 'Retrieved user form');
    //                } else {
    //                    sails.log.warn('User form retrieve failed');
    //                    assert(false, 'Failed to retrieve user form');
    //                } // if-else
    //                done();

    //            }, function (e) {

    //                assert(false, 'Unable to retrieve form form ' + e);
    //                done();
    //            });


    //    } catch (e) {

    //        sails.log.error('UNITTEST: Exception - ' + e.message);
    //        assert(false, e.message);
    //        done();
    //    }// try-catch

    //});


    it('should update a userform card', function (done) {

        try {


            var id = '55dc7f9e9e2142841e775a49';
            var card = {
                "id": "4J7pfY_4h",
                "title": "This is a question",
                "body": "Something goes here???",
                "dependencies": null,
                "subSectionTemplate": null,
                "subSections": [],
                "questions": [{
                    "id": "Vy4TMtdV3",
                    "type": {
                        "name": "Counter",
                        "key": "counter",
                        "min": 0,
                        "max": 100,
                        "order": 4,
                        "template": "",
                        "description": "Numeric counter",
                        "defaultValue": 0
                    },
                    "text": "",
                    "dependencies": null,
                    "validators": [],
                    "answer": 22222222,
                    "active": true,
                    "fieldName": "stories",
                    "sortable": true,
                    "searchable": true,
                    "exportable": true,
                    "hasDependents": true
                }],
                "active": true,
                "section": {
                    "id": "EypGKON3",
                    "title": "HOME",
                    "description": "",
                    "dependencies": null,
                    "active": true
                }
            };

            sails.log.debug('Updating userform card');

            sails.services.userformservice.saveCard(id, card)
                .then(function (results) {

                    if (results.success) {
                        sails.log.debug('Card saved ' + JSON.stringify(results.data));
                        assert(true, 'Card saved');
                    } else {
                        sails.log.warn('Card saved failed');
                        assert(false, 'Failed to save card');
                    } // if-else
                    done();

                }, function (e) {

                    assert(false, 'Unable to save card ' + e);
                    done();
                });


        } catch (e) {

            sails.log.error('UNITTEST: Exception - ' + e.message);
            assert(false, e.message);
            done();
        }// try-catch

    });

    it('should update a userform status', function (done) {

        try {


            var id = '55dc8e20aa7d73b02d89c8dc';
            var fields = {
                name: 'This is an updated form at ' + (new Date()).toString(),
                status: {
                    "name": "Saving something",
                    "key": "saved",
                    "index": 0
                },
                progress: {
                    "percent": 90,
                    "progressPosition": 7,
                    "currentPosition": 4
                },
                gps: {
                    "timestamp": 1440466831607.0,
                    "coords": {
                        "speed": null,
                        "heading": null,
                        "altitudeAccuracy": null,
                        "accuracy": 128.91400146484375,
                        "altitude": null,
                        "longitude": -82.6858113,
                        "latitude": 28.0458702
                    }
                }

            };

            sails.log.debug('Updating userform card');

            sails.services.userformservice.update(id, fields)
                .then(function (results) {

                    if (results.success) {
                        sails.log.debug('UserForm saved ' + JSON.stringify(results.data));
                        assert(true, 'UserForm saved');
                    } else {
                        sails.log.warn('UserForm saved failed');
                        assert(false, 'Failed to save userForm');
                    } // if-else
                    done();

                }, function (e) {

                    assert(false, 'Unable to save userForm ' + e);
                    done();
                });


        } catch (e) {

            sails.log.error('UNITTEST: Exception - ' + e.message);
            assert(false, e.message);
            done();
        }// try-catch

    });


});