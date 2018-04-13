'use strict';

var _ = require('underscore');

var BaseState = require('./base-state');
var logger = require('./logger');
var util = require('./util');
var mixin = require('./mixin');
var max = Math.max;

var State = function (name, options) {
    BaseState.call(this, name);

    options = _.defaults(options || {}, _.clone(State.options));

    if (_.isObject(options.data) && !_.isFunction(options.data)) {
        this.set(options.data);
    }

    this.save();

    if (_.isObject(options.props) && !_.isFunction(options.props)) {
        this.addProp(options.props);
    }

    if (_.isObject(options.methods) && !_.isFunction(options.methods)) {
        this.addMethod(options.methods);
    }

    this.entryAction = options.entryAction;
    this.exitAction = options.exitAction;
    this.doActivity = options.doActivity;

    this.autoTransition = options.autoTransition;

    this._loop = options.loop;
    this._fps = options.fps;
    this._interval = 1000 / this._fps;
    this._useRAF = options.useRAF;

    this._timerId = 0;
};

State.options = {
    entryAction: _.noop,
    exitAction: _.noop,
    doActivity: _.noop,

    autoTransition: false,
    loop: false,
    fps: 60,
    useRAF: false,
};

State.prototype = _.create(BaseState.prototype, {
    constructor: State,

    _cname: 'State',

    getTicks: function () {
        if (this._loop) {
            return this._ticks;

        } else {
            logger.error('Stateインスタンスのloopオプションが指定されてません。');
        }
    },

    getElapsedTime: function () {
        if (this._loop) {
            return this._elapsedTime;

        } else {
            logger.error('Stateインスタンスのloopオプションが指定されてません。');
        }
    },

    completion: function () {
        var params = _.toArray(arguments);

        if (!this.isActive()) {
            logger.error(this._cname + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
        }

        this._async(function () {
            var transit;
            if (!_.isNull(this.container)) {
                transit = util.findNextTransition(this.container, this);
                if (!_.isUndefined(transit)) {
                    transit.trigger.apply(transit, params);

                } else {
                    this._exit();
                    this.notify('container', 'completion');
                }
            }
        });
    },

    update: function (event) {
        var params = _.toArray(arguments).slice(1);

        switch (event) {
            case 'entry':
                this._entry.apply(this, params);
                break;

            case 'exit':
                this._exit.apply(this, params);
                break;

            case 'refresh':
                this._refresh.apply(this, params);
                break;

            case 'completion':
                this.completion.apply(this, params);
                break;
        }
    },

    _setAnim: function (callback) {
        var step = _.bind(function (currentTime) {
            var delta;
            this._timerId = requestAnimationFrame(step);
            delta = this._lastTime !== 0 ? currentTime - this._lastTime : 0;
            this._elapsedTime += delta;
            this._lastTime = currentTime;
            this._ticks += 1;
            callback(delta);
        }, this);

        this._ticks = 0;
        this._elapsedTime = 0;
        this._lastTime = 0;

        this._timerId = requestAnimationFrame(step);
    },

    _clearAnim: function () {
        clearAnimationFrame(this._timerId);
    },

    resetTimer: function () {
        this._lastTime = 0;
        this._elapsedTime = 0;
        this._ticks = 0;
    },

    _setTimer: function (callback) {
        var loop;
        callback = _.bind(callback, this);

        this._lastTime = 0;
        this._elapsedTime = 0;
        this._ticks = 0;
        this._timerId = 0;

        loop = _.bind(function () {
            var timeToCall = this._tick(callback);
            this._timerId = setTimeout(loop, timeToCall);
        }, this);

        loop();
    },

    _clearTimer: function () {
        clearTimeout(this._timerId);
    },

    _tick: function (callback) {
        var currentTime, deltaTime, processingTime, timeToCall;

        currentTime = _.now();
        deltaTime = this._lastTime === 0 ? 0 : currentTime - this._lastTime;

        this._elapsedTime += deltaTime;
        this._lastTime = currentTime;
        this._ticks += 1;

        callback(deltaTime);
        processingTime = _.now() - currentTime;
        timeToCall = max(this._interval - processingTime, 0);
        return timeToCall;
    },

    _activate: function () {
        var transit = util.findRelatedTransition(this);
        this._status = 'active';
        logger.info(this._cname + 'インスタンス"' + this._name + '"がアクティブ化されました。');

        this.entryAction(transit);

        this.notify('root', 'prev-activity', this);

        this.notify('root', 'async-activity', _.bind(function () {
            var transit, setTimer;
            transit = util.findRelatedTransition(this);
            if (this._loop) {
                setTimer = _.bind((this._useRAF ? this._setAnim : this._setTimer), this);
                setTimer(function (deltaTime) {
                    this.doActivity(deltaTime, transit);

                    if (this.autoTransition) {
                        this.completion();
                    }
                });
            } else {
                this.doActivity(transit);

                if (this.autoTransition) {
                    this.completion();
                }
            }
        }, this));

        this.notify('root', 'after-activity', this);
    },

    _deactivate: function () {
        var transit, clearTimer;
        transit = util.findRelatedTransition(this);
        clearTimer = _.bind((this._useRAF ? this._clearAnim : this._clearTimer), this);
        clearTimer();

        if (!_.isNull(this.container)) {
            this.notify('container', 'set-previous-state', this);
        }

        this.exitAction(transit);

        this._status = 'inactive';
        logger.info(this._cname + 'インスタンス"' + this._name + '"が非アクティブ化されました。');

    },

    _entry: function (message) {
        if (!this.isActive()) {
            this._activate();
            this.notify('children', 'entry', message);
        }
    },
});

var FinalState = function (name) {
    BaseState.call(this, name);
};

FinalState.prototype = _.create(BaseState.prototype, _.extend({
    constructor: FinalState,

    _cname: 'FinalState',

    _activate: function () {
        this._status = 'active';
        logger.info('FinalStateインスタンス"' + this._name + '"がアクティブ化されました。');

        this.completion();
    },

    _deactivate: function () {
        this._status = 'inactive';

        if (!_.isNull(this.container)) {
            this.notify('container', 'set-previous-state', null);
        }

        logger.info('FinalStateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
}, mixin.disable));

module.exports = {
    State: State,
    FinalState: FinalState,
};
