'use strict';

var _ = require('underscore');

var Observable = function () {
    this._listeners = {};
};

Observable.prototype = _.create(Object.prototype, {
    constructor: Observable,

    _cname: 'Observable',

    hasListener: function (state, listener) {
        var result = false;
        if (!_.isUndefined(this._listeners[state])) {
            if (_.indexOf(this._listeners[state], listener) > -1) {
                result = true;
            }
        }
        return result;
    },

    countListeners: function (state) {
        var result = 0;
        if (!_.isUndefined(this._listeners[state])) {
            result = this._listeners[state].length;
        }

        return result;
    },

    observe: function (state, listener) {
        if (_.isUndefined(this._listeners[state])) {
            this._listeners[state] = [];
        }

        if (_.isFunction(listener)) {
            this._listeners[state].push(listener);
        }
    },

    unobserve: function (state, listener) {
        var listeners, index;
        listeners = this._listeners[state];

        if (_.isUndefined(listeners)) {
            return;
        }

        index = _.indexOf(listeners, listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    },

    notifyListeners: function (state, params) {
        var listeners, i, l, listener;
        listeners = this._listeners[state];

        if (_.isUndefined(listeners)) {
            return;
        }

        for (i = 0, l = listeners.length; i < l; i += 1) {
            listener = listeners[i];
            if (_.isFunction(listener)) {
                params = _.isArray(params) ? params : _.toArray(arguments).slice(1);
                listener.apply(null, params);
            }
        }
    },
});

module.exports = Observable;
