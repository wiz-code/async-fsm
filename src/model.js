'use strict';

var _, Observable, logger, DELIMITER, trim, toString, getPrototypeOf, Model;

_ = require('underscore');
Observable = require('./observable');
logger = require('./logger');

DELIMITER = '/';

trim = (function () {
    var escaped, pattern;
    escaped = DELIMITER.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    pattern = new RegExp('^' + escaped + '+|' + escaped + '+$', 'g');

    return function (str) {
        return str.replace(pattern, '');
    };
}());

toString = Object.prototype.toString;
getPrototypeOf = Object.getPrototypeOf;

Model = function (data) {
    Observable.call(this);

    this._data = undefined;
    this._savedData = undefined;
    this.props = undefined;
    this.methods = undefined;
    this._cache = {};
    this._events = [];

    if (!_.isUndefined(data)) {
        var start = performance.now();
        this.set(data);
        console.log('set() performance: ', performance.now() - start);
    }
};

Model.prototype = _.create(Observable.prototype, {
    constructor: Model,

    _cname: 'Model',

    has: function (query) {
        var value;
        query = _normalizeQuery(query);
        value = this._test('_get', query);
        return !_.isUndefined(value);
    },

    get: function (query) {
        var value;
        query = _normalizeQuery(query);
        value = this._get(query);
        return value;
    },

    set: function (query, value) {
        var oldValue, newValue;
        if (_.isUndefined(value)) {
            value = query;
            query = DELIMITER;
        }

        this._events.length = 0;

        query = _normalizeQuery(query);
        oldValue = this._get(query);
        if (!_.isUndefined(oldValue)) {
            if (_.isEqual(oldValue, value)) {
                return value;
            }
var start = performance.now();
            if (_isObject(oldValue)) {
                this._unsetObject(query, oldValue);

            } else {
                this._unset(query);
            }
console.log('unset() performance: ', query, performance.now() - start);
        }
var start = performance.now();
        if (_isObject(value)) {
            newValue = this._setObject(query, value);

        } else {
            newValue = this._set(query, value);
        }
console.log('performance: ', query, performance.now() - start);
//console.log(this._events);

        var uniq = _.chain(this._events).groupBy('query').map(function (object, key) {
            if (_.size(object) === 1) {
                return _.first(object);

            } else {
                return {
                    event: 'update',
                    query: key,
                    value: object[1].value,
                    oldValue: object[0].value,
                };
            }
        });

        //console.log(uniq.value());
        /*_.each(uniq, function (q) {
            _.each(this._events, function () {

            }, this);
        }, this);*/
        //event = !_.isUndefined(oldValue) ? 'update' : 'create';
        //this._bubbling(event, query, newValue, oldValue);
        return newValue;
    },

    _setObject: function (query, object, parent) {
        var destination, propNamePath;
        destination = _.isArray(object) ? [] : {};
        propNamePath = _parseQuery(query);

        _.each(object, function (value, key) {
            var path, currentQuery;
            path = propNamePath.slice(0);
            path.push(key);
            currentQuery = path.join(DELIMITER);

            if (_isObject(value)) {
                value = this._setObject(currentQuery, value, destination);

            } else {
                this._set(currentQuery, value, destination);
            }
            //this._bubbling('create', currentQuery, val);
        }, this);

        this._set(query, destination, parent);

        return destination;
    },

    _unsetObject: function (query, object) {
        var propNamePath = _parseQuery(query);
        _.each(object, function (value, key) {
            var path, currentQuery;
            path = propNamePath.slice(0);
            path.push(key);
            currentQuery = path.join(DELIMITER);

            if (_isObject(value)) {
                this._unsetObject(currentQuery, value);

            } else {
                this._unset(currentQuery);
            }
        }, this);

        this._unset(query);

        return object;
    },

    unset: function (query) {
        var value;
        this._events.length = 0;

        query = _normalizeQuery(query);
        value = this._get(query);
        if (!_.isUndefined(value)) {
            if (_isObject(value)) {
                this._unsetObject(query, value);

            } else {
                value = this._unset(query);
            }
//console.log(this._events);
            //this._bubbling('delete', query, value);
        }

        return value;
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
        _validateEach(object, 'not-function');
        this.props = _extend(this.props, object);
        return this.props;
    },

    addMethod: function (object, context) {
        _validateEach(object, 'function-only');
        this.methods = _extendMethod(this.methods, object, context);
        return this.methods;
    },

    getProp: function (query) {
        var list, result;
        query = _normalizeQuery(query);
        list = _parseQuery(query);
        result = this._test('_get', list, this.props);
        return result;
    },

    setProp: function (query, prop) {
        var list;
        if (_.isUndefined(prop)) {
            prop = query;
            query = DELIMITER;
        }

        query = _normalizeQuery(query);
        list = _parseQuery(query);

        _validateEach(prop, 'not-function');
        this._set(list, prop, 'props');

        return prop;
    },

    getMethod: function (query) {
        var list, result;
        query = _normalizeQuery(query);
        list = _parseQuery(query);
        result = this._test('_get', list, this.methods);
        return result;
    },

    setMethod: function (query, method, context) {
        var list;
        if (_.isUndefined(method)) {
            method = query;
            query = DELIMITER;
        }

        query = _normalizeQuery(query);
        list = _parseQuery(query);

        _validateEach(method, 'function-only');
        this._setMethod(list, method, context);

        return method;
    },

    _test: function (method) {
        var params, result;
        params = _.toArray(arguments).slice(1);

        try {
            result = this[method].apply(this, params);

        } catch (e) {}

        return result;
    },

    _get: function (query) {
        var path, value;
        path = _parseQuery(query);
        value = this._cache[query];

        if (_.isUndefined(value)) {
            if (path.length) {
                value = _.property(path)(this._data);

            } else {
                value = this._data;
            }

            this._cache[query] = value;
        }

        return value;
    },

    _set: function (query, value, parent) {
        var path, parentPath, lastPropName;
        path = _parseQuery(query);
        _validate(value, 'json');

        if (path.length) {
            lastPropName = _.last(path);
            parentPath = _.initial(path);

            if (_.isUndefined(parent)) {
                if (parentPath.length) {
                    parent = _.property(parentPath)(this._data);

                } else {
                    parent = this._data;
                }
            }

            parent[lastPropName] = value;
        } else {
            this._data = value;
        }

        this._events.push({
            event: 'create',
            query: query,
            value: value,
        });

        return value;
    },

    _unset: function (query, parent) {
        var path, parentPath, lastPropName, value;
        path = _parseQuery(query);

        if (path.length) {
            lastPropName = _.last(path);
            parentPath = _.initial(path);

            if (_.isUndefined(parent)) {
                if (parentPath.length) {
                    parent = _.property(parentPath)(this._data);

                } else {
                    parent = this._data;
                }
            }
//console.log('unset path', path);
            value = parent[lastPropName];
            delete parent[lastPropName];

        } else {
            value = this._data;
            delete this._data;
        }

        if (!_.isUndefined(this._cache[query])) {
            delete this._cache[query];
        }

        this._events.push({
            event: 'delete',
            query: query,
            value: value,
        });

        return value;
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
            if (_isPlainObject(method)) {
                reference[lastMethodName] = {};
                _extendMethod(reference[lastMethodName], method, context);

            } else {
                reference[lastMethodName] = method;
            }
        }

        return method;
    },

    _bubbling: function (event, query, value, oldValue) {
        var propNamePath, currentTarget, object;
        query = _normalizeQuery(query);
        propNamePath = _parseQuery(query);
        object = {
            event: event,
            currentTarget: '',
            target: query,
            value: value,
            oldValue: oldValue,
        };

        while (propNamePath.length) {
            currentTarget = propNamePath.join(DELIMITER);
            object.currentTarget = currentTarget;

            if (this.countListeners(currentTarget) > 0) {
                this.notifyListeners(currentTarget, object);
            }

            propNamePath.pop();
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

        } else if (_isPlainObject(value)) {
            dest[key] = {};
            _extend(dest[key], value);

        } else {
            dest[key] = value;
        }
    });

    return dest;
}

function _validateEach(value, required) {
    var result = false;

    if (_isObject(value)) {
        result = _.every(value, function (val) {
            return _validateEach(val, required);
        });
    } else {
        result = _validate(value, required);
    }

    return result;
}

function _validate(value, required) {
    var result = false;

    switch (required) {
        case 'json':
        if (_.isString(value) || _.isNumber(value) ||
            _.isBoolean(value) || _.isNull(value) ||
            _isObject(value)) {
            result = true;

        } else {
            logger.error('JSONデータ型以外はデータに登録できません。');
        }

        break;

        case 'function-only':
        if (_.isFunction(value)) {
            result = true;

        } else {
            logger.error('Function以外はメソッドに登録できません。');
        }
        break;

        case 'not-function':
        if (!_.isFunction(value)) {
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

        } else if (_isPlainObject(value)) {
            dest[key] = {};
            _extendMethod(dest[key], value, context);

        } else {
            method = _.bind(value, context);
            dest[key] = method;
        }
    });

    return dest;
}

function _normalizeQuery(query) {
    if (!_.isString(query)) {
        logger.error('クエリは文字列で指定してください。');
    }

    if (query !== DELIMITER) {
        query = trim(query);
    }

    return query;
}

function _parseQuery(query) {
    var result = _.compact(query.split(DELIMITER));
    return result;
}

function _isPlainObject(obj) {
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

function _isObject(object) {
    var result = false;
    if (_.isArray(object) || _isPlainObject(object)) {
        result = true;
    }
    return result;
}

module.exports = Model;
