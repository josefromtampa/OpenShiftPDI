
module.exports = function (grunt) {

    grunt.registerTask('test-list', 'Shows the list of supported test commands.', function () {

        grunt.log.writeln(' ');
        grunt.log.writeln('Supported Tests');
        grunt.log.writeln('***************************************************************');
        grunt.log.writeln('test          ==> Runs through all tests');
        grunt.log.writeln('test-cleanup  ==> Runs all test clean-up tasks');
        grunt.log.writeln('test-models   ==> Runs through tests for MODELS');
        grunt.log.writeln('test-services ==> Runs through tests for SERVICES');

    });

    grunt.registerTask('test', [
        'mocha_istanbul:test'
    ]);
    grunt.registerTask('test-cleanup', [
        'mocha_istanbul:test-cleanup'
    ]);
    grunt.registerTask('test-models', [
        'mocha_istanbul:test-models'
    ]);
    grunt.registerTask('test-services', [
        'mocha_istanbul:test-services'
    ]);
};
