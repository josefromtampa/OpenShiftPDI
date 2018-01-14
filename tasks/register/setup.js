

var Sails = require('sails'),
    sails,
    uuid = require('uuid'),
    passwordhash = require('password-hash-and-salt'),
    Promise = require('bluebird');


module.exports = function (grunt) {

    grunt.registerTask('setup-list', 'Shows the list of supported setup tasks.', function () {

        grunt.log.writeln(' ');
        grunt.log.writeln('Supported Tasks');
        grunt.log.writeln('*************************************************************************************');
        grunt.log.writeln('setup-init:{environment}     ==> Initializes the core datastructures');
        grunt.log.writeln('setup-create-user:{environment}:{company}:{type = user|api}:{role = admin|agent}:{username}:{password}:{firstname}:{lastname}:{email}:{phone} ==> Creates a new user.');
        grunt.log.writeln('setup-forms:{environment}    ==> Creates base forms');
    });

    grunt.registerTask('setup-create-user', 'Creates a new user.', function (env, company, type, role, username, password, firstname, lastname, email, phone) {

        var done = this.async();

        if (arguments.length < 6) {
            grunt.log.writeln(this.name + ", no args");
            grunt.log.writeln('');
            grunt.log.writeln('Usage: grunt setup-create-user:{environment}:{company}:{type}:{role}:{username}:{password}:{firstname}:{lastname}:{email}:{phone}');

            done('Arguments required');
        } else {


            Sails.lift({
                port: 8181,
                log: {
                    level: 'info'
                },
                environment: env
            }, function (err, server) {
                sails = server;

                try {

                    if (err) {
                        grunt.log.error('*** ERROR - ' + err);
                        done();
                    } else {

                        sails.log.info('Setup Task: Creating user ' + username);

                        sails.models.company.findOne({ name: company })
                            .then(function (co) {
                                // hash password
                                passwordhash(password).hash(function (e, hash) {

                                    var user = {
                                        username: username,
                                        password: hash,
                                        firstName: firstname || '',
                                        lastName: lastname || '',
                                        companies: [],
                                        email: email || '',
                                        phone: phone || '',
                                        type: type,
                                        role: role,
                                        active: true
                                    };

                                    if (co) {
                                        user.companies.push(co);
                                    }

                                    sails.models.user.create(user).exec(function (e, results) {

                                        sails.log.info('Setup Task: User create done ' + JSON.stringify(results));

                                        if (e) {
                                            sails.log.error('User create failed ' + e);
                                        } else {

                                            sails.log.info('User create succeeded');
                                        }// if-else

                                        done();
                                    });

                                });
                            });

                    }// if

                } catch (e) {
                    sails.log.error('User create exception - ' + e.message);
                    done(e);
                }// try-catch

            });
        }// if-else

    });


    grunt.registerTask('setup-init', 'Initializes the core datastructures.', function (env) {

        var done = this.async();

        if (arguments.length === 0) {
            grunt.log.writeln(this.name + ", no args");
            grunt.log.writeln('');
            grunt.log.writeln('Usage: grunt setup-init:{environment}');

            done('Arguments required');
        } else {


            Sails.lift({
                port: 8181,
                log: {
                    level: 'info'
                },
                environment: env
            }, function (err, server) {
                sails = server;

                try {

                    if (err) {
                        grunt.log.error('*** ERROR - ' + err);
                        done();
                    } else {

                        // start promise chain
                        Promise.try(function () {

                            /* Initialize Statuses */

                            sails.log.info('Setup Task: Clearing statuses');
                            return sails.models.status.destroy()
                                .then(function () {

                                    sails.log.info('Setup Task: Initializing statuses');

                                    var statuses = [
                                        new sails.models.status.class('Saved', 'saved', 1),
                                        new sails.models.status.class('Submitted', 'submitted', 2),

                                    ];

                                    sails.log.info(JSON.stringify(statuses));

                                    sails.log.info('Setup Task: Saving statuses');

                                    // create statuses
                                    return sails.models.status.create(statuses)
                                                
                                                .catch(function (e) {

                                                    sails.log.error('Statuses creation failed ' + JSON.stringify(e));
                                                    return Promise.reject(e);
                                                });


                                });
                        })
                            .then(function () {

                            sails.log.info('Setup Task: creating status index');

                            // create index for status
                            return new Promise(function (resolve, reject) {

                                sails.models.status.native(function (err, collection) {

                                    if (err) {
                                        sails.log.error('Create status index failed - ' + err);
                                        reject(err);
                                    }

                                    collection.createIndex({ name: 1 }, { unique: true }, function () {
                                        resolve();
                                    });

                                });
                            });

                            })
                            .then(function () {

                            sails.log.info('Setup Task: creating IBHS company');

                            var company = new sails.models.company.class('IBHS');

                            // setup single company
                            return sails.models.company.create(company)
                                        .catch(function (e) {
                                            sails.log.error('Unable to create initial company');
                                            return Promise.reject(e);
                                        });
                        
                            })
                            .then(function () {


                            sails.log.info('Setup Task: setup task completed');

                            done();

                        }, function (e) {
                            sails.log.error('Init failed - ' + JSON.stringify(e));
                            done(e);
                        });
                                               

                    }// if

                } catch (e) {
                    sails.log.error('Init exception - ' + e.message);
                    done(e);
                }// try-catch

            });
        }// if-else

    });

    grunt.registerTask('setup-forms', 'Builds the base forms.', function (env) {

        var done = this.async();

        if (arguments.length === 0) {
            grunt.log.writeln(this.name + ", no args");
            grunt.log.writeln('');
            grunt.log.writeln('Usage: grunt setup-forms:{environment}');

            done('Arguments required');
        } else {


            Sails.lift({
                port: 8181,
                log: {
                    level: 'info'
                },
                environment: env
            }, function (err, server) {
                sails = server;

                try {

                    if (err) {
                        grunt.log.error('*** ERROR - ' + err);
                        done();
                    } else {

                        function clone(obj) {
                            var json = JSON.stringify(obj);

                            return JSON.parse(json);
                        };

                        function getStates() {

                            return [
                                {
                                    "name": "Alabama",
                                    "value": "AL"
                                },
                                {
                                    "name": "Alaska",
                                    "value": "AK"
                                },
                                {
                                    "name": "American Samoa",
                                    "value": "AS"
                                },
                                {
                                    "name": "Arizona",
                                    "value": "AZ"
                                },
                                {
                                    "name": "Arkansas",
                                    "value": "AR"
                                },
                                {
                                    "name": "California",
                                    "value": "CA"
                                },
                                {
                                    "name": "Colorado",
                                    "value": "CO"
                                },
                                {
                                    "name": "Connecticut",
                                    "value": "CT"
                                },
                                {
                                    "name": "Delaware",
                                    "value": "DE"
                                },
                                {
                                    "name": "District Of Columbia",
                                    "value": "DC"
                                },
                                {
                                    "name": "Federated States Of Micronesia",
                                    "value": "FM"
                                },
                                {
                                    "name": "Florida",
                                    "value": "FL"
                                },
                                {
                                    "name": "Georgia",
                                    "value": "GA"
                                },
                                {
                                    "name": "Guam",
                                    "value": "GU"
                                },
                                {
                                    "name": "Hawaii",
                                    "value": "HI"
                                },
                                {
                                    "name": "Idaho",
                                    "value": "ID"
                                },
                                {
                                    "name": "Illinois",
                                    "value": "IL"
                                },
                                {
                                    "name": "Indiana",
                                    "value": "IN"
                                },
                                {
                                    "name": "Iowa",
                                    "value": "IA"
                                },
                                {
                                    "name": "Kansas",
                                    "value": "KS"
                                },
                                {
                                    "name": "Kentucky",
                                    "value": "KY"
                                },
                                {
                                    "name": "Louisiana",
                                    "value": "LA"
                                },
                                {
                                    "name": "Maine",
                                    "value": "ME"
                                },
                                {
                                    "name": "Marshall Islands",
                                    "value": "MH"
                                },
                                {
                                    "name": "Maryland",
                                    "value": "MD"
                                },
                                {
                                    "name": "Massachusetts",
                                    "value": "MA"
                                },
                                {
                                    "name": "Michigan",
                                    "value": "MI"
                                },
                                {
                                    "name": "Minnesota",
                                    "value": "MN"
                                },
                                {
                                    "name": "Mississippi",
                                    "value": "MS"
                                },
                                {
                                    "name": "Missouri",
                                    "value": "MO"
                                },
                                {
                                    "name": "Montana",
                                    "value": "MT"
                                },
                                {
                                    "name": "Nebraska",
                                    "value": "NE"
                                },
                                {
                                    "name": "Nevada",
                                    "value": "NV"
                                },
                                {
                                    "name": "New Hampshire",
                                    "value": "NH"
                                },
                                {
                                    "name": "New Jersey",
                                    "value": "NJ"
                                },
                                {
                                    "name": "New Mexico",
                                    "value": "NM"
                                },
                                {
                                    "name": "New York",
                                    "value": "NY"
                                },
                                {
                                    "name": "North Carolina",
                                    "value": "NC"
                                },
                                {
                                    "name": "North Dakota",
                                    "value": "ND"
                                },
                                {
                                    "name": "Northern Mariana Islands",
                                    "value": "MP"
                                },
                                {
                                    "name": "Ohio",
                                    "value": "OH"
                                },
                                {
                                    "name": "Oklahoma",
                                    "value": "OK"
                                },
                                {
                                    "name": "Oregon",
                                    "value": "OR"
                                },
                                {
                                    "name": "Palau",
                                    "value": "PW"
                                },
                                {
                                    "name": "Pennsylvania",
                                    "value": "PA"
                                },
                                {
                                    "name": "Puerto Rico",
                                    "value": "PR"
                                },
                                {
                                    "name": "Rhode Island",
                                    "value": "RI"
                                },
                                {
                                    "name": "South Carolina",
                                    "value": "SC"
                                },
                                {
                                    "name": "South Dakota",
                                    "value": "SD"
                                },
                                {
                                    "name": "Tennessee",
                                    "value": "TN"
                                },
                                {
                                    "name": "Texas",
                                    "value": "TX"
                                },
                                {
                                    "name": "Utah",
                                    "value": "UT"
                                },
                                {
                                    "name": "Vermont",
                                    "value": "VT"
                                },
                                {
                                    "name": "Virgin Islands",
                                    "value": "VI"
                                },
                                {
                                    "name": "Virginia",
                                    "value": "VA"
                                },
                                {
                                    "name": "Washington",
                                    "value": "WA"
                                },
                                {
                                    "name": "West Virginia",
                                    "value": "WV"
                                },
                                {
                                    "name": "Wisconsin",
                                    "value": "WI"
                                },
                                {
                                    "name": "Wyoming",
                                    "value": "WY"
                                }
                            ];
                        }

                        function applyRequired(question) {

                            var required = new sails.services.domain.Validator('required', null, null, {
                                title: 'Previous step is incomplete',
                                body: 'Please complete all required fields before proceeding.'
                            });
                            question.validators = [required];

                        }

                        var _dependencyCache = {
                            houseStoriesQ: null,
                            frontElevationQ: null,
                            leftElevationQ: null,
                            rightElevationQ: null,
                            backElevationQ: null,

                        };
                       
                        var _section = {

                            createPropertySection: function () {

                                
                                var curSection = null;

                                curSection = new sails.services.domain.Section('Property');
                                curSection.cards.push(_card.createStorm());
                                curSection.cards.push(_card.createStories());
                                sails.log.info('Created storm');
                                curSection.cards.push(_card.createPropertyDirection());
                                sails.log.info('Created direction');
                                var hasAddress = _card.createAddressAsk();
                                curSection.cards.push(hasAddress);
                                sails.log.info('Created address ask');
                                curSection.cards.push(_card.createPropertyAddress(hasAddress.questions[0]));
                                sails.log.info('Created address');
                              

                                return curSection;
                            },

                            createElevationMain: function(){


                                var curSection = new sails.services.domain.Section('Elevations');
                                curSection.cards.push(_card.createPropertyElevation());
                                sails.log.info('Created elevation');

                                return curSection;
                            },
                            
                            createElevationSection: function (type, eleveationDependency) {

                                var sections = [];

                                /* Elevation section */
                                var curSection = new sails.services.domain.Section(type.toUpperCase() + ' Elevation Inspection');
                                var hasDamage = _card.createElevation1(type);
                                curSection.cards.push(hasDamage);
                                sails.log.info('Created elevation1');
                                curSection.cards.push(_card.createElevation2(type));
                                sails.log.info('Created elevation2');

                                var hasSoffit = _card.createElevation3(type);
                                curSection.cards.push(hasSoffit);
                                sails.log.info('Created elevation3');
                                curSection.cards.push(_card.createElevation4(type, hasSoffit.questions[0]));
                                sails.log.info('Created elevation4');
                                curSection.cards.push(_card.createElevation5(type, hasSoffit.questions[0]));
                                sails.log.info('Created elevation5');
                                curSection.cards.push(_card.createElevation6(type, hasSoffit.questions[0], hasDamage.questions[0]));
                                sails.log.info('Created elevation6');
                                curSection.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(curSection);


                                var walls = _section.createElevationWalls(type, hasDamage);
                                walls.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(walls);

                                // garage 1
                                var garage = _section.createElevationGarage(type, hasDamage.questions[0], 'Is there a garage on this elevation?', 1);
                                garage.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(garage);

                                // garage 2
                                var garage2 = _section.createElevationGarage(type, hasDamage.questions[0], 'Is there an additional garage to add?', 2);
                                garage2.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: garage.cards[0].questions[0].id,
                                    value: 'yes',
                                    operator: 'eq'
                                }];
                                sections.push(garage2);

                                // garage 3
                                var garage3 = _section.createElevationGarage(type, hasDamage.questions[0], 'Is there an additional garage to add?', 3);
                                garage3.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: garage2.cards[0].questions[0].id,
                                    value: 'yes',
                                    operator: 'eq'
                                }];
                                sections.push(garage3);


                                var doors = _section.createDoors(type, hasDamage);
                                doors.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(doors);
                                
                                var ext = _section.createExteriorSection(type, hasDamage.questions[0]);
                                ext.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(ext);

                                var photos = _section.createPhotoDocSection(type);
                                photos.dependencies = [{
                                    questionId: eleveationDependency,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: 'n/a'
                                }];
                                sections.push(photos);


                                return sections;
                            },

                            createElevationWalls: function (type, hasDamage) {

                                var curSection = new sails.services.domain.Section(type.toUpperCase() + ' Elevation Walls');

                                curSection.cards.push(_card.createFirstFloorWallMaterial(type));
                                curSection.cards.push(_card.createFirstFloorWallDamage(type, hasDamage.questions[0]));
                                sails.log.info('Created first floor eval');
                                curSection.cards.push(_card.createSecondFloorWallMaterial(type));
                                curSection.cards.push(_card.createSecondFloorWallDamage(type, hasDamage.questions[0]));
                                sails.log.info('Created second floor eval');

                                var hasGable = _card.createElevationGable(type);
                                curSection.cards.push(hasGable);
                                curSection.cards.push(_card.createElevationGableMaterial(type, hasGable.questions[0]));
                                curSection.cards.push(_card.createElevationGableDamage(type, hasGable.questions[0], hasDamage.questions[0]));
                                sails.log.info('Created gable end wall eval');

                                curSection.cards.push(_card.createElevationWallOpennings(type));
                                sails.log.info('Created wall opennings eval');

                                return curSection;

                            },

                            createElevationGarage: function (type, hasDamage, text, idx) {

                                var curSection = new sails.services.domain.Section(type.toUpperCase() + ' Elevation Garage');

                                var hasGarage = _card.createElevationGarage(type, text, idx);
                                curSection.cards.push(hasGarage);
                                sails.log.info('Created garage eval');
                                
                                // garage size
                                curSection.cards.push(_card.createElevationGarageSize(type, hasGarage.questions[0], idx));

                                

                                // garage damage
                                curSection.cards.push(_card.createElevationGarageDamage(type, hasGarage.questions[0], hasDamage, idx));


                                return curSection;
                            },

                            createDoors: function(type, hasDamage){

                                var curSection = new sails.services.domain.Section(type.toUpperCase() + ' Elevation Doors and Windows');

                                var doors = _card.createElevationDoors(type);
                                curSection.cards.push(doors);

                                /* Single Entry */
                                var doorCounts = _card.createElevationSingleEntryDoor1(type, doors.questions[0]);
                                curSection.cards.push(doorCounts);
                                var protectedDoors = _card.createElevationSingleEntryDoorProtected(type, doors.questions[0], doorCounts);
                                curSection.cards.push(protectedDoors);

                                // single door damges
                                curSection.cards.push(_card.createElevationSingleProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors));
                                curSection.cards.push(_card.createElevationSingleUnProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors));

                                var singleProtectedGlassDoorDamage = _card.createElevationSingleProtectedGlassDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors);
                                curSection.cards.push(singleProtectedGlassDoorDamage);
                                curSection.cards.push(_card.createElevationSingleProtectedGlassDoorDamgeCounts(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors
                                    , singleProtectedGlassDoorDamage));

                                var singleUnprotectedGlassDoorDamage = _card.createElevationSingleUnProtectedGlassDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors);
                                curSection.cards.push(singleUnprotectedGlassDoorDamage);
                                curSection.cards.push(_card.createElevationSingleUnProtectedGlassDoorDamgeCounts(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors
                                    , singleUnprotectedGlassDoorDamage));

                                curSection.cards.push(_card.createElevationSingleProtectedSidelightDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors));
                                curSection.cards.push(_card.createElevationSingleUnProtectedSidelightDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[0]
                                    , doorCounts
                                    , protectedDoors));
                                sails.log.info('Created Single Entry Door Cards');

                                /* Double Entry */

                                var doubleDoorCounts = _card.createElevationDoubleEntryDoor1(type
                                    , doors.questions[1]);
                                curSection.cards.push(doubleDoorCounts);
                                var doubleProtectedDoors = _card.createElevationDoubleEntryDoorProtected(type
                                    , doors.questions[1]
                                    , doubleDoorCounts);
                                curSection.cards.push(doubleProtectedDoors);

                                // double door damges
                                curSection.cards.push(_card.createElevationDoubleProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors));
                                curSection.cards.push(_card.createElevationDoubleUnProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors));
                                var glassProtectedDamage = _card.createElevationDoubleProtectedGlassDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors);
                                curSection.cards.push(glassProtectedDamage);
                                curSection.cards.push(_card.createElevationDoubleProtectedGlassDoorDamgeCounts(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors
                                    , glassProtectedDamage));

                                var glassUnprotectedDamage = _card.createElevationDoubleUnProtectedGlassDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors);
                                curSection.cards.push(glassUnprotectedDamage);
                                curSection.cards.push(_card.createElevationDoubleUnProtectedGlassDoorDamgeCounts(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors
                                    , glassUnprotectedDamage));

                                curSection.cards.push(_card.createElevationDoubleProtectedSidelightDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors));
                                curSection.cards.push(_card.createElevationDoubleUnProtectedSidelightDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[1]
                                    , doubleDoorCounts
                                    , doubleProtectedDoors));

                                sails.log.info('Created Double Entry Door Cards');


                                /* Slider Doors */
                                var sliderDoorCounts = _card.createElevationSliderScreen(type
                                   , doors.questions[2]);
                                curSection.cards.push(sliderDoorCounts);
                                curSection.cards.push(_card.createElevationSliderTypes(type
                                    , doors.questions[2]
                                    , sliderDoorCounts.questions[0]))
                                var sliderProtectedDoors = _card.createElevationSliderProtected(type
                                    , doors.questions[2], sliderDoorCounts);
                                curSection.cards.push(sliderProtectedDoors);

                                // single door damges
                                curSection.cards.push(_card.createElevationSliderProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[2]
                                    , sliderProtectedDoors));
                                curSection.cards.push(_card.createElevationSliderUnProtectedDoorDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[2]
                                    , sliderDoorCounts
                                    , sliderProtectedDoors));

                                /* Windows */
                                var windowCounts = _card.createElevationWindowScreen(type
                                   , doors.questions[3]);
                                curSection.cards.push(windowCounts);

                                curSection.cards.push(_card.createElevationWindowLargePanels(type
                                    , doors.questions[3]));
                                var pwc = _card.createElevationWindowProtectedDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[3]
                                    , windowCounts);
                                curSection.cards.push(pwc);
                                curSection.cards.push(_card.createElevationWindowUnprotectedDamange(type
                                    , hasDamage.questions[0]
                                    , doors.questions[3]
                                    , windowCounts));


                                return curSection;

                            },


                            createExteriorSection: function (type, hasDamage) {

                                /* Exterior attachment section */
                                var curSection = new sails.services.domain.Section(type.toUpperCase() + ' Elevation Exterior');

                                var hasExt = _card.createElevationExteriorAtt(type, 'Exterior Attachment', 'Does this elevation side have any exterior attachments?');
                                curSection.cards.push(hasExt);

                                // exterior cards
                                curSection.cards.push(_card.createElevationExteriorType(type, 'Exterior Attachment Type', hasExt.questions[0], hasDamage, 1));


                                var hasExt2 = _card.createElevationExteriorAtt(type, '2nd Exterior Attachment', 'Does this elevation side have additional exterior attachments?', hasExt.questions[0]);
                                curSection.cards.push(hasExt2);
                                // exterior cards
                                curSection.cards.push(_card.createElevationExteriorType(type, '2nd Exterior Attachment Type', hasExt2.questions[0], hasDamage, 2));

                                var hasExt3 = _card.createElevationExteriorAtt(type, '3rd Exterior Attachment', 'Does this elevation side have additional exterior attachments?', hasExt2.questions[0]);
                                curSection.cards.push(hasExt3);
                                // exterior cards
                                curSection.cards.push(_card.createElevationExteriorType(type, '3rd Exteroir Attachment Type', hasExt3.questions[0], hasDamage, 3));


                                var hasExt4 = _card.createElevationExteriorAtt(type, '4th Exterior Attachment', 'Does this elevation side have additional exterior attachments?', hasExt3.questions[0]);
                                curSection.cards.push(hasExt4);
                                // exterior cards
                                curSection.cards.push(_card.createElevationExteriorType(type, '4th Exterior Attachment Type', hasExt4.questions[0], hasDamage, 4));

                                sails.log.info('Created exterior attachment eval');

                                return curSection;

                            },

                            createPhotoDocSection: function (name) {
                                /* Exterior attachment section */
                                var curSection = new sails.services.domain.Section(name.toUpperCase() + ' Elevation Photos');


                                curSection.cards.push(_card.createElevationPhoto(name, 'Photos 1', 'Please attach photos related to the ' + name.toUpperCase() + ' elevation.'));
                                curSection.cards.push(_card.createElevationPhoto(name, 'Photos 2', 'Please attach additional photos, if any, related to the ' + name.toUpperCase() + ' elevation.'));
                                curSection.cards.push(_card.createElevationPhoto(name, 'Photos 3', 'Please attach additional photos, if any, related to the ' + name.toUpperCase() + ' elevation.'));


                                sails.log.info('Created exterior attachment eval');

                                return curSection;

                            },

                            createRoofSection: function () {
                                /* Roof section */
                                var curSection = new sails.services.domain.Section('Roof Evaluation');

                                var name = '';
                                curSection.cards.push(_card.createRoofType(name));

                                curSection.cards.push(_card.createRoofShape(name))

                                var damage = _card.createRoofDamage(name);
                                curSection.cards.push(damage);

                                curSection.cards.push(_card.createRoofDamageElevations(name, damage.questions[0]));
                                curSection.cards.push(_card.createRoofDamageLocation(name, damage.questions[0]));
                                curSection.cards.push(_card.createRoofDamageItem(name, damage.questions[0]));
                                curSection.cards.push(_card.createRoofDamageCause(name, damage.questions[0]));
                                curSection.cards.push(_card.createRoofProtection(name, damage.questions[0]));
                                var decking = _card.createRoofDamageDecking(name, damage.questions[0]);
                                curSection.cards.push(decking);
                                curSection.cards.push(_card.createRoofCoveringDamage(name, damage.questions[0], decking));
                                curSection.cards.push(_card.createRoofDormers(name));


                                return curSection;

                            },

                            createDoneSection: function () {

                                var curSection = new sails.services.domain.Section('End');                                
                                var curCard = new sails.services.domain.Card('You are Done', 'Based on the answers you have provided, you have reached the end of this form. <br/><br/>Please review your answers by selecting the review button. You will then have the chance to submit your form. <br/><br/>Thank You!');
                                curSection.cards.push(curCard);

                                return curSection;

                            }

                        };

                        var _card = {

                            createStorm: function () {

                                var curType = null;
                                var curQ = null;

                                /* Storm and Foundation card */
                                var curCard = new sails.services.domain.Card('Storm and Foundation', 'Please specify the storm and foundation:');

                                // storm dropdown - required
                                // Hurricane Charlie
                                // Hurricane Sandy
                                // 2015 CA Mudslide
                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Hurricane Charlie', value: 'charlie' },
                                    { name: 'Hurricane Sandy', value: 'sandy' },
                                    { name: 'Hurricane Matthew', value: 'Hurricane Matthew' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What storm affected this property?');
                                curQ.fieldName = 'Affected Storm';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                // foundation type dropdown - required
                                //Basement
                                //Crawlspace
                                //Piers <= 8 feet, strapped
                                //Piers <= 8 feet, unstrapped
                                //Piers > 8 feet, strapped
                                //Piers > 8 feet, unstrapped                                //Pilings
                                //Slab on Grade
                                //Unknown
                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Basement', value: 'basement' },
                                    { name: 'Crawlspace', value: 'crawlspace' },
                                    { name: 'Piers <= 8 feet, strapped', value: 'piers_lte_8_strapped' },
                                    { name: 'Piers <= 8 feet, unstrapped', value: 'piers_lte_8_unstrapped' },
                                    { name: 'Piers > 8 feet, strapped', value: 'piers_gt_8_strapped' },
                                    { name: 'Piers > 8 feet, unstrapped', value: 'piers_gt_8_unstrapped' },
                                    { name: 'Pilings', value: 'pilings' },
                                    { name: 'Slab on Grade', value: 'slabs' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the property foundation type?');
                                curQ.fieldName = 'Foundation Type';
                                applyRequired(curQ);                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createStories: function(){

                                var curCard = new sails.services.domain.Card('Property Stories', 'How many stories does the home have?');

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                var curQ = new sails.services.domain.Question(curType, null, null, '# of Stories');
                                curQ.answer = 1;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                _dependencyCache.houseStoriesQ = curQ;

                                return curCard;
                            },

                            createPropertyDirection: function () {
                                /* property direction card */
                                var curCard = new sails.services.domain.Card('Property Direction', 'Enter direction at the front of the property with your back at the front door.');

                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Degrees';
                                curType.max = 359;
                                var curQ = new sails.services.domain.Question(curType, null, null, 'Property Direction');
                                curQ.answer = 180;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createAddressAsk: function(){
                                
                                var curCard = new sails.services.domain.Card('Address Available?', 'To support this evaluation, we would like to get the address of the property.');

                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType
                                    , 'Does this property have an address?'
                                    , null
                                    , 'Has Address?');
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createPropertyAddress: function (hasAddress) {
                                /* address card */
                                var curCard = new sails.services.domain.Card('Address', 'What is the address of the home?');
                                curCard.dependencies = [{
                                    questionId: hasAddress.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[0]);
                                curType.label = 'Address';
                                var curQ = new sails.services.domain.Question(curType, null, null, 'Address');
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[0]);
                                curType.label = 'City';
                                curQ = new sails.services.domain.Question(curType, null, null, 'City');
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = 'State';
                                curType.options = getStates();
                                curQ = new sails.services.domain.Question(curType, null, null, 'State');
                                curCard.questions.push(curQ);


                                //curType = clone(sails.services.constants.questionTypes[0]);
                                //curType.label = 'Zipcode';
                                //curType.type = 'tel';
                                //curQ = new sails.services.domain.Question(curType, null, null, 'zipcode');
                                //applyRequired(curQ);
                                //curCard.questions.push(curQ);

                                return curCard;



                            },

                            createPropertyElevation: function () {
                                /* elevation card */
                                var curCard = new sails.services.domain.Card('Elevation Accessibility', 'Are you able to obtain access to the following elevations?');
                                var curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Front Elevation';
                                var curQ = new sails.services.domain.Question(curType, 'Please select all elevations that are accessible:', null, 'Front Elevation Accessible?');
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);
                                _dependencyCache.frontElevationQ = curQ.id;

                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Left-Side Elevation';
                                curQ = new sails.services.domain.Question(curType, null, null, 'Left Elevation Accessible?');
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);
                                _dependencyCache.leftElevationQ = curQ.id;

                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Right-Side Elevation';
                                curQ = new sails.services.domain.Question(curType, null, null, 'Right Elevaton Accessible?');
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);
                                _dependencyCache.rightElevationQ = curQ.id;

                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Back Elevation';
                                curQ = new sails.services.domain.Question(curType, null, null, 'Back Eelvation Accessible?');
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);
                                _dependencyCache.backElevationQ = curQ.id;

                                return curCard;
                            },
                            
                            createElevation1: function (name) {

                                var curCard = new sails.services.domain.Card('Damage', 'We will now gather information about the ' + name.toUpperCase() + ' elevation.');

                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType, 'Was there any damage to this elevation side?');
                                curQ.fieldName = name + ' Elevation has Damage?';
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevation2: function (name) {
                                var curCard = new sails.services.domain.Card('Exposure', 'What is the general exposure surrounding the property on this side?');


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Shorter', value: 'shorter' },
                                    { name: 'Same', value: 'same' },
                                    { name: 'One Story Taller', value: '1_story_taller' },
                                    { name: 'More than one story taller', value: 'more_than_1_story_taller' },
                                    { name: 'There are no trees in the surrounding area', value: 'no_trees' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'Compared to the height of the surrounding trees, the house is:');
                                curQ.fieldName = name + ' Elevation : House height compared to trees';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Dense Suburban Dense Trees', value: 'dsdt'},
                                    { name: 'Dense Suburban Few Trees', value: 'dsft'},
                                    { name: 'Dense Trees', value: 'dt'},
                                    { name: 'Open Land', value: 'dl'},
                                    { name: 'Open Water', value: 'dw'},
                                    { name: 'Sparse Suburban Dense Trees', value: 'ssdt'},
                                    { name: 'Sparse Suburban Few Trees', value: 'ssft'},
                                    { name: 'Sparse Trees/Scrub', value: 'sts'}
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the general exposure on this elevation?');
                                curQ.fieldName = name + ' Elevation : General Exposure';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevation3: function (name) {

                                var curCard = new sails.services.domain.Card('Soffit Length', 'What is the maximum soffit overhang length (not including porches or lanais)?');

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'No Soffit', value: 'no_soffit'},
                                    { name: '< 6"', value: 'lt6'},
                                    { name: '6"', value: '6'},
                                    { name: '12"', value: '12'},
                                    { name: '16"', value: '16'},
                                    { name: '18"', value: '18'},
                                    { name: '24"', value: '24'},
                                    { name: '> 24"', value: 'gt24'},
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Soffit Overhang Length');
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevation4: function (name, soffitLen) {

                                var curCard = new sails.services.domain.Card('Soffit Material', 'What is the primary soffit material?');
                                curCard.dependencies = [{
                                    questionId: soffitLen.id,
                                    value: { value: 'no_soffit'},
                                    operator: 'option_neq'
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    //{ name: 'No Soffit', value: 'no_soffit' },
                                    { name: 'Aluminum', value: 'aluminum' },
                                    { name: 'Cement/Stucco', value: 'cement_stucco' },
                                    { name: 'Plywood/Panel', value: 'plywood_panel' },
                                    { name: 'Vinyl', value: 'vinyl' },
                                    { name: 'Wood - T&G', value: 'wood' },
                                    { name: 'Open Soffit', value: 'open_soffit' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType
                                    , 'If multiple soffit materials are found on the home, select the description that describes the material used most often.'
                                    , null, name + ' Elevation : Soffit Material');
                                applyRequired(curQ);
                                curCard.questions.push(curQ);
                                return curCard;

                            },

                            createElevation5: function(name, soffitLen){
                                var curCard = new sails.services.domain.Card('Soffit Vent', 'How is the soffit vented?');
                                curCard.dependencies = [{
                                    questionId: soffitLen.id,
                                    value: { value: 'no_soffit' },
                                    operator: 'option_neq'
                                }];

                                var curType = clone(sails.services.constants.questionTypes[3]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Non-Vented', value: 'non_vented' },
                                    { name: 'Partially Vented', value: 'partial' },
                                    { name: 'Vented', value: 'vented' }
                                ];
                                curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Soffit Vent');
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevation6: function (name, soffitLen, hasDamage) {

                                var curCard = new sails.services.domain.Card('Soffit Damage', 'Estimate the percentage of the soffit that is damaged on this elevation and record the percentage (0-100) to the nearest 5%');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: '0'
                                }, {
                                    questionId: soffitLen.id,
                                    value: { value: 'no_soffit' },
                                    operator: 'option_neq'
                                }];
                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Soffit Damage %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Soffit Damage %');
                                curQ.answer = 10;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Fascia Damage %';
                                curType.max = 100;
                                curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Facia Damage %');
                                curQ.answer = 10;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createFirstFloorWallMaterial: function (name) {
                                var curCard = new sails.services.domain.Card('Wall Material', 'Please provide information about the first floor wall material for the ' + name + ' elevation.');


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Aluminum Siding', value: 'aluminum' },
                                    { name: 'Brick', value: 'brick' },
                                    { name: 'CMU', value: 'cmu' },
                                    { name: 'Curtain Wall', value: 'curtain' },
                                    { name: 'EIFS', value: 'eifs' },
                                    { name: 'Fiber-Cement Board', value: 'fiber-cement' },
                                    { name: 'Metal', value: 'metal' },
                                    { name: 'Plywood Siding', value: 'plywood' },
                                    { name: 'Stucco', value: 'stucco' },
                                    { name: 'Vinyl Sliding', value: 'vinyl' },
                                    { name: 'Wood Boards', value: 'wood-board' },
                                    { name: 'Wood Shake/Shingle', value: 'wood-shake' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the primary first floor wall finish material?');
                                curQ.fieldName = name + ' Elevation : First Floor Wall Finish Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Masonry/Concrete', value: 'masonry-concrete' },
                                    { name: 'Steel Frame', value: 'steel' },
                                    { name: 'Wood Frame', value: 'wood' },
                                    { name: 'Other', value: 'other' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the primary first floor wall structural material?');
                                curQ.fieldName = name + ' Elevation : First Floor Wall Structural Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createFirstFloorWallDamage: function (name, dependency) {

                                var curCard = new sails.services.domain.Card('Wall Damage', 'Estimate the percentage of the first floor wall that is damaged on this elevation and record the percentage (0-100) to the nearest 5%');
                                curCard.dependencies = [{
                                    questionId: dependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];


                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Finish Damage %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType, 'Gable end should not be included as they will be estimated later.');
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : First Floor Wall Damage %';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Structure Damage %';
                                curType.max = 100;
                                curQ = new sails.services.domain.Question(curType);
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : First Floor Structure Damage %';
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createSecondFloorWallMaterial: function (name) {

                                // dependent on # of stories
                                var curCard = new sails.services.domain.Card('Wall Material', 'Please provide information about the primary upper floor(s) wall material for the ' + name + ' elevation.');
                                curCard.dependencies = [{
                                    questionId: _dependencyCache.houseStoriesQ.id,
                                    value: 1,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Aluminum Siding', value: 'aluminum' },
                                    { name: 'Brick', value: 'brick' },
                                    { name: 'CMU', value: 'cmu' },
                                    { name: 'Curtain Wall', value: 'curtain' },
                                    { name: 'EIFS', value: 'eifs' },
                                    { name: 'Fiber-Cement Board', value: 'fiber-cement' },
                                    { name: 'Metal', value: 'metal' },
                                    { name: 'Plywood Siding', value: 'plywood' },
                                    { name: 'Stucco', value: 'stucco' },
                                    { name: 'Vinyl Sliding', value: 'vinyl' },
                                    { name: 'Wood Boards', value: 'wood-board' },
                                    { name: 'Wood Shake/Shingle', value: 'wood-shake' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the primary upper floor(s) wall finish material?');
                                curQ.fieldName = name + ' Elevation : Primary Upper Floor Wall Finish Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Masonry/Concrete', value: 'masonry-concrete' },
                                    { name: 'Steel Frame', value: 'steel' },
                                    { name: 'Wood Frame', value: 'wood' },
                                    { name: 'Other', value: 'other' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the primary upper floor(s) wall structural material?');
                                curQ.fieldName = name + ' Elevation : Primary Upper Floor Structure Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createSecondFloorWallDamage: function (name, dependency) {

                                var curCard = new sails.services.domain.Card('Wall Damage', 'Estimate the percentage of the primary upper floor(s) wall that is damaged on this elevation and record the percentage (0-100) to the nearest 5%');
                                curCard.dependencies = [{
                                    questionId: _dependencyCache.houseStoriesQ.id,
                                    value: 1,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: dependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];


                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Finish Damage %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType, 'Gable end should not be included as they will be estimated later.');
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : Primary Upper Floor Wall Finish Damage %';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Structure Damage %';
                                curType.max = 100;
                                curQ = new sails.services.domain.Question(curType);
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : Primary Upper Floor Wall Structure Damage %';
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationGable: function (name) {

                                var curCard = new sails.services.domain.Card('Gable End Wall', 'Does this ' + name + ' elevation have a gable end wall?');

                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Gable End Wall?');
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevationGableMaterial: function (name, hasGableDependency) {

                                // dependent on # of stories
                                var curCard = new sails.services.domain.Card('Gable End Wall Material', 'Please provide information about the gable end wall material for the ' + name.toUpperCase() + ' elevation.');
                                curCard.dependencies = [{
                                    questionId: hasGableDependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Aluminum Siding', value: 'aluminum' },
                                    { name: 'Brick', value: 'brick' },
                                    { name: 'CMU', value: 'cmu' },
                                    { name: 'Curtain Wall', value: 'curtain' },
                                    { name: 'EIFS', value: 'eifs' },
                                    { name: 'Fiber-Cement Board', value: 'fiber-cement' },
                                    { name: 'Metal', value: 'metal' },
                                    { name: 'Plywood Siding', value: 'plywood' },
                                    { name: 'Stucco', value: 'stucco' },
                                    { name: 'Vinyl Sliding', value: 'vinyl' },
                                    { name: 'Wood Boards', value: 'wood-board' },
                                    { name: 'Wood Shake/Shingle', value: 'wood-shake' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the gable end wall finish material?');
                                curQ.fieldName = name + ' Elevation : Gable End Wall Finish Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Masonry/Concrete', value: 'masonry-concrete' },
                                    { name: 'Steel Frame', value: 'steel' },
                                    { name: 'Wood Frame', value: 'wood' },
                                    { name: 'Other', value: 'other' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the primary gable end wall structural material?');
                                curQ.fieldName = name + ' Elevation : Gable End Wall Structural Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevationGableDamage: function (name, hasGableDependency, hasDamageDependency) {

                                var curCard = new sails.services.domain.Card('Gable End Wall Damage', 'Estimate the percentage of the gable end wall that is damaged on this elevation and record the percentage (0-100) to the nearest 5%');
                                curCard.dependencies = [{
                                    questionId: hasDamageDependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: hasGableDependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];


                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Finish Damage %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : Gable End Wall Finish Damage %';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Structure Damage %';
                                curType.max = 100;
                                curQ = new sails.services.domain.Question(curType);
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : Gable End Wall Structure Damage %';
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationWallOpennings: function (name) {

                                var curCard = new sails.services.domain.Card('Wall Openings', 'Estimate the percentage of wall openings (windows, doors, etc) on the ' + name + ' elevation and record the percentage (0–100) to the nearest 5%');

                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Wall Openings %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.answer = 10;
                                curQ.fieldName = name + ' Elevation : Wall Openings %';
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            // roof covering
                            // covering material & type
                            createRoofType: function (name) {

                                // dependent on # of stories
                                var curCard = new sails.services.domain.Card('Roof Covering', 'We will now gather information about the roof for this property.');
                                

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Asphalt Shingles, 3 Tab/Thin', value: 'asphalt_shingles_3_tab' },
                                    { name: 'Asphalt Shingles, Architectural/Thick', value: 'asphalt_shingles_3d' },
                                    { name: 'Built-Up with Gravel', value: 'built_up_with_gravel' },
                                    { name: 'Built-Up without Gravel', value: 'built_up_without_gravel' },
                                    { name: 'Clay Tiles, Barrel', value: 'clay_tiles_barrel' },
                                    { name: 'Clay Tiles, Flat', value: 'clay_tiles_flat' },
                                    { name: 'Concrete Tiles, Barrel', value: 'concrete_tiles_barrel' },
                                    { name: 'Concrete Tiles, Flat', value: 'concrete_tiles_flat' },
                                    { name: 'Metal Tiles', value: 'metal_tiles' },
                                    { name: 'Metal, Corrugated/5V-CRIMP', value: 'metal_corrugated' },
                                    { name: 'Metal, Standing Seam', value: 'metal_standing_seam' },
                                    { name: 'Roll Roofing', value: 'roll_roofing' },
                                    { name: 'Single Ply', value: 'single_ply' },
                                    { name: 'Wood Shake', value: 'wood_shake' },
                                    { name: 'Wood Shingle', value: 'wood_shingle' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the roof covering material?');
                                curQ.fieldName = 'Roof Covering Material';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Yes', value: 'yes' },
                                    { name: 'No', value: 'no' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'Does the roof covering have multiple layers?');
                                curQ.fieldName = 'Roof Covering Has Multiple Layers';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            // roof shape & slope
                            // shape
                            // complex
                            // slope
                            createRoofShape: function (name) {

                                // dependent on # of stories
                                var curCard = new sails.services.domain.Card('Roof Shape & Slope', '');


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Dome', value: 'dome' },
                                    { name: 'Dutch Hip', value: 'dutch_hip' },
                                    { name: 'Flat', value: 'flat' },
                                    { name: 'Gable', value: 'gable' },
                                    { name: 'Gable/Hip Combo', value: 'gable_hip' },
                                    { name: 'Gambrel', value: 'gambrel' },
                                    { name: 'Hip', value: 'hip' },
                                    { name: 'Mansard', value: 'mansard' },
                                    { name: 'Shed', value: 'shed' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the primary shape of the roof?');
                                curQ.fieldName = 'Primary Roof Shape';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Yes', value: 'yes' },
                                    { name: 'No', value: 'no' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'Does the roof have a complex shape?');
                                curQ.fieldName = 'Roof Has Complex Shape';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Shallow (0 – 10 Degrees) – Roofs with a maximum of 2/12 slope.', value: 'shallow'},
                                    { name: 'Moderate (11 – 30 Degrees) - Roof slopes between 2/12 and 7/12.', value: 'moderate'},
                                    { name: 'Steep (> 30 Degrees) – Roof slopes greater than 7/12.', value: 'steep' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                curQ = new sails.services.domain.Question(curType, 'What is the primary slope of the roof?');
                                curQ.fieldName = 'Primary Roof Slope';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },
                            
                            // roof damage
                            // yes/no
                            createRoofDamage: function(name){
                                
                                var curCard = new sails.services.domain.Card('Roof Damage', 'Was there any damage to the roof covering or decking?');

                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Has Roof or Decking Damage?';
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            // roof damage
                            // damaged elevations
                            createRoofDamageElevations: function(name, roofDamage){
                                
                                var curCard = new sails.services.domain.Card('Roof Damaged Elevations', 'What elevations did damage occur on?');
                                curCard.dependencies = [{
                                    questionId: roofDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                // TODO: card validation - at least one

                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Front Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Front Elevation : Has Roof Damage';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Left Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Left Elevation : Has Roof Damage';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Back Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Back Elevation : Has Roof Damage';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Right Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Right Elevation : Has Roof Damage';
                                curCard.questions.push(curQ);

                                return curCard;
                                
                            },

                            // roof damage
                            // damaged location
                            createRoofDamageLocation: function (name, roofDamage) {

                                var curCard = new sails.services.domain.Card('Roof Damage Locations', 'Where was the location of the roof damage?');
                                curCard.dependencies = [{
                                    questionId: roofDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                // TODO: card validation - at least one

                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Chimney/Wood Stove';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Chimney/Wood Stove Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Dormers';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Dormers Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Eave Edge';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Eave Edge Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Power Vents';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Power Vents Damaged';
                                curCard.questions.push(curQ);                                
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Rake Edge';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Rake Edge Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Raised Entrance';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Raised Entrance Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Ridge';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Ridge Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Hip Ridge';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Hip Ridge Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Ridge Vents';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Ridge Vents Damaged';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Skylights';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Skylights Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Total Collapse';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Total Collapse';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Field';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Roof Field Damaged';
                                curCard.questions.push(curQ);
                                

                                return curCard;

                            },

                            // roof damage
                            // damaged item
                            createRoofDamageItem: function (name, roofDamage) {

                                var curCard = new sails.services.domain.Card('Roof Damage Items', 'What rooftop items were damaged?');
                                curCard.dependencies = [{
                                    questionId: roofDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                // TODO: card validation - at least one
                                                                
                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'None';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'No Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Chimney/Wood Stove';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Chimney/Wood Stove Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Dormers';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Dormers Rooftop Item Damaged';
                                curCard.questions.push(curQ);
                                
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Gable Rake Edge';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Gable Rake Edge Rooftop Item Damaged';
                                curCard.questions.push(curQ);
                                
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Lightning Protection';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Lightning Protection Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Power Vents';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Power Vents Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Raised Entrance';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Raised Entrance Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Ridge Vents';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Ridge Vents Rooftop Item Damaged';
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Skylights';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName ='Skylights Rooftop Item Damaged';
                                curCard.questions.push(curQ);
                                
                                return curCard;

                            },

                            // roof damage
                            // damage cause
                            createRoofDamageCause: function (name, roofDamage) {

                                var curCard = new sails.services.domain.Card('Roof Damage Cause', 'What caused the roof damage?');
                                curCard.dependencies = [{
                                    questionId: roofDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                // TODO: card validation - at least one

                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Trees';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Trees Caused Roof Damage';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Wind';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Wind Caused Roof Damage';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Wind Borne Debris';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Wind Borne Debris Caused Roof Damage';
                                curCard.questions.push(curQ);
                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Unknown';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName ='Roof Damage Cause Unknown';
                                curCard.questions.push(curQ);
                                
                                return curCard;

                            },

                            // roof damage
                            // temp protection?
                            // % of roof covered
                            createRoofProtection: function(name, roofDamage){
                                
                                var curCard = new sails.services.domain.Card('Damage Temporary Protection', 'Does the roof have a tarp or temporary protection that limits the damage inspection?');
                                curCard.dependencies = [{
                                    questionId: roofDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName ='Roof Damage Has Temporary Protection';
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);


                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = '';
                                curType.min = 1;
                                curType.max = 100;
                                var percent = new sails.services.domain.Question(curType
                                                , 'Estimate the percentage of roof that is covered by a tarp on all elevations and record the percentage (0-100) to the nearest 5%.'
                                                , null
                                                , '% of Roof Covered by Tarp');
                                percent.answer = 10;
                                percent.dependencies = [
                                    {
                                        questionId: curQ.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }
                                ];
                                curCard.questions.push(percent);

                                return curCard;
                            },

                            // roof decking damage
                            // decking damage %
                            // underlayment damage %
                            createRoofDamageDecking: function (name, hasDamage) {

                                var curCard = new sails.services.domain.Card('Roof Decking Damage', 'Estimate the percentage of roof decking and underlayment damage on all elevations and record the percentage (0-100) to the nearest 5%.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq'
                                }];
                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Roof Decking Damage %';
                                curType.max = 100;
                                var q1 = new sails.services.domain.Question(curType, null, null, 'Roof Decking Damage %');
                                q1.answer = 10;
                                curCard.questions.push(q1);



                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Roof Underlayment Damage %';
                                curType.max = 100;
                                var q2 = new sails.services.domain.Question(curType, null, null, 'Roof Underlayment Damage %');
                                q2.answer = 10;


                                var cardValidation = new sails.services.domain.Validator('gte'
                                   , 'question'
                                   , q1.id
                                    , {
                                        title: 'Invalid Roof Underlayment Damage %',
                                        body: 'The % of roof UNDERLAYMENT DAMAGE needs to be greater or equal to the roof DECKING DAMAGE.'
                                    });
                                q2.validators = [cardValidation];

                                curCard.questions.push(q2);

                                return curCard;
                            },

                            // roof covering damage
                            // covering damage
                            // covering missing
                            createRoofCoveringDamage: function (name, hasDamage, deckingDamage) {

                                var curCard = new sails.services.domain.Card('Roof Covering Damage', 'Estimate the percentage of roof covering damage (that is still in place) and missing roof covering on all elevations and record the percentage (0-100) to the nearest 5%.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq'
                                }];
                                var curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Roof Covering Damage %';
                                curType.max = 100;
                                var curQ = new sails.services.domain.Question(curType, null, null, 'Roof Covering Damge %');
                                curQ.answer = 10;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[5]);
                                curType.label = 'Roof Covering Missing %';
                                curType.max = 100;
                                curQ = new sails.services.domain.Question(curType, null, null, 'Roof Covering Missing %');
                                curQ.answer = 10;
                                curCard.questions.push(curQ);

                                var cardValidation = new sails.services.domain.Validator('gte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: deckingDamage.questions[0].id, operator: '+' },
                                       { type: 'question', value: deckingDamage.questions[1].id, operator: '+' }
                                   ]
                                   , {
                                       title: 'Invalid Roof Covering Damage',
                                       body: 'The sum of ROOF COVERING DAMAGE and ROOF COVERING MISSING needs to be greater than or equal to the UNDERLAYMENT DAMAGE.'
                                   }
                                    , 'sum');
                                var cardValidation2 = new sails.services.domain.Validator('lte'
                                   , 'static'
                                   , 100
                                   , {
                                       title: 'Invalid Roof Covering Damage',
                                       body: 'The sum of ROOF COVERING DAMAGE and ROOF COVERING MISSING cannot exceed 100%.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation, cardValidation2];

                                return curCard;
                            },


                            // roof doormers
                            // has?
                            // locations?
                            createRoofDormers: function (name) {

                                var curCard = new sails.services.domain.Card('Roof Dormers', 'Does the roof have roof dormers?');
                                
                                var curType = clone(sails.services.constants.questionTypes[6]);
                                var dormers = new sails.services.domain.Question(curType);
                                dormers.fieldName = 'Has Roof Dormers';
                                dormers.hasDependents = true;
                                applyRequired(dormers);
                                curCard.questions.push(dormers);

                                var cardValidation = new sails.services.domain.Validator('gtez'
                                   , 'static'
                                   , 2
                                   , {
                                       title: 'Dormer elevation not specified',
                                       body: 'You have specified that there are roof dormers but have not selected an elevation. Please select an elevation or specify that there are no doormers.'
                                   }
                                    , 'count_true');
                                curCard.validators = [cardValidation];


                                // TODO: card validation - at least one if has dormers
                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Front Elevation';
                                var curQ = new sails.services.domain.Question(curType, 'Which elevations do the dormers appear?');
                                curQ.fieldName = 'Front Elevation Has Roof Dormers';
                                curQ.dependencies = [
                                    {
                                        questionId: dormers.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }
                                ];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Left Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Left Elevation Has Roof Dormers';
                                curQ.dependencies = [
                                    {
                                        questionId: dormers.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }
                                ];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Back Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Back Elevation Has Roof Dormers';
                                curQ.dependencies = [
                                    {
                                        questionId: dormers.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }
                                ];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Right Elevation';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = 'Right Elevation Has Roof Dormers';
                                curQ.dependencies = [
                                    {
                                        questionId: dormers.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }
                                ];
                                curCard.questions.push(curQ);

                                return curCard;
                            },
                            
                            // garage doors
                            createElevationGarage: function (name, text, idx) {

                                var curCard = new sails.services.domain.Card('Garage', text);

                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Garage' + idx);
                                curQ.hasDependents = true;
                                applyRequired(curQ);
                                curCard.questions.push(curQ);
                                
                                return curCard;

                            },

                            // garage size
                            createElevationGarageSize: function(name, garageDependency, idx){

                                var curCard = new sails.services.domain.Card('Garage Size & Rating', 'Please provide the size and rating of the garage door for the ' + name.toUpperCase() + ' elevation.');
                                curCard.dependencies = [{
                                    questionId: garageDependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Double', value: 'double' },
                                    { name: 'Single', value: 'single' },
                                    { name: 'Mini', value: 'mini' },
                                    { name: 'Oversized', value: 'oversized' },
                                    { name: 'Unknown', value: 'unknown' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the size of the garage door?');
                                curQ.fieldName = name + ' Elevation : Garage' + idx + ' Size';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: '< 20', value: '<20' },
                                    { name: '20-30', value: '20-30' },
                                    { name: '31-40', value: '31-40' },
                                    { name: '41-50', value: '41-50' },
                                    { name: '51-60', value: '51-60' },
                                    { name: '> 60', value: '60+' },
                                    { name: 'unknown', value: 'unknown'}
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the design pressure rating of the garage door?');
                                curQ.fieldName = name + ' Elevation : Garage' + idx + ' Rating';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            // garage damage
                            createElevationGarageDamage: function (name, garageDependency, hasDamage, idx) {

                                var curCard = new sails.services.domain.Card('Garage Damage', 'If there was damage to the garage please select the damage level that best describes it.');
                                curCard.dependencies = [{
                                    questionId: garageDependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Door Partially Breached', value: 'door_partially_breached' },
                                    { name: 'Door Fully Breached', value: 'door_fully_breached' },
                                    { name: 'Glass Breached', value: 'glass_breached' },
                                    { name: 'Minor Damage', value: 'minor_damage' },
                                    { name: 'One or More Small Penetrations', value: 'one_or_more_small_penetrations' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the level of damage to the garage door?');
                                curQ.fieldName = name + ' Elevation : Garage' + idx + ' Door Damage Level';
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },
                            
                            createElevationDoors: function (name) {
                                /* elevation card */
                                var curCard = new sails.services.domain.Card('Entry Doors and Windows', 'Please select the following doors and windows that exist on this elevation.');
                                

                                var curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Single Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, '', null, name + ' Elevation : Has Single Entry Doors');
                                curQ.hasDependents = true;
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Double Entry Doors';
                                curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Double Entry Doors');
                                curQ.hasDependents = true;
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Slider Entry Doors';
                                curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Slider Entry Doors');
                                curQ.hasDependents = true;
                                curQ.answer = false;
                                curCard.questions.push(curQ);
                                
                                curType = clone(sails.services.constants.questionTypes[7]);
                                curType.label = 'Has Windows';
                                curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Windows');
                                curQ.hasDependents = true;
                                curQ.answer = false;
                                curCard.questions.push(curQ);


                                return curCard;
                            },
                            
                            // Single entry
                            createElevationSingleEntryDoor1: function (name, singleEntryDependency) {

                                var curCard = new sails.services.domain.Card('Single Entry Doors', 'Please specify the number of each single entry door types that are present:');
                                curCard.dependencies = [{
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range

                                }];

                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('gt'
                                   , 'static'
                                   , 0
                                   , {
                                       title: 'Invalid Single Entry Door Counts',
                                       body: 'You have specified that there are single entry doors but have not specified the count of each type. Please enter the count of each type of single entry door or go back and de-select single entry doors if there are none.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Solid Entry Doors (with or without sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Solid Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Glass Entry Doors (with or without sidelights - glass door includes doors with glass and windows)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Glass Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# Sidelights for Single Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Sidelights');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                //_dependencyCache.houseStoriesQ = curQ;

                                return curCard;
                            },

                            createElevationSingleEntryDoorProtected: function (name, singleEntryDependency, doorCounts) {

                                var curCard = new sails.services.domain.Card('Single Entry Doors Protection', 'Please specify the number of single entry doors that were adequately rated or show visible signs of impact protection.');
                                curCard.dependencies = [{
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Protected Solid Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Protected Solid Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , doorCounts.questions[0].id
                                    ,{
                                        title: 'Invalid Protected Solid Entry Count',
                                        body: 'The entered amount exceeds the number of SOLID DOORS you previously specified, please enter a value that is equal to or less than the specified solid doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Protected Glass Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Protected Glass Entry Doors');
                                curQ.answer = 0
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                    , 'question'
                                    , doorCounts.questions[1].id
                                    , {
                                        title: 'Invalid Protected Glass Entry Count',
                                        body: 'The entered amount exceeds the number of GLASS ENTRY DOORS you previously specified, please enter a value that is equal to or less than the specified glass entry doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# Protected Sidelights for Single Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : # of Protected Sidelights');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                    , 'question'
                                    , doorCounts.questions[2].id
                                    , {
                                        title: 'Invalid Protected Sidelight Entry Count',
                                        body: 'The entered amount exceeds the number of SIDELIGHT DOORS you previously specified, please enter a value that is equal to or less than the specified sidelight doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);
                                
                                return curCard;
                            },

                            createElevationSingleProtectedDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Single Entry Solid Door Damage', 'Enter the total number of PROTECTED single entry solid doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[0].id
                                   , {
                                       title: 'Invalid Protected Solid Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED SOLID DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];
                                
                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Solid Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Solid Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSingleUnProtectedDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Single Entry Solid Door Damage', 'Enter the total number of UNPROTECTED single entry solid doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];


                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [ 
                                       { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-'}
                                       ]
                                   , {
                                       title: 'Invalid Unprotected Solid Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED SOLID DOORS and DAMAGED UNPROTECTED SOLID DOORS does not equal to the total number of SOLID DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Solid Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Solid Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSingleProtectedGlassDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Single Entry Glass Door Damage', 'Enter the total number of PROTECTED single entry glass doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[1].id
                                   , {
                                       title: 'Invalid Protected Glass Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED GLASS DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Glass Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Glass Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSingleUnProtectedGlassDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Single Entry Glass Door Damage', 'Enter the total number of UNPROTECTED single entry glass doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];


                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Glass Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED GLASS DOORS and DAMAGED UNPROTECTED GLASS DOORS does not equal to the total number of GLASS DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Glass Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Glass Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSingleProtectedGlassDoorDamgeCounts: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount, damageDoorCount) {

                                var curCard = new sails.services.domain.Card('Protected Single Entry Glass Door Damage Area', 'How many of the PROTECTED single entry glass doors have the following damages?');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    or: [
                                        { questionId: damageDoorCount.questions[0].id, operator: 'gt', value: 0 },
                                        { questionId: damageDoorCount.questions[1].id, operator: 'gt', value: 0 }
                                    ]
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[1].id
                                   , {
                                       title: 'Invalid Protected Door Glass Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED GLASS DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum'); 
                                var cardValidation2 = new sails.services.domain.Validator('eq'
                                   , 'card'
                                   , damageDoorCount.id
                                   , {
                                       title: 'Invalid Counts',
                                       body: 'The sum of the damaged door types does not equal the number of DAMAGED PROTECTED GLASS DOORS you previously specified, please ensure that all damaged doors are accounted for.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation, cardValidation2];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to GLASS Portion Only (not including sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to SOLID Portion Only';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to BOTH Glass and Solid Portion';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationSingleUnProtectedGlassDoorDamgeCounts: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount, damageDoorCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Single Entry Glass Door Damage Area', 'How many of the UNPROTECTED single entry glass doors have the following damages?');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    or: [
                                        { questionId: damageDoorCount.questions[0].id, operator: 'gt', value: 0 },
                                        { questionId: damageDoorCount.questions[1].id, operator: 'gt', value: 0 }
                                    ]
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];


                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Door Glass Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED GLASS DOORS and DAMAGED UNPROTECTED GLASS DOORS does not equal to the total number of GLASS DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                var cardValidation2 = new sails.services.domain.Validator('eq'
                                   , 'card'
                                   , damageDoorCount.id
                                   , {
                                       title: 'Invalid Counts',
                                       body: 'The sum of the damaged door types does not equal the number of DAMAGED UNPROTECTED GLASS DOORS you previously specified, please ensure that all damaged doors are accounted for.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation, cardValidation2];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to GLASS Portion Only (not including sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors unprotected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to SOLID Portion Only';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors unprotected : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to BOTH Glass and Solid Portion';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors unprotected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationSingleProtectedSidelightDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Single Entry Door Sidelights Damage', 'Enter the total number of PROTECTED single entry sidelights that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[2].id
                                   , {
                                       title: 'Invalid Protected Sidelight Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED SIDELIGHT DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Sidelights with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Sidelights with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSingleUnProtectedSidelightDoorDamange: function (name, hasDamage, singleEntryDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Single Entry Door Sidelights Damage', 'Enter the total number of UNPROTECTED single entry sidelights that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: singleEntryDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[2].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[2].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[2].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[2].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Sidelight Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED SIDELIGHT DOORS and DAMAGED UNPROTECTED SIDELIGHT DOORS does not equal to the total number of SIDELIGHT DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Sidelights with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Sidelights with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Single Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            // Double entry
                            createElevationDoubleEntryDoor1: function (name, doorDependency) {

                                var curCard = new sails.services.domain.Card('Double Entry Doors', 'Please specify the number of each double entry door types that are present:');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('gt'
                                   , 'static'
                                   , 0
                                   , {
                                       title: 'Invalid Single Entry Door Counts',
                                       body: 'You have specified that there are double entry doors but have not specified the count of each type. Please enter the count of each type of double entry door or go back and de-select double entry doors if there are none.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Solid Entry Doors (with or without sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : # of Solid Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Glass Entry Doors (with or without sidelights - glass doors include doors with glass or windows)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : # of Glass Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# Sidelights for Double Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : # Sidelights');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                //_dependencyCache.houseStoriesQ = curQ;

                                return curCard;
                            },

                            createElevationDoubleEntryDoorProtected: function (name, doorDependency, doorCounts) {

                                var curCard = new sails.services.domain.Card('Double Entry Doors Protection', 'Please specify the number of double entry doors that were adequately rated or show visible signs of impact protection.');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Protected Solid Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation: # of Protected Solid Double Entry Doors');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , doorCounts.questions[0].id
                                    , {
                                        title: 'Invalid Protected Solid Entry Count',
                                        body: 'The entered amount exceeds the number of SOLID DOORS you previously specified, please enter a value that is equal to or less than the specified solid doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Protected Glass Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : # of Protected Glass Entry Doors');
                                curQ.answer = 0
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , doorCounts.questions[1].id
                                    , {
                                        title: 'Invalid Protected Glass Entry Count',
                                        body: 'The entered amount exceeds the number of GLASS DOORS you previously specified, please enter a value that is equal to or less than the specified glass doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Protected Sidelights for Double Entry Doors';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : # of Protected Sidelights');
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curQ.dependencies = [{
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt'
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , doorCounts.questions[2].id
                                    , {
                                        title: 'Invalid Protected Sidelight Entry Count',
                                        body: 'The entered amount exceeds the number of SIDLIGHT DOORS you previously specified, please enter a value that is equal to or less than the specified slider doors.'
                                    });
                                curQ.validators = [cardValidation];
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationDoubleProtectedDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Double Entry Solid Door Damage', 'Enter the total number of PROTECTED double entry solid doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[0].id
                                   , {
                                       title: 'Invalid Protected Solid Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED SOLID DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Solid Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Solid Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationDoubleUnProtectedDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Double Entry Solid Door Damage', 'Enter the total number of UNPROTECTED double entry solid doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Solid Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED SOLID DOORS and DAMAGED UNPROTECTED SOLID DOORS does not equal to the total number of SOLID DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Solid Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Solid Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationDoubleProtectedGlassDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Double Entry Glass Door Damage', 'Enter the total number of PROTECTED double entry glass doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[1].id
                                   , {
                                       title: 'Invalid Protected Glass Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED GLASS DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Glass Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Glass Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationDoubleUnProtectedGlassDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Double Entry Glass Door Damage', 'Enter the total number of UNPROTECTED double entry glass doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Glass Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED GLASS DOORS and DAMAGED UNPROTECTED GLASS DOORS does not equal to the total number of GLASS DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Glass Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Glass Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationDoubleProtectedGlassDoorDamgeCounts: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount, damageDoorCount) {

                                var curCard = new sails.services.domain.Card('Protected Double Entry Glass Doors Damage Area', 'How many of the PROTECTED double entry glass doors have the following damages?');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    or: [
                                        { questionId: damageDoorCount.questions[0].id, operator: 'gt', value: 0 },
                                        { questionId: damageDoorCount.questions[1].id, operator: 'gt', value: 0 }
                                    ]
                                }];

                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[1].id
                                   , {
                                       title: 'Invalid Protected Door Glass Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED GLASS DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                var cardValidation2 = new sails.services.domain.Validator('eq'
                                   , 'card'
                                   , damageDoorCount.id
                                   , {
                                       title: 'Invalid Counts',
                                       body: 'The sum of the damaged door types does not equal the number of DAMAGED PROTECTED GLASS DOORS you previously specified, please ensure that all damaged doors are accounted for.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation, cardValidation2];


                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to GLASS Portion Only (not including sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to SOLID Portion Only';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to BOTH Glass and Solid Portion';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Protected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationDoubleUnProtectedGlassDoorDamgeCounts: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount, damageDoorCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Double Entry Glass Door Damage Area', 'How many of the UNPROTECTED double entry glass doors have the following damages?');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    or: [
                                        { questionId: damageDoorCount.questions[0].id, operator: 'gt', value: 0 },
                                        { questionId: damageDoorCount.questions[1].id, operator: 'gt', value: 0 }
                                    ]
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[1].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[1].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Doors Glass Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED GLASS DOORS and DAMAGED UNPROTECTED GLASS DOORS does not equal to the total number of GLASS DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                var cardValidation2 = new sails.services.domain.Validator('eq'
                                   , 'card'
                                   , damageDoorCount.id
                                   , {
                                       title: 'Invalid Counts',
                                       body: 'The sum of the damaged door types does not equal the number of DAMAGED UNPROTECTED GLASS DOORS you previously specified, please ensure that all damaged doors are accounted for.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation, cardValidation2];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to GLASS Portion Only (not including sidelights)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Unprotected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to SOLID Portion Only';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Unprotected : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = 'Damage to BOTH Glass and Solid Portion';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors Unprotected : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationDoubleProtectedSidelightDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Double Entry Door Sidelights Damage', 'Enter the total number of PROTECTED double entry sidelights that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];


                                // add card validation
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[2].id
                                   , {
                                       title: 'Invalid Protected Sidelight Doors Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED SIDELIGHT DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Sidelights with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Sidelights with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationDoubleUnProtectedSidelightDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Double Entry Door Sidelights Damage', 'Enter the total number of UNPROTECTED double entry sidelights that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: doorCounts.questions[2].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[2].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[2].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[2].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[2].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Sidelight Doors Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED SIDELIGHT DOORS and DAMAGED UNPROTECTED SIDELIGHT DOORS does not equal to the total number of SIDELIGHT DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Sidelights with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Sidelights with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation - Double Entry Doors : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            // Slider screens
                            createElevationSliderScreen: function (name, doorDependency) {

                                var curCard = new sails.services.domain.Card('Slider Entry Doors', 'Please specify the number of slider entry doors that are present:');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // 
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Slider Entry Doors';
                                curType.min = 1;
                                var q1 = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                q1.answer = 1;
                                q1.hasDependents = true;
                                curCard.questions.push(q1);


                                return curCard;
                            },

                            createElevationSliderTypes: function(name, doorDependency, sliderCount){

                                var curCard = new sails.services.domain.Card('Slider Entry Door Types', 'Please select the types of sliders on this elevation:');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // card validation - at least one
                                curCard.validators = [];
                                curCard.validators.push(new sails.services.domain.Validator('eq'
                                   , 'static' // compare type: validate with static value
                                   , true // compare value: validate to match this value
                                   , { // error message
                                       title: 'Slide Entry Types Required',
                                       body: 'You have specified that there are SLIDE ENTRY doors on this elevation but have not specified the existing types. Please specify which types exists on this elevation or go back and de-select slide entry doors if there are none.'
                                   }
                                    , 'bool_or' // aggregate function to execute and compare with value
                                    ));
                                curCard.validators.push(new sails.services.domain.Validator(
                                    'lte'
                                    , 'question'
                                    , sliderCount.id
                                    , {
                                        title: 'Invalid Selection',
                                        body: 'The number of selected SLIDE ENTRY door TYPES exceeds the SLIDE ENTRY door COUNTS that you previously specified. Please select the correct number of slide entry door types.'
                                    }
                                    , 'count_true' ));
                                
                                var curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Two Panel Slider';
                                var curQ = new sails.services.domain.Question(curType
                                    , null
                                    , null, name + ' Elevation : Has Two Panel Slider');
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Three Panel Slider';
                                var curQ = new sails.services.domain.Question(curType
                                    , null
                                    , null, name + ' Elevation : Has Three Panel Slider');
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Four Panel Slider';
                                var curQ = new sails.services.domain.Question(curType
                                    , null
                                    , null, name + ' Elevation : Has Four Panel Slider');
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[8]);
                                curType.label = 'Other';
                                var curQ = new sails.services.domain.Question(curType
                                    , null
                                    , null, name + ' Elevation : Has Other Slider');
                                curQ.answer = false;
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevationSliderProtected: function (name, doorDependency, doorCounts) {

                                var curCard = new sails.services.domain.Card('Slider Entry Door Protection', 'How many of the slider entry doors were adequately rated or show visible signs of protection?');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Slider Entry Doors';
                                var q1 = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                q1.answer = 0;
                                q1.hasDependents = true;

                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , doorCounts.questions[0].id
                                    , {
                                        title: 'Invalid Protected Slider Door Count',
                                        body: 'The entered amount exceeds the number of SLIDE ENTRY DOORS you previously specified, please enter a value that is equal to or less than the specified slider doors.'
                                    });
                                q1.validators = [cardValidation];
                                curCard.questions.push(q1);

                                return curCard;

                            },

                            createElevationSliderProtectedDoorDamange: function (name, hasDamage, doorDependency, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Protected Slider Entry Door Damage', 'Enter the total number of PROTECTED slider entry doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedDoorsCount.questions[0].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , protectedDoorsCount.questions[0].id
                                   , {
                                       title: 'Invalid Protected Slider Door Damage Counts',
                                       body: 'The sum of the damaged door counts exceed the number of PROTECTED SLIDE ENTRY DOORS you previously specified, please enter values that do not exceed the previously specified protected door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Slider Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Slider Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationSliderUnProtectedDoorDamange: function (name, hasDamage, doorDependency, doorCounts, protectedDoorsCount) {

                                var curCard = new sails.services.domain.Card('Unprotected Slider Entry Door Damage', 'Enter the total number of UNPROTECTED slider entry doors that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                        { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];


                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: doorCounts.questions[0].id, operator: '+' },
                                       { type: 'question', value: protectedDoorsCount.questions[0].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Slider Door Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED SLIDER DOORS and DAMAGED UNPROTECTED SLIDER DOORS does not equal to the total number of SLIDER DOORS you previously specified, please enter values that do not exceed the previously specified total door count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Slider Doors with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Slider Doors with MAJOR Damage (blown open)';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            // Windows
                            createElevationWindowScreen: function (name, doorDependency) {

                                var curCard = new sails.services.domain.Card('Windows', 'How many windows are present on this elevation?');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                // 
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of Windows';
                                curType.min = 1;
                                var q1 = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                q1.answer = 1;
                                q1.hasDependents = true;
                                curCard.questions.push(q1);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Windows';
                                var q2 = new sails.services.domain.Question(curType, 'How many of the windows show visible signs of protection?', null, name + ' Elevation : ' + curType.label);
                                q2.answer = 0;
                                q2.hasDependents = true;
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'question'
                                   , q1.id
                                    , {
                                        title: 'Invalid Count',
                                        body: 'The number of PROTECTED WINDOWS entered exceeds the number of WINDOWS you specified, please enter a value that is equal to or less than the specified window count.'
                                    });
                                q2.validators = [cardValidation];
                                curCard.questions.push(q2);
                                
                                return curCard;
                            },

                            createElevationWindowLargePanels: function (name, doorDependency) {

                                var curCard = new sails.services.domain.Card('Large Window Panels', 'Does this elevation side have any extra large window panels?');
                                curCard.dependencies = [{
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                var curType = clone(sails.services.constants.questionTypes[6]);

                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : Has Large Window Panels');
                                applyRequired(curQ);
                                curCard.questions.push(curQ);

                                return curCard;

                            },

                            createElevationWindowProtectedDamange: function (name, hasDamage, doorDependency, protectedWindows) {

                                var curCard = new sails.services.domain.Card('Protected Windows Damage', 'Enter the total number of PROTECTED windows that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    questionId: protectedWindows.questions[1].id,
                                    value: 0,
                                    operator: 'gt' //eq|neq|lte|gte|gt|lt|range
                                }];
                                var cardValidation = new sails.services.domain.Validator('lte'
                                  , 'question'
                                  , protectedWindows.questions[1].id
                                  , {
                                      title: 'Invalid Protected Window Damage Counts',
                                      body: 'The sum of the damaged door counts exceed the number of PROTECTED WINDOWS you previously specified, please enter values that do not exceed the previously specified protected windows count.'
                                  }
                                   , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Windows with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of PROTECTED Windows with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            createElevationWindowUnprotectedDamange: function (name, hasDamage, doorDependency, windowCounts) {


                                var curCard = new sails.services.domain.Card('Unprotected Windows Damage', 'Enter the total number of UNPROTECTED windows that experienced damages on this elevation.');
                                curCard.dependencies = [{
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq',
                                    valueIfFail: 'n/a'
                                }, {
                                    questionId: doorDependency.id,
                                    value: true,
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }, {
                                    sum: [
                                        { type: 'question', value: windowCounts.questions[0].id, operator: '+' },
                                        { type: 'question', value: windowCounts.questions[1].id, operator: '-' }
                                    ],
                                    value: 0,
                                    operator: 'gt'
                                }];

                                // card validation - must not exceed prev values
                                var cardValidation = new sails.services.domain.Validator('lte'
                                   , 'expression'
                                   , [
                                       { type: 'question', value: windowCounts.questions[0].id, operator: '+' },
                                       { type: 'question', value: windowCounts.questions[1].id, operator: '-' }
                                   ]
                                   , {
                                       title: 'Invalid Unprotected Window Damage Counts',
                                       body: 'The sum of DAMAGED PROTECTED WINDOWS and DAMAGED UNPROTECTED WINDOWS does not equal to the total number of WINDOWS you previously specified, please enter values that do not exceed the previously specified total window count.'
                                   }
                                    , 'sum');
                                curCard.validators = [cardValidation];

                                // #stories - counter - required
                                var curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Windows with MINOR Damage';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0;
                                curCard.questions.push(curQ);

                                curType = clone(sails.services.constants.questionTypes[4]);
                                curType.label = '# of UNPROTECTED Windows with MAJOR Damage/Breached';
                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + curType.label);
                                curQ.answer = 0
                                curCard.questions.push(curQ);


                                return curCard;
                            },

                            // Exterior Attachments
                            createElevationExteriorAtt: function (name, title, text, hasMore) {
                                var curCard = new sails.services.domain.Card(title, text);
                                
                                if (hasMore) {
                                    curCard.dependencies = [{
                                        questionId: hasMore.id,
                                        value: 'yes',
                                        operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    }];
                                }

                                var curType = clone(sails.services.constants.questionTypes[6]);


                                var curQ = new sails.services.domain.Question(curType, null, null, name + ' Elevation : ' + title);
                                applyRequired(curQ);
                                curQ.hasDependents = true;
                                curCard.questions.push(curQ);

                                return curCard;
                            },

                            createElevationExteriorType: function (name, title, dependency, hasDamage, idx) {

                                var curCard = new sails.services.domain.Card(title, 'What is the type of exterior attachment on this elevation?');
                                curCard.dependencies = [{
                                    questionId: dependency.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Awning', value: 'awning'},
                                    { name: 'Carport', value: 'carport'},
                                    { name: 'Covered Entry Way', value: 'covered_entry_way'},
                                    { name: 'Open Patio/Porch (Includes lanais)', value: 'open_patio'},
                                    { name: 'Screened Patio/Porch (Includes lanais)', value: 'screened_patio'},
                                    { name: 'Screened Pool Cage', value: 'screened_pool_cage'},
                                    { name: 'Sunroom/Greenhouse', value: 'sunroom'}
                                ];
                                var typeQ = new sails.services.domain.Question(curType);
                                typeQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Type';
                                typeQ.hasDependents = true;
                                applyRequired(typeQ);
                                curCard.questions.push(typeQ);
                                
                                // awning damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure'},
                                    { name: 'Damaged Covering', value: 'damaged_covering'},
                                    { name: 'Damaged Structural Support', value: 'damaged_structural_support'},
                                    { name: 'Total Damage', value: 'total_damage'},
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Awning Damage Level';
                                //applyRequired(curQ);
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: {value: 'awning'},
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // carport damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Damaged/Displaced Roof Covering', value: 'damaged_roof_covering' },
                                    { name: 'Damaged/Displaced Roof Structure', value: 'damaged_roof_structure' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Car Port Damage';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'carport'},
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // covered entry way damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Damaged/Displaced Roof Covering', value: 'damaged_roof_covering' },
                                    { name: 'Damaged/Displaced Roof Structure', value: 'damaged_roof_structure' },
                                    { name: 'Finish Damage', value: 'finish_damage' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Covered Entry Way Damage';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'covered_entry_way' },
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // open patio damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Damaged/Displaced Roof Covering', value: 'damaged_roof_covering' },
                                    { name: 'Damaged/Displaced Roof Structure', value: 'damaged_roof_structure' },
                                    { name: 'Finish Damage', value: 'finish_damage' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Open Patio Damage';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'open_patio' },
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // screened patio damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Torn Screen', value: 'torn_screen' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Screened Patio Damge';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'screened_patio' },
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // screened pool damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Torn Screen', value: 'torn_screen' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Screened Pool Damge';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'screened_pool_cage' },
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);

                                // sunroom damages
                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Anchor/Connection Failure', value: 'anchor_failure' },
                                    { name: 'Buckled Members', value: 'buckled_members' },
                                    { name: 'Finish Damage', value: 'finish_damage' },
                                    { name: 'Partial Collapse', value: 'partial_collapse' },
                                    { name: 'Total Collapse', value: 'total_collapse' },
                                    { name: 'None', value: 'none' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'What is the damage level to this exterior attachment?');
                                curQ.fieldName = name + ' Elevation : Exterior Attachment' + idx + ' Sunroom Damage';
                                curQ.dependencies = [{
                                    questionId: typeQ.id,
                                    value: { value: 'sunroom' },
                                    operator: 'option_eq',
                                    valueIfFail: { name: 'n/a', value: 'n/a' }
                                }, {
                                    questionId: hasDamage.id,
                                    value: 'yes',
                                    operator: 'eq', //eq|neq|lte|gte|gt|lt|range
                                    valueIfFail: { name: 'None', value: 'none' }
                                }];
                                curQ.answer = { name: 'None', value: 'none' };
                                curCard.questions.push(curQ);


                                return curCard;


                            },

                            // photo card 
                            createElevationPhoto: function (type, title, text, idx) {

                                var curCard = new sails.services.domain.Card(title, text);


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Elevation', value: 'elevation' },
                                    { name: 'Property Location', value: 'property_location' },
                                    { name: 'Garage - Rating Sticker', value: 'garage_rating_sticker' },
                                    { name: 'Entry Door - Rating Sticker', value: 'entry_door_rating_sticker' },
                                    { name: 'Window - Protection', value: 'window_protection' },
                                    { name: 'Window - Rating Sticker', value: 'window_rating_sticker' },

                                    { name: 'Awning - Damage Detail', value: 'awning_damage_detail' },
                                    { name: 'Carport - Damage Detail', value: 'carport_damage_detail' },
                                    { name: 'Covered Entry Way - Damage Detail', value: 'covered_entry_damage_detail' },
                                    { name: 'Entry Door - Damage Detail', value: 'entry_door_detail_damage' },
                                    { name: 'Garage - Damage Detail', value: 'garage_detail_damage' },
                                    { name: 'Open Patio/Porch - Damage Detail', value: 'open_patio_damage_detail' },
                                    { name: 'Pool Cage - Damage Detail', value: 'pool_cage_damage_detail' },
                                    { name: 'Roof - Damage Detail', value: 'roof_damage_detail' },
                                    { name: 'Screened Patio/Porch - Damage Detail', value: 'screen_portch_damage_detail' },
                                    { name: 'Soffit/Fascia - Damage Detail', value: 'soffit_damage_detail' },
                                    { name: 'Sunroom/Greenhouse - Damage Detail', value: 'sunroom_damage_detail' },

                                    { name: 'Awning - Damage Overview', value: 'awning_damage_overview' },
                                    { name: 'Carport - Damage Overview', value: 'carport_damage_overview' },
                                    { name: 'Covered Entry Way - Damage Overview', value: 'covered_entry_damage_overview' },
                                    { name: 'Entry Door - Damage Overview', value: 'entry_door_damage_overview' },
                                    { name: 'Garage - Damage Overview', value: 'garage_damage_overview' },
                                    { name: 'Open Patio/Porch - Damage Overview', value: 'open_patio_damage_overview' },
                                    { name: 'Pool Cage - Damage Overview', value: 'pool_cage_damage_overview' },
                                    { name: 'Roof - Damage Overview', value: 'roof_damage_overview' },
                                    { name: 'Screened Patio/Porch - Damage Overview', value: 'screened_patio_damage_overview' },
                                    { name: 'Soffit/Fascia - Damage Overview', value: 'soffit_damage_overview' },
                                    { name: 'Sunroom/Greenhouse - Damage Overview', value: 'sunroom_damage_overview' },
                                    { name: 'Window - Damage Overview', value: 'window_damage_overview' },

                                    { name: 'Awning - No Damage', value: 'awning_no_damage' },
                                    { name: 'Carport - No Damage', value: 'carport_no_damage' },
                                    { name: 'Covered Entry Way - No Damage', value: 'covered_entry_no_damage' },
                                    { name: 'Entry Door - No Damage', value: 'entry_door_no_damage' },
                                    { name: 'Garage - No Damage', value: 'garage_no_damage' },
                                    { name: 'Open Patio/Porch - No Damage', value: 'open_patio_no_damage' },
                                    { name: 'Pool Cage - No Damage', value: 'pool_cage_no_damage' },
                                    { name: 'Roof - No Damage', value: 'roof_no_damage' },
                                    { name: 'Screened Patio/Porch - No Damage', value: 'screened_patio_no_damage' },
                                    { name: 'Soffit/Fascia - No Damage', value: 'soffit_no_damage' },
                                    { name: 'Sunroom/Greenhouse - No Damage', value: 'sunroom_no_damage' },
                                    { name: 'Window - No Damage', value: 'window_no_damage' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'Select the option that best describes the photo:');
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo Description1';
                                curCard.questions.push(curQ);
                                var curType = clone(sails.services.constants.questionTypes[10]);
                                curType.label = '';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo1';
                                curCard.questions.push(curQ);


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Elevation', value: 'elevation' },
                                    { name: 'Property Location', value: 'property_location' },
                                    { name: 'Awning - Damage Detail', value: 'awning_damage_detail' },
                                    { name: 'Awning - Damage Overview', value: 'awning_damage_overview' },
                                    { name: 'Awning - No Damage', value: 'awning_no_damage' },
                                    { name: 'Carport - Damage Detail', value: 'carport_damage_detail' },
                                    { name: 'Carport - Damage Overview', value: 'carport_damage_overview' },
                                    { name: 'Carport - No Damage', value: 'carport_no_damage' },
                                    { name: 'Covered Entry Way - Damage Detail', value: 'covered_entry_damage_detail' },
                                    { name: 'Covered Entry Way – Damage Overview', value: 'covered_entry_damage_overview' },
                                    { name: 'Covered Entry Way – No Damage', value: 'covered_entry_no_damage' },
                                    { name: 'Entry Door – Detail Damage', value: 'entry_door_detail_damage' },
                                    { name: 'Entry Door – No Damage', value: 'entry_door_no_damage' },
                                    { name: 'Entry Door – Overview Damage', value: 'entry_door_overview_damage' },
                                    { name: 'Entry Door – Rating Sticker', value: 'entry_door_rating_sticker' },
                                    { name: 'Garage – Detail Damage', value: 'garage_detail_damage' },
                                    { name: 'Garage – No Damage', value: 'garage_no_damage' },
                                    { name: 'Garage – Overview Damage', value: 'garage_overview_damage' },
                                    { name: 'Garage – Rating Sticker', value: 'garage_rating_sticker' },
                                    { name: 'Open Patio/Porch – Damage Detail', value: 'open_patio_damage_detail' },
                                    { name: 'Open Patio/Porch – Damage Overview', value: 'open_patio_damage_overview' },
                                    { name: 'Open Patio/Porch – No Damage', value: 'open_patio_no_damage' },
                                    { name: 'Pool Cage – Damage Detail', value: 'pool_cage_damage_detail' },
                                    { name: 'Pool Cage – Damage Overview', value: 'pool_cage_damage_overview' },
                                    { name: 'Pool Cage – No Damage', value: 'pool_cage_no_damage' },
                                    { name: 'Roof – Damage Detail', value: 'roof_damage_detail' },
                                    { name: 'Roof – Damage Overview', value: 'roof_damage_overview' },
                                    { name: 'Roof – No Damage', value: 'roof_no_damage' },
                                    { name: 'Screened Patio/Porch – Damage Overview', value: 'screened_patio_damage_overview' },
                                    { name: 'Screened Patio/Porch – No Damage', value: 'screened_patio_no_damage' },
                                    { name: 'Soffit/Fascia – Detail Damage', value: 'soffit_detail_damage' },
                                    { name: 'Soffit/Fascia – No Damage', value: 'soffit_no_damage' },
                                    { name: 'Soffit/Fascia – Damage Overview', value: 'soffit_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – Damage Detail', value: 'sunroom_damage_detail' },
                                    { name: 'Sunroom/Greenhouse – Damage Overview', value: 'sunroom_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – No Damage', value: 'sunroom_no_damage' },
                                    { name: 'Window – No Damage', value: 'window_no_damage' },
                                    { name: 'Window – Overview Damage', value: 'window_overview_damage' },
                                    { name: 'Window – Protection', value: 'window_protection' },
                                    { name: 'Window – Rating Sticker', value: 'window_rating_sticker' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'Select the option that best describes the photo:');
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo Description2';
                                curCard.questions.push(curQ);
                                var curType = clone(sails.services.constants.questionTypes[10]);
                                curType.label = '';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo2';
                                curCard.questions.push(curQ);


                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Elevation', value: 'elevation' },
                                    { name: 'Property Location', value: 'property_location' },
                                    { name: 'Awning - Damage Detail', value: 'awning_damage_detail' },
                                    { name: 'Awning - Damage Overview', value: 'awning_damage_overview' },
                                    { name: 'Awning - No Damage', value: 'awning_no_damage' },
                                    { name: 'Carport - Damage Detail', value: 'carport_damage_detail' },
                                    { name: 'Carport - Damage Overview', value: 'carport_damage_overview' },
                                    { name: 'Carport - No Damage', value: 'carport_no_damage' },
                                    { name: 'Covered Entry Way - Damage Detail', value: 'covered_entry_damage_detail' },
                                    { name: 'Covered Entry Way – Damage Overview', value: 'covered_entry_damage_overview' },
                                    { name: 'Covered Entry Way – No Damage', value: 'covered_entry_no_damage' },
                                    { name: 'Entry Door – Detail Damage', value: 'entry_door_detail_damage' },
                                    { name: 'Entry Door – No Damage', value: 'entry_door_no_damage' },
                                    { name: 'Entry Door – Overview Damage', value: 'entry_door_overview_damage' },
                                    { name: 'Entry Door – Rating Sticker', value: 'entry_door_rating_sticker' },
                                    { name: 'Garage – Detail Damage', value: 'garage_detail_damage' },
                                    { name: 'Garage – No Damage', value: 'garage_no_damage' },
                                    { name: 'Garage – Overview Damage', value: 'garage_overview_damage' },
                                    { name: 'Garage – Rating Sticker', value: 'garage_rating_sticker' },
                                    { name: 'Open Patio/Porch – Damage Detail', value: 'open_patio_damage_detail' },
                                    { name: 'Open Patio/Porch – Damage Overview', value: 'open_patio_damage_overview' },
                                    { name: 'Open Patio/Porch – No Damage', value: 'open_patio_no_damage' },
                                    { name: 'Pool Cage – Damage Detail', value: 'pool_cage_damage_detail' },
                                    { name: 'Pool Cage – Damage Overview', value: 'pool_cage_damage_overview' },
                                    { name: 'Pool Cage – No Damage', value: 'pool_cage_no_damage' },
                                    { name: 'Roof – Damage Detail', value: 'roof_damage_detail' },
                                    { name: 'Roof – Damage Overview', value: 'roof_damage_overview' },
                                    { name: 'Roof – No Damage', value: 'roof_no_damage' },
                                    { name: 'Screened Patio/Porch – Damage Overview', value: 'screened_patio_damage_overview' },
                                    { name: 'Screened Patio/Porch – No Damage', value: 'screened_patio_no_damage' },
                                    { name: 'Soffit/Fascia – Detail Damage', value: 'soffit_detail_damage' },
                                    { name: 'Soffit/Fascia – No Damage', value: 'soffit_no_damage' },
                                    { name: 'Soffit/Fascia – Damage Overview', value: 'soffit_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – Damage Detail', value: 'sunroom_damage_detail' },
                                    { name: 'Sunroom/Greenhouse – Damage Overview', value: 'sunroom_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – No Damage', value: 'sunroom_no_damage' },
                                    { name: 'Window – No Damage', value: 'window_no_damage' },
                                    { name: 'Window – Overview Damage', value: 'window_overview_damage' },
                                    { name: 'Window – Protection', value: 'window_protection' },
                                    { name: 'Window – Rating Sticker', value: 'window_rating_sticker' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'Select the option that best describes the photo:');
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo Description';
                                curCard.questions.push(curQ);
                                var curType = clone(sails.services.constants.questionTypes[10]);
                                curType.label = '';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo';
                                curCard.questions.push(curQ);

                                var curType = clone(sails.services.constants.questionTypes[2]);
                                curType.label = '';
                                curType.options = [
                                    { name: 'Elevation', value: 'elevation' },
                                    { name: 'Property Location', value: 'property_location' },
                                    { name: 'Awning - Damage Detail', value: 'awning_damage_detail' },
                                    { name: 'Awning - Damage Overview', value: 'awning_damage_overview' },
                                    { name: 'Awning - No Damage', value: 'awning_no_damage' },
                                    { name: 'Carport - Damage Detail', value: 'carport_damage_detail' },
                                    { name: 'Carport - Damage Overview', value: 'carport_damage_overview' },
                                    { name: 'Carport - No Damage', value: 'carport_no_damage' },
                                    { name: 'Covered Entry Way - Damage Detail', value: 'covered_entry_damage_detail' },
                                    { name: 'Covered Entry Way – Damage Overview', value: 'covered_entry_damage_overview' },
                                    { name: 'Covered Entry Way – No Damage', value: 'covered_entry_no_damage' },
                                    { name: 'Entry Door – Detail Damage', value: 'entry_door_detail_damage' },
                                    { name: 'Entry Door – No Damage', value: 'entry_door_no_damage' },
                                    { name: 'Entry Door – Overview Damage', value: 'entry_door_overview_damage' },
                                    { name: 'Entry Door – Rating Sticker', value: 'entry_door_rating_sticker' },
                                    { name: 'Garage – Detail Damage', value: 'garage_detail_damage' },
                                    { name: 'Garage – No Damage', value: 'garage_no_damage' },
                                    { name: 'Garage – Overview Damage', value: 'garage_overview_damage' },
                                    { name: 'Garage – Rating Sticker', value: 'garage_rating_sticker' },
                                    { name: 'Open Patio/Porch – Damage Detail', value: 'open_patio_damage_detail' },
                                    { name: 'Open Patio/Porch – Damage Overview', value: 'open_patio_damage_overview' },
                                    { name: 'Open Patio/Porch – No Damage', value: 'open_patio_no_damage' },
                                    { name: 'Pool Cage – Damage Detail', value: 'pool_cage_damage_detail' },
                                    { name: 'Pool Cage – Damage Overview', value: 'pool_cage_damage_overview' },
                                    { name: 'Pool Cage – No Damage', value: 'pool_cage_no_damage' },
                                    { name: 'Roof – Damage Detail', value: 'roof_damage_detail' },
                                    { name: 'Roof – Damage Overview', value: 'roof_damage_overview' },
                                    { name: 'Roof – No Damage', value: 'roof_no_damage' },
                                    { name: 'Screened Patio/Porch – Damage Overview', value: 'screened_patio_damage_overview' },
                                    { name: 'Screened Patio/Porch – No Damage', value: 'screened_patio_no_damage' },
                                    { name: 'Soffit/Fascia – Detail Damage', value: 'soffit_detail_damage' },
                                    { name: 'Soffit/Fascia – No Damage', value: 'soffit_no_damage' },
                                    { name: 'Soffit/Fascia – Damage Overview', value: 'soffit_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – Damage Detail', value: 'sunroom_damage_detail' },
                                    { name: 'Sunroom/Greenhouse – Damage Overview', value: 'sunroom_damage_overview' },
                                    { name: 'Sunroom/Greenhouse – No Damage', value: 'sunroom_no_damage' },
                                    { name: 'Window – No Damage', value: 'window_no_damage' },
                                    { name: 'Window – Overview Damage', value: 'window_overview_damage' },
                                    { name: 'Window – Protection', value: 'window_protection' },
                                    { name: 'Window – Rating Sticker', value: 'window_rating_sticker' }
                                ];
                                var curQ = new sails.services.domain.Question(curType, 'Select the option that best describes the photo:');
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo Description3';
                                curCard.questions.push(curQ);
                                var curType = clone(sails.services.constants.questionTypes[10]);
                                curType.label = '';
                                var curQ = new sails.services.domain.Question(curType);
                                curQ.fieldName = type + ' ' + title.toLowerCase() + ' Photo3';
                                curCard.questions.push(curQ);

                                return curCard;

                            }





                        };

                        sails.log.info('getting company object');

                        sails.models.company.findOne({ name: 'IBHS' })
                            .then(function (co) {

                                if (co) {

                                    sails.log.info('Got company info');

                                    var form = new sails.models.form.class('Residential Property Form', [co]);
                                    form.description = 'Post disaster data collection form for residential properties';


                                    // main
                                    form.sections.push(_section.createPropertySection());

                                    sails.log.info('Created proprty section');

                                    form.sections = form.sections.concat(_section.createElevationMain());

                                    // front elevation
                                    var frontElevation = _section.createElevationSection('Front', _dependencyCache.frontElevationQ);                                    
                                    form.sections = form.sections.concat(frontElevation);

                                    sails.log.info('Created front elevation section');

                                    // left elevation
                                    var leftElevation = _section.createElevationSection('Left', _dependencyCache.leftElevationQ);
                                    //leftElevation.dependencies = [{
                                    //    questionId: _dependencyCache.leftElevationQ,
                                    //    value: true,
                                    //    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    //}];
                                    form.sections = form.sections.concat(leftElevation);
                                    sails.log.info('Created left elevation section');

                                    // right elevation
                                    var rightElevation = _section.createElevationSection('Right', _dependencyCache.rightElevationQ);
                                    //rightElevation.dependencies = [{
                                    //    questionId: _dependencyCache.rightElevationQ,
                                    //    value: true,
                                    //    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    //}];
                                    form.sections = form.sections.concat(rightElevation);
                                    sails.log.info('Created right elevation section');

                                    // back elevation
                                    var backElevation = _section.createElevationSection('Back', _dependencyCache.backElevationQ);
                                    //backElevation.dependencies = [{
                                    //    questionId: _dependencyCache.backElevationQ,
                                    //    value: true,
                                    //    operator: 'eq' //eq|neq|lte|gte|gt|lt|range
                                    //}];
                                    form.sections = form.sections.concat(backElevation);
                                    sails.log.info('Created back elevation section');


                                    form.sections.push(_section.createRoofSection());

                                    // done
                                    form.sections.push(_section.createDoneSection());

                                        

                                    sails.models.form.create(form)
                                        .then(function () {

                                            sails.log.info('Form created');
                                            done();
                                        }, function (e) {
                                            sails.log.error(e);
                                            done();
                                        });

                                    
                                } else {

                                    sails.log.warn('No company found - form not created');
                                    done();
                                }// if-else

                            }, function (e) {
                                done();
                            });





                    }
                

                } catch (e) {
                    sails.log.error('Init exception - ' + e.message);
                    done(e);
                }// try-catch

            });
        }// if-else

    });


   



};
