/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/

    AdminController: {

        '*': false,

        'login': true,
        'logout': 'bearerToken'

    },

    AuthController: {

        '*': false,

        login: true,
        logout: 'bearerToken'

    },

    FormController: {

        '*': false,

        getTemplates: 'bearerToken',
        getTemplate: 'bearerToken',
        getTemplateCards: 'bearerToken',
        getUserForms: 'bearerToken',
        getUserForm: 'bearerToken',
        getUserFormCards: 'bearerToken',
        saveUserForm: 'bearerToken',
        saveCard: 'bearerToken',
        saveProgress: 'bearerToken',
        saveGPS: 'bearerToken',
        updateUserForm: 'bearerToken',
        deleteUserForm: 'bearerToken',
        getImage: 'urlToken',
        uploadImage: 'urlToken'

    },

    LogController: {

        '*': false,

        logEvent: 'bearerToken',
        logEvents: 'bearerToken'

    },

    UserController: {

      '*': false,
      'getList': 'isAdmin',
      'get': 'isAdminOrOwner',
      'delete': 'isAdmin',
      'post': 'isAdmin',
      'put': 'isAdminOrOwner'

    },
};
