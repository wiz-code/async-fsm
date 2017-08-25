/* Async-FSM.js
 * version 0.1.5
 * 
 * Copyright (c) 2017 Masa (http://wiz-code.digick.jp)
 * LICENSE: MIT license
 */

;(function () {
    'use strict';
    
    var _, uuid, Promise, logger, isNodeJS, isFalsy, mixin, FSM;

    _ = require('underscore');
    uuid = require('uuid/v4');
    Promise = require('bluebird');

    logger = {
        debuggable: true,
        logLevel: 'DEBUG',
        logLevelData: [
            'DEBUG',
            'INFO',
            'WARN',
            'ERROR',
        ],

        debug: function (message) {
            if (this.debuggable && _.indexOf(this.logLevelData, this.logLevel) <= 0) {
                console.log('DEBUG: ', message);
            }
        },

        info: function (message) {
            if (this.debuggable && _.indexOf(this.logLevelData, this.logLevel) <= 1) {
                console.log('INFO: ', message);
            }
        },

        warn: function (message) {
            if (this.debuggable && _.indexOf(this.logLevelData, this.logLevel) <= 2) {
                console.log('WARN: ', message);
            }
        },

        error: function (message) {
            if (this.debuggable && _.indexOf(this.logLevelData, this.logLevel) <= 3) {
                console.error('ERROR: ', message);
                throw new Error('ERROR: ' + message);
            }
        },
    };

    isNodeJS = !!(!_.isUndefined(process) && process.versions && process.versions.node);

    isFalsy = _.negate(Boolean);

    mixin = {
        accessor: {
            get: function (key) {
                return this.model.get(key);
            },

            set: function (key, value) {
                return this.model.set(key, value);
            },

            unset: function (key) {
                return this.model.unset(key);
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
        },

        helper: {
            $get: function (key) {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    return superState.model.get(key);
                }
            },

            $set: function (key, value) {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    return superState.model.set(key, value);
                }
            },

            $unset: function (key) {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    return superState.model.unset(key);
                }
            },

            $extend: function (data) {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    return superState.model.extend(data);
                }
            },

            $save: function () {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    superState.model.save();

                } else {
                    return false;
                }
            },

            $restore: function () {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    superState.model.restore();

                } else {
                    return false;
                }
            },

            $clear: function () {
                var superState = this._getSuperState();
                if (!_.isNull(superState)) {
                    superState.model.clear();

                } else {
                    return false;
                }
            },
        },

        disable: {
            get: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            set: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            unset: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            extend: function (data) {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            save: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            restore: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            clear: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $props: null,

            $methods: null,

            $get: function (key) {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $set: function (key, value) {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $unset: function (key) {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $extend: function (data) {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $save: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $restore: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            $clear: function () {
                logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
            },

            addState: function () {
                logger.error(this.constructor.name + 'インスタンスはサブ状態を持てません。');
            },

            removeState: function () {
                logger.error(this.constructor.name + 'インスタンスはサブ状態を持てません。');
            },

            addTransition: function (transition) {
                logger.error(this.constructor.name + 'インスタンスは遷移を持てません。');
            },

            removeTransition: function (transition) {
                logger.error(this.constructor.name + 'インスタンスは遷移を持てません。');
            },

            appendRegion: function (region) {
                logger.error(this.constructor.name + 'インスタンスは領域を持てません。');
            },

            removeRegion: function (region) {
                logger.error(this.constructor.name + 'インスタンスは領域を持てません。');
            },
        },

        descriptor: {
            $props: {
                enumerable: true,
                get: function () {
                    var superState = this._getSuperState();
                    if (!_.isNull(superState)) {
                        return superState.props;
                    }
                },
            },

            $methods: {
                enumerable: true,
                get: function () {
                    var superState = this._getSuperState();
                    if (!_.isNull(superState)) {
                        return superState.methods;
                    }
                },
            },
        },

        manipulator: {
            state: {
                addState: function () {
                    var states = _.toArray(arguments);
                    if (_.isNull(this.region)) {
                        this.appendRegion();
                        logger.info(this.constructor.name + 'インスタンス"' + this._name + '"のRegionインスタンスが自動生成されました。');
                    }

                    return this.region.addState.apply(this.region, states);
                },

                removeState: function () {
                    var states = _.toArray(arguments);
                    if (_.isNull(this.region)) {
                        logger.error('コンテナのRegionインスタンスが存在しません。');
                    }

                    return this.region.removeState.apply(this.region, states);
                },

                addTransition: function () {
                    var transits = _.toArray(arguments);
                    if (_.isNull(this.region)) {
                        this.appendRegion();
                        logger.info(this.constructor.name + 'インスタンス"' + this._name + '"のRegionインスタンスが自動作成されました。');
                    }

                    return this.region.addTransition.apply(this.region, transits);
                },

                removeTransition: function () {
                    var transits = _.toArray(arguments);
                    if (_.isNull(this.region)) {
                        logger.error('コンテナのRegionインスタンスが存在しません。');
                    }

                    return this.region.removeTransition.apply(this.region, transits);
                },

                appendRegion: function (region) {
                    if (_.isNull(this.region)) {
                        if (_.isUndefined(region)) {
                            region = new Region('default-region-of-' + this._name);

                        } else if (!(region instanceof Region)) {
                            logger.error('Regionインスタンスを指定してください。');
                        }

                        this.region = region;
                    } else {
                        if (_.isUndefined(region)) {
                            region = new Region(false);

                        } else if (!(region instanceof Region)) {
                            logger.error('Regionインスタンスを指定してください。');
                        }
                    }

                    region._parent = this;
                    this._regions.push(region);

                    this._addObserver('regions', region);
                    region._addObserver('parent', this);

                    region._update('update-relation');

                    return region;
                },

                removeRegion: function (region) {
                    var index;

                    if (!(region instanceof Region)) {
                        logger.error('Regionインスタンスを指定してください。');
                    }

                    region._parent = null;

                    index = _.indexOf(this._regions, region);
                    if (index > -1) {
                        this._regions.splice(index, 1);

                    } else {
                        logger.error('削除対象のRegionインスタンスが見つかりません。');
                    }

                    if (this.region === region) {
                        this.region = null;
                    }

                    region._update('update-relation');

                    this._removeObserver('regions', region);
                    region._removeObserver('parent', this);

                    return region;
                },
            },

            region: {
                addState: function () {
                    var states, i, l, state, currentLevel, root;
                    states = _.toArray(arguments);

                    for (i = 0, l = states.length; i < l; i += 1) {
                        state = states[i];

                        if (!(state instanceof ProtoState)) {
                            logger.error('Stateインスタンスを指定してください。');
                        }

                        if (state instanceof InitialPseudoState) {
                            this._initialPseudo = state;

                        } else if (state instanceof FinalState) {
                            this._final = state;

                        } else if (state instanceof HistoryPseudoState) {
                            this._historyPseudo = state;
                        }

                        this._states.push(state);
                        this._states[state._id] = state;
                        this._addObserver('states', state);

                        state._container = this;
                        state._addObserver('container', this);

                        currentLevel = this._getParentLevel() + 1;
                        root = this._getRoot();

                        state._updateRelation(currentLevel, root);
                    }

                    return states.length > 1 ? states : _.first(states);
                },

                /* 引数にStateインスタンスを複数指定可 */
                removeState: function () {
                    var states, i, state;
                    states = _.toArray(arguments);

                    for (i = this._states.length; i--;) {
                        state = this._states[i];

                        if (_.indexOf(states, state) > -1) {
                            if (state instanceof HistoryPseudoState) {
                                this._historyPseudo = null;
                            }

                            this._states.splice(i, 1);
                            delete this._states[state._id];

                            this._removeObserver('states', state);

                            state._container = null;
                            state._removeObserver('container', this);

                            state._updateRelation(0, null);
                        }
                    }

                    return states.length > 1 ? states : _.first(states);
                },

                addTransition: function () {
                    var transits, i, l, transit, result, currentLevel, root;
                    transits = _.toArray(arguments);

                    for (i = 0, l = transits.length; i < l; i += 1) {
                        transit = transits[i];

                        if (!(transit instanceof Transition)) {
                            logger.error('Transitionインスタンスを指定してください。');
                        }

                        if (transit._rawSource === InitialPseudoState || isFalsy(transit._rawSource)) {
                            transit._source = this._initialPseudo;

                        } else {
                            result = _findState(this, transit._rawSource, 0);

                            if (_.isUndefined(result)) {
                                result = _findState(this, transit._rawSource, 1);

                                if (!_.isUndefined(result)) {
                                    transit._exitViaExitPoint = true;

                                } else {
                                    logger.error('遷移元のStateインスタンスが見つかりません。');
                                }
                            }

                            transit._source = transit._rawSource;
                        }

                        if (transit._rawTarget === FinalState || isFalsy(transit._rawTarget)) {
                            transit._target = this._final;

                        } else {
                            result = _findState(this, transit._rawTarget, 0);

                            if (_.isUndefined(result)) {
                                result = _findState(this, transit._rawTarget, 1);

                                if (!_.isUndefined(result)) {
                                    transit._isExplicitEntry = true;

                                } else {
                                    logger.error('遷移先のStateインスタンスが見つかりません。');
                                }
                            }

                            transit._target = transit._rawTarget;
                        }

                        if (transit._name === transit._id) {
                            transit._name = 'transit-from-' + transit._source._name + '-to-' + transit._target._name;
                        }

                        this._transits.push(transit);
                        this._transits[transit._id] = transit;
                        this._addObserver('transits', transit);

                        transit._container = this;
                        transit._addObserver('container', this);

                        currentLevel = this._getParentLevel() + 1;
                        root = this._getRoot();

                        transit._updateRelation(currentLevel, root);
                    }

                    return transits.length > 1 ? transits : _.first(transits);
                },

                removeTransition: function () {
                    var transits, i, transit;
                    transits = _.toArray(arguments);

                    for (i = this._transits.length; i--;) {
                        transit = this._transits[i];

                        if (_.indexOf(transits, transit) > -1) {
                            this._transits.splice(i, 1);
                            delete this._transits[transit._id];
                            this._removeObserver('transits', transit);

                            transit._source = null;
                            transit._target = null;

                            transit._container = null;
                            transit._removeObserver('container', this);

                            transit._updateRelation(0, null);
                        }
                    }

                    return transits.length > 1 ? transits : _.first(transits);
                },
            },

            subMachine: {
                addLink: function (machine) {
                    if (!(machine instanceof Machine)) {
                        logger.error('Machineインスタンスを指定してください。');
                    }

                    this._link = machine;
                    this._addObserver('outbound', machine);

                    machine._addObserver('inbound', this);
                },

                removeLink: function () {
                    this._removeObserver('outbound', this._link);

                    this._link._removeObserver('inbound', this);
                    this._link = null;
                },
            },
        },
    };

    function Model(data) {
        this._data = {};
        this._cache = null;

        if (_.isObject(data)) {
            this._data = this._extendDeep(this._data, data);
        }
    }

    Model.prototype = _.create(Object.prototype, {
        constructor: Model,

        get: function (key) {
            return this._data[key];
        },

        set: function (key, value) {
            this._data[key] = value;
            return value;
        },

        unset: function (key) {
            var value = this._data[key];
            if (!_.isUndefined(value)) {
                delete this._data[key];
                return value;
            }
        },

        extend: function (data) {
            return this._extendDeep(this._data, data);
        },

        save: function () {
            this._cache = this._extendDeep(this._cache, this._data);
        },

        restore: function () {
            if (!_.isNull(this._cache)) {
                this._data = {};
                this._data = this._extendDeep(this._data, this._cache);
            }
        },

        clear: function () {
            this._data = {};
            this._cache = null;
        },

        _extendDeep: function (destination, source) {
            destination = destination || {};

            _.each(source, _.bind(function (value, key) {
                if (_.isObject(value)) {
                    if (_.isFunction(value)) {
                        logger.error('Functionはdataプロパティに登録できません。methodsプロパティに登録してください。');
                    }

                    destination[key] = _.isArray(value) ? [] : {};
                    this._extendDeep(destination[key], value);
                } else {
                    destination[key] = value;
                }
            }, this));

            return destination;
        },
    });

    function Subject() {
        this._observers = {};
    }

    Subject.prototype = _.create(Object.prototype, {
        constructor: Subject,

        _countObservers: function (type) {
            var result = 0;
            if (!_.isUndefined(this._observers[type])) {
                result = this._observers[type].length;
            }

            return result;
        },

        _setObserverType: function () {
            var types, type, i, l;
            types = _.toArray(arguments);

            for (i = 0, l = types.length; i < l; i += 1) {
                type = types[i];
                if (_.isUndefined(this._observers[type])) {
                    this._observers[type] = [];
                }
            }
        },

        _addObserver: function (type, observer) {
            if (_.isUndefined(this._observers[type])) {
                this._observers[type] = [];
            }
            this._observers[type].push(observer);
        },

        _removeObserver: function (type, observer) {
            var observers, index;
            observers = this._observers[type];

            if (_.isUndefined(observers)) {
                logger.warn('オブザーバーが登録されていません。');
                return;
            }

            index = _.indexOf(observers, observer);
            if (index > -1) {
                observers.splice(index, 1);
            }
        },

        _notify: function (type) {
            var observers, i, l, observer, args;
            observers = this._observers[type];
            args = _.toArray(arguments).slice(1);

            if (_.isUndefined(observers)) {
                logger.warn('オブザーバーが登録されていません。');
                return;
            }

            for (i = 0, l = observers.length; i < l; i += 1) {
                observer = observers[i];
                if (_.isFunction(observer._update)) {
                    observer._update.apply(observer, args);
                }
            }
        },
    });

    function Entity(name) {
        Subject.call(this);

        this._id = uuid();
        this._name = !isFalsy(name) ? name : this._id;
        this._type = 'entity';
        this._status = 'inactive';

        this.model = new Model();
        this.props = {};
        this.methods = {};

        this._setObserverType('root');
    }

    Entity.prototype = _.create(Subject.prototype, _.extend({
        constructor: Entity,

        getId: function () {
            return this._id;
        },

        getName: function () {
            return this._name;
        },

        setName: function (name) {
            this._name = name;
            return name;
        },

        isActive: function () {
            return this._status === 'active';
        },

        addMethod: function (methods) {
            return _.mapObject(methods, _.bind(function (method) {
                return _.bind(method, this);
            }, this));
        },

        _activate: function () {
            this._status = 'active';
            logger.info(this.constructor.name + 'インスタンス"' + this._name + '"がアクティブ化されました。');
        },

        _inactivate: function () {
            this._status = 'inactive';
            logger.info(this.constructor.name + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
        },

        _update: _.noop,

    }, mixin.accessor));

    function Elem(name) {
        Entity.call(this, name);

        this._type = 'element';

        this._container = null;
        this._root = null;
        this._level = 0;

        this._setObserverType('container');

        Object.defineProperties(this, mixin.descriptor);
    }

    Elem.prototype = _.create(Entity.prototype, _.extend({
        constructor: Elem,

        getContainer: function () {
            return this._container;
        },

        getCurrentLevel: function () {
            return this._level;
        },

        _async: function (callback) {
            this._notify('root', 'async', _.bind(function () {
                _.bind(callback, this)();
                return Promise.resolve();
            }, this));
        },
    }, mixin.helper));

    function ProtoState(name) {
        Elem.call(this, name);

        this._type = 'state';
        this.region = null;
        this._regions = [];

        this._setObserverType('regions');
    }

    ProtoState.prototype = _.create(Elem.prototype, _.extend({
        constructor: ProtoState,

        getRegion: function (index) {
            if (_.isNumber(index)) {
                return this._regions[index];

            } else {
                return this.region;
            }
        },

        _getSuperState: function () {
            var result = null;
            if (!_.isNull(this._container) && !_.isNull(this._container._parent)) {
                result = this._container._parent;
            }

            return result;
        },

        completion: function () {
            this._async(function () {
                if (this.isActive()) {
                    this._exit();

                    if (!_.isNull(this._container)) {
                        this._notify('container', 'completion');

                    } else {
                        logger.error(this.constructor.name + 'インスタンス"' + this._name + '"のコンテナが存在しません。');
                    }
                } else {
                    logger.error(this.constructor.name + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
                }
            });
        },

        _update: function (event) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'entry':
                    this._entry.apply(this, args);
                    break;

                case 'exit':
                    this._exit.apply(this, args);
                    break;

                case 'update-relation':
                    this._updateRelation.apply(this, args);
                    break;

                case 'completion':
                    this.completion.apply(this, args);
                    break;
            }
        },

        _updateRelation: function (currentLevel, root) {
            this._level = currentLevel;
            this._root = root;

            this._notify('regions', 'update-relation');
        },

        _entry: function () {
            if (!this.isActive()) {
                this._activate();
                this._notify('regions', 'entry');
            }
        },

        _exit: function () {
            if (this.isActive()) {
                this._notify('regions', 'exit');
                this._inactivate();
            }
        },
    }, mixin.manipulator.state));

    function State(name, options) {
        ProtoState.call(this, name);

        options = _.defaults(options || {}, _.clone(State.options));

        if (_.isObject(options.data)) {
            this.extend(options.data);
        }

        this.save();

        if (_.isObject(options.props)) {
            _.extend(this.props, options.props);
        }

        if (_.isObject(options.methods)) {
            this.methods = this.addMethod(options.methods);
        }

        this._entryAction = options.entryAction;
        this._exitAction = options.exitAction;
        this._doActivity = options.doActivity;

        this._autoTransition = options.autoTransition;

        this._loop = options.loop;
        this._fps = options.fps;
        this._interval = 1000 / this._fps;

        this._timerId = 0;
        this._lastCallTime = 0;
    }

    State.options = {
        entryAction: _.noop,
        exitAction: _.noop,
        doActivity: _.noop,

        autoTransition: false,
        loop: false,
        fps: 60,
    };

    State.prototype = _.create(ProtoState.prototype, {
        constructor: State,

        completion: function () {
            this._async(function () {
                var transit;

                if (this.isActive()) {
                    if (!_.isNull(this._container)) {
                        transit = _findNextTransition(this._container, this);
                        if (!_.isUndefined(transit)) {
                            transit.trigger();
                        } else {
                            this._exit();
                            this._notify('container', 'completion');
                        }
                    } else {
                        logger.error(this.constructor.name + 'インスタンス"' + this._name + '"のコンテナが存在しません。');
                    }
                } else {
                    logger.error(this.constructor.name + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
                }
            });
        },

        _update: function (event) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'entry':
                    this._entry.apply(this, args);
                    break;

                case 'exit':
                    this._exit.apply(this, args);
                    break;

                case 'update-relation':
                    this._updateRelation.apply(this, args);
                    break;

                case 'completion':
                    this.completion.apply(this, args);
                    break;
            }
        },

        _setTimer: function (callback) {
            this._timerId = 0;
            this._lastCallTime = 0;

            this._repeat(callback);
        },

        _clearTimer: function () {
            clearTimeout(this._timerId);
        },

        _repeat: function (callback) {
            var currentTime, processingTime, timeToCall;

            currentTime = _.now();
            processingTime = this._lastCallTime !== 0 ? currentTime - this._lastCallTime : 0;
            timeToCall = Math.max(this._interval - processingTime, 0);

            this._lastCallTime = currentTime + timeToCall;
            this._timerId = setTimeout(_.bind(this._timeout, this, callback, currentTime, processingTime), timeToCall);

            return this._timerId;
        },

        _timeout: function (callback, previousTime, processingTime) {
            var deltaTime;
            deltaTime = _.now() - previousTime + processingTime;

            callback(deltaTime);
            this._repeat(callback);
        },

        _activate: function () {
            var root, model, props, methods;

            root = this._root;
            if (!_.isNull(root)) {
                model = root.model;
                props = root.props;
                methods = root.methods;

            } else {
                logger.error('Machineインスタンスの参照が存在しません。');
            }

            this._status = 'active';
            logger.info(this.constructor.name + 'インスタンス"' + this._name + '"がアクティブ化されました。');

            this._entryAction(model, props, methods);

            if (this._loop) {
                this._setTimer(_.bind(function (deltaTime) {
                    this._doActivity(deltaTime, model, props, methods);

                    if (this._autoTransition) {
                        this.completion();
                    }
                }, this));

            } else {
                this._doActivity(model, props, methods);

                if (this._autoTransition) {
                    this.completion();
                }
            }
        },

        _inactivate: function () {
            var root, model, props, methods;

            root = this._root;
            if (!_.isNull(root)) {
                model = root.model;
                props = root.props;
                methods = root.methods;

            } else {
                logger.error('Machineインスタンスの参照が存在しません。');
            }

            this._clearTimer();

            if (!_.isNull(this._container)) {
                this._notify('container', 'set-previous-state', this);
            }

            this._exitAction(model, props, methods);

            this._status = 'inactive';
            logger.info(this.constructor.name + 'インスタンス"' + this._name + '"が非アクティブ化されました。');

        },

        _entry: function (history, priority) {
            if (!this.isActive()) {
                this._activate();
                this._notify('regions', 'entry', history, priority);
            }
        },

    });

    function Machine(name, options) {
        ProtoState.call(this, name, options);

        options = options || {};

        if (_.isObject(options.data)) {
            this.extend(options.data);
        }

        this.save();

        if (_.isObject(options.props)) {
            _.extend(this.props, options.props);
        }

        if (_.isObject(options.methods)) {
            this.methods = this.addMethod(options.methods);
        }

        this._deployed = false;
        this._promise = null;

        this._links = [];

        this.appendRegion();
        this._setObserverType('inbound');
    }

    Machine.prototype = _.create(ProtoState.prototype, {
        constructor: Machine,

        deploy: function () {
            this._deployed = true;

            this._promise = Promise.resolve();
            this._updateRelation(this._level, this);

            _eachEntity(this, _.bind(function (entity) {
                if (!(entity instanceof Machine)) {
                    entity._addObserver('root', this);
                }

                if (entity instanceof ConnectionPointPseudoState && entity._getSuperState() === this) {
                    entity._isEndpoint = true;
                }
            }, this));

            return this;
        },

        undeploy: function () {
            this._deployed = false;
            this._promise = null;

            _eachEntity(this, _.bind(function (entity) {
                if (!(entity instanceof Machine)) {
                    entity._removeObserver('root', this);
                }

                if (entity instanceof ConnectionPointPseudoState) {
                    entity._isEndpoint = false;
                }
            }, this));

            this._updateRelation(this._level, null);

            return this;
        },

        start: function (priority) {
            if (!this._deployed) {
                logger.error('start()の前にdeploy()メソッドを実行してください。');
            }

            if (!this.isActive()) {
                logger.info('Machineインスタンス"' + this._name + '"が動作を開始しました。');

                this._stackPromise(_.bind(function () {
                    this._entry(undefined, priority);

                    return Promise.resolve();
                }, this));

            } else {
                logger.warn('Machineインスタンス"' + this._name + '"はすでに起動しています。');
            }

            return this;
        },

        finish: function () {
            if (!this._deployed) {
                logger.error('start()の前にdeploy()メソッドを実行してください。');
            }

            if (this.isActive()) {
                this.completion();
            } else {
                logger.warn('Machineインスタンス"' + this._name + '"はすでに動作を終了しています。');
            }

            return this;
        },

        completion: function () {
            this._stackPromise(_.bind(function () {
                this._exit();
                logger.info('Machineインスタンス"' + this._name + '"が動作を終了しました。');

                return Promise.resolve();
            }, this));
        },

        _stackPromise: function (callback) {
            this._promise = this._promise.then(callback, this._onRejected).catch(this._onError);
        },

        _aborted: function (state) {
            logger.error('Machineインスタンス"' + this._name + '"は処理を停止しました。');
        },

        _outerExecution: function (key) {
            var i, l, region, state;

            if (!_.isUndefined(key)) {
                for (i = 0, l = this._regions.length; i < l; i += 1) {
                    region = this._regions[i];
                    state = region._states[key];
                    if (!_.isUndefined(state)) {
                        this.start(state);
                        return;
                    }
                }

                logger.error('エンドポイントのEntryPointPseudoStateインスタンスが指定されていません。');

            } else {
                this.start();
            }
        },

        _linkBack: function (state) {
            this.completion();

            this._stackPromise(_.bind(function () {
                this._notify('inbound', 'link-back', state._id);

                return Promise.resolve();
            }, this));
        },

        _update: function (event, callback) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'async':
                    this._stackPromise(callback);
                    break;

                case 'entry':
                    this._entry.apply(this, args);
                    break;

                case 'exit':
                    this._exit.apply(this, args);
                    break;

                case 'completion':
                    this.completion.apply(this, args);
                    break;

                case 'termination':
                    this._aborted.apply(this, args);
                    break;

                case 'link-forward':
                    this._outerExecution.apply(this, args);
                    break;

                case 'exit-point':
                    this._linkBack.apply(this, args);
                    break;
            }
        },

        _onRejected: function (e) {
            return Promise.reject(e);
        },

        _onError: function (e) {
            logger.info(e);
            return Promise.reject(e);
        },

        _entry: function (history, priority) {
            if (!this.isActive()) {
                this._activate();
                this._notify('regions', 'entry', history, priority);
            }
        },
    });

    function FinalState(name) {
        ProtoState.call(this, name);
    }

    FinalState.prototype = _.create(ProtoState.prototype, _.extend({
        constructor: FinalState,

        _activate: function () {
            this._status = 'active';
            logger.info('FinalStateインスタンス"' + this._name + '"がアクティブ化されました。');

            this.completion();
        },

        _inactivate: function () {
            this._status = 'inactive';

            if (!_.isNull(this._container)) {
                this._notify('container', 'set-previous-state', null);
            }

            logger.info('FinalStateインスタンス"' + this._name + '"が非アクティブ化されました。');
        },
    }, mixin.disable));

    function SubMachine(name) {
        ProtoState.call(this, name);

        this._link = null;
        this._deployed = false;

        this.appendRegion();
        this._setObserverType('outbound');
    }

    SubMachine.prototype = _.create(ProtoState.prototype, _.extend({
        constructor: SubMachine,

        deploy: function () {
            this._deployed = true;

            _eachEntity(this, _.bind(function (entity) {
                if (entity instanceof ProtoState) {
                    if (entity instanceof PseudoState) {
                        if (entity instanceof ConnectionPointPseudoState) {
                            entity._addObserver('sub-root', this);

                            if (entity._getSuperState() === this) {
                                entity._hasSubRoot = true;

                            } else {
                                logger.error('ConnectionPointPseudoStateインスタンスはサブマシン直下のサブ状態でなければなりません。');
                            }
                        } else if (!(entity instanceof InitialPseudoState)) {
                            logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を追加できません。');
                        }
                    } else if (!(entity instanceof SubMachine) && !(entity instanceof FinalState)) {
                        logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を保持できません。');
                    }
                }
            }, this));

            return this;
        },

        undeploy: function () {
            this._deployed = false;

            _eachEntity(this, _.bind(function (entity) {
                if (entity instanceof ProtoState) {
                    if (entity instanceof PseudoState) {
                        if (entity instanceof ConnectionPointPseudoState) {
                            entity._removeObserver('sub-root', this);
                            entity._hasSubRoot = false;

                        } else if (!(entity instanceof InitialPseudoState)) {
                            logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を追加できません。');
                        }
                    } else if (!(entity instanceof SubMachine) && !(entity instanceof FinalState)) {
                        logger.error('SubMachineインスタンスはConnectionPointPseudoStateクラス以外の状態を保持できません。');
                    }
                }
            }, this));

            return this;
        },

        _linkForward: function (state) {
            this._async(_.bind(function () {
                state._exit();

                if (!_.isEmpty(state._key)) {
                    this._notify('outbound', 'link-forward', state._key);

                } else {
                    logger.error('リンク先のマシンに渡すキーが指定されていません。');
                }
            }, this));
        },

        _innerExecution: function (id) {
            var exitPoint, i, l, region;

            for (i = 0, l = this._regions.length; i < l; i += 1) {
                region = this._regions[i];

                exitPoint = _.findWhere(region._states, {_key: id});

                if (!_.isUndefined(exitPoint)) {
                    exitPoint._entry();

                } else {
                    logger.error('エンドポイントのExitPointPseudoStateインスタンスが指定されていません。');
                }
            }
        },

        _update: function (event) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'entry-point':
                    this._linkForward.apply(this, args);
                    break;

                case 'link-back':
                    this._innerExecution.apply(this, args);
                    break;
            }
        },

        _entry: function (history, priority) {
            if (!this._deployed) {
                logger.error('SubMachineインスタンスのdeploy()メソッドを実行してください。');
            }

            if (!this.isActive()) {
                this._activate();
                this._notify('regions', 'entry', history, priority);
            }
        },

        _exit: function () {
            if (!this._deployed) {
                logger.error('SubMachineインスタンスのdeploy()メソッドを実行してください。');
            }

            if (this.isActive()) {
                this._notify('regions', 'exit');
                this._inactivate();
            }
        },
    }, mixin.manipulator.subMachine));


    function PseudoState(name) {
        ProtoState.call(this, name);

        this._type = 'pseudo-state';
    }

    PseudoState.prototype = _.create(ProtoState.prototype, _.extend({
        constructor: PseudoState,

        _inactivate: function () {
            this._status = 'inactive';

            if (!_.isNull(this._container)) {
                this._notify('container', 'set-previous-state', null);
            }

            logger.info(this.constructor.name + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
        },
    }, mixin.disable));

    function InitialPseudoState(name) {
        PseudoState.call(this, name);
    }

    InitialPseudoState.prototype = _.create(PseudoState.prototype, {
        constructor: InitialPseudoState,

        _activate: function () {
            var transit;

            this._status = 'active';
            logger.info('InitialPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

            if (!_.isNull(this._container)) {
                transit = _findFirstTransition(this._container);
                if (!_.isUndefined(transit)) {
                    transit.trigger();

                } else {
                    logger.error('Regionインスタンス"' + this._container._name + '"の初期遷移が見つかりません。');
                }
            } else {
                logger.error('InitialPseudoStateインスタンス"' + this._name + '"のコンテナが存在しません。');
            }
        },
    });

    function HistoryPseudoState(name, deep) {
        PseudoState.call(this, name);

        this._isDeep = !_.isUndefined(deep) ? deep : false;
    }

    HistoryPseudoState.prototype = _.create(PseudoState.prototype, {
        constructor: HistoryPseudoState,
    });

    function TerminatePseudoState(name, deep) {
        PseudoState.call(this, name);
    }

    TerminatePseudoState.prototype = _.create(PseudoState.prototype, {
        constructor: TerminatePseudoState,

        _activate: function () {
            this._status = 'active';
            logger.info('TerminatePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

            this._notify('root', 'termination', this);
            throw new Error('ERROR: 停止状態に遷移しました。処理を中断します。');
        },
    });

    function ChoicePseudoState(name, condition) {
        PseudoState.call(this, name);

        this._condition = _.isFunction(condition) ? condition : _.noop;
    }

    ChoicePseudoState.prototype = _.create(PseudoState.prototype, {
        constructor: ChoicePseudoState,

        _activate: function () {
            var root, model, props, methods, target, transit;

            root = this._root;
            if (!_.isNull(root)) {
                model = root.model;
                props = root.props;
                methods = root.methods;

            } else {
                logger.error('Machineインスタンスの参照が存在しません。');
            }

            this._status = 'active';
            logger.info('ChoicePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

            target = this._condition(model, props, methods);
            if (!(target instanceof ProtoState)) {
                logger.error('遷移先のStateインスタンスが存在しません。');
            }

            if (!_.isNull(this._container)) {
                transit = _findNextTransition(this._container, this, target);
                if (!_.isUndefined(transit)) {
                    transit.trigger();

                } else {
                    logger.error('ChoicePseudoStateインスタンス"' + this._name + '"起点のTransitionインスタンスが見つかりません。');
                }
            } else {
                logger.error('ChoicePseudoStateインスタンス"' + this._name + '"のコンテナが存在しません。');
            }
        },
    });

    function ConnectionPointPseudoState(name) {
        PseudoState.call(this, name);

        this._key = '';
        this._hasSubRoot = false;
        this._isEndpoint = false;
        this._setObserverType('sub-root');
    }

    ConnectionPointPseudoState.prototype = _.create(PseudoState.prototype, {
        constructor: ConnectionPointPseudoState,

        setKey: function (key) {
            this._key = key;
            return key;
        },
    });

    function EntryPointPseudoState(name) {
        ConnectionPointPseudoState.call(this, name);
    }

    EntryPointPseudoState.prototype = _.create(ConnectionPointPseudoState.prototype, {
        constructor: EntryPointPseudoState,

        _activate: function () {
            var transit;

            this._status = 'active';
            logger.info('EntryPointPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

            if (this._hasSubRoot) {
                this._notify('sub-root', 'entry-point', this);

            } else {
                if (!_.isNull(this._container)) {
                    transit = _findFirstTransition(this._container, this);
                    if (!_.isUndefined(transit)) {
                        transit.trigger();

                    } else {
                        logger.error('Regionインスタンス"' + this._container._name + '"の初期遷移が見つかりません。');
                    }
                } else {
                    logger.error('EntryPointPseudoStateインスタンス"' + this._name + '"のコンテナが存在しません。');
                }
            }
        },
    });

    function ExitPointPseudoState(name) {
        ConnectionPointPseudoState.call(this, name);
    }

    ExitPointPseudoState.prototype = _.create(ConnectionPointPseudoState.prototype, {
        constructor: ExitPointPseudoState,

        _activate: function () {
            var upperContainer, transit;

            this._status = 'active';
            logger.info('ExitPointPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');

            if (this._isEndpoint) {
                this._notify('root', 'exit-point', this);

            } else {
                upperContainer = this._container._getUpperContainer();
                if (!_.isNull(upperContainer)) {
                    transit = _findNextTransition(upperContainer, this);

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

    function Transition(name, source, target, options) {
        Elem.call(this, name);

        this._type = 'transition';

        if (source instanceof ProtoState || isFalsy(source) || InitialPseudoState) {
            this._rawSource = source;

        } else {
            logger.error('第2引数に遷移元のStateインスタンス、またはfalseを指定してください。');
        }

        if (target instanceof ProtoState || isFalsy(target) || FinalState) {
            this._rawTarget = target;

        } else {
            logger.error('第3引数に遷移元のStateインスタンス、またはfalseを指定してください。');
        }

        options = _.defaults(options || {}, _.clone(Transition.options));

        if (_.isObject(options.data)) {
            this.extend(options.data);
        }

        this.save();

        if (_.isObject(options.props)) {
            _.extend(this.props, options.props);
        }

        if (_.isObject(options.methods)) {
            this.methods = this.addMethod(options.methods);
        }

        this._source = null;
        this._target = null;

        this._guard = options.guard;
        this._effect = options.effect;
        this._internal = options.internal;

        this._locked = options.locked;

        this._isExplicitEntry = false;
        this._exitViaExitPoint = false;
    }

    Transition.options = {
        guard: null,
        effect: null,
        internal: false,

        locked: true,
    };

    Transition.prototype = _.create(Elem.prototype, {
        constructor: Transition,

        trigger: function () {
            var root, model, props, methods;

            root = this._root;
            if (!_.isNull(root)) {
                model = root.model;
                props = root.props;
                methods = root.methods;

            } else {
                logger.error('Machineインスタンスの参照が存在しません。');
            }

            if (_.isNull(this._container)) {
                logger.error('Transitionインスタンス"' + this._name + '"のコンテナが存在しません。');
            }

            if (!this._container.isActive()) {
                logger.error('Transitionインスタンス"' + this._name + '"のコンテナが非アクティブです。');
            }

            /* 遷移元が終了状態であったり、遷移先の状態が開始擬似状態である場合、エラー出力 */
            if (this._source instanceof FinalState) {
                logger.error('終了状態を遷移元にすることはできません。');

            } else if (this._source instanceof TerminatePseudoState) {
                logger.error('停止状態を遷移元にすることはできません。');

            } else if (this._target instanceof InitialPseudoState) {
                logger.error('開始擬似状態を遷移先にすることはできません。');
            }

            /* ガードが設定されていたら、ガード判定する */
            if (!_.isNull(this._guard)) {
                if (!this._guard(model, props, methods)) {
                    logger.info('ガードが成立しませんでした。遷移は発生しません。');
                    return;
                }
            }

            if (this._internal) {
                if (this._source === this._target) {
                    this._async(function () {
                        logger.info('内部遷移を実行します。');

                            if (!_.isNull(this._effect)) {
                            this._effect(model, props, methods);
                        }
                    });

                    return;
                } else {
                    logger.error('遷移元と遷移先は同じStateインスタンスを指定してください。');
                }
            }

            this._async(function () {
                var superState;

                if (!this.isActive()) {
                    this._activate();

                } else {
                    logger.error('Transitionインスタンス"' + this._name + '"はすでにアクティブ化されています。');
                }

                if (this._source.isActive()) {
                    if (this._exitViaExitPoint) {
                        superState = this._source._getSuperState();
                        if (!_.isNull(superState)) {
                            superState._exit();

                        } else {
                            logger.error(this._target.constructor.name + 'インスタンス"' + this._target._name + '"の「親」状態が存在しません。');
                        }
                    } else {
                        this._source._exit();
                    }
                } else {
                    logger.error('遷移元' + this._target.constructor.name + 'インスタンス"' + this._target._name + '"が非アクティブです。');
                }

                if (!_.isNull(this._effect)) {
                    this._effect(model, props, methods);
                }

                if (!this._target.isActive()) {
                    if (this._isExplicitEntry) {
                        superState = this._target._getSuperState();
                        if (!_.isNull(superState)) {
                            superState._entry(undefined, this._target);

                        } else {
                            logger.error(this._target.constructor.name + 'インスタンス"' + this._target._name + '"の「親」状態が存在しません。');
                        }
                    } else {
                        this._target._entry();
                    }
                } else {
                    logger.error('遷移先' + this._target.constructor.name + 'インスタンス"' + this._target._name + '"がアクティブです。');
                }

                if (this.isActive()) {
                    this._inactivate();

                } else {
                    logger.error('Transitionインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
                }
            });
        },

        _update: function (event) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'update-relation':
                    this._updateRelation.apply(this, args);
                    break;
            }
        },

        _updateRelation: function (currentLevel, root) {
            this._level = currentLevel;
            this._root = root;
        },
    });

    function Region(name, options) {
        Entity.call(this, name);

        this._type = 'region';

        options = options || {};

        if (_.isObject(options.data)) {
            this.extend(options.data);
        }

        this.save();

        if (_.isObject(options.props)) {
            _.extend(this.props, options.props);
        }

        if (_.isObject(options.methods)) {
            this.methods = this.addMethod(options.methods);
        }

        this._parent = null;

        this._initialPseudo = null;
        this._final = null;
        this._historyPseudo = null;
        this._previousState = null;

        this._states = [];
        this._transits = [];

        this._setObserverType('parent', 'states', 'transits');
        this._setDefaultStates();
    }

    Region.prototype = _.create(Entity.prototype, _.extend({
        constructor: Region,

        hasHistory: function (deep) {
            return isFalsy(deep) ? !_.isNull(this._historyPseudo) :
                !_.isNull(this._historyPseudo) && this._historyPseudo._isDeep;
        },

        getIndex: function () {
            var result = -1;

            if (_.isNull(this._parent)) {
                _.indexOf(this._parent._regions, this);
            }

            return result;
        },

        _update: function (event) {
            var args = _.toArray(arguments).slice(1);

            switch (event) {
                case 'entry':
                    this._entry.apply(this, args);
                    break;

                case 'exit':
                    this._exit.apply(this, args);
                    break;

                case 'update-relation':
                    this._updateRelation.apply(this, args);
                    break;

                case 'completion':
                    this._completion.apply(this, args);
                    break;

                case 'set-previous-state':
                    this._setPreviousState.apply(this, args);
                    break;
            }
        },

        _getParentLevel: function () {
            var result = -1;
            if (!_.isNull(this._parent)) {
                result = this._parent._level;
            }

            return result;
        },

        _getRoot: function () {
            var result = null;
            if (!_.isNull(this._parent)) {
                return this._parent._root;
            }

            return result;
        },

        _getUpperContainer: function () {
            var result = null;
            if (!_.isNull(this._parent) && !_.isNull(this._parent._container)) {
                result = this._parent._container;
            }

            return result;
        },

        _setDefaultStates: function () {
            var initialPseudo, final;
            initialPseudo = new InitialPseudoState(false);
            final = new FinalState(false);

            this.addState(initialPseudo, final);
        },

        _setDefaultStateName: function () {
            this._initialPseudo._name = 'initial-pseudo-state-in-' + this._name;
            this._final._name = 'final-state-in-' + this._name;
        },

        _updateRelation: function () {
            var currentLevel, root;

            this._setDefaultStateName();

            currentLevel = this._getParentLevel() + 1;
            root = this._getRoot();

            this._notify('states', 'update-relation', currentLevel, root);
            this._notify('transits', 'update-relation', currentLevel, root);
        },

        _setPreviousState: function (state) {
            this._previousState = state;
            return state;
        },

        _entry: function (history, priority) {
            var state;

            if (!this.isActive()) {
                this._activate();

                if (_.isUndefined(history)) {
                    history = _findDeepHistoryPseudoState(this);
                    history = !_.isUndefined(history);
                }

                if (_.indexOf(this._states, priority) > -1) {
                    priority._update('entry', history);

                } else {
                    if (history) {
                        state = this._previousState || this._initialPseudo;

                    } else if (!_.isNull(this._historyPseudo)) {
                        state = this._previousState || this._initialPseudo;

                        if (this._historyPseudo._isDeep) {
                            history = true;
                        }
                    } else {
                        state = this._initialPseudo;
                    }

                    state._update('entry', history, priority);
                }
            }
        },

        _exit: function () {
            if (this.isActive()) {
                this._notify('states', 'exit');
                this._inactivate();
            }
        },

        _completion: function () {
            this._inactivate();

            if (!_.isNull(this._parent)) {
                if (_.every(this._parent._regions, function (region) {
                    return !region.isActive();
                })) {
                    this._notify('parent', 'completion');
                }
            } else {
                logger.error('Regionインスタンス"' + this._name + '"の「親」状態が存在しません。');
            }

        },
    }, mixin.manipulator.region));

    function _eachEntity(state, callback) {
        var i, j, l, m, region, subState, transit;

        callback(state);

        for (i = 0, l = state._regions.length; i < l; i += 1) {
            region = state._regions[i];
            callback(region);

            for (j = 0, m = region._transits.length; j < m; j += 1) {
                transit = region._transits[j];
                callback(transit);
            }

            for (j = 0, m = region._states.length; j < m; j += 1) {
                subState = region._states[j];
                _eachEntity(subState, callback);
            }
        }
    }

    function _findState(region, targetState, sublevel) {
        var i, j, l, m, state, subRegion, result;

        sublevel = !_.isUndefined(sublevel) ? sublevel : Infinity;

        if (sublevel >= 0) {
            sublevel -= 1;

            for (i = 0, l = region._states.length; i < l; i += 1) {
                state = region._states[i];

                if (state === targetState) {
                    return state;
                }

                for (j = 0, m = state._regions.length; j < m; j += 1) {
                    subRegion = state._regions[j];
                    result = _findState(subRegion, targetState, sublevel);
                    if (!_.isUndefined(result)) {
                        return result;
                    }
                }
            }
        }
    }

    function _findDeepHistoryPseudoState(region) {
        var container;

        if (region.hasHistory(true)) {
            return region._historyPseudo;
        }

        container = region._getUpperContainer();
        if (!_.isNull(container)) {
            return _findDeepHistoryPseudoState(container);
        }
    }

    function _findFirstTransition(region, from) {
        var transits = region._transits;
        if (_.isUndefined(from)) {
            from = region._initialPseudo;

        } else if (from instanceof EntryPointPseudoState) {

        }

        return _.find(transits, function (transit) {
            return transit._source === from;
        });
    }

    function _findNextTransition(region, from, to) {
        var transits;

        transits = region._transits;
        return _.find(transits, function (transit) {
            if (!_.isUndefined(to)) {
                return transit._target === to && transit._source === from;

            } else if (transit._source instanceof FinalState) {
                return transit._source === from && !transit._locked;

            } else {
                return transit._source === from;
            }
        });
    }

    FSM = {
        Machine: Machine,
        State: State,
        Transition: Transition,
        Region: Region,

        InitialPseudoState: InitialPseudoState,
        FinalState: FinalState,
        SubMachine: SubMachine,
        HistoryPseudoState: HistoryPseudoState,
        TerminatePseudoState: TerminatePseudoState,
        ChoicePseudoState: ChoicePseudoState,

        EntryPointPseudoState: EntryPointPseudoState,
        ExitPointPseudoState: ExitPointPseudoState,
    };

    if (isNodeJS) {
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = FSM;
            }

            exports.FSM = FSM;
        }
    } else if (typeof window !== 'undefined') {
        window.FSM = FSM;
        
    } else if (typeof define === 'function' && define.amd) {
        define(function () {return FSM;});
    } 
}());