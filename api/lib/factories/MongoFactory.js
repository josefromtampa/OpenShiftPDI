/*
    Name: MongoFactory.js
    Description: Module provides MongoDB functionality extensions.
*/

var Promise = require('bluebird');

module.exports = {

    findUserById: function (id, modelHandle) {

        if (!id) {

          return Promise.reject('Invalid id');
        }

        var model = modelHandle || this;

        return new Promise(function (resolve, reject) {

          model.native(function (err, col) {

            if (err) {

              sails.log.error('MongoFactory.findByMongoId() Error retrieving collection - ' + JSON.stringify(err));
              reject(err);

            } else {

              col.find({
                _id: model.mongo.objectId(id)
              })
                .limit(1)
                .toArray(function (err, result) {

                  var user = result && result.length
                    ? result[0]
                    : undefined
                  if (!user) {
                    return reject("Not found")
                  }
                  if (user.password) {
                    delete user.password
                  }
                  resolve(user)

                });

            }

          });

        });

    },

    findByMongoId: function (mongoId, select, modelHandle) {

        if (mongoId) {

            var model = modelHandle || this;

            return new Promise(function (resolve, reject) {

                // get collection
                model.native(function (err, col) {

                    if (err) {
                        sails.log.error('MongoFactory.findByMongoId() Error retrieving collection - ' + JSON.stringify(err));
                        reject(err);

                    } else {

                        // find
                        col.find({ _id: model.mongo.objectId(mongoId) }, select || {})
                            .limit(1)
                            .toArray(function (err, result) {

                                // return first element if exists
                                if (result && result.length > 0) {
                                    resolve(result[0]);
                                } else {
                                    resolve(null);
                                }// if-else
                            });


                    }// if-else
                });


            });
        } else {
            return Promise.reject('Invalid id');
        }// if-else

    },

    deleteByMongoId: function (mongoId, modelHandle) {

        var model = modelHandle || this;

        return new Promise(function (resolve, reject) {

            // get collection
            model.native(function (err, col) {

                if (err) {
                    sails.log.error('MongoFactory.deleteByMongoId() Error retrieving collection - ' + JSON.stringify(err));
                    reject(err);

                } else {

                    // find
                    col.remove({ _id: model.mongo.objectId(mongoId) }, true, function (err, result) {

                        // return first element if exists
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result);
                        }// if-else
                    });


                }// if-else
            });


        });

    },


    updateByMongoId: function (id, updateFields, where, modelHandle) {

        var model = modelHandle || this;

        return new Promise(function (resolve, reject) {
            
            if (id && updateFields) {

                // upsert
                var mongoId = model.mongo.objectId(id);
                var criteria = where || {};
                criteria['_id'] = mongoId;
                
                // get native handle of waterline model
                model.native(function (e, col) {

                    // check if errored
                    if (e) {
                        // return error
                        sails.log.error('MongoFactory.updateByMongoId() Exception - ' + e);
                        reject(e);
                    } else {

                        // upsert
                        col.update(criteria, updateFields,
                            { upsert: false, safe: true, multi: false },
                            function (err, result) {
                                if (err) {
                                    sails.log.error('MongoFactory.updateByMongoId() Update Exception - ' + err);
                                    reject(err);
                                } else {
                                    resolve(true);
                                }// if-else
                            });

                    }// if-else
                });
            } else {

                reject('No id or update fields speciied');

            }// if-else
        });
    },
    
    upsert: function (doc, where, modelHandle) {

        var model = modelHandle || this;

        return new Promise(function (resolve, reject) {

            var id = doc.id || doc._id;

            if (id || where) {

                // upsert
                var mongoId = model.mongo.objectId(id);
                var criteria = where ? where : { _id: mongoId};
                
                delete doc.id;
                delete doc._id;

                // get native handle of waterline model
                model.native(function (e, col) {

                    // check if errored
                    if (e) {
                        // return error
                        sails.log.error('MongoFactory.upsert() Exception - ' + e);
                        reject(e);
                    } else {

                        // upsert
                        col.update(criteria, { $set: doc, $setOnInsert: { _id: mongoId } },
                            { upsert: true, safe: true, multi: false },
                            function (err, result) {
                                if (err) {
                                    sails.log.error('MongoFactory.upsert() Update Exception - ' + err);
                                    reject(err);
                                } else {
                                    resolve(doc);
                                }// if-else
                            });



                    }// if-else
                });
            } else {

                // insert
                model.create(doc)
                    .then(function (doc) {
                        resolve(doc);
                    }, function (e) {
                        sails.log.error('MongoFactory.upsert() Insert failed ' + e);
                        reject(e);
                    });

            }// if-else
        });
    },

    select: function (where, select, modelHandle) {

        var model = modelHandle || this;

        return new Promise(function (resolve, reject) {

            // get collection
            model.native(function (err, col) {

                if (err) {
                    sails.log.error('MongoFactory.select() Error retrieving collection - ' + JSON.stringify(err));
                    reject(err);

                } else {

                    //sails.log.debug('Selecting ' + JSON.stringify(select) + ' where ' + JSON.stringify(where));

                    if (select) {
                        // find
                        col.find(where || {}, select).toArray(function (err, result) {
                            // return first element if exists
                            if (err) {
                                reject(err)
                            } else {
                                resolve(result);
                            }// if-else
                        });
                    } else {
                        // find
                        col.find(where || {}).toArray(function (err, result) {

                            // return first element if exists
                            if (err) {
                                reject(err)
                            } else {
                                resolve(result);
                            }// if-else
                        });
                    }// if-else


                }// if-else
            });


        });
    }

};
