'use strict';

var _ = require('underscore');

var BaseState = require('./base-state');

var logger = require('./logger');
var util = require('./util');
var mixin = require('./mixin');

var PseudoState = function (name) {
    BaseState.call(this, name);

    this._type = 'pseudo-state';
};

PseudoState.prototype = _.create(BaseState.prototype, _.extend({
    constructor: PseudoState,

    _cname: 'PseudoState',

    _deactivate: function () {
        this._status = 'inactive';

        if (!_.isNull(this.container)) {
            this.notify('container', 'set-previous-state', null);
        }

        logger.info(this._cname + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
    },
}, mixin.disable));

var InitialPseudoState = function (name) {
    PseudoState.call(this, name);
};

InitialPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: InitialPseudoState,

    _cname: 'InitialPseudoState',

    _activate: function () {
        var transit;

        this._status = 'active';
        logger.info('InitialPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        if (!_.isNull(this.container)) {
            transit = util.findFirstTransition(this.container);
            if (!_.isUndefined(transit)) {
                transit.trigger();

            } else {
                logger.error('Regionインスタンス"' + this.container._name + '"の初期遷移が見つかりません。');
            }
        }
    },
});

var HistoryPseudoState = function (name, deep) {
    PseudoState.call(this, name);

    this._isDeep = !_.isUndefined(deep) ? deep : false;
};

HistoryPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: HistoryPseudoState,

    _cname: 'HistoryPseudoState',

    _activate: function () {
        var container, state, transit;

        this._status = 'active';
        logger.info('HistoryPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        if (!_.isNull(this.container)) {
            container = this.container;
            state = container._previousState || container._initialPseudo;

            if (state instanceof InitialPseudoState) {
                this._async(function () {
                    this._exit();
                    state.update('entry');
                });
            } else {
                this._async(function () {
                    this._exit();
                    state.update('entry', {
                        priority: null,
                        deepHistory: this._isDeep,
                    });
                });
            }
        }
    },
});

var TerminatePseudoState = function (name) {
    PseudoState.call(this, name);
};

TerminatePseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: TerminatePseudoState,

    _cname: 'TerminatePseudoState',

    _activate: function () {
        this._status = 'active';
        logger.info('TerminatePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        this.notify('root', 'termination', this);
        logger.error('停止状態に遷移しました。処理を中断します。');
    },
});

var ChoicePseudoState = function (name, condition) {
    PseudoState.call(this, name);

    this._condition = _.isFunction(condition) ? condition : _.noop;
};

ChoicePseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ChoicePseudoState,

    _cname: 'ChoicePseudoState',

    _activate: function () {
        var target, transit;
        transit = util.findRelatedTransition(this);

        this._status = 'active';
        logger.info('ChoicePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        target = this._condition(transit);
        if (!(target instanceof BaseState)) {
            logger.error('遷移先のStateインスタンスが存在しません。');
        }

        if (!_.isNull(this.container)) {
            transit = util.findNextTransition(this.container, this, target);
            if (!_.isUndefined(transit)) {
                transit.trigger();

            } else {
                logger.error('ChoicePseudoStateインスタンス"' + this._name + '"起点のTransitionインスタンスが見つかりません。');
            }
        }
    },
});

var ConnectionPointPseudoState = function (name) {
    PseudoState.call(this, name);

    this._key = '';
    this._isMediator = false;
    this._isConnector = false;
    this.setObserverType('sub-root');
};

ConnectionPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ConnectionPointPseudoState,

    _cname: 'ConnectionPointPseudoState',

    setKey: function (key) {
        this._key = key;
        return key;
    },
});

var EntryPointPseudoState = function (name) {
    ConnectionPointPseudoState.call(this, name);
};

EntryPointPseudoState.prototype = _.create(ConnectionPointPseudoState.prototype, {
    constructor: EntryPointPseudoState,

    _cname: 'EntryPointPseudoState',

    _activate: function () {
        var transit;

        this._status = 'active';
        logger.info('EntryPointPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        if (this._isMediator) {
            this.notify('sub-root', 'entry-point', this);

        } else {
            if (!_.isNull(this.container)) {
                transit = util.findFirstTransition(this.container, this);
                if (!_.isUndefined(transit)) {
                    transit.trigger();

                } else {
                    logger.error('Regionインスタンス"' + this.container._name + '"の初期遷移が見つかりません。');
                }
            }
        }
    },
});

var ExitPointPseudoState = function (name) {
    ConnectionPointPseudoState.call(this, name);
};

ExitPointPseudoState.prototype = _.create(ConnectionPointPseudoState.prototype, {
    constructor: ExitPointPseudoState,

    _cname: 'ExitPointPseudoState',

    _activate: function () {
        var upperContainer, transit;

        this._status = 'active';
        logger.info('ExitPointPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

        if (this._isConnector) {
            this.notify('root', 'exit-point', this);

        } else {
            upperContainer = this.container._getUpperContainer();
            if (!_.isNull(upperContainer)) {
                transit = util.findNextTransition(upperContainer, this);

                if (!_.isUndefined(transit)) {
                    transit.trigger();

                } else {
                    logger.error('ExitPointPseudoStateインスタンス"' + this._name + '"起点のTransitionインスタンスが見つかりません。');
                }
            } else {
                logger.error('ExitPointPseudoStateインスタンス"' + this._name + '"の上位コンテナが存在しません。');
            }
        }
    },
});

module.exports = {
    PseudoState: PseudoState,
    InitialPseudoState: InitialPseudoState,
    HistoryPseudoState: HistoryPseudoState,
    TerminatePseudoState: TerminatePseudoState,
    ChoicePseudoState: ChoicePseudoState,
    ConnectionPointPseudoState: ConnectionPointPseudoState,
    EntryPointPseudoState: EntryPointPseudoState,
    ExitPointPseudoState: ExitPointPseudoState,
};
