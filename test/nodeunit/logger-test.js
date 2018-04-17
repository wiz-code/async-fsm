var assert = require('assert');
var logger = require('../../src/logger');

module.exports = {
    'Logger Test': function (test) {
        test.expect(7);

        logger.disable();
        test.ok(!logger.config.debuggable);
        logger.enable();
        test.ok(logger.config.debuggable);

        logger.setLogLevel('debug');
        test.equal(logger.config.logLevel, 'DEBUG');
        logger.setLogLevel('info');
        test.equal(logger.config.logLevel, 'INFO');
        logger.setLogLevel('warn');
        test.equal(logger.config.logLevel, 'WARN');
        logger.setLogLevel('error');
        test.equal(logger.config.logLevel, 'ERROR');
        test.throws(logger.error);

        test.done();
    },
};
