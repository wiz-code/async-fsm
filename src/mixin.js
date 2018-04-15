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
            return this.model.addProp(object);
        },

        addMethod: function (object, context) {
            context = !_.isUndefined(context) ? context : this;
            return this.model.addMethod(object, context);
        },

        getProp: function (query) {
            return this.model.getProp(query);
        },

        setProp: function (query, object) {
            return this.model.setProp(query, object);
        },

        getMethod: function (query) {
            return this.model.getMethod(query);
        },

        setMethod: function (query, object, context) {
            context = !_.isUndefined(context) ? context : this;
            return this.model.setMethod(query, object, context);
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

        $getProp: function (query) {
            return $getProp(query, this);
        },

        $getMethod: function (query) {
            return $getMethod(query, this);
        },

        $setProp: function (query, prop) {
            return $setProp(query, prop, this);
        },

        $setMethod: function (query, method, context) {
            return $setMethod(query, method, context, this);
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

        getProp: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        setProp: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        getMethod: function () {
            logger.error(this._cname + 'インスタンスは内部データを保持できません。');
        },

        setMethod: function () {
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
    var result, next;
    result = elem.has(query);
    if (!result) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            result = $has(query, parent);
        }
    }

    return result;
}

function $get(query, elem) {
    var result, next;
    result = elem.get(query);
    if (_.isUndefined(result)) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            result = $get(query, next);
        }
    }
    
    return result;
}

function $set(query, value, elem) {
    var result, next;
    result = elem.get(query);
    if (!_.isUndefined(result)) {
        result = elem.set(query, value);

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            result = $set(query, value, next);
        }
    }

    return result;
}

function $unset(query, elem) {
    var result, next;
    result = elem.get(query);
    if (!_.isUndefined(result)) {
        result = elem.unset(query);

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            result = $unset(query, next);
        }
    }

    return result;
}

function $getProp(query, elem) {
    var prop, next;
    prop = elem.getProp(query);
    if (_.isUndefined(prop)) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            prop = $getProp(query, next);
        }
    }

    return prop;
}

function $setProp(query, value, elem) {
    var prop, next;
    if (_.isFunction(value)) {
        logger.error('Functionはプロパティに登録できません。');
    }

    prop = elem.getProp(query);
    if (!_.isUndefined(prop)) {
        elem.setProp(query, value);

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            $setProp(query, value, next);
        }
    }

    return value;
}

function $getMethod(query, elem) {
    var method, next;
    method = elem.getMethod(query);
    if (_.isUndefined(method)) {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            method = $getMethod(query, next);
        }
    }

    return method;
}

function $setMethod(query, value, context, elem) {
    var method, next;
    if (!_.isFunction(value)) {
        logger.error('Function以外はメソッドに登録できません。');
    }

    method = elem.getMethod(query);
    if (!_.isUndefined(method)) {
        elem.setMethod(query, value, context);

    } else {
        next = elem._type === 'region' ? elem.parent : elem.container;
        if (!_.isNull(next)) {
            $setMethod(query, value, context, next);
        }
    }

    return value;
}

module.exports = mixin;
