'use strict';

var uuidv4 = require('uuid/v4');
var _ = require('underscore');

var Subject = require('./subject');
var Model = require('./model');
var logger = require('./logger');
var util = require('./util');
var mixin = require('./mixin');

var Entity = function (name) {
    Subject.call(this);

    this._id = uuidv4();

    if (!util.isFalsy(name)) {
        this._name = this._originalName = name;

    } else {
        this._name = this._id;
        this._originalName = false;
    }

    this._type = 'entity';
    this._status = 'inactive';

    this.model = new Model();
};

Entity.prototype = _.create(Subject.prototype, _.extend({
    constructor: Entity,

    _cname: 'Entity',

    getId: function () {
        return this._id;
    },

    getName: function () {
        return this._name;
    },

    setName: function (name) {
        this._name = name;
        if (!this._originalName) {
            this._originalName = name;
        }
        
        return name;
    },

    isActive: function () {
        return this._status === 'active';
    },

    _activate: function () {
        if (!this.isActive()) {
            this._status = 'active';
            logger.info(this._cname + 'インスタンス"' + this._name + '"がアクティブ化されました。');
        }
    },

    _deactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            logger.info(this._cname + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
        }
    },

    update: _.noop,

}, mixin.accessor));

module.exports = Entity;
