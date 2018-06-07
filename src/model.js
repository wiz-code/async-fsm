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

    this._data = this._savedData = this.props = this.methods = this._temp = undefined;
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
        var collection, parentPaths, destPaths, srcPaths, deletePaths, updatePaths, createPaths, path, oldValue, preData, postData, parentPath, parent;

        if (_.isUndefined(value)) {
            value = query;
            query = DELIMITER;
        }

        collection = [];
        parentPaths = _getParentPath(query);
        destPaths = [];
        srcPaths = [];

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        oldValue = this.get(query);

        if (!_.isUndefined(oldValue)) {
            if (_.isEqual(oldValue, value)) {
                return value;
            }

            _getChildrenPath(oldValue, query, destPaths);
        }

        _getChildrenPath(value, query, srcPaths);

        deletePaths = _.difference(destPaths, srcPaths);
        updatePaths = _.intersection(destPaths, srcPaths).concat(parentPaths);
        createPaths = _.difference(srcPaths, destPaths);

        preData = _extend(undefined, this._data);
        this._temp = _extend(undefined, this._data);
        this._set('_temp', query, _extend(undefined, value));
        postData = this._temp;
        delete this._temp;

        _collect(preData, deletePaths, collection, 'delete');
        _collect(preData, updatePaths, collection, 'delete');
        _collect(postData, updatePaths, collection, 'create');
        _collect(postData, createPaths, collection, 'create');

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

        _.each(_.compact(_.map(_.groupBy(collection, '0'), function (array) {
            var deleted, created, object;

            if (array.length > 1) {
                deleted = array[0];
                created = array[1];
                if (!_.isEqual(deleted[2], created[2])) {
                    return {
                        target: deleted[0],
                        event: 'update',
                        value: created[2],
                        oldValue: deleted[2],
                    };
                }
            } else {
                object = array[0];
                return {
                    target: object[0],
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
        var path, value, collection, deletePaths, updatePaths, preData, postData, parentPath, parent;

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        value = this.get(query);

        collection = [];
        deletePaths = [];
        updatePaths = _getParentPath(query);

        if (!_.isUndefined(value)) {
            _getChildrenPath(value, query, deletePaths);

            preData = _extend(undefined, this._data);
            this._temp = _extend(undefined, this._data);
            this._unset('_temp', query);
            postData = this._temp;
            delete this._temp;

            _collect(preData, deletePaths, collection, 'delete');
            _collect(preData, updatePaths, collection, 'delete');
            _collect(postData, updatePaths, collection, 'create');

            if (path.length) {
                parentPath = _.initial(path);

                if (parentPath.length) {
                    parent = _.property(parentPath)(this._data);
                } else {
                    parent = this._data;
                }

                delete parent[_.last(path)];
            } else {
                delete this._data;
            }

            _.each(_.compact(_.map(_.groupBy(collection, '0'), function (array) {
                var deleted, created;

                if (array.length > 1) {
                    deleted = array[0];
                    created = array[1];

                    return {
                        event: 'update',
                        target: deleted[0],
                        value: created[2],
                        oldValue: deleted[2],
                    };
                } else {
                    deleted = array[0];
                    return {
                        target: deleted[0],
                        event: deleted[1],
                        value: deleted[2],
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
        }

        return value;
    },

    merge: function (query) {
        var dest, srcs, collection;
        srcs = _.toArray(arguments);

        if (!_.isString(query)) {
            query = DELIMITER;
        } else {
            if (srcs.length > 1) {
                srcs = srcs.slice(1);
            } else {
                query = DELIMITER;
                srcs = srcs[0];
            }
        }

        query = _normalizeQuery(query);
        dest = this.get(query);

        collection = [];

        _.each(srcs, function (src) {
            var parentPaths, destPaths, srcPaths, updatePaths, createPaths, preData, postData;

            if (!_.isObject(src)) {
                logger.error('マージ元は配列か連想配列を指定してください。');
            }

            parentPaths = _getParentPath(query);
            destPaths = _getChildrenPath(dest, query).concat(parentPaths);
            srcPaths = _getMergedChildrenPath(dest, src, query).concat(parentPaths);

            updatePaths = _.intersection(destPaths, srcPaths);
            createPaths = _.difference(srcPaths, destPaths);

            preData = _extend(undefined, this._data);
            this._temp = _extend(undefined, this._data);
            this._merge('_temp', query, _extend(undefined, src));
            postData = this._temp;
            delete this._temp;

            _collect(preData, updatePaths, collection, 'delete');
            _collect(postData, updatePaths, collection, 'create');
            _collect(postData, createPaths, collection, 'create');

            dest = _merge(dest, src);
            //_merge(dest, src);

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
        this._savedData = _extend(undefined, this._data);
    },

    restore: function () {
        if (!_.isUndefined(this._savedData)) {
            this.clear();
            this.set(this._savedData);
        }
    },

    clear: function () {
        delete this._data;

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

    _set: function (type, query, value) {
        var path, parentPath, parent;

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

    _unset: function (type, query) {
        var path, value, parentPath, parent;

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        value = this._get(type, query);

        if (path.length) {
            parentPath = _.initial(path);

            if (parentPath.length) {
                parent = _.property(parentPath)(this[type]);
            } else {
                parent = this[type];
            }

            delete parent[_.last(path)];
        } else {
            delete this[type];
        }

        return value;
    },

    _merge: function (type, query, value) {
        var path, oldValue, dest;

        query = _normalizeQuery(query);
        path = _parseQuery(query);
        oldValue = this._get(type, query);

        dest = _merge(oldValue, value);
        this._set(type, query, dest);

        return dest;
    },

    getProp: function (query) {
        return this._get('props', query);
    },

    setProp: function (query, prop) {
        if (_.isUndefined(prop)) {
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
        return this._set('methods', query, method);
    },

    mergeProp: function (query, prop) {
        if (_.isUndefined(prop)) {
            prop = query;
            query = DELIMITER;
        }

        _validateEach(prop, 'not-function');
        return this._merge('props', query, prop);
    },

    mergeMethod: function (query, method, context) {
        if (!_.isString(query)) {
            context = method;
            method = query;
            query = DELIMITER;
        }

        _validateEach(method, 'function-only');
        method = _bind(method, context);
        return this._merge('methods', query, method, context);
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

function _collect(data, paths, collection, event) {
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

function _getMergedChildrenPath(dest, src, currentPath, collection) {
    var destLength;
    currentPath = !_.isUndefined(currentPath) ? currentPath : DELIMITER;
    collection = !_.isUndefined(collection) ? collection : [];

    if (_.isArray(src)) {
        destLength = _.isArray(dest) ? dest.length : 0;

        _.each(src, function (element, index) {
            var currentIndex, path;
            currentIndex = '' + (destLength + index);
            path = currentPath !== DELIMITER ? currentPath + DELIMITER + currentIndex : currentIndex;

            _getMergedChildrenPath(undefined, element, path, collection);
        });
    } else if (_isPlainObject(src)) {
        _.each(src, function (value, key) {
            var path, destChild;
            path = currentPath !== DELIMITER ? currentPath + DELIMITER + key : key;
            destChild = _isPlainObject(dest) ? dest[key] : undefined;
            _getMergedChildrenPath(destChild, value, path, collection);
        });
    }

    collection.push(currentPath);
    return collection;
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
        path = _.initial(path);

        while (path.length) {
            collection.push(path.join(DELIMITER));
            path.pop();
        }

        collection.push(DELIMITER);
    }

    return collection;
}

/*function _extend(dest, src) {
    dest = dest || (_.isArray(src) ? [] : {});

    _.each(src, function (value, key) {
        if (_.isArray(value) || _isPlainObject(value)) {
            dest[key] = _extend(dest[key], value);

        } else {
            dest[key] = value;
        }
    });

    return dest;
}*/

function _extend(dest, src) {
    var i, l, keys, key, value;
    if (_.isArray(src)) {
        dest = dest != null ? dest : [];

        for (i = 0, l = src.length; i < l; i += 1) {
            value = !_.isObject(src[i]) ? src[i] : _extend(undefined, src[i]);
            dest.push(value);
        }
    } else if (_isPlainObject(src)) {
        dest = dest != null ? dest : {};
        keys = _.keys(src);

        for (i = 0, l = keys.length; i < l; i += 1) {
            key = keys[i];
            value = !_.isObject(src[key]) ? src[key] : _extend(dest[key], src[key]);
            dest[key] = value;
        }
    } else {
        dest = src;
    }

    return dest;
}

function _merge(dest) {
    var srcs = _.toArray(arguments).slice(1);

    _.each(srcs, function (src) {
        dest = _extend(dest, src);
    });

    return dest;
}

function _isPrimitive(value) {
    return _.isUndefined(value) || _.isNull(value) || _.isString(value) || _.isNumber(value) || _.isBoolean(value);
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
    query = !_.isString(query) ? '' + query : query;

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
