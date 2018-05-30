'use strict';

var _ = require('underscore');

var Elem = require('./elem');
var logger = require('./logger');
var util = require('./util');

var Region = function (name, options) {
    Elem.call(this, name);

    this._type = 'region';

    options = options || {};

    if (!_.isUndefined(options.data)) {
        this.set(options.data);
    }

    this.save();

    if (!_.isUndefined(options.props)) {
        this.setProp(options.props);
    }

    if (!_.isUndefined(options.methods)) {
        this.setMethod(options.methods);
    }

    this._initialPseudo = null;
    this._final = null;
    this._historyPseudo = null;
    this._previousState = null;

    this.children = {
        states: [],
        transitions: [],
    };

    this.setObserverType('states', 'transits');
    this._setDefaultStates();
};

Region.prototype = _.create(Elem.prototype, {
    constructor: Region,

    _cname: 'Region',

    setName: function (name, automatical) {
        this._name = name;
        if (!this._originalName && util.isFalsy(automatical)) {
            this._originalName = name;
        }

        this._setDefaultStateName();
        return name;
    },

    hasHistory: function (deep) {
        return util.isFalsy(deep) ? !_.isNull(this._historyPseudo) :
            !_.isNull(this._historyPseudo) && this._historyPseudo._isDeep;
    },

    getIndex: function () {
        var result = -1;

        if (!_.isNull(this.parent)) {
            result = _.indexOf(this.parent.children, this);
        }

        return result;
    },

    getStateByName: function (stateName) {
        return _.find(this.children.states, function (state) {
            return state.getName() === stateName;
        });
    },

    getTransitionByName: function (transitionName) {
        return _.find(this.children.transitions, function (transit) {
            return transit.getName() === transitionName;
        });
    },

    getStateById: function (stateId) {
        return _.find(this.children.states, function (state) {
            return state.getId() === stateId;
        });
    },

    getTransitionById: function (transitionId) {
        return _.find(this.children.transitions, function (transit) {
            return transit.getId() === transitionId;
        });
    },

    findActiveState: function () {
        return _.find(this.children.states, function (state) {
            return state.isActive();
        });
    },

    addState: function () {
        var BaseState, Machine, InitialPseudoState, HistoryPseudoState, FinalState, states, i, l, state, currentDepth;
        BaseState = require('./base-state');
        Machine = require('./machines').Machine;
        HistoryPseudoState = require('./pseudo-states').HistoryPseudoState;
        InitialPseudoState = require('./pseudo-states').InitialPseudoState;
        FinalState = require('./states').FinalState;

        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        states = _.toArray(arguments);

        for (i = 0, l = states.length; i < l; i += 1) {
            state = states[i];

            if (state instanceof Machine || !(state instanceof BaseState)) {
                logger.error('Stateインスタンスを指定してください。');
            }

            if (state instanceof InitialPseudoState) {
                this._initialPseudo = state;

            } else if (state instanceof FinalState) {
                this._final = state;

            } else if (state instanceof HistoryPseudoState) {
                this._historyPseudo = state;
            }

            this.children.states.push(state);
            this.children.states[state._id] = state;
            this.addObserver('children', state);
            this.addObserver('states', state);

            state.container = this;
            state.addObserver('container', this);

            currentDepth = this._getParentDepth() + 1;

            state._refresh(currentDepth);
        }

        return states.length > 1 ? states : _.first(states);
    },

    /* 引数にStateインスタンスを複数指定可 */
    removeState: function () {
        var HistoryPseudoState, states, i, state;
        HistoryPseudoState = require('./pseudo-states').HistoryPseudoState;

        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        states = _.toArray(arguments);

        for (i = this.children.states.length; i--;) {
            state = this.children.states[i];

            if (_.indexOf(states, state) > -1) {
                if (state instanceof HistoryPseudoState) {
                    this._historyPseudo = null;
                }

                this.children.states.splice(i, 1);
                delete this.children.states[state._id];

                this.removeObserver('children', state);
                this.removeObserver('states', state);

                state.container = null;
                state.removeObserver('container', this);

                state._refresh(0);
            }
        }

        return states.length > 1 ? states : _.first(states);
    },

    addTransition: function () {
        var InitialPseudoState, FinalState, Transition, transits, i, l, transit, result, currentDepth;
        InitialPseudoState = require('./pseudo-states').InitialPseudoState;
        FinalState = require('./states').FinalState;
        Transition = require('./transition');

        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        transits = _.toArray(arguments);

        for (i = 0, l = transits.length; i < l; i += 1) {
            transit = transits[i];

            if (!(transit instanceof Transition)) {
                logger.error('Transitionインスタンスを指定してください。');
            }

            if (transit._rawSource === InitialPseudoState || util.isFalsy(transit._rawSource)) {
                transit.source = this._initialPseudo;

            } else {
                result = util.findState(this, transit._rawSource, 0);

                if (_.isUndefined(result)) {
                    result = util.findState(this, transit._rawSource, 1);

                    if (!_.isUndefined(result)) {
                        transit._exitViaExitPoint = true;

                    } else {
                        logger.error('遷移元のStateインスタンスが見つかりません。');
                    }
                }

                transit.source = transit._rawSource;
            }

            if (transit._rawTarget === FinalState || util.isFalsy(transit._rawTarget)) {
                transit.target = this._final;

            } else {
                result = util.findState(this, transit._rawTarget, 0);

                if (_.isUndefined(result)) {
                    result = util.findState(this, transit._rawTarget, 1);

                    if (!_.isUndefined(result)) {
                        transit._isExplicitEntry = true;

                    } else {
                        logger.error('遷移先のStateインスタンスが見つかりません。');
                    }
                }

                transit.target = transit._rawTarget;
            }

            transit.addObserver('source', transit.source);
            transit.addObserver('target', transit.target);

            if (!transit._originalName) {
                transit.setName('transit-from-' + transit.source._name + '-to-' + transit.target._name, true);
            }

            this.children.transitions.push(transit);
            this.children.transitions[transit._id] = transit;
            this.addObserver('children', transit);
            this.addObserver('transits', transit);

            transit.container = this;
            transit.addObserver('container', this);

            currentDepth = this._getParentDepth() + 1;

            transit._refresh(currentDepth);
        }

        return transits.length > 1 ? transits : _.first(transits);
    },

    removeTransition: function () {
        var transits, i, transit;
        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        transits = _.toArray(arguments);

        for (i = this.children.transitions.length; i--;) {
            transit = this.children.transitions[i];

            if (_.indexOf(transits, transit) > -1) {
                this.children.transitions.splice(i, 1);
                delete this.children.transitions[transit._id];
                this.removeObserver('children', transit);
                this.removeObserver('transits', transit);

                transit.removeObserver('source', transit.source);
                transit.removeObserver('target', transit.target);

                if (!transit._originalName) {
                    transit.setName(transit._id, true);
                }

                transit.container = null;
                transit.removeObserver('container', this);

                transit._refresh(0);
            }
        }

        return transits.length > 1 ? transits : _.first(transits);
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
                this._completion.apply(this, params);
                break;

            case 'set-previous-state':
                this._setPreviousState.apply(this, params);
                break;
        }
    },

    _getParentDepth: function () {
        var result = -1;
        if (!_.isNull(this.parent)) {
            result = this.parent._depth;
        }

        return result;
    },

    _getUpperContainer: function () {
        var result = null;
        if (!_.isNull(this.parent) && !_.isNull(this.parent.container)) {
            result = this.parent.container;
        }

        return result;
    },

    _setDefaultStates: function () {
        var InitialPseudoState = require('./pseudo-states').InitialPseudoState;
        var FinalState = require('./states').FinalState;
        var initialPseudo, final;
        if (!_.isNull(this._initialPseudo) || !_.isNull(this._final)) {
            return;
        }

        initialPseudo = new InitialPseudoState(false);
        final = new FinalState(false);

        this.addState(initialPseudo, final);
        this._setDefaultStateName();
    },

    _setDefaultStateName: function () {
        this._initialPseudo.setName('initial-pseudo-state-in-' + this._name, true);
        this._final.setName('final-state-in-' + this._name, true);
    },

    _refresh: function (depth) {
        var currentDepth;
        depth = !_.isUndefined(depth) ? depth : this._getParentDepth();
        currentDepth = depth + 1;
        this.notify('children', 'refresh', currentDepth);
    },

    _setPreviousState: function (state) {
        this._previousState = state;
        return state;
    },

    _entry: function (message) {
        var SubMachine, PseudoState, state;
        SubMachine = require('./machines').SubMachine;
        PseudoState = require('./pseudo-states').PseudoState;
        if (!this.isActive()) {
            this._activate();

            if (_.indexOf(this.children.states, message.priority) > -1) {
                state = message.priority;
                message.priority = null;

            } else if (this.parent instanceof SubMachine) {
                this.parent.notify('inner-machine', 'link-forward');
                return;

            } else {
                if (message.deepHistory) {
                    state = this._previousState || this._initialPseudo;

                } else if (!_.isNull(this._historyPseudo)) {
                    state = this._historyPseudo;

                    if (state._isDeep) {
                        message.deepHistory = true;
                    }
                } else {
                    state = this._initialPseudo;
                }
            }

            if (!(state instanceof PseudoState)) {
                this._async(function () {
                    state.update('entry', message);
                });
            } else {
                state.update('entry', message);
            }
        }
    },

    _exit: function () {
        if (this.isActive()) {
            this.notify('states', 'exit');
            this._deactivate();
        }
    },

    _completion: function () {
        this._deactivate();

        if (!_.isNull(this.parent)) {
            if (_.every(this.parent.children, function (region) {
                return !region.isActive();
            })) {
                this.notify('parent', 'completion');
            }
        }
    },
});

module.exports = Region;
