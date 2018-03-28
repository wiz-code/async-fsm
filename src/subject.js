'use strict';

var _ = require('underscore');

var Subject = function () {
    this._observers = {};
};

Subject.prototype = _.create(Object.prototype, {
    constructor: Subject,

    _cname: 'Subject',

    hasObserver: function (type, observer) {
        var result = false;
        if (!_.isUndefined(this._observers[type])) {
            if (_.indexOf(this._observers[type], observer) > -1) {
                result = true;
            }
        }
        return result;
    },

    countObservers: function (type) {
        var result = 0;
        if (!_.isUndefined(this._observers[type])) {
            result = this._observers[type].length;
        }

        return result;
    },

    setObserverType: function (types) {
        var type, i, l;
        types = _.isArray(types) ? types : _.toArray(arguments);

        for (i = 0, l = types.length; i < l; i += 1) {
            type = types[i];
            if (_.isUndefined(this._observers[type])) {
                this._observers[type] = [];
            }
        }
    },

    addObserver: function (type, observer) {

        if (_.isUndefined(this._observers[type])) {
            this._observers[type] = [];
        }

        if (_.isObject(observer) && !_.isFunction(observer)) {
            this._observers[type].push(observer);
        }
    },

    removeObserver: function (type, observer) {
        var observers, index;
        observers = this._observers[type];

        if (_.isUndefined(observers)) {
            return;
        }

        index = _.indexOf(observers, observer);
        if (index > -1) {
            observers.splice(index, 1);
        }
    },

    notify: function (type) {
        var observers, i, l, observer, params;
        observers = this._observers[type];

        if (_.isUndefined(observers)) {
            return;
        }

        for (i = 0, l = observers.length; i < l; i += 1) {
            observer = observers[i];
            if (_.isFunction(observer.update)) {
                params = _.toArray(arguments).slice(1);
                observer.update.apply(observer, params);
            }
        }
    },
});

module.exports = Subject;
