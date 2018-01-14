/**
 * FormController
 *
 * @description :: Server-side logic for managing Forms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require("lodash")
var path = require('path');
var fs = require('fs-extra');
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    // get list of form templates by user
    getTemplates: function (req, res) {

        try {

            // get templates
            UserFormService.getTemplates(req.tokenSession.user)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('FormController.getTemplates() Unable to retrieve user form tempates');
                        res.jsonp({ success: false, message: 'Unable to retrieve user form templates' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.getTemplates() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve form templates' });
                });

        } catch (e) {
            sails.log.error('FormController.getTemplates() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    getTemplate: function (req, res) {

        try {
            // get templates
            UserFormService.getTemplate(req.params.id)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('FormController.getTemplate() Unable to retrieve form template');
                        res.jsonp({ success: false, message: 'Unable to retrieve form template' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.getTemplate() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve form template' });
                });
        } catch (e) {

            sails.log.error('FormController.getTemplate() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    getTemplateCards: function(req, res){

        try {

            sails.log.info('FormController.getTemplateCards() - Retrieving template');

            // get templates
            UserFormService.getTemplate(req.params.id)
                .then(function (results) {

                    sails.log.info('FormController.getTemplateCards() - Generating template cards');
                    var template = Form.flatten(results.data);

                    sails.log.info('FormController.getTemplateCards() - Building new userForm object');
                    // auto pre-save record to db
                    var userForm = new UserForm.class(
                            req.tokenSession.user,
                            template.form,
                            template.outline,
                            Constants.formStatus[0] // saved status
                        );

                    // generate userform id
                    // Get a timestamp in seconds
                    var timestamp = Math.floor(new Date().getTime() / 1000);
                    // Create a date with the timestamp
                    var timestampDate = new Date(timestamp * 1000);
                    userForm.id = new ObjectID(timestamp).toString();

                    sails.log.info('FormController.getTemplateCards() - UserForm object created with id: ' + userForm.id);

                    if (results.success) {

                        res.jsonp({ success: true, data: userForm });

                        sails.log.info('FormController.getTemplateCards() - Pre-saving userForm object');
                        // pre-save to db
                        UserFormService.save(userForm)
                        .then(function (saveResults) {

                            if (saveResults.success) {
                                sails.log.info('FormController.getTemplateCards() Successfully saved new userform');
                            } else {
                                sails.log.info('FormController.getTemplateCards() Save new userForm failed - ' + saveResults.message);
                            }// if-else

                        }, function (e) {

                            sails.log.error('FormController.getTemplateCards() Errored pre-saving userform - ' + e.message);
                           // res.serverError({ error: 'Unable to retrieve form template' });
                        });


                    } else {
                        sails.log.warn('FormController.getTemplateCards() Unable to retrieve form template');
                        res.jsonp({ success: false, message: 'Unable to retrieve form template' });
                    }// if-else
                    
                    

                }, function (e) {

                    sails.log.error('FormController.getTemplateCards() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve form template' });
                });
        } catch (e) {

            sails.log.error('FormController.getTemplateCards() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    // get list of user forms
    getUserForms: function (req, res) {

        try {

          var query

          if (req.query && req.query.q) {
            query = JSON.parse(req.query.q, function(key, value) {
              switch (key) {
                case "$regex":
                  value = new RegExp(value, "i")
                  break;

                case "updatedAt":
                case "createdAt":
                  if (_.isString(value)) {
                    value = new Date(value)
                  } else if (_.isObject(value)) {
                    value = _.mapValues(value, function(value, key) {
                      return new Date(value)
                    })
                  }
                  break;
              }
              return value
            })

            if (query.text) {
              var regex = new RegExp(query.text, "i")
              delete query.text
              query.$or = [
                {"name": {$regex: regex}},
                {"form.name": {$regex: regex}},
                {"form.sections.title": {$regex: regex}},
                {"form.sections.description": {$regex: regex}},
                {"form.cards.title": {$regex: regex}},
                {"form.cards.body": {$regex: regex}},
                {"form.cards.questions.text": {$regex: regex}},
                {"form.cards.questions.type.label": {$regex: regex}},
                {"form.cards.questions.answer": {$regex: regex}},
                {"form.cards.questions.answer.value": {$regex: regex}},
              ]
            }
          }

            // get templates
            UserFormService.getList(req.tokenSession.user, query, req)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('FormController.getUserForms() Unable to retrieve user forms');
                        res.jsonp({ success: false, message: 'Unable to retrieve user forms' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.getUserForms() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve forms' });
                });

        } catch (e) {
            sails.log.error('FormController.getUserForms() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    getUserForm: function (req, res) {

        try {

            // get templates
            UserFormService.get(req.params.id)
                .then(function (results) {
                    if (results.data && results.data._id) {
                      results.data.id = results.data._id
                    }

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('FormController.getUserForm() Unable to retrieve user form');
                        res.jsonp({ success: false, message: 'Unable to retrieve user form' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.getUserForm() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve form' });
                });

        } catch (e) {
            sails.log.error('FormController.getUserForm() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    getUserFormCards: function (req, res) {

        try {

            // get templates
            UserFormService.get(req.params.id)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: UserForm.flatten(results.data) });
                    } else {
                        sails.log.warn('FormController.getUserFormCards() Unable to retrieve user form');
                        res.jsonp({ success: false, message: 'Unable to retrieve user form' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.getUserFormCards() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve form' });
                });

        } catch (e) {
            sails.log.error('FormController.getUserFormCards() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    // post user form
    saveUserForm: function(req, res){

        try {

            sails.log.info('FormController.saveUserForm() - Got save request');

            var form = req.method == 'POST' ? req.body.form : req.body

            sails.log.info('Saving user form');

            if (form) {

                // get templates
                UserFormService.save(form)
                    .then(function (results) {

                        if (results.success) {
                            sails.log.info('User form saved');

                            res.jsonp({ success: true, data: results.data });
                        } else {
                            sails.log.warn('FormController.saveUserForm() Unable to save user form');
                            res.jsonp({ success: false, message: 'Unable to save user form' });
                        }// if-else

                    }, function (e) {

                        sails.log.error('FormController.saveUserForm() Errored - ' + e.message);
                        res.serverError({ error: 'Unable to save form' });
                    });
            } else {

                res.jsonp({ success: false, message: 'No data' });
            }// if-else

        } catch (e) {
            sails.log.error('FormController.saveUserForm() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    updateUserForm: function (req, res) {

        try {

            sails.log.info('FormController.updateUserForm() - Got save request');

            var fields = req.method == 'PUT' ? req.body.fields : req.body
            var id = req.params.id;

            sails.log.info('Updating user form ' + JSON.stringify(fields));

            if (id && fields) {

                // get templates
                UserFormService.update(id, fields)
                    .then(function (results) {

                        if (results.success) {
                            sails.log.info('User form updated');

                            res.jsonp({ success: true, data: results.data });
                        } else {
                            sails.log.warn('FormController.updateUserForm() Unable to update user form');
                            res.jsonp({ success: false, message: 'Unable to update user form' });
                        }// if-else

                    }, function (e) {

                        sails.log.error('FormController.updateUserForm() Errored - ' + e.message);
                        res.serverError({ error: 'Unable to update' });
                    });
            } else {

                res.jsonp({ success: false, message: 'No data' });
            }// if-else

        } catch (e) {
            sails.log.error('FormController.updateUserForm() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch
    },

    saveCard: function(req, res){
        try {

            sails.log.info('FormController.saveCard() - Got save request');

            var card = req.method == 'POST' ? req.body.card : req.body
            var id = req.params.id;

            sails.log.info('Saving card');

            if (card) {

                // get templates
                UserFormService.saveCard(id, card)
                    .then(function (results) {

                        if (results.success) {
                            sails.log.info('User form card saved');

                            res.jsonp({ success: true, data: results.data });
                        } else {
                            sails.log.warn('FormController.saveUserForm() Unable to save user form card');
                            res.jsonp({ success: false, message: 'Unable to save user form card' });
                        }// if-else

                    }, function (e) {

                        sails.log.error('FormController.saveCard() Errored - ' + e.message);
                        res.serverError({ error: 'Unable to save form card' });
                    });
            } else {

                res.jsonp({ success: false, message: 'No data' });
            }// if-else

        } catch (e) {
            sails.log.error('FormController.saveCard() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    },

    saveProgress: function(req, res){
        try {

            sails.log.info('FormController.savePositin() - Got save request');

            var progress = req.method == 'POST' ? req.body.progress : req.body
            var id = req.params.id;

            sails.log.info('Saving progress');

            if (progress) {

                // get templates
                UserFormService.saveProgress(id, progress)
                    .then(function (results) {

                        if (results.success) {
                            sails.log.info('User form progress saved');

                            res.jsonp({ success: true, data: results.data });
                        } else {
                            sails.log.warn('FormController.saveProgress() Unable to save user form progress');
                            res.jsonp({ success: false, message: 'Unable to save user form progress' });
                        }// if-else

                    }, function (e) {

                        sails.log.error('FormController.saveProgress() Errored - ' + e.message);
                        res.serverError({ error: 'Unable to save form progress' });
                    });
            } else {

                res.jsonp({ success: false, message: 'No data' });
            }// if-else

        } catch (e) {
            sails.log.error('FormController.saveProgress() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch
    },

    saveGPS: function (req, res) {
        try {

            sails.log.info('FormController.saveGPS() - Got save request');

            var gps = req.method == 'POST' ? req.body.gps : req.body
            var id = req.params.id;

            sails.log.info('Saving gps');

            if (gps) {

                // get templates
                UserFormService.saveGPS(id, gps)
                    .then(function (results) {

                        if (results.success) {
                            sails.log.info('User form progress saved');

                            res.jsonp({ success: true, data: results.data });
                        } else {
                            sails.log.warn('FormController.saveGPS() Unable to save user form progress');
                            res.jsonp({ success: false, message: 'Unable to save user form progress' });
                        }// if-else

                    }, function (e) {

                        sails.log.error('FormController.saveGPS() Errored - ' + e.message);
                        res.serverError({ error: 'Unable to save form gps' });
                    });
            } else {

                res.jsonp({ success: false, message: 'No data' });
            }// if-else

        } catch (e) {
            sails.log.error('FormController.saveGPS() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch
    },

    // get form image
    getImage: function(req, res){

        try {

            // get wildcard param for path
            var filePath = req.params[0];

            //var file = process.cwd() + '/.tmp/uploads/' + filePath;
            //sails.log.info('Retrieving file ' + file);

            //res.sendfile(file);

            // call method and pipe file response back
            EgnyteService.file.get(filePath)
                .then(function (fileRes) {

                    // pipe response back
                    fileRes.pipe(res, { end: true });
                    fileRes.resume();

                }, function (e) {
                    sails.log.error('FormController.getImage() - Get image failed ' + JSON.stringify(e));
                    res.serverError({ error: 'Unable to retrieve file' });

                });

        } catch (e) {
            sails.log.error('FormController.getImage() Exception ' + e.message);
            res.serverError('Unable to retrieve file');
        }// try-catch



    },

    uploadImage: function (req, res) {
        
        // get wildcard param for path
        var filePath = req.params[0]
        var user = req.tokenSession.user;

        // build path
        // formtype/date_formname_username

        req.file('image').upload(function (err, uploadedFiles) {

            if (!err) {

                sails.log.debug('File uploaded ' + JSON.stringify(uploadedFiles));
                
                if (uploadedFiles.length > 0) {

                    var cur = uploadedFiles[0];

                    var file = {
                        remotePath: '/' + filePath,
                        fileName: Date.now() + '.jpg',
                        type: cur.type
                    };
                    var src = cur.fd; // (typeof cur.fd === 'object' ? cur.fd : (typeof cur.fd === 'string' && cur.fd.indexOf('.jpg') === -1 ? cur.fd + '.jpg' : cur.fd));

                    sails.log.info('File upload - uploading src ' + src + ' to Egnyte');
                    sails.log.debug('Saving file ' + JSON.stringify(file));
                    
                    // upload file to egnyte
                    EgnyteService.file.upload(src, file.remotePath)
                        .then(function (results) {

                            sails.log.debug('image uploaded ' + JSON.stringify(results));

                            try {
                                // clean up local file
                                fs.unlink(cur.fd, function () {
                                    sails.log.info('FormController.uploadImage() - Cleaned up temp upload');
                                });
                            } catch (e) {
                                sails.log.error('FormController.uploadImage() Cleanup failed - ' + e.toString());
                            }

                            res.jsonp({ success: true, data: file });

                        }, function (e) {

                            sails.log.error('FormController.uploadImage() Failed - ' + e.toString());
                            res.jsonp({ success: false, error: 'File upload failed' });
                        });


                } else {

                    res.jsonp({ success: false, message: 'No uploaded file' });
                }// if-else
                

            } else {
                sails.log.error('FormController.uploadImage() - Image Upload failed ' + JSON.stringify(err));
                res.serverError({ error: 'Unable to upload file' });
                
            }// if-else

        });


    },

    deleteUserForm: function (req, res) {

        try {

            // get templates
            UserFormService.delete(req.params.id)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('FormController.deleteUserForm() Unable to delete user form');
                        res.jsonp({ success: false, message: 'Unable to delete user form' });
                    }// if-else

                }, function (e) {

                    sails.log.error('FormController.deleteUserForm() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to delete form' });
                });

        } catch (e) {
            sails.log.error('FormController.deleteUserForm() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch

    }

};

