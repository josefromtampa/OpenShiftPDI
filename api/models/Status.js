/**
* Status.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {

        name: {
            type: 'string',
            unique: true,
            required: true,
            primaryKey: true
        },

        key: {
            type: 'string',
            required: true
        },

        order: {
            type: 'integer'
        },

        active: {
            type: 'boolean',
            required: true
        }

    },

    class: function (name, key, order) {

        /* Public Properties */
        this.name = name || '';
        this.key = key || this.name.toString();
        this.order = order || 0;
        this.active = true;

    }
};

