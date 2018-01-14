/**
 * CompanyController
 *
 * @description :: Server-side logic for managing Companies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
    getList: function (req, res) {

        try {

            var filter = req.params.query;

            // get templates
            CompanyService.getCompanies(filter, req.tokenSession.user)
                .then(function (results) {

                    if (results.success) {
                        res.jsonp({ success: true, data: results.data });
                    } else {
                        sails.log.warn('CompanyController.getCompanies() Unable to retrieve companies');
                        res.jsonp({ success: false, message: 'Unable to retrieve companies' });
                    }// if-else

                }, function (e) {

                    sails.log.error('CompanyController.getCompanies() Errored - ' + e.message);
                    res.serverError({ error: 'Unable to retrieve companies' });
                });

        } catch (e) {
            sails.log.error('CompanyController.getCompanies() Exception - ' + e.message);
            res.serverError({ error: 'Ooops... something went wrong' });
        }// try-catch
    }
};

