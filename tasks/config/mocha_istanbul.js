


module.exports = function (grunt) {

    grunt.config.set('mocha_istanbul', {
        test: {
            src: 'test', // the folder, not the files
            options: {
                coverageFolder: 'coverage',
                mask: '**/*.test.js',
                root: 'api/'
            }
        },

        'test-cleanup': {
            src: 'test/cleanup', // the folder, not the files
            options: {
                coverageFolder: 'coverage',
                mask: '**/*.js',
                root: 'api/'
            }
        },

        'test-models': {
            src: 'test/models', // the folder, not the files
            options: {
                coverageFolder: 'coverage',
                mask: '**/*.js',
                root: 'api/'
            }
        },

        'test-services': {
            src: 'test/services', // the folder, not the files
            options: {
                coverageFolder: 'coverage',
                mask: '**/*.js',
                root: 'api/'
            }
        }



    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');
};
