'use strict';

var _ = require('underscore');

var Logger = function (config) {
    config = config || {};
    this.config = _.defaults(config, Logger.defaultConfig);
    if (config.logLevel) {
        this.setLogLevel(this.config.logLevel);
    }
};

Logger.defaultConfig = {
    logLevel: 'DEBUG',
    debuggable: true,
};

Logger.logLevelData = [
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
];

Logger.prototype = _.create(Object.prototype, {
    constructor: Logger,

    enable: function () {
        if (!this.config.debuggable) {
            this.config.debuggable = true;
        }
    },

    disable: function () {
        if (this.config.debuggable) {
            this.config.debuggable = false;
        }
    },

    setLogLevel: function (level) {
        level = level.toUpperCase();
        if (_.indexOf(Logger.logLevelData, level) !== -1) {
            this.config.logLevel = level;
        }
    },

    debug: function (message) {
        if (this.config.debuggable && _.indexOf(Logger.logLevelData, this.config.logLevel) <= 0) {
            console.log('DEBUG: ', message);
        }
    },

    info: function (message) {
        if (this.config.debuggable && _.indexOf(Logger.logLevelData, this.config.logLevel) <= 1) {
            console.log('INFO: ', message);
        }
    },

    warn: function (message) {
        if (this.config.debuggable && _.indexOf(Logger.logLevelData, this.config.logLevel) <= 2) {
            console.log('WARN: ', message);
        }
    },

    error: function (message) {
        if (this.config.debuggable && _.indexOf(Logger.logLevelData, this.config.logLevel) <= 3) {
            console.error('ERROR: ', message);
            throw new Error('ERROR: ' + message);
        }
    },
});

module.exports = Logger;
