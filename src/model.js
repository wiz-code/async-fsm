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

    this._data = this._savedData = this.props = this.methods = undefined;
    this._cache = {};

    if (!_.isUndefined(data)) {
        this.set(data);
    }
};

Model.prototype = _.create(Observable.prototype, {
    constructor: Model,

    _cname: 'Model',

    has: function (query) {
        return !_.isUndefined(this.get(query));
    },

    get: function (query) {
        var path, value;
        query = _normalizeQuery(query);
        path = _parseQuery(query);
        value = this._cache[query];

        if (_.isUndefined(value)) {
            if (path.length) {
                value = _.property(path)(this._data);

            } else {
                value = this._data;
            }

            if (!_.isUndefined(value)) {
                this._cache[query] = value;
            }
        }

        return value;
    },

    set: function (query, value) {
        var collection, path, oldValue, parentPath, parent;
        if (_.isUndefined(value)) {
            value = query;
            query = DELIMITER;
        }

        collection = [];

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        oldValue = this.get(query);
        if (!_.isUndefined(oldValue)) {
            if (_.isEqual(oldValue, value)) {
                return value;
            }
            _collect(oldValue, query, collection, 'delete');
        }

        _collect(value, query, collection, 'create');

        if (path.length) {
            parentPath = _.initial(path);

            if (parentPath.length) {
                parent = _.property(parentPath)(this._data);
            } else {
                parent = this._data;
            }

            parent[_.last(path)] = value;
        } else {
            this._data = value;
        }

        _.each(_.map(_.groupBy(collection, '0'), function (array, key) {
            if (array.length > 1) {
                return {
                    event: 'update',
                    target: array[0][0],
                    value: array[1][2],
                    oldValue: array[0][2],
                };
            } else {
                return {
                    target: key,
                    event: array[0][1],
                    value: array[0][2],
                };
            }
        }), function (object) {
            if (!_.isUndefined(this._cache[object.target])) {
                if (object.event === 'delete') {
                    delete this._cache[object.target];
                } else {
                    this._cache[object.target] = object.value;
                }
            }

            this._bubbling(object);
        }, this);
    },

    unset: function (query) {
        var collection, path, value, parentPath, parent;
        collection = [];

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        value = this.get(query);

        if (!_.isUndefined(value)) {
            _collect(value, query, collection, 'delete');

            if (path.length) {
                parentPath = _.initial(path);

                if (parentPath.length) {
                    parent = _.property(parentPath)(this._data);
                } else {
                    parent = this._data;
                }

                delete parent[_.last(path)];
            } else {
                this._data = undefined;
            }

            _.each(_.map(collection, function (array) {
                return {
                    target: array[0],
                    event: 'delete',
                    value: array[2],
                };
            }), function (object) {
                delete this._cache[object.target];
                this._bubbling(object);
            }, this);
        }

        return value;
    },

    save: function () {
        this._savedData = _extend(null, this._data);
    },

    restore: function () {
        if (!_.isUndefined(this._savedData)) {
            this.set(this._savedData);
        }
    },

    clear: function () {
        this._data = this._savedData = undefined;
    },

    _get: function (type, query) {
        var path, value;
        query = _normalizeQuery(query);
        path = _parseQuery(query);
        if (path.length) {
            value = _.property(path)(this[type]);

        } else {
            value = this[type];
        }

        return value;
    },

    _set: function (type, query, value, context) {
        var path, validType, parentPath, parent;
        if (!_.isString(query)) {
            context = value;
            value = query;
            query = DELIMITER;
        }

        query = _normalizeQuery(query);
        path = _parseQuery(query);

        validType = type === 'props' ? 'not-function' : 'function-only';
        _validateEach(value, validType);

        if (path.length) {
            parentPath = _.initial(path);

            if (parentPath.length) {
                parent = _.property(parentPath)(this[type]);
            } else {
                parent = this[type];
            }

            if (type === 'props') {
                parent[_.last(path)] = value;
            } else {
                parent[_.last(path)] = _bind(value, context);
            }
        } else {
            if (type === 'props') {
                this[type] = value;
            } else {
                this[type] = _bind(value, context);
            }
        }

        return value;
    },

    getProp: function (query) {
        return this._get('props', query);
    },

    setProp: function (query, prop) {
        return this._set('props', query, prop);
    },

    getMethod: function (query) {
        return this._get('methods', query);
    },

    setMethod: function (query, method, context) {
        return this._set('methods', query, method, context);
    },

    _test: function (method) {
        var params, result;
        params = _.toArray(arguments).slice(1);

        try {
            result = this[method].apply(this, params);

        } catch (e) {}

        return result;
    },

    _bubbling: function (object) {
        var propNamePath, currentTarget;
        propNamePath = _parseQuery(object.target);

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

function _collect(object, query, collection, event) {
    collection = collection || [];

    if (event === 'create') {
        _validate(object, 'json');
    }

    if (_.isObject(object)) {
        _.each(object, function (value, key) {
            var path = (query !== DELIMITER ? query + '/' : '') + key;
            _collect(value, path, collection, event);
        });
    }

    collection.push([query, event, object]);

    return collection;
}

function _bind(object, context) {
    if (_.isArray(object) || _isPlainObject(object)) {
        _.each(object, function (value, key) {
            object[key] = _bind(value, context);
        });
    } else {
        object = _.bind(object, context);
    }

    return object;
}

function _extend(dest, src) {
    dest = dest || (_.isArray(src) ? [] : {});

    _.each(src, function (value, key) {
        if (_.isArray(value) || _isPlainObject(value)) {
            dest[key] = _extend(null, value);

        } else {
            dest[key] = value;
        }
    });

    return dest;
}

function _validateEach(value, required) {
    var result = false;

    if (_.isArray(value) || _isPlainObject(value)) {
        result = _.every(value, function (element) {
            return _validateEach(element, required);
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
        if (_isPlainObject(value) || _.isArray(value) || _.isNull(value) ||
        _.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
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
    if (query !== DELIMITER) {
        return query.split(DELIMITER);
    } else {
        return [];
    }
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

module.exports = Model;
