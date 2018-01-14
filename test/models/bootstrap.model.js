var Sails = require('sails'),
  sails;

before(function (done) {

    this.timeout(0);

    Sails.lift({
        // configuration for testing purposes
        log: {
            level: 'debug'
        },
        //environment: 'test'
    }, function (err, server) {
        sails = server;
        if (err) return done(err);

        done(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    sails.lower(done);
   // done();
});
