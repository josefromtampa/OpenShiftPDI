/**
* Form.js
*
* @description :: Model for form templates.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var extend = require('extend');
var MongoFactory = require('../lib/factories/MongoFactory.js');

module.exports = {

    attributes: {
        
        name: {
            type: 'string',
            required: true
        },

        description: {
            type: 'string'
        },

        /* 
            Array of permission company objects. The company and department builds up the permissions.
        */
        companies: {
            type: 'array'
        },

        sections: {
            type: 'array'
        },

        active: {
            type: 'boolean',

        }

    },

    // constructor to instantiate a form object
    class: function (name, companies, sections) {

        this.name = name || '';
        this.companies = companies || [];
        this.sections = sections || [];
        this.active = true;

    },

    flatten: function (template) {

        try {
            if (template) {

                var templateLight = _.omit(template, 'companies');
                var outline = {
                    sections: []
                };
                var cardOutline = null;
                var index = 0;

                var cards = _.map(template.sections, function (section) {

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

                templateLight = _.omit(templateLight, 'sections');
                templateLight.cards = _.flatten(cards);

                return { form: templateLight, outline: outline };

            } else {
                return null;
            }// if-else


        } catch (e) {

            sails.log.error('Form.flatten() Exception - ' + e.message);
            return null;

        }// try-catch
    }
};

// extend with mongofactory
extend(false, module.exports, MongoFactory);
