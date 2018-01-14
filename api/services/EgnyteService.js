/*
    Name: EgnyteService.js
    Description: Egnyte cloud storage service.

*/

var Promise = require('bluebird');
var fs = require('fs-extra');

// initialize egnyte
var Egnyte = require('egnyte-js-sdk');
var egnyte = Egnyte.init(sails.config.egnyte.domain, {
    token: sails.config.egnyte.token
});

module.exports = {

    file: {

        get: function (path) {

            sails.log.info('Getting file ' + path);

            try {

                sails.log.info('Retrieving file ' + sails.config.egnyte.root + path);

                // get the stream of the file
                return egnyte.API.storage.getFileStream(('/' + sails.config.egnyte.root + path).replace('///', '/').replace('//', '/'));

            } catch (e) {
                sails.log.error('EgnyteService.file.get() Exception - ' + e.message);
                return Promise.reject({ message: 'File retrieval exception' });

            }// try-catc

        },

        upload: function (source, destination) {

            sails.log.info('egnyte uploading image');

            try {
                // create read stream of file
                var fileStream = null;

                if (typeof (source) == 'string') {
                    sails.log.info('EgnyteService.file.upload() - Source is a string ' + source);
                    fileStream = fs.createReadStream(source);

                } else {
                    sails.log.info('EgnyteService.file.upload() - Source is a file stream');
                    fileStream = source;
                }// if-else

                var remote = '/' + sails.config.egnyte.root + destination;
                sails.log.info('EgnyteService.file.upload() - uploading file to ' + remote.replace('///', '/').replace('//', '/'));

                // upload in chunks
                return egnyte.API.storage.storeFile(remote.replace('///', '/').replace('//', '/'), fileStream);

            } catch (e) {
                sails.log.error('EgnyteService.file.upload() Exception - ' + e.message);
                return Promise.reject({ message: 'File upload exception' });

            }// try-catch


        }

    }
} 