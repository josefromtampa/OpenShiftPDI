

module.exports = {

    isNullOrEmpty: function (val) {

        return val === undefined || val == null || val == '';

    },

    isNull: function (val) {
        return val === undefined || cal == null;
    },

    toQueryString: function (obj) {
        var query = [];
        var cur = null;

        for (var prop in obj) {

            cur = obj[prop];

            if (!CommonFactory.isNull(cur)) {
                query.push(prop + '=' + cur);
            }// if

        }// for

        return query.join('&');
    },

    tryJSONParse: function (json) {

        try {
            return JSON.parse(json);
        } catch (e) {
            sails.log.warn('CommonUtil.tryJSONParse() Failed to parse ' + json);
            return json;
        }// try-catch

    }



};
