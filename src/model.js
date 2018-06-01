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

        _.each(_.compact(_.map(_.groupBy(collection, '0'), function (array, key) {
            var deleted, created, object;
            if (array.length > 1) {
                deleted = array[0];
                created = array[1];
                if (!_.isEqual(deleted[2], created[2])) {
                    return {
                        event: 'update',
                        target: deleted[0],
                        value: created[2],
                        oldValue: deleted[2],
                    };
                }
            } else {
                object = array[0];
                return {
                    target: key,
                    event: object[1],
                    value: object[2],
                };
            }
        })), function (object) {
            if (!_.isUndefined(this._cache[object.target])) {
                if (object.event === 'delete') {
                    delete this._cache[object.target];
                } else {
                    this._cache[object.target] = object.value;
                }
            }

            this._bubbling(object);
        }, this);

        return value;
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

            _.each(_.map(collection, function (deleted) {
                return {
                    target: deleted[0],
                    event: 'delete',
                    value: deleted[2],
                };
            }), function (object) {
                delete this._cache[object.target];
                this._bubbling(object);
            }, this);
        }

        return value;
    },

    merge: function (query) {
        var query, dest, srcs, collection;
        srcs = _.toArray(arguments);

        if (!_.isString(query)) {
            query = DELIMITER;
        } else {
            srcs = srcs.slice(1);
        }

        query = _normalizeQuery(query);
        dest = this.get(query);

        collection = [];

        if (!_.isObject(dest)) {
            dest = this.set(query, _.isArray(_.first(srcs)) ? [] : {});
        }

        _.each(srcs, function (src) {
            var parentPaths, destPaths, srcPaths, updatePaths, createPaths, cloneData, mergedData;
            parentPaths = _getParentPath(query);
            destPaths = _getChildrenPath(dest, query).concat(parentPaths);
            srcPaths = _getChildrenPath(src, query).concat(parentPaths);

            updatePaths = _.intersection(destPaths, srcPaths);
            createPaths = _.difference(srcPaths, destPaths);

            this._temp = _extend(null, this.get());
            cloneData = _extend(null, this._temp);
            this._set('_temp', query, src);
            mergedData = this._temp;

            _collectMerge(cloneData, updatePaths, collection, 'delete');
            _collectMerge(mergedData, updatePaths, collection, 'create');
            _collectMerge(mergedData, createPaths, collection, 'create');

            _merge(dest, src);

            _.each(_.compact(_.map(_.groupBy(collection, '0'), function (array, key) {
                var deleted, created;

                if (array.length > 1) {
                    deleted = array[0];
                    created = array[1];

                    if (!_.isEqual(deleted[2], created[2])) {
                        return {
                            event: 'update',
                            target: deleted[0],
                            value: created[2],
                            oldValue: deleted[2],
                        };
                    }
                } else {
                    created = array[0];
                    return {
                        target: key,
                        event: created[1],
                        value: created[2],
                    };
                }
            })), function (object) {
                if (!_.isUndefined(this._cache[object.target])) {
                    this._cache[object.target] = object.value;
                }

                this._bubbling(object);
            }, this);
        }, this);

        return dest;
    },

    save: function () {
        if (!_.isObject(this._data)) {
            this._savedData = this._data;

        } else {
            this._savedData = _extend(null, this._data);
        }
    },

    restore: function () {
        if (!_.isUndefined(this._savedData)) {
            this.clear();
            this.set(this._savedData);
        }
    },

    clear: function () {
        this._data = undefined;
        _.each(_.keys(this._cache), function (key) {
            delete this._cache[key];
        }, this);
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

        query = _normalizeQuery(query);
        path = _parseQuery(query);

        if (path.length) {
            parentPath = _.initial(path);

            if (parentPath.length) {
                parent = _.property(parentPath)(this[type]);
            } else {
                parent = this[type];
            }

            parent[_.last(path)] = value;
        } else {
            this[type] = value;
        }

        return value;
    },

    getProp: function (query) {
        return this._get('props', query);
    },

    setProp: function (query, prop) {
        if (!_.isString(query)) {
            prop = query;
            query = DELIMITER;
        }

        _validateEach(prop, 'not-function');
        return this._set('props', query, prop);
    },

    getMethod: function (query) {
        return this._get('methods', query);
    },

    setMethod: function (query, method, context) {
        if (!_.isString(query)) {
            context = method;
            method = query;
            query = DELIMITER;
        }

        _validateEach(method, 'function-only');
        method = _bind(method, context);
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

function _collect(/*data, paths, collection, event*/object, query, collection, event) {
    collection = collection || [];

    if (event === 'create') {
        _validate(object, 'json');
    }

    if (_.isObject(object)) {
        _.each(object, function (value, key) {
            var path = (query !== DELIMITER ? query + DELIMITER : '') + key;
            _collect(value, path, collection, event);
        });
    }

    collection.push([query, event, object]);
    /*collection = collection || [];

    _.each(paths, function (path) {
        var list, value;
        list = _parseQuery(path);

        if (list.length) {
            value = _.property(list)(data);

        } else {
            value = data;
        }

        if (event === 'create') {
            _validate(value, 'json');
        }

        collection.push([path, event, value]);
    });*/

    return collection;
}

function _collectMerge(data, paths, collection, event) {
    collection = collection || [];

    _.each(paths, function (path) {
        var list, value;
        list = _parseQuery(path);

        if (list.length) {
            value = _.property(list)(data);

        } else {
            value = data;
        }

        if (event === 'create') {
            _validate(value, 'json');
        }

        collection.push([path, event, value]);
    });

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

function _getChildrenPath(object, currentPath, collection) {
    currentPath = !_.isUndefined(currentPath) ? currentPath : DELIMITER;
    collection = !_.isUndefined(collection) ? collection : [];

    if (_.isObject(object)) {
        _.each(object, function (value, key) {
            var path = currentPath !== DELIMITER ? currentPath + DELIMITER + key : key;
            _getChildrenPath(value, path, collection);
        });
    }

    collection.push(currentPath);
    return collection;
}

function _getParentPath(query, collection) {
    var path = _parseQuery(query);
    collection = !_.isUndefined(collection) ? collection : [];

    if (path.length) {
        path.pop();
        path.reverse().push(DELIMITER);
    }

    Array.prototype.push.apply(collection, path);
    return collection;
}

function _extend(dest, src) {
    dest = dest || (_.isArray(src) ? [] : {});

    _.each(src, function (value, key) {
        if (_.isArray(value) || _isPlainObject(value)) {
            dest[key] = _extend(dest[key], value);

        } else {
            dest[key] = value;
        }
    });

    return dest;
}

function _merge(dest) {
    var srcs = _.toArray(arguments).slice(1);

    _.each(srcs, function (src) {
        dest = _extend(dest, src);
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
    if (_.isUndefined(query)) {
        query = DELIMITER;

    } else if (!_.isString(query)) {
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
