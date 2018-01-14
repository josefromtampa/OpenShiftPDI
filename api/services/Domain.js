/*
    Name: Domain.js
    Description: Module containing the domain model.

*/

var shortid = require('shortid');

module.exports = {

    Group: function (name) {

        /* Private Properties */

        /* Public Properties */
        this.id = shortid.generate();
        this.name = name || '';
        this.value = this.name.toLowerCase().replace(/\s/ig, '_');
        this.description = '';

        /* Public Methods */


    },

    Section: function (title, description, cards) {

        /* Private Properties */

        /* Public Properties */
        this.id = shortid.generate();
        this.title = title || '';
        this.description = description || '';
        this.cards = cards || [];
        this.dependencies = null;
        this.active = true;

        /* Public Methods */
    },

    Card: function (title, body, questions) {

        /* Private Properties */

        /* Public Properties */
        this.id = shortid.generate();
        this.title = title || '';
        this.body = body || '';
        this.dependencies = null;
        //this.subSectionTemplate = null;
        //this.subSections = [];
        this.questions = questions || [];
        this.active = true;

        /* Public Methods */

    },

    Question: function (type, text, validators, fieldname) {

        /* Private Properties */

        /* Public Properties */
        this.id = shortid.generate();
        this.type = type || null;
        this.text = text || '';
        this.dependencies = null;
        this.validators = validators || [];
        this.answer = null;
        this.active = true;
        this.fieldName = fieldname || '';
        this.sortable = true;
        this.searchable = true;
        this.exportable = true;
        this.hasDependents = false;
        
        /* Public Methods */


    },

    Dependency: function (questionId, value, operator, aggregate) {

        this.sum = null; // nested dependencies
        this.or = null; // nested dependencies
        this.questionId = questionId || null;
        this.value = value || '';
        this.operator = operator || 'eq'; //eq|neq|lte|gte|gt|lt|range
        this.aggregate = aggregate || null;
    },

    FormProgress: function (currentIndex, progressIndex, percentage) {
        this.progressPosition = progressIndex || 0;
        this.currentPosition = currentIndex || 0;
        this.percent = percentage || 0;
    },

    Validator: function (operator, type, value, message, aggregate) {
        this.operator = operator || '';
        this.invalidMessage = message || {
            title: 'Validation Failed',
            body: 'Validation failed'
        };
        this.comparison = {
            type: type || '',  // static|question|card
            value: value != undefined ? value : ''  // if static, then just a value; if question, then question id; if card, then card id
        },
        this.aggregate = aggregate || ''; // ''|sum|concat

    }

};
