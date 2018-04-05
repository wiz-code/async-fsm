'use strict';

var _ = require('underscore');
var Observable = require('./observable');
var logger = require('./logger');

var DELIMITER = '/';

var Model = function (data) {
    Observable.call(this);

    this._data = this._savedData = null;
    this.props = {};
    this.methods = {};
    this._cache = {}; //TODO

    if (_.isObject(data) && !_.isFunction(data)) {
        this.set(data);
    }
};

Model.prototype = _.create(Observable.prototype, {
    constructor: Model,

    _cname: 'Model',

    has: function (query) {
        var result = !_.isUndefined(this.get(query));
        return result;
    },

    get: function (query) {
        var result;
        query = _normalizeQuery(query);
        result = this._test('_get', query);
        return result;
    },

    set: function (query, value) {
        var oldValue, event;
        if (_.isUndefined(value)) {
            value = query;
            query = DELIMITER;
        }

        query = _normalizeQuery(query);
        oldValue = this._test('_get', query);
        if (_.isEqual(oldValue, value)) {
            return value;
        }

        _validate(value, 'json');
        this._set(query, value);
        event = oldValue == null ? 'create' : 'update';
        this._bubbling(event, query, value, oldValue);

        return value;
    },

    unset: function (query) {
        var value;
        query = _normalizeQuery(query);
        value = this._test('_get', query);
        if (!_.isUndefined(value)) {
            this._unset(query);
            this._bubbling('delete', query, value);
            return value;
        }
    },

    save: function () {
        this._savedData = _extend(this._savedData, this._data);
    },

    restore: function () {
        if (!_.isNull(this._savedData)) {
            this._data = _extend(null, this._savedData);
        }
    },

    clear: function () {
        this._data = this._savedData = null;
    },

    addProp: function (object) {
        _validate(object, 'not-function');
        this.props = _extend(this.props, object);
    },

    addMethod: function (object, context) {
        _validate(object, 'function');
        _addMethod(this.methods, object, context);
    },

    _test: function (method, param) {
        var result;

        try {
            result = this[method](param);

        } catch (e) {}

        return result;
    },

    _get: function (query) {
        var propNameList, value;
        propNameList = _parseQuery(query);
        value = _search(propNameList, this._data);

        return value;
    },

    _set: function (query, value) {
        var propNameList, lastPropName, reference;

        propNameList = _parseQuery(query);

        if (!_exists(propNameList, this._data)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        if (!propNameList.length) {
            this._data = _extend(this._data, value);

        } else {
            lastPropName = propNameList.pop();
            reference = _search(propNameList, this._data);
            if (_.isObject(value) && !_.isFunction(value)) {
                reference[lastPropName] = {};
                _extend(reference[lastPropName], value);

            } else {
                reference[lastPropName] = value;
            }
        }

        return value;
    },

    _unset: function (query) {
        var propNameList, lastPropName, reference, cache;
        propNameList = _parseQuery(query);
        lastPropName = propNameList.pop();

        if (!_exists(propNameList, this._data)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        reference = _search(propNameList, this._data);
        cache = reference[lastPropName];
        delete reference[lastPropName];

        return cache;
    },

    _bubbling: function (event, query, value, oldValue) {
        var propNameList, currentTarget, object;
        propNameList = _parseQuery(query);
        object = {
            event: event,
            currentTarget: '',
            target: query,
            value: value,
            oldValue: oldValue,
        };

        while (propNameList.length) {
            currentTarget = propNameList.join(DELIMITER);
            object.currentTarget = currentTarget;

            if (this.countListeners(currentTarget) > 0) {
                this.notifyListeners(currentTarget, object);
            }

            propNameList.pop();
        }

        object.currentTarget = DELIMITER;
        if (this.countListeners(DELIMITER) > 0) {
            this.notifyListeners(DELIMITER, object);
        }
    },

    watch: function (query, listener) {
        if (_.isFunction(query)) {
            listener = query;
            query = DELIMITER;
        }
        query = _normalizeQuery(query);
        this.observe(query, listener);
    },

    unwatch: function (query, listener) {
        if (_.isFunction(query)) {
            listener = query;
            query = DELIMITER;
        }
        query = _normalizeQuery(query);
        this.unobserve(query, listener);
    },
});

function _extend(destination, source) {
    destination = destination || (_.isArray(source) ? [] : {});

    _.each(source, function (value, key) {
        if (_.isObject(value) && !_.isFunction(value)) {
            destination[key] = _.isArray(value) ? [] : {};
            _extend(destination[key], value);

        } else {
            destination[key] = value;
        }
    });

    return destination;
}

function _validate(value, required) {
    var result = false;

    switch (required) {
        case 'json':
        if (_.isString(value) || _.isNumber(value) ||
            _.isBoolean(value) || _.isNull(value)) {
            result = true;

        } else if (_.isArray(value) || (_.isObject(value) && !_.isFunction(value))) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });

        } else {
            logger.error('JSONデータ型以外はデータに登録できません。');
        }

        break;

        case 'function':
        if (_.isFunction(value)) {
            result = true;

        } else if (_.isArray(value) || (_.isObject(value) && !_.isFunction(value))) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });
        } else {
            logger.error('Function以外はメソッドに登録できません。');
        }
        break;

        case 'not-function':
        if (!_.isFunction(value)) {
            result = true;

        } else if (_.isArray(value) || (_.isObject(value) && !_.isFunction(value))) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });
        } else {
            logger.error('Functionはプロパティに登録できません。');
        }
        break;
    }

    return result;
}

function _addMethod(dest, object, context) {
    _.each(object, function (value, key) {
        var method;
        if (!_.isFunction(value)) {
            dest[key] = {};
            _addMethod(dest[key], value, context);

        } else {
            method = _.bind(value, context);
            dest[key] = method;
        }
    });
}

function _parseQuery(query) {
    var result = _.compact(query.split(DELIMITER));
    return result;
}

function _exists(list, data) {
    var result = _.every(list, function (propName) {
        if (_.isArray(data) || (_.isObject(data) && !_.isFunction(data))) {
            if (data.hasOwnProperty(propName)) {
                data = data[propName];
                return true;
            }
        }
    });

    return result;
}

function _search(list, data) {
    var result = _.reduce(list, function (object, propName) {
        return object[propName];
    }, data);

    return result;
}

function _normalizeQuery(query) {
    if (!_.isString(query)) {
        logger.error('クエリは文字列で指定してください。')
    }

    if (query !== DELIMITER) {
        query = query.replace(/^\/|\/$/g, '');
    }

    return query;
}

module.exports = Model;
