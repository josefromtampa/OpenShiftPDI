/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

    /* AUTH ENDPOINTS */
    // login auth for user token - basic login
  'POST /auth/login': {
      controller: 'AuthController',
      action: 'login',
      cors: true
  },
  'PUT /auth/logout': {
      controller: 'AuthController',
      action: 'logout',
      cors: true
  },

    /* USER FORM ENDPOINTS */
    // get list of form templates by user
    // get template form cards
  'GET /form/templates/cards/:id': {
      controller: 'FormController',
      action: 'getTemplateCards',
      cors: true
  },
  'GET /form/templates': {
      controller: 'FormController',
      action: 'getTemplates',
      cors: true
  },

    // get template form cards
  'GET /form/templates/:id': {
      controller: 'FormController',
      action: 'getTemplate',
      cors: true
  },
    // get list of user forms
  'GET /form/list': {
      controller: 'FormController',
      action: 'getUserForms',
      cors: true
  },
    // get single form
  'GET /form/cards/:id': {
      controller: 'FormController',
      action: 'getUserFormCards',
      cors: true
  },
    // get single form
  'GET /form/:id': {
      controller: 'FormController',
      action: 'getUserForm',
      cors: true
  },
    // post user form - bearer
  'POST /form': {
      controller: 'FormController',
      action: 'saveUserForm',
      cors: true
  },
  'PUT /form/:id': {
    controller: 'FormController',
    action: 'updateUserForm',
    cors: true
  },

  //  // put user form - req form id
  //'PUT /form/:access_token': {
  //    controller: 'FormController',
  //    action: 'updateUserForm',
  //    cors: true
  //},
    // delete user form
  'DELETE /form/:id': {
      controller: 'FormController',
      action: 'deleteUserForm',
      cors: true
  },
  'POST /form/:id/card': {
      controller: 'FormController',
      action: 'saveCard',
      cors: true
  },

  'POST /form/:id/progress': {
      controller: 'FormController',
      action: 'saveProgress',
      cors: true
  },


  'POST /form/:id/gps': {
      controller: 'FormController',
      action: 'saveGPS',
      cors: true
  },
    /* FILE ENDPOINTS */
    // get engyte filestream - user token in url
  'GET /image/:access_token/*': {
      controller: 'FormController',
      action: 'getImage',
      cors: true
  },
    // upload file - user token
  'POST /image/:access_token/*': {
      controller: 'FormController',
      action: 'uploadImage',
      cors: true
  },

    /* TRACKER ENDPOINTS */
  'POST /log/event': {
      controller: 'LogController',
      action: 'logEvent',
      cors: true
  },
  'POST /log/events': {
      controller: 'LogController',
      action: 'logEvents',
      cors: true
  },



    /* ADMIN ENDPOINTS */
    // get users - token
    // get companies - token

  'GET /users': {
    controller: 'UserController',
    action: 'getList',
    cors: true
  },

  'GET /users/:id': {
    controller: 'UserController',
    action: 'get',
    cors: true
  },

  'DELETE /users/:id': {
    controller: 'UserController',
    action: 'delete',
    cors: true
  },

  'PUT /users/:id': {
    controller: 'UserController',
    action: 'put',
    cors: true
  },

  'POST /users': {
    controller: 'UserController',
    action: 'post',
    cors: true
  },

  'POST /admin/login': {
    controller: 'AdminController',
    action: 'login',
    cors: true
  },


};
