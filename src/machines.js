'use strict';

var Promise = require('es6-promise').Promise;
var _ = require('underscore');

var BaseState = require('./base-state');
var Logger = require('./logger');
var util = require('./util');
var logger = new Logger();

var Machine = function (name, options) {
    BaseState.call(this, name, options);

    options = options || {};

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

    this._deployed = false;
    this._chain = {
        main: null,
        activities: [],
        counter: 0,
    };

    this.appendRegion();
    this.setObserverType('outer-machine');
};

Machine.prototype = _.create(BaseState.prototype, {
    constructor: Machine,

    _cname: 'Machine',

    deploy: function () {
        var Transition, ConnectionPointPseudoState;
        Transition = require('./transition');
        ConnectionPointPseudoState = require('./pseudo-states').ConnectionPointPseudoState;

        this._deployed = true;
        this._chain.main = Promise.resolve();

        this._refresh(this._depth);

        util.eachElem(this, _.bind(function (elem) {
            elem._attached = true;

            if (!(elem instanceof Machine)) {
                elem.addObserver('root', this);

                if (elem instanceof BaseState || elem instanceof Transition) {
                    elem.addObserver('parent', elem.parent);
                }
            }

            if (elem instanceof ConnectionPointPseudoState) {
                if (elem.parent === this) {
                    elem._isConnector = true;
                }
            }
        }, this));

        return this;
    },

    undeploy: function () {
        var Transition = require('./transition');

        this._deployed = false;
        this._chain.main = null;

        util.eachElem(this, _.bind(function (elem) {
            elem._attached = false;

            if (!(elem instanceof Machine)) {
                elem.removeObserver('root', this);

                if (elem instanceof BaseState || elem instanceof Transition) {
                    elem.removeObserver('parent', elem.parent);
                }
            }

        }, this));

        this._refresh(this._depth);

        return this;
    },

    start: function (priority) {
        var message = {
            priority: null,
            deepHistory: false,
        };

        if (!_.isUndefined(priority)) {
            message.priority = priority;
        }

        if (!this._deployed) {
            logger.error('start()の前にdeploy()メソッドを実行してください。');
        }

        if (!this.isActive()) {
            logger.info('Machineインスタンス"' + this._name + '"が動作を開始しました。');

            this._addChain(_.bind(function () {
                this._entry(message);
                return Promise.resolve();
            }, this));

        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでに起動しています。');
        }

        return this;
    },

    finish: function () {
        if (!this._deployed) {
            logger.error('deploy()メソッドがまだ実行されていません。');
        }

        if (this.isActive()) {
            this.completion();

        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでに動作を終了しています。');
        }

        return this;
    },

    completion: function () {
        if (!this.isActive()) {
            logger.error(this._cname + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
        }

        this._addChain(_.bind(function () {
            this._exit();
            logger.info('Machineインスタンス"' + this._name + '"が動作を終了しました。');
            return Promise.resolve();
        }, this));
    },

    _addChain: function (callback) {
        this._chain.main = this._chain.main.then(callback).catch(this._onRejected);
    },

    _addActivity: function (callback) {
        this._chain.activities.push(callback);
    },

    _prevActivity: function (state) {
        if (_.isNull(this._chain.resolve)) {
            this._chain.counter += state.children.length;
        }
    },

    _afterActivity: function (state) {
        var self = this;
        if (!state._hasSubState()) {
            this._chain.counter -= 1;

            if (this._chain.counter <= 0) {
                this._chain.main = _.reduce(this._chain.activities, function (chain, activity) {
                    return chain.then(activity).catch(self._onRejected);
                }, this._chain.main);

                this._chain.activities.length = 0;
                this._chain.counter = 0;
            }
        }
    },

    _onAborted: function (state) {
        logger.info('Machineインスタンス"' + this._name + '"は処理を停止しました。');
    },

    _onRejected: function (e) {
        logger.info(e);
        return Promise.reject(e);
    },

    _inboundTransit: function (key) {
        var i, l, region, state;

        if (!_.isUndefined(key)) {
            if (_.isEmpty(key)) {
                logger.error('リンク先のEntryPointPseudoStateインスタンスに対応するキーが指定されてません。');
            }

            for (i = 0, l = this.children.length; i < l; i += 1) {
                region = this.children[i];
                state = region.children.states[key];
                if (!_.isUndefined(state)) {
                    this.start(state);
                    return;
                }
            }

            logger.error('エンドポイントのEntryPointPseudoStateインスタンスが指定されてません。');

        } else {
            this.start();
        }
    },

    _outboundTransit: function (state) {
        this.completion();

        this._addChain(_.bind(function () {
            this.notify('outer-machine', 'link-back', state._id);
            return Promise.resolve();
        }, this));
    },

    update: function (event, callback) {
        var params = _.toArray(arguments).slice(1);

        switch (event) {
            case 'async':
                this._addChain(callback);
                break;

            case 'async-activity':
                this._addActivity(callback);
                break;

            case 'prev-activity':
                this._prevActivity.apply(this, params);
                break;

            case 'after-activity':
                this._afterActivity.apply(this, params);
                break;

            case 'entry':
                this._entry.apply(this, params);
                break;

            case 'exit':
                this._exit.apply(this, params);
                break;

            case 'completion':
                this.completion.apply(this, params);
                break;

            case 'termination':
                this._onAborted.apply(this, params);
                break;

            case 'link-forward':
                this._inboundTransit.apply(this, params);
                break;

            case 'exit-point':
                this._outboundTransit.apply(this, params);
                break;
        }
    },
});

var SubMachine = function (name) {
    BaseState.call(this, name);

    this._link = null;
    this._deployed = false;

    this.appendRegion();
    this.setObserverType('inner-machine');
};

SubMachine.prototype = _.create(BaseState.prototype, {
    constructor: SubMachine,

    _cname: 'SubMachine',

    deploy: function () {
        var PseudoState, ConnectionPointPseudoState, InitialPseudoState, FinalState;
        PseudoState = require('./pseudo-states').PseudoState;
        ConnectionPointPseudoState = require('./pseudo-states').ConnectionPointPseudoState;
        InitialPseudoState = require('./pseudo-states').InitialPseudoState;
        FinalState = require('./states').FinalState;

        this._deployed = true;

        util.eachElem(this, _.bind(function (elem) {
            if (elem instanceof BaseState) {
                if (elem instanceof PseudoState) {
                    if (elem instanceof ConnectionPointPseudoState) {
                        elem.addObserver('sub-root', this);

                        if (elem.parent === this) {
                            elem._isMediator = true;

                        } else {
                            logger.error('ConnectionPointPseudoStateインスタンスはサブマシン直下のサブ状態でなければなりません。');
                        }
                    } else if (!(elem instanceof InitialPseudoState)) {
                        logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を追加できません。');
                    }
                } else if (!(elem instanceof SubMachine) && !(elem instanceof FinalState)) {
                    logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を保持できません。');
                }
            }
        }, this));

        return this;
    },

    undeploy: function () {
        var PseudoState, ConnectionPointPseudoState, InitialPseudoState, FinalState;
        PseudoState = require('./pseudo-states').PseudoState;
        ConnectionPointPseudoState = require('./pseudo-states').ConnectionPointPseudoState;
        InitialPseudoState = require('./pseudo-states').InitialPseudoState;
        FinalState = require('./states').FinalState;

        this._deployed = false;

        util.eachElem(this, _.bind(function (elem) {
            if (elem instanceof BaseState) {
                if (elem instanceof PseudoState) {
                    if (elem instanceof ConnectionPointPseudoState) {
                        elem.removeObserver('sub-root', this);
                        elem._isMediator = false;

                    } else if (!(elem instanceof InitialPseudoState)) {
                        logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を追加できません。');
                    }
                } else if (!(elem instanceof SubMachine) && !(elem instanceof FinalState)) {
                    logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を保持できません。');
                }
            }
        }, this));

        return this;
    },

    addLink: function (machine) {
        if (!(machine instanceof Machine)) {
            logger.error('Machineインスタンスを指定してください。');
        }

        this._link = machine;
        this.addObserver('inner-machine', machine);

        machine.addObserver('outer-machine', this);
    },

    removeLink: function () {
        this.removeObserver('inner-machine', this._link);

        this._link.removeObserver('outer-machine', this);
        this._link = null;
    },

    update: function (event) {
        var params = _.toArray(arguments).slice(1);

        switch (event) {
            case 'entry-point':
                this._linkForward.apply(this, params);
                break;

            case 'link-back':
                this._linkBack.apply(this, params);
                break;

            case 'entry':
                this._entry.apply(this, params);
                break;

            case 'exit':
                this._exit.apply(this, params);
                break;
        }
    },

    _linkForward: function (state) {
        this._async(function () {
            state._exit();
            this.notify('inner-machine', 'link-forward', state._key);
        });
    },

    _linkBack: function (id) {
        var exitPoint, i, l, region;

        for (i = 0, l = this.children.length; i < l; i += 1) {
            region = this.children[i];

            exitPoint = _.findWhere(region.children.states, {_key: id});

            if (!_.isUndefined(exitPoint)) {
                exitPoint._entry();
                return;
            }
        }

        logger.error('リンク先のEntryPointPseudoStateインスタンスに対応するキーが指定されてません。');
    },

    _entry: function (message) {
        if (!this._deployed) {
            logger.error('SubMachineインスタンスのdeploy()メソッドを実行してください。');
        }

        if (!this.isActive()) {
            this._activate();
            this.notify('children', 'entry', message);
        }
    },

    _exit: function () {
        if (!this._deployed) {
            logger.error('SubMachineインスタンスのdeploy()メソッドを実行してください。');
        }

        if (this.isActive()) {
            this.notify('children', 'exit');
            this._deactivate();
        }
    },
});

module.exports = {
    Machine: Machine,
    SubMachine: SubMachine,
};
