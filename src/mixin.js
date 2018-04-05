'use strict';

var _ = require('underscore');

var logger = require('./logger');

var mixin = {
    accessor: {
        has: function (query) {
            return this.model.has(query);
        },

        get: function (query) {
            return this.model.get(query);
        },

        set: function (query, value) {
            return this.model.set(query, value);
        },

        unset: function (query) {
            return this.model.unset(query);
        },

        extend: function (data) {
            return this.model.extend(data);
        },

        save: function () {
            this.model.save();
        },

        restore: function () {
            this.model.restore();
        },

        clear: function () {
            this.model.clear();
        },

        addProp: function (object) {
            this.model.addProp(object);
        },

        addMethod: function (object, context) {
            context = !_.isUndefined(context) ? context : this;
            this.model.addMethod(object, context);
        },

        watch: function (query, listener) {
            this.model.watch(query, listener);
        },

        unwatch: function (query, listener) {
            this.model.unwatch(query, listener);
        },
    },

    helper: {
        $has: function (query) {
            return $has(query, this);
        },

        $get: function (query) {
            return $get(query, this);
        },

        $set: function (query, value) {
            return $set(query, value, this);
        },

        $unset: function (query) {
            return $unset(query, this);
        },

        $getProp: function (propName) {
            return $getProp(propName, this);
        },

        $getMethod: function (methodName) {
            return $getMethod(methodName, this);
        },

        $setProp: function (propName, prop) {
            return $setProp(propName, prop, this);
        },

        $setMethod: function (methodName, method) {
            return $setMethod(methodName, method, this);
        },
    },

    disable: {
        has: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        get: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        set: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        unset: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        extend: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        save: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        restore: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        clear: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        addProp: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        addMethod: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        watch: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        unwatch: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $getProp: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $getMethod: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },
        $setProp: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $setMethod: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $has: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $get: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $set: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        $unset: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        addState: function () {
            logger.error(this._cname + 'インスタンスはサブ状態を持てません。');
        },

        removeState: function () {
            logger.error(this._cname + 'インスタンスはサブ状態を持てません。');
        },

        addTransition: function () {
            logger.error(this._cname + 'インスタンスは遷移を持てません。');
        },

        removeTransition: function () {
            logger.error(this._cname + 'インスタンスは遷移を持てません。');
        },

        appendRegion: function () {
            logger.error(this._cname + 'インスタンスは領域を持てません。');
        },

        removeRegion: function () {
            logger.error(this._cname + 'インスタンスは領域を持てません。');
        },
    },

    descriptor: {
        props: {
            enumerable: false,
            get: function () {
                return this.model.props;
            },
        },
        methods: {
            enumerable: false,
            get: function () {
                return this.model.methods;
            },
        },
    },
};

function $has(query, elem) {
    var result, parent;
    result = elem.has(query);
    if (!result) {
        if (elem._type === 'region') {
            parent = elem.parent;
            if (!_.isNull(parent)) {
                result = $has(query, parent);
            }
        } else {
            if (!_.isNull(elem.container)) {
                result = $has(query, elem.container);
            }
        }
    }
    return result;
}

function $get(query, elem) {
    var result, parent;
    result = elem.get(query);
    if (_.isUndefined(result)) {
        if (elem._type === 'region') {
            parent = elem.parent;
            if (!_.isNull(parent)) {
                result = $get(query, parent);
            }
        } else {
            if (!_.isNull(elem.container)) {
                result = $get(query, elem.container);
            }
        }
    }
    return result;
}

function $set(query, value, elem) {
    var result, parent;
    result = elem.get(query);
    if (!_.isUndefined(result)) {
        result = elem.set(query, value);

    } else {
        if (elem._type === 'region') {
            parent = elem.parent;
            if (!_.isNull(parent)) {
                result = $set(query, value, parent);
            }
        } else {
            if (!_.isNull(elem.container)) {
                result = $set(query, value, elem.container);
            }
        }
    }

    return result;
}

function $unset(query, elem) {
    var result, parent;
    result = elem.get(query);
    if (!_.isUndefined(result)) {
        result = elem.unset(query);

    } else {
        if (elem._type === 'region') {
            parent = elem.parent;
            if (!_.isNull(parent)) {
                result = $unset(query, parent);
            }
        } else {
            if (!_.isNull(elem.container)) {
                result = $unset(query, elem.container);
            }
        }
    }

    return result;
}

function $getProp(propName, elem) {
    var prop, next;
    prop = elem.props[propName];
    if (_.isUndefined(prop)) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            prop = $getProp(propName, next);
        }
    }
    return prop;
}

function $setProp(propName, value, elem) {
    var prop, next;
    if (_.isFunction(value)) {
        logger.error('Functionはプロパティに登録できません。');
    }

    prop = elem.props[propName];
    if (!_.isUndefined(prop)) {
        elem.props[propName] = value;

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            $setProp(propName, value, next);
        }
    }
    return value;
}

function $getMethod(methodName, elem) {
    var method, next;
    method = elem.methods[methodName];
    if (_.isUndefined(method)) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            method = $getMethod(methodName, next);
        }
    }
    return method;
}

function $setMethod(methodName, value, elem) {
    var method, next;
    if (!_.isFunction(value)) {
        logger.error('Function以外はメソッドに登録できません。');
    }

    method = elem.methods[methodName];
    if (!_.isUndefined(method)) {
        elem.methods[methodName] = value;

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            $setMethod(methodName, value, next);
        }
    }
    return value;
}

module.exports = mixin;
