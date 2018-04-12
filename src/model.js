'use strict';

var _ = require('underscore');
var Observable = require('./observable');
var logger = require('./logger');

var DELIMITER = '/';
var toString = Object.prototype.toString;
var getPrototypeOf = Object.getPrototypeOf;

var Model = function (data) {
    Observable.call(this);

    this._data = this._savedData = null;
    this.props = null;
    this.methods = null;
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
        result = this._test('_get', query, this._data);
        return result;
    },

    set: function (query, value) {
        var oldValue, event;
        if (_.isUndefined(value)) {
            value = query;
            query = DELIMITER;
        }

        query = _normalizeQuery(query);
        oldValue = this._test('_get', query, this._data);
        if (_.isEqual(oldValue, value)) {
            return value;
        }

        _validate(value, 'json');
        this._set(query, value, '_data');
        event = oldValue == null ? 'create' : 'update';
        this._bubbling(event, query, value, oldValue);

        return value;
    },

    unset: function (query) {
        var value;
        query = _normalizeQuery(query);
        value = this._test('_get', query, this._data);
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
        return this.props;
    },

    addMethod: function (object, context) {
        _validate(object, 'function-only');
        this.methods = _extendMethod(this.methods, object, context);
        return this.methods;
    },

    getProp: function (query) {
        var result;
        query = _normalizeQuery(query);
        result = this._test('_get', query, this.props);
        return result;
    },

    setProp: function (query, prop) {
        query = _normalizeQuery(query);
        if (_.isUndefined(prop)) {
            prop = query;
            query = DELIMITER;
        }

        _validate(prop, 'not-function');
        this._set(query, prop, 'props');

        return prop;
    },

    getMethod: function (query) {
        var result;
        query = _normalizeQuery(query);
        result = this._test('_get', query, this.methods);
        return result;
    },

    setMethod: function (query, method, context) {
        query = _normalizeQuery(query);
        if (_.isUndefined(method)) {
            method = query;
            query = DELIMITER;
        }

        _validate(method, 'function-only');
        this._setMethod(query, method, context);

        return method;
    },

    _test: function (method) {
        var params, result;
        params = _.toArray(arguments).slice(1);

        try {
            result = this[method].apply(null, params);

        } catch (e) {}

        return result;
    },

    _get: function (query, data) {
        var propNameList, value;
        propNameList = _parseQuery(query);
        value = _search(propNameList, data);

        return value;
    },

    _set: function (query, value, type) {
        var data, propNameList, lastPropName, reference;

        data = this[type];
        propNameList = _parseQuery(query);

        if (!_exists(propNameList, data)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        if (!propNameList.length) {
            this[type] = _extend(data, value);

        } else {
            lastPropName = propNameList.pop();
            reference = _search(propNameList, data);
            if (_isObject(value)) {
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

    _setMethod: function (query, method, context) {
        var methodNameList, lastMethodName, reference;
        methodNameList = _parseQuery(query);

        if (!_exists(methodNameList, this.methods)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        if (!methodNameList.length) {
            this.methods = _extendMethod(this.methods, method, context);

        } else {
            lastMethodName = methodNameList.pop();
            reference = _search(methodNameList, this.methods);
            if (_isObject(method)) {
                reference[lastMethodName] = {};
                _extendMethod(reference[lastMethodName], method, context);

            } else {
                reference[lastMethodName] = method;
            }
        }

        return method;
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

function _extend(dest, src) {
    dest = dest || (_.isArray(src) ? [] : {});

    _.each(src, function (value, key) {
        if (_.isArray(value)) {
            dest[key] = [];
            _extend(dest[key], value);

        } else if (_isObject(value)) {
            dest[key] = {};
            _extend(dest[key], value);

        } else {
            dest[key] = value;
        }
    });

    return dest;
}

function _validate(value, required) {
    var result = false;

    switch (required) {
        case 'json':
        if (_.isString(value) || _.isNumber(value) ||
            _.isBoolean(value) || _.isNull(value)) {
            result = true;

        } else if (_.isArray(value) || _isObject(value)) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });

        } else {
            logger.error('JSONデータ型以外はデータに登録できません。');
        }

        break;

        case 'function-only':
        if (_.isFunction(value)) {
            result = true;

        } else if (_.isArray(value) || _isObject(value)) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });
        } else {
            logger.error('Function以外はメソッドに登録できません。');
        }
        break;

        case 'not-function':
        if (_.isArray(value) || _isObject(value)) {
            result = _.every(value, function (v) {
                return _validate(v, required);
            });
        } else if (!_.isFunction(value)) {
            result = true;

        } else {
            logger.error('Functionはプロパティに登録できません。');
        }
        break;
    }

    return result;
}

function _extendMethod(dest, object, context) {
    dest = dest || (_.isArray(object) ? [] : {});

    _.each(object, function (value, key) {
        var method;
        if (_.isArray(value)) {
            dest[key] = [];
            _extendMethod(dest[key], value, context);

        } else if (_isObject(value)) {
            dest[key] = {};
            _extendMethod(dest[key], value, context);

        } else {
            method = _.bind(value, context);
            dest[key] = method;
        }
    });

    return dest;
}

function _parseQuery(query) {
    var result = _.compact(query.split(DELIMITER));
    return result;
}

function _exists(list, data) {
    var result = _.every(list, function (propName) {
        if (_.isArray(data) || _isObject(data)) {
            if (data.hasOwnProperty(propName)) {
                data = data[propName];
            }
            return true;
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

function _isObject(obj) {
    var result, proto;
    result = false;
    if (toString.call(obj) === '[object Object]') {
        proto = obj;
        while (!_.isNull(getPrototypeOf(proto))) {
            proto = getPrototypeOf(proto);
        }
        result = getPrototypeOf(obj) === proto;
    }
    return result;
}

module.exports = Model;
