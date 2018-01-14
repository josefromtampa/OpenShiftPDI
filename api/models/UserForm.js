/**
* UserForm.js
*
* @description :: Model for user forms with data.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var extend = require('extend');
var MongoFactory = require('../lib/factories/MongoFactory.js');

module.exports = {

    attributes: {

        user: {
            type: 'json',
            required: true
        },

        name: {
            type: 'string',
            required: true
        },

        identifier: {
            type: 'string'
        },

        progress: {
            type: 'json'
        },
        
        status: {
            type: 'json'
        },

        /* form identifier */
        form: {
            type: 'json'
        },

        gps: {
            type: 'json'
        },

        outline: {
            type: 'json'
        },

        submitDate: {
            type: 'datetime'
        }


    },

    class: function (user, form, outline, status, name, identifier, progress, gps) {

        this.user = user || null;
        var timeStamp = new Date();
        var dateStr = (timeStamp.getMonth() + 1) + "/" + timeStamp.getDate() + "/" + timeStamp.getFullYear();
        this.name = name || (form ? form.name + ' - ' : 'New Form - ') + dateStr;

        // default identifier
        var defaultIdentifier = form && user ? form.name + ' - ' + user.username.toUpperCase() + ' - '
                                                          + timeStamp.toGMTString().replace(/\//ig, '-').replace(/,/ig, '').replace(/:/ig, '-')
                                            : '';

        this.identifier = identifier || defaultIdentifier;


        this.form = form || null;
        this.status = status || null;
        this.gps = gps || null;
        this.progress = progress || {
            percent: 0,
            progressPosition: 0,
            currentPosition: 0
        };
        this.outline = outline || null;
        this.submitDate = null;
    },

    flatten: function (userForm) {

        try {
            if (userForm.form) {

                var userFormLight = _.omit(userForm, 'form');
                var outline = {
                    sections: []
                };
                var cardOutline = null;
                var index = 0;
                
                var cards = _.map(userForm.form.sections, function (section) {

                    cardOutline = [];
                    var sectionCards = _.map(section.cards, function (card) {
                        // add section to card for tracking
                        card.section = _.omit(section, 'cards');
                        cardOutline.push({ id: card.id, title: card.title, index: index++ });
                        return card;

                    });// should return array of cards

                    outline.sections.push({ id: section.id, title: section.title, cards: cardOutline });
                    return sectionCards;

                }); // should return array of card arrays
                                   
                userFormLight.form = _.omit(userForm.form, 'sections');
                userFormLight.form.cards = _.flatten(cards);
                userFormLight.outline = outline;

                                            
                return userFormLight;

            } else {
                return null;
            }// if-else


        } catch (e) {

            sails.log.error('UserForm.flatten() Exception - ' + e.message);
            return null;

        }// try-catch
    }

};

// extend with mongofactory
extend(false, module.exports, MongoFactory);

