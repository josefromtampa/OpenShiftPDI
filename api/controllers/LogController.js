/**
 * LogController
 *
 * @description :: Server-side logic for managing Logs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /*
        Desc: Log a single event.
        Params: type (string)       => type of event (post param)
                value (JSON object) => data to log (post param)
    */
    logEvent: function (req, res) {

        try {
            
            sails.log.info('logging event');

            var val = req.body.value;
            var type = req.body.type;

            if (val && type) {
                // log event
                EventService.logEvent(type, val);

                res.jsonp({ success: true, message: 'Event logged' });
            } else {
                res.serverError({ error: 'Invalid event parameters' });
            }// if-else

        } catch (e) {
            res.serverError({ error: e.message });
        }// try-catch


    },

    /*
        Desc: Log multiple events.
        Parmas: events (JSON - post param) => list of event objects to log. ie: [{"type":"test", "value": {}]
    */
    logEvents: function(req, res){

        try {
            // get body
            var param = req.param('events');
            var events = typeof(param) == 'object' ? param : CommonUtil.tryJSONParse(req.param('events'));

            if (events) {

                // log events
                EventService.logEvents(events);

                res.jsonp({ success: true, message: 'Events logged' });
            } else {
                res.serverError({ error: 'Invalid events' });
            }// if-else

        } catch (e){
            sails.log.error('LogController.logEvents() Exception - ' + e.message);
            res.serverError({ error: 'Invalid events' });
        }// try-catch


    }
	
};

