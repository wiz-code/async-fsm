/* Async-FSM.js
 * version 0.0.1
 * 
 * Copyright (c) 2017 Masa (http://wiz-code.digick.jp)
 * LICENSE: MIT license
 */

var _, uuid, Promise, logger, isNodeJS, isFalsy, mixin, FSM, Model, Subject, Entity, Node, ProtoState, State, Machine, FinalState, SubMachine, PseudoState, InitialPseudoState, HistoryPseudoState, ChoicePseudoState, EntryPointPseudoState, ExitPointPseudoState, Transition, Region;

_ = require('../node_modules/underscore');
uuid = require('../node_modules/uuid/v4');
Promise = require('../node_modules/bluebird');

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
            if (!_.isNull(this._container)) {
                return this._container.model.get(key);
            }
        },

        $set: function (key, value) {
            if (!_.isNull(this._container)) {
                return this._container.model.set(key, value);
            }
        },

        $unset: function (key) {
            if (!_.isNull(this._container)) {
                return this._container.model.unset(key);
            }
        },

        $extend: function (data) {
            if (!_.isNull(this._container)) {
                return this._container.model.extend(data);
            }
        },

        $save: function () {
            if (!_.isNull(this._container)) {
                this._container.model.save();
                
            } else {
                return false;
            }
        },

        $restore: function () {
            if (!_.isNull(this._container)) {
                this._container.model.restore();
                
            } else {
                return false;
            }
        },

        $clear: function () {
            if (!_.isNull(this._container)) {
                this._container.model.clear();
                
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

        $props: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $methods: function () {
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
        
        completion: function (region) {
            logger.error(this.constructor.name + 'インスタンスは完了状態に移行できません。');
        },
    },
    
    descriptors: {
        $props: {
            enumerable: true,
            get: function () {
                if (!_.isNull(this._container)) {
                    return this._container.props;
                }
            },
        },
        
        $methods: {
            enumerable: true,
            get: function () {
                if (!_.isNull(this._container)) {
                    return this._container.methods;
                }
            },
        },
    },
};

Model = function (data) {
    this._data = {};
    this._cache = null;
    
    if (_.isObject(data)) {
        this._data = this._extendDeep(this._data, data);
    }
};

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

Subject = function () {
    this._observers = {};
};

Subject.prototype = _.create(Object.prototype, {
    constructor: Subject,
    
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

Entity = function (name) {
    Subject.call(this);
    
    this._id = uuid();
    this._name = !isFalsy(name) ? name : this._id;
    this._type = 'entity';
    this._status = 'inactive';
    
    this.model = new Model();
    this.props = {};
    this.methods = {};
    
    this._setObserverType('controller');
};

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

Node = function (name) {
    Entity.call(this, name);
    
    this._type = 'node';
    
    this._container = null;
    this._reference = null;
    this._level = 0;
    
    this._setObserverType('container');
    
    Object.defineProperties(this, mixin.descriptors);
};

Node.prototype = _.create(Entity.prototype, _.extend({
    constructor: Node,
    
    getContainer: function () {
        return this._container;
    },
    
    getCurrentLevel: function () {
        return this._level;
    },
    
    getReference: function () {
        return this._reference;
    },
    
    _async: function (callback) {
        this._notify('controller', 'async', _.bind(function () {
            _.bind(callback, this)();
            return Promise.resolve();
        }, this));
    },
}, mixin.helper));

ProtoState = function (name) {
    Node.call(this, name);
	
    this._type = 'state';
    this._regions = [];
    
    this._setObserverType('regions');
};

ProtoState.prototype = _.create(Node.prototype, {
    constructor: ProtoState,
    
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
                this._entry();
                break;
                
            case 'exit':
                this._exit();
                break;
                
            case 'update-relation':
                this._updateRelation.apply(this, args);
                break;
                
            case 'completion':
                this.completion();
                break;
        }
    },
    
    _updateRelation: function (currentLevel, reference) {
        this._level = currentLevel;
        this._reference = reference;
        
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
});

State = function (name, options) {
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
    this._isSimple = false;///////////////////////////////////////////////////////
    
    this._loop = options.loop;
    this._fps = options.fps;
    this._interval = 1000 / this._fps;
    
    this._timerId = 0;
    this._lastCallTime = 0;
    
    this.region = new Region('default-region-of-' + this._name);
    this.appendRegion(this.region);
};

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
    
    addState: function () {
        var states = _.toArray(arguments);
        return this.region.addState.apply(this.region, states);
    },
    
    removeState: function () {
        var states = _.toArray(arguments);
        return this.region.removeState.apply(this.region, states);
    },
    
    addTransition: function () {
        var transits = _.toArray(arguments);
        return this.region.addTransition.apply(this.region, transits);
    },
    
    removeTransition: function () {
        var transits = _.toArray(arguments);
        return this.region.removeTransition.apply(this.region, transits);
    },
    
    appendRegion: function (region) {
        var currentLevel, reference;
        
        if (_.isUndefined(region)) {
            region = new Region();
            
        } else if (!(region instanceof Region)) {
            logger.error('Regionインスタンスを指定してください。');
        }
        
        region._parent = this;
        this._regions.push(region);
        
        this._addObserver('regions', region);
        region._addObserver('parent', this);
        
        region._update('update-relation');
        
        if (region._name === region._id) {
            region.setName(region._id + '-of-' + this._name);
        }
        
        return region;
    },
    
    removeRegion: function (region) {
        var index;
        
        if (!(region instanceof Region)) {
            logger.error('Regionインスタンスを指定してください。');
        }
        
        if (region === this.region) {
            logger.error('デフォルトのRegionインスタンスは削除できません。');
        }
        
        region._parent = null;
        
        index = _.indexOf(this._regions, region);
        if (index > -1) {
            this._regions.splice(index, 1);
            
        } else {
            logger.error('削除対象のRegionインスタンスが見つかりません。');
        }
        
        region._update('update-relation');
        
        this._removeObserver('regions', region);
        region._removeObserver('parent', this);
        
        return region;
    },
    
    completion: function () {
        this._async(function () {
            var transit;

            if (this.isActive()) {
                if (!_.isNull(this._container)) {
                    transit = _findNextTransition(this);
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
    
    getRegion: function (index) {
        if (!_.isUndefined(index)) {
            return this._regions[index];
            
        } else {
            this._region;
        }
    },
    
    _update: function (event) {
        var args = _.toArray(arguments).slice(1);
        
        switch (event) {
            case 'entry':
                this._entry.apply(this, args);
                break;
                
            case 'exit':
                this._exit();
                break;
                
            case 'update-relation':
                this._updateRelation.apply(this, args);
                break;
                
            case 'completion':
                this.completion();
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
        var reference, model, props, methods;
        
        reference = this.getReference();
        if (!_.isNull(reference)) {
            model = reference.model;
            props = reference.props;
            methods = reference.methods;
            
        } else {
            logger.info('Machineインスタンスの参照が存在しません。');
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
        var reference, model, props, methods;
        
        reference = this.getReference();
        if (!_.isNull(reference)) {
            model = reference.model;
            props = reference.props;
            methods = reference.methods;
            
        } else {
            logger.info('Machineインスタンスの参照が存在しません。');
        }
        
        this._clearTimer();
        
        if (!_.isNull(this._container)) {
            this._notify('container', 'set-previous-state', this);
        }
        
        this._exitAction(model, props, methods);
        
        this._status = 'inactive';
        logger.info(this.constructor.name + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
        
    },
    
    _entry: function (priority, history) {
        var priority, deepHistory, i, l, region, state;
        
        if (!this.isActive()) {
            if (_.isUndefined(history)) {
                if (!_.isNull(this._container)) {
                    deepHistory = _findHistoryPseudoState(this._container);
                }
                
                history = !_.isUndefined(deepHistory);
            }
            
            this._activate();
            this._notify('regions', 'entry', priority, history);
        }
    },
    
});

Machine = function (name, options) {
    State.call(this, name, options);
    
    options = _.defaults(options || {}, _.clone(Machine.options));
    
    this._deployed = false;
    this._promise = null;
    
    this._links = [];
    this._connectionPoints = [];
    
    this._setObserverType('outbound');
};

Machine.prototype = _.create(State.prototype, {
    constructor: Machine,
    
    deploy: function () {
        this._deployed = true;
        
        this._promise = Promise.resolve();
        this._updateRelation(0, this);
        
        _eachEntity(this, _.bind(function (entity) {
            if (!(entity instanceof Machine)) {
                entity._addObserver('controller', this);
            }
            
            if (entity instanceof ProtoState) {
                //
            } else if (entity instanceof Transition) {
                //
            } else if (entity instanceof Region) {
                //
            }
        }, this));
        
        return this;
    },
    
    undeploy: function () {
        this._deployed = false;
        this._promise = null;
        
        _eachEntity(this, _.bind(function (entity) {
            if (!(entity instanceof Machine)) {
                entity._removeObserver('controller', this);
            }
            
            if (entity instanceof ProtoState) {
                //
            } else if (entity instanceof Transition) {
                //
            } else if (entity instanceof Region) {
                //
            }
        }, this));
        
        this._updateRelation(0, null);
        
        return this;
    },
    
    start: function () {
        if (!this._deployed) {
            logger.error('start()の前にdeploy()メソッドを実行してください。');
        }
        
        if (!this.isActive()) {
            logger.info('Machineインスタンス"' + this._name + '"が動作を開始しました。');
            
            this._stackPromise(_.bind(function () {
                this._entry();
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
    
    createConnectionPoint: function (region) {
        var id, entryPoint, exitPoint, connectionPoint;
        
        if (_.isUndefined(region)) {
            region = this.region;
            
        } else if (!_.contains(this._regions, region)) {
            logger.error('Regionインスタンス"' + this._name + '"が見つかりません。');
        }
        
        id = uuid();
        entryPoint = new EntryPointPseudoState(false, id);
        exitPoint = new ExitPointPseudoState(false, id);
        
        region.addState(entryPoint, exitPoint);
        
        connectionPoint = {
            entry: entryPoint,
            exit: exitPoint,
        };
        
        this._connectionPoints.push(connectionPoint);
        
        return connectionPoint;
    },
    
    deleteConnectionPoint: function () {
        //TODO
    },
    
    _stackPromise: function (callback) {
        this._promise = this._promise.then(callback, this._onRejected).catch(this._onError);
    },
    
    _update: function (event, callback) {
        var args = _.toArray(arguments).slice(1);
        
        switch (event) {
            case 'async':
                this._stackPromise(callback);
                break;
                
            case 'entry':
                this._entry();
                break;
                
            case 'exit':
                this._exit();
                break;
                
            case 'update-relation':
                this._updateRelation(0, this);
                break;
                
            case 'completion':
                this.completion();
                break;
        }
    },
    
    _onRejected: function (e) {
        return Promise.reject(e);
    },
    
    _onError: function (e) {
        logger.info(e);
    },
    
    _activate: function () {
        this._status = 'active';
        logger.info('Machineインスタンス"' + this._name + '"がアクティブ化されました。');
    },
    
    _inactivate: function () {
        this._status = 'inactive';
        logger.info('Machineインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
    
    _entry: function () {
        if (!this.isActive()) {
            this._activate();
            this._notify('regions', 'entry');
        }
    },
});

FinalState = function (name) {
    ProtoState.call(this, name);
};

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

SubMachine = function (name) {
    ProtoState.call(this, name);
    
    this._link = null;
    this._entryPoint = null;
    this._exitPoint = null;
    
    this._setObserverType('inbound');
};

SubMachine.prototype = _.create(ProtoState.prototype, _.extend({
    constructor: SubMachine,
    
    addLink: function (machine, connectionPoint) {
        if (!(machine instanceof Machine)) {
            logger.error('Machineインスタンスを指定してください。');
        }
        
        this._link = machine;
        this._addObserver('outbound', machine);
        
        machine._links.push(this);
        machine._links[this._id] = this;
        machine._addObserver('inbound', this);
        
        this._entryPoint = connectionPoint;
        
    },
    
    removeLink: function () {
        
    },
    
    completion: function () {
        
    },
    
    _update: function () {
        var args = _.toArray(arguments).slice(1);
        
        switch (event) {
            case '':
                
                break;
        }
    },
    
    _entry: function () {
        if (!this.isActive()) {
            this._activate();
            this._notify('outbound', 'entry');
        }
    },
    
    _exit: function () {
        if (this.isActive()) {
            //this._notify('regions', 'exit');
            this._inactivate();
        }
    },
    
    _activate: function () {
        this._status = 'active';
        logger.info('FinalStateインスタンス"' + this._name + '"がアクティブ化されました。');
        
    },
    
    _inactivate: function () {
        this._status = 'inactive';
        
        if (!_.isNull(this._container)) {
            this._notify('container', 'set-previous-state', null);
        }
        
        logger.info('FinalStateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
}, mixin.disable));


PseudoState = function (name) {
    ProtoState.call(this, name);
    
    this._type = 'pseudo-state';
};

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

InitialPseudoState = function (name) {
    PseudoState.call(this, name);
};

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
            }
        }
    },
    
    _inactivate: function () {
        this._status = 'inactive';
        
        if (!_.isNull(this._container)) {
            this._notify('container', 'set-previous-state', null);
        }
        
        logger.info('InitialPseudoStateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
});

HistoryPseudoState = function (name, deep) {
    PseudoState.call(this, name);
    
    this._isDeep = !_.isUndefined(deep) ? deep : false;
};

HistoryPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: HistoryPseudoState,
});

ChoicePseudoState = function (name, condition) {
    PseudoState.call(this, name);
    
    this._condition = _.isFunction(condition) ? condition : _.noop;
};

ChoicePseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ChoicePseudoState,
    
    _activate: function () {
        var reference, model, props, methods, target, transit;
        
        reference = this.getReference();
        if (!_.isNull(reference)) {
            model = reference.model;
            props = reference.props;
            methods = reference.methods;
            
        } else {
            logger.info('Machineインスタンスの参照が存在しません。');
        }
        
        this._status = 'active';
        logger.info('ChoicePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');
        
        target = this._condition(model, props, methods);
        if (!target instanceof State) {
            logger.error('遷移先のStateインスタンスが存在しません。');
        }
        
        if (!_.isNull(this._container)) {
            transit = _findNextTransition(this, target);
            if (!_.isUndefined(transit)) {
                transit.trigger();
                
            } else {
                this._exit();
                this._notify('container', 'completion');
            }
        } else {
            logger.error(this.constructor.name + 'インスタンス"' + this._name + '"のコンテナが存在しません。');
        }
    },
});

EntryPointPseudoState = function (name) {
    PseudoState.call(this, name);
};

EntryPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: EntryPointPseudoState,
    
    _activate: function () {
        var transit;
        
        this._status = 'active';
        logger.info('EntryPointPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');
        
        if (!_.isNull(this._container)) {
            transit = _findNextTransition(this);
            if (!_.isUndefined(transit)) {
                transit.trigger();
            }
        }
    },
});

ExitPointPseudoState = function (name) {
    PseudoState.call(this, name);
};

ExitPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ExitPointPseudoState,
});

Transition = function (name, source, target, options) {
    Node.call(this, name);
    
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
    this._explicitEntry = options.explicitEntry;
};

Transition.options = {
    guard: null,
    effect: null,
    internal: false,
    
    locked: true,
    explicitEntry: false,
};

Transition.prototype = _.create(Node.prototype, {
    constructor: Transition,
    
    trigger: function () {
        var reference, model, props, methods;
        
        reference = this.getReference();
        if (!_.isNull(reference)) {
            model = reference.model;
            props = reference.props;
            methods = reference.methods;

        } else {
            logger.info('Machineインスタンスの参照が存在しません。');
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
                        this._effect();
                    }
                });

                return;
            } else {
                logger.error('遷移元と遷移先は同じStateインスタンスを指定してください。');
            }
        }
        
        this._async(function () {
            var superState;

            this._async(function () {
                if (!this.isActive()) {
                    this._activate();

                } else {
                    logger.error('Transitionインスタンス"' + this._name + '"はすでにアクティブ化されています。');
                }
            });

            this._async(function () {
                if (this._source.isActive()) {
                    this._source._exit();
                } else {
                    logger.error('遷移元' + this._target.constructor.name + 'インスタンス"' + this._target._name + '"が非アクティブです。');
                }
            });

            this._async(function () {
                if (!_.isNull(this._effect)) {
                    this._effect(model, props, methods);
                }
            });

            this._async(function () {
                if (!this._target.isActive()) {
                    if (this._explicitEntry) {
                        if (!_.isNull(this._target._container) && !_.isNull(this._target._container._parent)) {
                            superState = this._target._container._parent;
                            superState._entry(this._target);

                        } else {
                            logger.error(this._target.constructor.name + 'インスタンス"' + this._target._name + '"の「親」状態が存在しません。');
                        }
                    } else {
                        this._target._entry();
                    }
                } else {
                    logger.error('遷移先' + this._target.constructor.name + 'インスタンス"' + this._target._name + '"がアクティブです。');
                }
            });

            this._async(function () {
                if (this.isActive()) {
                    this._inactivate();

                } else {
                    logger.error('Transitionインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
                }
            });
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
    
    _updateRelation: function (currentLevel, reference) {
        this._level = currentLevel;
        this._reference = reference;
    },
});

Region = function (name, options) {
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
    
	this._historyPseudo = null;
	this._previousState = null;
    
	this._states = [];
	this._transits = [];
    
    this._setObserverType('parent', 'states', 'transits');
    
	this._initialPseudo = new InitialPseudoState('initial-pseudo-state-in-' + this._name);
	this._final = new FinalState('final-state-in-' + this._name);
	
	this.addState(this._initialPseudo, this._final);
};

Region.prototype = _.create(Entity.prototype, {
    constructor: Region,
    
    getIndex: function () {
        var result = -1;
        
        if (_.isNull(this._parent)) {
            _.indexOf(this._parent._regions, this);
        }
        
        return result;
    },
    
    /* 引数にStateインスタンスを複数指定可 */
	addState: function () {
        var states, i, l, state, currentLevel, reference;
        states = _.toArray(arguments);
        
        for (i = 0, l = states.length; i < l; i += 1) {
            state = states[i];
            
            if (!(state instanceof ProtoState)) {
                logger.error('Stateインスタンスを指定してください。');
            }
            
            if (state instanceof HistoryPseudoState) {
                this._historyPseudo = state;
            }
            
            this._states.push(state);
            this._states[state._id] = state;
            this._addObserver('states', state);
            
            state._container = this;
            state._addObserver('container', this);
            
            currentLevel = this._getParentLevel() + 1;
            reference = this._getReference();
            
            state._updateRelation(currentLevel, reference);
            
            if (state._name === state._id) {
                state.setName(state._id + '-of-' + state._container._name);
            }
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
        var transits, i, l, transit, result, currentLevel, reference;
        transits = _.toArray(arguments);
        
        for (i = 0, l = transits.length; i < l; i += 1) {
            transit = transits[i];
            
            if (!(transit instanceof Transition)) {
                logger.error('Transitionインスタンスを指定してください。');
            }
            
            if (transit._rawSource === InitialPseudoState || isFalsy(transit._rawSource)) {
                transit._source = this._initialPseudo;
                
            } else {
                if (_.indexOf(this._states, transit._rawSource) === -1) {
                    logger.error('遷移元のStateインスタンスが見つかりません。');
                }
                
                transit._source = transit._rawSource;
            }
            
            if (transit._rawTarget === FinalState || isFalsy(transit._rawTarget)) {
                transit._target = this._final;
                
            } else {
                if (transit._explicitEntry) {
                    result = _findState(this, transit._rawTarget);
                    
                    if (_.isUndefined(result)) {
                        logger.error('遷移先のStateインスタンスが見つかりません。');
                    }
                    
                    if (transit._rawTarget._level - transit._source._level !== 1) {
                        logger.error('明示的入場の場合、遷移先は同階層の状態のサブ状態を指定します。');
                    }
                    
                    transit._target = transit._rawTarget;
                } else {
                    if (_.indexOf(this._states, transit._rawTarget) === -1) {
                        logger.error('遷移先のStateインスタンスが見つかりません。');
                    }
                    
                    transit._target = transit._rawTarget;
                }
            }
            
            this._transits.push(transit);
            this._transits[transit._id] = transit;
            this._addObserver('transits', transit);
            
            transit._container = this;
            transit._addObserver('container', this);
            
            currentLevel = this._getParentLevel() + 1;
            reference = this._getReference();
            
            transit._updateRelation(currentLevel, reference);
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
        
        return states.length > 1 ? states : _.first(states);
    },
    
    _update: function (event) {
        var args = _.toArray(arguments).slice(1);
        
        switch (event) {
            case 'entry':
                this._entry.apply(this, args);
                break;
                
            case 'exit':
                this._exit();
                break;
                
            case 'update-relation':
                this._updateRelation();
                break;
                
            case 'completion':
                this._completion();
                break;
                
            case 'set-previous-state':
                this._setPreviousState(args[0]);
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
    
    _getReference: function () {
        var result = null;
        if (!_.isNull(this._parent)) {
            result = this._parent._reference;
        }
        
        return result;
    },
    
    _updateRelation: function () {
        var currentLevel, reference;
        
        currentLevel = this._getParentLevel() + 1;
        reference = this._getReference();
        
        this._notify('states', 'update-relation', currentLevel, reference);
        this._notify('transits', 'update-relation', currentLevel, reference);
    },
    
    _setPreviousState: function (state) {
        this._previousState = state;
        return state;
    },
    
    _entry: function (priority, history) {
        var state;
        
        if (!this.isActive()) {
            this._activate();
            
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
            
            if (_.indexOf(this._states, priority) > -1) {
                state = priority;
            }
            
            state._update('entry', priority, history);
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
});

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

function _findState(region, object) {
    var i, j, l, m, state, subRegion, result;
    
    for (i = 0, l = region._states.length; i < l; i += 1) {
        state = region._states[i];
        
        if (state === object) {
            return state;
        }
        
        for (j = 0, m = state._regions.length; j < m; j += 1) {
            subRegion = state._regions[j];
            result = _findState(subRegion, object);
            if (!_.isUndefined(result)) {
                return result;
            }
        }
    }
}

function _findHistoryPseudoState(region) {
    var superState;
    
    if (!_.isNull(region._historyPseudo)) {
        return region._historyPseudo;
    }
    
    superState = region._parent;
    if (!_.isNull(superState) && !_.isNull(superState._container)) {
        return _findHistoryPseudoState(superState._container);
    }
}

function _findFirstTransition(region) {
    var transits = region._transits;
    return _.find(transits, function (transit) {
        return transit._source === region._initialPseudo; 
    });
}

function _findNextTransition(from, to) {
    var container, transits;
    container = from._container;
    
    if (!_.isNull(container)) {
        transits = container._transits;
        return _.find(transits, function (transit) {
            if (!_.isUndefined(to)) {
                return transit._target === to && transit._source === from;
                
            } else {
                return transit._source === from && !transit._locked;
            }
        });
    }
}

FSM = {
    Machine: Machine,
    State: State,
    Transition: Transition,
    Region: Region,
    
    InitialPseudoState: InitialPseudoState,
    FinalState: FinalState,
    HistoryPseudoState: HistoryPseudoState,
    ChoicePseudoState: ChoicePseudoState,
    
    EntryPointPseudoState: EntryPointPseudoState,
    ExitPointPseudoState: ExitPointPseudoState,
};

if (isNodeJS) {
    module.exports = FSM;
    
} else if (!_.isUndefined(window)) {
    window.FSM = FSM;   
}

