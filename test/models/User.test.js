'use strict';

var assert = require('assert');
var Sails = require('sails');

var passwordhash = require('password-hash-and-salt');

describe('User Model Test', function () {

    //this.timeout(6000);

    var username = 'yyangx',
        password = 'password';

    var testUser = null;
    var userId = null;
    var testUser2 = null;

    it('should create user for Company1', function (done) {
        
        passwordhash(password).hash(function (e, hash) {

            var user = new sails.models.user.class('test', 'agent', 'testagent1', hash, 'agent1@laicos.com');
            user.firstName = 'Agent1';
            user.lastName = 'Test';

            var c = new sails.models.company.class('Test Company1');
            c.id = '1234567890';

            user.companies.push(c);
               
            sails.log.debug('Creating user ' + JSON.stringify(user));

            sails.models.user.create(user)
                .exec(function (e, results) {
                    
                    if (e) {
                        assert(false, 'User create failed');
                    } else {
                        testUser = results;
                        userId = testUser.id;
                        sails.log.debug('Created user ' + JSON.stringify(testUser));
                        assert(true, 'User created');
                    }// if

                    done();
                });

        });

    });

    it('should upsert a new user for Company2', function (done) {

        
        passwordhash(password).hash(function (e, hash) {
            sails.log.debug('Inserting new user testagent2');

            var user = new sails.models.user.class('test', 'agent', 'testagent2', hash, 'agent2@laicos.com');
            user.firstName = 'Agent2';
            user.lastName = 'Test';

            var c = new sails.models.company.class('Test Company2');
            c.id = '0987654321';

            user.companies.push(c);

            sails.models.user.upsert(user)
                .then(function (results) {

                    testUser2 = results;

                    sails.log.debug('Inserted user ' + JSON.stringify(results));
                    assert(true, 'User inserted');
                    done();
                }, function (e) {
                    assert(false, 'User validation errored ' + JSON.stringify(e));
                    done();
                });
        });

    });

    it('should upsert a new admin user', function (done) {


        passwordhash(password).hash(function (e, hash) {
            sails.log.debug('Inserting new user ' + username);

            var user = new sails.models.user.class('test', 'admin', username, hash, 'admin@laicos.com');
            user.firstName = 'Admin';
            user.lastName = 'Test';

            var c1 = new sails.models.company.class('Test Company1');
            c1.id = '1234567890';
            var c2 = new sails.models.company.class('Test Company2');
            c2.id = '0987654321';

            user.companies.push(c1);
            user.companies.push(c2);

            sails.models.user.upsert(user)
                .then(function (results) {
                    
                    sails.log.debug('Inserted user ' + JSON.stringify(results));
                    assert(true, 'User inserted');
                    done();
                }, function (e) {
                    assert(false, 'User validation errored ' + JSON.stringify(e));
                    done();
                });
        });

    });

    it('should update a user by id', function (done) {

        sails.log.debug('Updating user ' + testUser.id);

        testUser.firstName = 'Updated user by id';

        sails.models.user.upsert(testUser)
            .then(function (results) {

                sails.log.debug('Updated user by id ' + JSON.stringify(results));
                assert(true, 'User updated');

                done();
            }, function (e) {
                assert(false, 'User validation errored ' + JSON.stringify(e));
                done();
            });

    });

    it('should update a user by username', function (done) {

        sails.log.debug('Updating user ' + testUser2.username);

        testUser2.firstName = 'Updated user by username';

        sails.models.user.upsert(testUser2, { username: testUser2.username })
            .then(function (results) {

                sails.log.debug('Updated user by username ' + JSON.stringify(results));
                assert(true, 'User updated');

                done();
            }, function (e) {
                assert(false, 'User validation errored ' + JSON.stringify(e));
                done();
            });

    });

    it('should find test user by username', function (done) {

        sails.log.debug('Searching user ' + username);

        sails.models.user.findOne({ username: username })
            .then(function (user) {

                sails.log.debug('Username search ' + JSON.stringify(user));

                if (user) {
                    assert(true, 'User found');
                } else {
                    assert(false, 'User not found');
                }// if

                done();
            }, function (e) {
                assert(false, 'User search errored ' + JSON.stringify(e));
                done();
            });

        

    });

    it('should find test user and select certain fields', function (done) {

        sails.log.debug('Selecting user ' + username);


        sails.models.user.select({ username: username },
            {
                username: 1,
                type: 1,
                role: 1
            })
            .then(function (user) {
                
                sails.log.debug('User select ' + JSON.stringify(user));

                if (user) {
                    assert(true, 'User selected');
                } else {
                    assert(false, 'User not selected');
                }// if

                done();
            }, function (e) {
                assert(false, 'User select errored ' + JSON.stringify(e));
                done();
            });



    });

    it('should find a user by ObjectID', function (done) {

        sails.log.debug('Searching user id ' + userId);

        sails.models.user.findByMongoId(userId)
            .then(function (results) {

                if (results) {
                    sails.log.debug('Found user by id ' + JSON.stringify(results));
                    assert(true, 'User found');
                } else {
                    assert(false, 'No results found');
                }// if-else

                done();

            }, function (e) {
                assert(false, e);
                done(e);
            });


    });

    it('should validate a user', function (done) {
        
        sails.log.debug('Validating user ' + username + ' with ' + password);

        sails.models.user.validateUser(username, password)
            .then(function (results) {

                if (results.success) {
                    assert(true, 'User validated');
                } else {
                    assert(false, 'User validation failed');
                }// if

                done();
            }, function (e) {
                assert(false, 'User validation errored ' + JSON.stringify(e));
                done();
            });

    });

    
    it('should delete a user by ObjectID', function (done) {

        sails.log.debug('Deleting user ' + testUser.id);

        sails.models.user.deleteByMongoId(testUser.id)
            .then(function (results) {

                sails.log.debug(JSON.stringify(results));
                assert(true, 'User found');
                done();

            }, function (e) {
                assert(false, e);
                done(e);
            });


    });



});