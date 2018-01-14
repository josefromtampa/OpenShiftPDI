/*
*   UserFormFactory.js
*   Desc: Data context service layer for user forms.
*/

var Promise = require('bluebird'),
  _ = require("lodash")

var _private = {

    buildTemplateQuery: function (user, filter) {

        try {
            sails.log.debug('Building template query');

            var expressions = [];
            var id = null;

            if (user && user.companies && user.companies.length) {
                // build filters by company
                for (var i = 0; i < user.companies.length; i++) {

                    id =  user.companies[i].id || user.companies[i]._id;
                    expressions.push({
                        companies: { '$elemMatch': { id: id} }
                    });
                    expressions.push({
                        companies: { '$elemMatch': { _id: id } }
                    });
                }// for
            }// if

            var query = filter && typeof (filter) == 'object' ? filter : null;
            if (query && expressions.length > 0){
                query['$or'] = expressions;
            } else if (expressions.length > 0) {
                query = {
                    '$or': expressions
                };
            }// if-else

            return query;

        } catch (e) {

            sails.log.error('UserFormService.buildTemplateQuery() Exception - ' + e.message + e.toString());
            return null;

        }// try-catch

    },

    buildUserFormQuery: function (user, filter) {

      console.log("buildUserFormQuery", filter)
        try {

          if (_.isObject(filter)) {
            return filter
          }


          var query = {}

            if (user) {

                switch (user.role) {

                    case 'agent':

                        // query by user's id
                        query = filter && typeof (filter) == 'object' ? filter : null;;

                        if (query) {
                            query['user.username'] = user.username;
                        } else {
                            query = {
                                'user.username': user.username
                            };
                        }// if-else

                        break;

                    case 'admin':
                        // { name: /Test/, $or: [{ "user.companies": { $elemMatch: { id: '55a944a2524609b8000cee3a' }}}]}
                        // query userforms for all of admin's company

                        var expressions = [];
                        var id = null;

                        if (user.companies && user.companies.length) {
                            // build filters by company
                            for (var i = 0; i < user.companies.length; i++) {

                                id = user.companies[i].id || user.companies[i]._id;
                                expressions.push({
                                    'user.companies': { '$elemMatch': { id:  id } }
                                });
                                expressions.push({
                                    'user.companies' : { '$elemMatch': { _id: id } }
                                });
                            }// for
                        }// if

                        var query = filter && typeof (filter) == 'object' ? filter : null;
                        if (query && expressions.length > 0) {
                            query['$or'] = expressions;
                        } else if (expressions.length > 0) {
                            query = {
                                '$or': expressions
                            };
                        }// if-else

                        break;

                };

            }// if

            return query;
        } catch (e) {
            sails.log.error('UserFormService.buildUserFormQuery() Exception - ' + e.message);
            return null;
        }// try-catch
    }

};


module.exports = {

    getTemplates: function (user, filter) {

        return Promise.try(function () {

            // build permissions filter
            var query = _private.buildTemplateQuery(user, filter);

            if (query == null || query == undefined) {
                return Promise.reject('Unable to build query for form templates');
            }// if

            sails.log.debug('Querying template for ' + JSON.stringify(query));

            // query forms
            return Form.select(query, { name: 1, description: 1 })
                        .then(function (response) {
                            return Promise.resolve({ success: true, data: response });
                        }, function (e) {
                            sails.log.error('UserFormService.getTemplates() Error retrieving user form templates - ' + e);
                            return Promise.reject(e);
                        });
        });
    },

    getTemplate: function (id) {

        return Promise.try(function () {

            // query forms
            return Form.findByMongoId(id, { name: 1, description: 1, sections: 1 })
                        .then(function (response) {

                            return Promise.resolve({ success: response ? true : false, data: response });
                        }, function (e) {
                            sails.log.error('UserFormService.getTemplate() Error retrieving template data - ' + e);
                            return Promise.reject(e);
                        });
        });
    },

    getList: function (user, filter, req) {
      //console.log("UserFormService.getList", filter)

        return Promise.try(function () {


            // build filter
            var userQuery = _private.buildUserFormQuery(user, filter);

            if (userQuery == null || userQuery === undefined) {
                return Promise.reject('Unable to build query for forms');
            }// if

            sails.log.debug('Querying forms for ' + JSON.stringify(userQuery));

            var waterlineQuery,
              stuff = {
                fields: {
                  name: 1,
                  identifier: 1,
                  status: 1,
                  progress: 1,
                  submitDate: 1,
                  'user.username': 1,
                  createdAt: 1
                }
              }

          if (req.query) {

            if (req.query.sort) {
              try {
                userQuery.sort = JSON.parse(req.query.sort)
              } catch (err) {}
            }

            if (req.query.paginate) {
              try {
                waterlineQuery = UserForm.find(userQuery, stuff)
                var paginate = JSON.parse(req.query.paginate)
                waterlineQuery = waterlineQuery.paginate(paginate)
              } catch (err) {
                waterlineQuery = UserForm.select(userQuery, stuff)
              }
            } else {
              waterlineQuery = UserForm.select(userQuery, stuff)
            }
          }

            // find user forms
            return waterlineQuery
                        .then(function (response) {
                            return Promise.resolve({ success: true, data: response });
                        }, function (e) {
                        sails.log.error('UserFormService.getList() Error retrieving user forms - ' + e);
                        return Promise.reject(e);
                    });

        });
    },

    get: function (id) {

        sails.log.info('Retrieving user form ' + id);

        // get by id
        return UserForm.findByMongoId(id, { user: 1, name: 1, status: 1, form: 1, gps: 1, progress: 1, identifier: 1, outline: 1, lastPosition: 1, createdAt: 1, updatedAt: 1 })
                        .then(function (response) {
                            return Promise.resolve({ success: response ? true : false, data: response });
                        }, function (e) {

                            sails.log.error('UserFormService.get() Error retrieving user form - ' + e);
                            return Promise.reject(e);
                        });
    },

    save: function (form) {

        if (form) {
            return Promise.try(function () {

                // save new form
                return UserForm.upsert(form)
                        .then(function (results) {
                            
                            return Promise.resolve({ success: true, data: results });
                        }, function (e) {
                            sails.log.error('UserFormService.save() Error saving user form - ' + e);
                            return Promise.reject(e);
                        });



            });
        } else {

            return Promise.reject('No data');

        }// if-else
    },

    delete: function (id) {

        if (id) {

            return UserForm.deleteByMongoId(id)
                            .then(function (response) {
                                return Promise.resolve({ success: true, data: response });
                            }, function (e) {

                                sails.log.error('UserFormService.delete() Error deleting user form - ' + e);
                                return Promise.reject(e);
                            });
        } else {
            return Promise.resolve({ success: false, message: 'Invalid id' });
        }// if-else

    },

    update: function(id, updateFields){

        // save user form status
        if (id && updateFields) {

            var updates = {
                $set: updateFields
            };

            return Promise.try(function () {

                // save new form
                return UserForm.updateByMongoId(id, updates)
                        .then(function (results) {

                            return Promise.resolve({ success: true, data: results });
                        }, function (e) {
                            sails.log.error('UserFormService.update() Error saving user form - ' + e);
                            return Promise.reject(e);
                        });
                
            });
        } else {

            return Promise.reject('No data');

        }// if-else


    },

    saveCard: function (userFormId, card) {

        if (userFormId && card) {

            return Promise.try(function () {
                
                // save new form
                return UserForm.updateByMongoId(userFormId, { "$set": { "form.cards.$": card } }, { 'form.cards.id': card.id })
                        .then(function (results) {

                            return Promise.resolve({ success: true, data: results });
                        }, function (e) {
                            sails.log.error('UserFormService.save() Error saving user form - ' + e);
                            return Promise.reject(e);
                        });



            });
        } else {

            return Promise.reject('No data');

        }// if-else
    },

    saveProgress: function (userFormId, progress) {

        if (userFormId && progress) {

            return Promise.try(function () {

                // save new form
                return UserForm.updateByMongoId(userFormId, { "$set": { "progress": progress } })
                        .then(function (results) {

                            return Promise.resolve({ success: true, data: results });
                        }, function (e) {
                            sails.log.error('UserFormService.savePosition() Error saving user form progress - ' + e);
                            return Promise.reject(e);
                        });



            });
        } else {

            return Promise.reject('No data');

        }// if-else
    },

    
    saveGPS: function (userFormId, gps) {

        if (userFormId && gps) {

            return Promise.try(function () {

                // save new form
                return UserForm.updateByMongoId(userFormId, { "$set": { "gps": gps } })
                        .then(function (results) {

                            return Promise.resolve({ success: true, data: results });
                        }, function (e) {
                            sails.log.error('UserFormService.saveGPS() Error saving user form gps - ' + e);
                            return Promise.reject(e);
                        });



            });
        } else {

            return Promise.reject('No data');

        }// if-else
    }



};
