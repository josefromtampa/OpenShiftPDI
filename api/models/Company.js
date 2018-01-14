/**
* Company.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {

        name: {
            type: 'string',
            unique: true
        },
        address: {
            type: 'string'
        },
        address2: {
            type: 'string'
        },
        city: {
            type: 'string'
        },
        state: {
            type: 'string'
        },
        zipcode: {
            type: 'string'
        },
        phone: {
            type: 'string'
        },
        groups: {
            type: 'array'
        }

    },

    class: function (name) {

        /* Public Properties */
        this.name = name || '';
        this.address = '';
        this.address2 = '';
        this.city = '';
        this.state = '';
        this.zipcode = '';
        this.phone = '';
        this.groups = [];
        this.active = true;

    }
};

