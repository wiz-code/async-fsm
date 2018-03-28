'use strict';

var _ = require('underscore');
var Observable = require('./observable');
var Logger = require('./logger');

var logger = new Logger();
var DELIMITER = '/';

var Model = function (data) {
    Observable.call(this);

    this._data = null;
    this.props = {};
    this.methods = {};
    this._cache = null;

    if (_.isObject(data) && !_.isFunction(data)) {
        this.set(data);
    }
};

Model.prototype = _.create(Observable.prototype, {
    constructor: Model,

    _cname: 'Model',

    has: function (query) {
        var result = !_.isUndefined(this._has(query));
        return result;
    },

    get: function (query) {
        var result = this._has(query)
        return result;
    },

    set: function (query, value) {
        var oldValue, event;
        if (_.isObject(query) && !_.isFunction(query)) {
            value = query;
            query = '/';
        }

        oldValue = this.get(query);
        if (_.isEqual(oldValue, value)) {
            return value;
        }

        _validate(value, 'not-function');
        this._set(query, value);
        event = oldValue == null ? 'create' : 'update';
        this._bubbling(event, query, value, oldValue);

        return value;
    },

    unset: function (query) {
        var value = this.get(query);
        if (!_.isUndefined(value)) {
            this._unset(query);
            this._bubbling('delete', query, value);
            return value;
        }
    },

    save: function () {
        this._cache = _extend(this._cache, this._data);
    },

    restore: function () {
        if (!_.isNull(this._cache)) {
            this._data = _extend(null, this._cache);
        }
    },

    clear: function () {
        this._data = null;
        this._cache = null;
    },

    addProp: function (object) {
        _validate(object, 'not-function');
        this.props = _extend(this.props, object);
    },

    addMethod: function (object, context) {
        _validate(object, 'function');
        _.each(object, _.bind(function (value, key) {
            value = _.bind(value, this);
            this.methods[key] = value;
        }, context));
    },

    _has: function (query) {
        var result;
        query = !_.isUndefined(query) ? query : '';

        try {
            result = this._get(query);

        } catch (e) {}

        return result;
    },

    _get: function (query) {
        var propNameList, value;
        propNameList = _parseQuery(query);

        value = _getValue(propNameList, this._data);
        return value;
    },

    _set: function (query, value) {
        var propNameList, lastPropName, reference;

        propNameList = _parseQuery(query);
        lastPropName = propNameList.pop();

        if (!_containerExists(propNameList, this._data)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        if (_.isUndefined(lastPropName)) {
            this._data = _extend(this._data, value);

        } else {
            reference = _getValue(propNameList, this._data);console.log('reference', reference);
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

        if (!_containerExists(propNameList, this._data)) {
            logger.error('クエリに対応するデータ構造が存在しません。');
        }

        reference = _getValue(propNameList, this._data);
        cache = reference[lastPropName];
        delete reference[lastPropName];

        return cache;
    },

    _bubbling: function (event, query, value, oldValue) {
        var propNameList, currentTarget, object;
        propNameList = _parseQuery(query);
        object = {
            event: event,
            currentTarget: null,
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
    if (_.isUndefined(required)) {
        return;
    }

    if (!_.isObject(value)) {
        value = [value];
    }

    switch (required) {
        case 'function':
        _.each(value, function (val) {
            if (!_.isFunction(val)) {
                logger.error('Function以外はメソッドに登録できません。propsプロパティに登録してください。');
            }
        });
        break;

        case 'not-function':
        _.each(value, function (val) {
            if (_.isFunction(val)) {
                logger.error('Functionはプロパティに登録できません。methodsプロパティに登録してください。');
            }
        });
        break;
    }
}

function _parseQuery(query) {
    if (!_.isString(query)) {
        logger.error('クエリは文字列で指定してください。')
    }
    return _.compact(query.split(DELIMITER));
}

function _containerExists(params, data) {
    var check = _.every(params, function (id) {
        if (_.isArray(data) || (_.isObject(data) && !_.isFunction(data))) {
            if (data.hasOwnProperty(id)) {
                data = data[id];
                return true;
            }
        }
    });

    return check;
}

function _getValue(list, data) {
    var propName;
    while (list.length) {
        propName = list.shift();
        data = data[propName];
    }

    return data;
}

module.exports = Model;
