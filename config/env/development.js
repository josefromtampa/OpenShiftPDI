/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the development       *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    // models: {
    //   connection: 'someMongodbServer'
    // }

    controllers: {

        actions: false,
        shortcuts: false,
        rest: false
    },

    connections: {

        //dataStore: {
        //    host: 'ds051720.mongolab.com',
        //    port: 51720,
        //    database: 'postdisaster-dev',
        //    user: 'post-disaster-user',
        //    password: 'DBU9n8IdNk5Z'
        //}

        dataStore: {
            adapter: 'sails-mongo',
            adapter: 'sails-mongo',
            host: 'ds059242-a0.mongolab.com',
            port: 59242,
            database: 'ibhs-pdi',
            user: 'post-disaster-user',
            password: '21zhy52eFg2A',
            socketOptions: {
                connectTimeoutMS: 30000,
                socketTimeoutMS: 30000
            },
            poolSize: 5
        }
    }

};
