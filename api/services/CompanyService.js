/*
*   UserFormFactory.js
*   Desc: Data context service layer for user forms.
*/

var Promise = require('bluebird'),
  _ = require("lodash")



module.exports = {

    getCompanies: function (query, user) {

        // TODO: build query based off of user's role
        // 'agent' & 'admin' only see companies they are assigned
        // 'super' sees all

        return Promise.try(function () {
            
            query = query || {};

            sails.log.debug('Querying template for ' + JSON.stringify(query));

            // query forms
            return Company.find(query)
                        .then(function (response) {
                            return Promise.resolve({ success: true, data: response });
                        }, function (e) {
                            sails.log.error('CompanyService.getCompanies() Error retrieving companies - ' + e);
                            return Promise.reject(e);
                        });
        });
    }



};
