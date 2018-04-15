'use strict';

var _ = require('underscore');

var Observable = require('./observable')
var Elem = require('./elem');
var BaseState = require('./base-state');
var FinalState = require('./states').FinalState;
var InitialPseudoState = require('./pseudo-states').InitialPseudoState;
var TerminatePseudoState = require('./pseudo-states').TerminatePseudoState;

var logger = require('./logger');
var util = require('./util');
var mixin = require('./mixin');

var Transition = function (name, source, target, options) {
    Elem.call(this, name);

    this._type = 'transition';

    if (source === FinalState) {
        logger.error('終了状態を遷移元にすることはできません。');

    } else if (source instanceof TerminatePseudoState) {
        logger.error('停止状態を遷移元にすることはできません。');

    } else if (source instanceof BaseState || util.isFalsy(source) || InitialPseudoState) {
        this._rawSource = source;

    } else {
        logger.error('第2引数に遷移元のStateインスタンス、またはfalseを指定してください。');
    }

    if (target === InitialPseudoState) {
        logger.error('開始擬似状態を遷移先にすることはできません。');

    } else if (target instanceof BaseState || util.isFalsy(target) || FinalState) {
        this._rawTarget = target;

    } else {
        logger.error('第3引数に遷移先のStateインスタンス、またはfalseを指定してください。');
    }

    options = _.defaults(options || {}, _.clone(Transition.options));

    if (!_.isUndefined(options.data)) {
        this.set(options.data);
    }

    this.save();

    if (!_.isUndefined(options.props)) {
        this.addProp(options.props);
    }

    if (!_.isUndefined(options.methods)) {
        this.addMethod(options.methods);
    }

    this.container = null;

    this.source = null;
    this.target = null;

    this.guard = options.guard;
    this.effect = options.effect;
    this.internal = options.internal;

    if (this.internal) {
        if (this._rawSource !== this._rawTarget) {
            logger.error('遷移元と遷移先は同じStateインスタンスを指定してください。');
        }
    }

    this.unlocked = options.unlocked;

    this._isExplicitEntry = false;
    this._exitViaExitPoint = false;

    this.setObserverType('container');
};

Transition.options = {
    guard: null,
    effect: null,
    internal: false,

    unlocked: false,
};

Transition.prototype = _.create(Elem.prototype, {
    constructor: Transition,

    _cname: 'Transition',

    test: function () {
        var result = false;
        try {
            if (
                !this.isActive() &&
                this.container.isActive() &&
                this.source.isActive() &&
                !this.target.isActive()
            ) {
                result = true;
            }
        } catch (e) {}
        
        return result;
    },

    trigger: function () {
        var params = _.toArray(arguments);

        if (this.isActive()) {
            logger.error('Transitionインスタンス"' + this._name + '"はすでにアクティブ化されています。');
        }

        if (!this.container.isActive()) {
            logger.error('Transitionインスタンス"' + this._name + '"のコンテナが非アクティブです。');

        } else if (!this.source.isActive()) {
            logger.error('遷移元' + this.source._cname + 'インスタンス"' + this.source._name + '"が非アクティブです。');

        } else if (this.target.isActive()) {
            logger.error('遷移先' + this.target._cname + 'インスタンス"' + this.target._name + '"がアクティブです。');
        }

        if (!_.isNull(this.guard)) {
            if (!this.guard.apply(this, params)) {
                logger.info('ガードが成立しませんでした。遷移は発生しません。');
                return;
            }
        }

        if (this.internal) {
            if (this.source === this.target) {
                this._async(function () {
                    logger.info('内部遷移を実行します。');

                    if (!_.isNull(this.effect)) {
                        this.effect.apply(this, params);
                    }
                });

                return;
            } else {
                logger.error('遷移元と遷移先は同じStateインスタンスを指定してください。');
            }
        }

        this._async(function () {
            var message = {
                priority: null,
                deepHistory: false,
            };

            this._entry();

            if (this._exitViaExitPoint) {
                this.source.notify('parent', 'exit');

            } else {
                this.notify('source', 'exit');
            }

            if (!_.isNull(this.effect)) {
                this.effect.apply(this, params);
            }

            message.deepHistory = !!util.findDeepHistoryPseudoState(this.container);

            if (this._isExplicitEntry) {
                message.priority = this.target;
                this.target.notify('parent', 'entry', message);

            } else {
                this.notify('target', 'entry', message);
            }

            this._exit();
        });
    },

    update: function (event) {
        var params = _.toArray(arguments).slice(1);

        switch (event) {
            case 'refresh':
                this._refresh.apply(this, params);
                break;
        }
    },

    _getParentState: function () {
        var result = null;
        if (!_.isNull(this.container) && !_.isNull(this.container.parent)) {
            result = this.container.parent;
        }

        return result;
    },

    _refresh: function (depth) {
        this._depth = depth;
        this.parent = this._getParentState();
        this.notify('children', 'refresh', depth);
    },
});

module.exports = Transition;
