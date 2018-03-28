'use strict';

var Promise = require('es6-promise').Promise;
var _ = require('underscore');

var Entity = require('./entity');
var Logger = require('./logger');
var util = require('./util');
var mixin = require('./mixin');
var logger = new Logger();

var Elem = function (name) {
    Entity.call(this, name);

    this._type = 'element';

    this.parent = null;
    this.children = null;
    this._attached = false;
    this._depth = 0;

    this.setObserverType('root', 'parent', 'children');

    Object.defineProperties(this, mixin.descriptor);
};

Elem.prototype = _.create(Entity.prototype, _.extend({
    constructor: Elem,

    _cname: 'Elem',

    getCurrentDepth: function () {
        return this._depth;
    },

    _async: function (callback) {
        callback = _.bind(callback, this);
        this.notify('root', 'async', function () {
            callback();
            return Promise.resolve();
        });
    },

    _entry: function () {
        if (!this.isActive()) {
            this._activate();
            this.notify('children', 'entry');
        }
    },

    _exit: function () {
        if (this.isActive()) {
            this.notify('children', 'exit');
            this._deactivate();
        }
    },
}, mixin.helper));

module.exports = Elem;
