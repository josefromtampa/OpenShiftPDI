/*
*   EventFactory.js
*   Desc: Common methods to filestore backend
*/

var request = require('request');
var Keen = require('keen-js');
var Promise = require('bluebird');

var _logServer = null;

function _initialize() {

    _logServer = new Keen({
        projectId: sails.config.keen.projectId,
        writeKey: sails.config.keen.writeKey
    });

}

function _getClient() {

    return new Promise(function (resolve, reject) {

        if (_logServer == null || _logServer === undefined) {

            _initialize();
        }// if

        resolve(_logServer);

    });

}

module.exports = {

    logEvent: function (type, data) {

        // get client handle
        return _getClient().then(function (client) {

            // wrap into promise
            return new Promise(function (resolve, reject) {

                // log event
                client.addEvent(type, data, function (err, res) {
                    if (err) {
                        sails.log.error('EventService.logEvent() Error - ' + err);
                        reject(err);

                    } else if (res.created) {
                        resolve({ success: true, message: 'Event created' });
                    } else {
                        resolve({ success: false, message: 'Event not created' });
                    }// if-else
                });
            });

        });

    },

    logEvents: function (eventList) {

        // get client handle
        return _getClient().then(function (client) {

            // wrap into promise
            return new Promise(function (resolve, reject) {

                var events = {};
                var cur = null;
                var hasEvents = false;

                // build events object with event list
                for (var i = 0; i < eventList.length; i++) {
                    cur = eventList[i];

                    if (cur.type) {

                        // initialize new list
                        if (events[cur.type] === undefined) {
                            events[cur.type] = [];
                        }// if

                        // push to parent list
                        events[cur.type].push(cur.value);
                        hasEvents = true;
                    }// if
                    
                }// for

                if (hasEvents) {

                    // log event
                    client.addEvents(events, function (err, res) {

                        sails.log.debug('EventService.logEvents() addEvents() response - ' + JSON.stringify(res));

                        if (err) {
                            sails.log.error('EventService.logEvent() Error - ' + err);
                            reject(err);
                        } else {
                            resolve({ success: true, message: 'Event created' });
                        }// if-else
                    });
                } else {
                    resolve({ success: false, message: 'No events to log' });
                }// if-else
            });

        });

    }




};