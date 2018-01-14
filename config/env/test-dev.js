/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {



    /***************************************************************************
     * Set the default database connection for models in the production        *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    // models: {
    //   connection: 'someMysqlServer'
    // },

    /***************************************************************************
     * Set the port in the production environment to 80                        *
     ***************************************************************************/

    port: process.env.PORT || process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 80,
    host: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',

    /***************************************************************************
     * Set the log level in production environment to "silent"                 *
     ***************************************************************************/


    controllers: {

        actions: false,
        shortcuts: false,
        rest: false
    },

    connections: {
        dataStore: {
            adapter: 'sails-mongo',
            host: 'ds051720.mongolab.com',
            port: 51720,
            database: 'postdisaster-dev',
            user: 'post-disaster-user',
            password: 'DBU9n8IdNk5Z',
            socketOptions: {
                connectTimeoutMS: 30000,
                socketTimeoutMS: 30000
            },
            poolSize: 5

        }
    }



};
