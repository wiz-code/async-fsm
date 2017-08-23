var _, uuid, Promise, logger, isNode, isFalsy, mixin, FSM, Model, Subject, Entity, Element, BaseState, State, Machine, FinalState, PseudoState, InitialPseudoState, HistoryPseudoState, ChoicePseudoState, EntryPointPseudoState, ExitPointPseudoState, Transition, Region;

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

isNode = !!(!_.isUndefined(process) && process.versions && process.versions.node);

isFalsy = _.negate(Boolean);

mixin = {
    accessor: {
        get: function (key) {
            return this._model.get(key);
        },

        set: function (key, value) {
            return this._model.set(key, value);
        },

        unset: function (key) {
            return this._model.unset(key);
        },

        extend: function (data) {
            return this._model.extend(data);
        },

        save: function () {
            this._model.save();
        },

        restore: function () {
            this._model.restore();
        },

        clear: function () {
            this._model.clear();
        },
    },
    
    helper: {
        $get: function (key) {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference._model.get(key);
            }
        },

        $set: function (key, value) {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference._model.set(key, value);
            }
        },

        $unset: function (key) {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference._model.unset(key);
            }
        },

        $extend: function (data) {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference._model.extend(data);
            }
        },

        $save: function () {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                reference._model.save();
                
            } else {
                return false;
            }
        },

        $restore: function () {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                reference._model.restore();
                
            } else {
                return false;
            }
        },

        $clear: function () {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                reference._model.clear();
                
            } else {
                return false;
            }
        },

        $getProps: function () {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference.props;
            }
        },

        $getMethods: function () {
            var reference = this.getReference();
            if (!_.isNull(reference)) {
                return reference.methods;
            }
        },

        $$get: function (key) {
            if (!_.isNull(this._container)) {
                return this._container._model.get(key);
            }
        },

        $$set: function (key, value) {
            if (!_.isNull(this._container)) {
                return this._container._model.set(key, value);
            }
        },

        $$unset: function (key) {
            if (!_.isNull(this._container)) {
                return this._container._model.unset(key);
            }
        },

        $$extend: function (data) {
            if (!_.isNull(this._container)) {
                return this._container._model.extend(data);
            }
        },

        $$save: function () {
            if (!_.isNull(this._container)) {
                this._container._model.save();
                
            } else {
                return false;
            }
        },

        $$restore: function () {
            if (!_.isNull(this._container)) {
                this._container._model.restore();
                
            } else {
                return false;
            }
        },

        $$clear: function () {
            if (!_.isNull(this._container)) {
                this._container._model.clear();
                
            } else {
                return false;
            }
        },

        $$getProps: function () {
            if (!_.isNull(this._container)) {
                return this._container.props;
            }
        },

        $$getMethods: function () {
            if (!_.isNull(this._container)) {
                return this._container.methods;
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

        $getProps: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $getMethods: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$get: function (key) {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$set: function (key, value) {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$unset: function (key) {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$extend: function (data) {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$save: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$restore: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$clear: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$getProps: function () {
            logger.error(this.constructor.name + 'インスタンスは内部データを保持できません。');
        },

        $$getMethods: function () {
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
    
    addObserver: function (type, observer) {
        if (_.isUndefined(this._observers[type])) {
            this._observers[type] = [];
        }
        this._observers[type].push(observer);
    },
    
    removeObserver: function (type, observer) {
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
    
    notify: function (type, event, param) {
		var observers, i, l, observer;
		observers = this._observers[type];
		
		if (_.isUndefined(observers)) {
            logger.warn('オブザーバーが登録されていません。');
            return;
		}
		
		for (i = 0, l = observers.length; i < l; i += 1) {
            observer = observers[i];
            if (_.isFunction(observer.update)) {
                observer.update.call(observer, event, param);
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
    
    this._model = new Model();
    this.props = {};
    this.methods = {};
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
    
    update: _.noop,
    
    _activate: function () {
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn(this.constructor.name + 'インスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        logger.info(this.constructor.name + 'インスタンス"' + this._name + '"がアクティブ化されました。');
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn(this.constructor.name + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        logger.info(this.constructor.name + 'インスタンス"' + this._name + '"が非アクティブ化されました。');
    },
    
}, mixin.accessor));

Element = function (name, options) {
    Entity.call(this, name);
    
    this._type = 'element';
    
    this._container = null;
    this._level = 0;
    
    options = _.defaults(options || {}, _.clone(Element.options));
    
    this._loop = options.loop;
    this._fps = options.fps;
    this._interval = 1000 / this._fps;
    this._timerId = 0;
    this._lastTime = 0;
};

Element.options = {
    loop: false,
    fps: 60,
};

Element.prototype = _.create(Entity.prototype, {
    constructor: Element,
    
    getCurrentLevel: function () {
        return _.isNull(this._container) ? 0 : this._container._level;
    },
    
    getReference: function () {
        var reference;
        if (this instanceof Machine) {
            reference = this;
            
        } else if (_.isNull(this._container)) {
            reference = null;
            
        } else {
            reference = this._container._reference
        }
        
        return reference;
    },
    
    setTimer: function (callback) {
        this._timerId = 0;
        this._lastTime = 0;
        this._repeat(callback);
    },
    
    clearTimer: function () {
        clearTimeout(this._timerId);
    },
    
    _repeat: function (callback) {
        var currentTime, deltaTime, timeToCall;
        currentTime = _.now();
        deltaTime = currentTime - this._lastTime;
        timeToCall = Math.max(this._interval - deltaTime, 0);
        
        this._lastTime = currentTime + timeToCall;
        
        this._timerId = setTimeout(_.bind(function () {
            currentTime = _.now();
            
            if (!this._loop) {
                callback();
                return;
            }
            
            callback(currentTime);
            this._repeat(callback);
            
        }, this), timeToCall);
        
        return this._timerId;
    },
});

BaseState = function (name, options) {
    Element.call(this, name, options);
	
    this._type = 'state';
    this._regions = [];
};

BaseState.prototype = _.create(Element.prototype, _.extend({
    constructor: BaseState,
    
    appendRegion: function (region) {
        if (_.isUndefined(region)) {
            region = new Region();
            
        } else if (!(region instanceof Region)) {
            logger.error('Regionインスタンスを指定してください。');
        }
        
        region._parent = this;
        this._regions.push(region);
        
        this.addObserver('regions', region);
        region.addObserver('parent', this);
        
        region._updateEntity();
        
        if (region._name === region._id) {
            region.setName(region._id + '-of-' + region._parent._name);
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
        
        this.removeObserver('regions', region);
        region.removeObserver('parent', this);
        
        region._updateEntity();
        
        return region;
    },
    
    _entry: function () {
        var i, j, l, m, region, state;
        
        this._activate();
        
        for (i = 0, l = this._regions.length; i < l; i += 1) {
            region = this._regions[i];
            
            if (!region.isActive()) {
                region._activate();
                
                for (j = 0, m = region._states.length; j < m; j += 1) {
                    state = region._states[j];
                    if (!state.isActive()) {
                        state._entry();
                    }
                }
            }
        }
    },
    
    _exit: function () {
        var i, j, l, m, region, state;
        
        for (i = 0, l = this._regions.length; i < l; i += 1) {
            region = this._regions[i];
            
            if (region.isActive()) {
                for (j = 0, m = region._states.length; j < m; j += 1) {
                    state = region._states[j];
                    if (state.isActive()) {
                        state._exit();
                    }
                }
                
                region._inactivate();
            }
        }
        
        this._inactivate();
    },
    
    update: function (event, callback) {
        var superState;
        
        switch (event) {
            case 'exit':
                this._exit();
                break;
                
            case 'explicit-entry':
                if (this.getCurrentLevel >= 1) {
                    superState = this._container._parent;
                    
                } else {
                    logger.error('Stateインスタンス"' + state._name + '"の「親」状態が存在しません。');
                }
                
                superState._entry(this);
                this.notify('machine', 'execute');
                break;
                
            case 'entry':
                this._entry(false);
                this.notify('machine', 'execute');
                break;
        }
    },
    
    completion: function () {
        this._inactivate();
        
        if (!_.isNull(this._container)) {
            this._container.completion();
            
        } else {
            logger.error('コンテナのRegionインスタンスが存在しません。');
        }
    },
}, mixin.helper));

State = function (name, options) {
    BaseState.call(this, name, options);
    
    options = _.defaults(options || {}, _.clone(State.options));
    
    if (_.isObject(options.data)) {
        this.extend(options.data);
    }
    
    this.save();
    
    if (_.isObject(options.props)) {
        _.extend(this.props, options.props);
    }
    
    if (_.isObject(options.methods)) {
        _.extend(this.methods, options.methods);
    }
    
    this._entryAction = options.entryAction;
    this._exitAction = options.exitAction;
    this._doActivity = options.doActivity;
    
    this._autoTransition = options.autoTransition;
    
    this.region = new Region('default-region-of-' + this._name);
    this.appendRegion(this.region);
};

State.options = {
    entryAction: _.noop,
    exitAction: _.noop,
    doActivity: _.noop,
    
    autoTransition: false,
};

State.prototype = _.create(BaseState.prototype, {
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
    
    completion: function () {
        var transit;
        
        if (!_.isNull(this._container)) {
            transit = _findNextTransition(this);
            if (!_.isUndefined(transit)) {
                transit.trigger();
            } else {
                this._exit();
                this._container.completion();
            }
        }
    },
    
    _activate: function () {
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn('Stateインスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        logger.info('Stateインスタンス"' + this._name + '"がアクティブ化されました。');
        
        this._entryAction();
        
        this.setTimer(_.bind(function (time) {
            this._doActivity(time);
            
            if (this._autoTransition) {
                this.completion();
            }
        }, this));
    },
    
    _inactivate: function () {
        this.clearTimer();
        
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('Stateインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        if (!_.isNull(this._container)) {
            this._container._previousState = this;
        }
        
        this._exitAction();
        logger.info('Stateインスタンス"' + this._name + '"が非アクティブ化されました。');
        
    },
    
    _entry: function (priority, history) {
        var priority, deepHistory, i, l, region, state;
        
        if (_.isUndefined(history)) {
            if (!_.isNull(this._container)) {
                deepHistory = _findHistoryPseudoState(this._container);
            }
            
            history = !_.isUndefined(deepHistory);
        }
        
        this._activate();
        
        for (i = 0, l = this._regions.length; i < l; i += 1) {
            region = this._regions[i];
            
            if (!region.isActive()) {
                region._activate();
                
                if (history) {
                    state = region._previousState || region._initialPseudo;
                    
                } else if (!_.isNull(region._historyPseudo)) {
                    state = region._previousState || region._initialPseudo;
                    
                    if (region._historyPseudo._isDeep) {
                        history = true;
                    }
                } else {
                    state = region._initialPseudo;
                }
                
                if (_.indexOf(region._states, priority) > -1) {
                    state = priority;
                }
                
                state._entry(priority, history);
            }
        }
    },
});

Machine = function (name, options) {
    State.call(this, name, options);
    
    options = _.defaults(options || {}, _.clone(Machine.options));
    
    this.entryPoint = null;
    this.exitPoint = null;
    
    this._stack = [];/////////////////////////////////////////////////////
    
    if (options.isSubMachine) {
        this.createSubMachine();
    }
};

Machine.options = {
    isSubMachine: false,
};

Machine._stack = {};

Machine.prototype = _.create(State.prototype, {
    constructor: Machine,
    
    start: function () {
        var callback;
        
        if (!this.isActive()) {
            _each(this, _.bind(function (entity) {
                if (!(entity instanceof Machine)) {
                    entity.addObserver('machine', this);
                }
                
                if (entity instanceof BaseState) {
                    
                } else if (entity instanceof Transition) {
                    
                } else if (entity instanceof Region) {
                    
                }
            }, this));
            
            this._stack.length = 0;
            
            //入場点をアクティブにする。
            logger.info('Machineインスタンス"' + this._name + '"が動作を開始しました。');
            this._entry(false);
            console.log('マシンの_entry()が終わった');
            callback = this._stack.pop();
            while (!_.isUndefined(callback)) {
                callback();
                callback = this._stack.pop()
            }
            
        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでに起動しています。');
        }
    },
    
    finish: function () {
        if (this.isActive()) {
            this.completion();
            
        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでに動作を終了しています。');
        }
    },
    
    completion: function () {//////////////////
        this._exit();
        logger.info('Machineインスタンス"' + this._name + '"が動作を終了しました。');
        //退場点をアクティブにする。
    },
    
    createSubMachine: function () {
        this.entryPoint = new EntryPointPseudoState();
        this.exitPoint = new ExitPointPseudoState();
        
        this.entryPoint.addObserver('machine', this);
        this.addObserver('exitPoint', this.exitPoint);
        
        this.entryPoint._machine = this;
        this.exitPoint._machine = this;
    },
    
    _activate: function () {
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        logger.info('Machineインスタンス"' + this._name + '"がアクティブ化されました。');
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('Machineインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        logger.info('Machineインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
    
    update: function (event, callback) {
        switch (event) {
            case 'stack':
                if (this.isActive()) {
                    this._stack.unshift(callback);
                }
                break;
                
            case 'execute':
                if (this.isActive()) {
                    callback = this._stack.pop();
                    while (!_.isUndefined(callback)) {
                        callback();
                        callback = this._stack.pop()
                    }
                }
                break;
        }
    },
});

FinalState = function (name) {
    BaseState.call(this, name);
};

FinalState.prototype = _.create(BaseState.prototype, _.extend({
    constructor: FinalState,
    
    _activate: function () {
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn('FinalStateインスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        logger.info('FinalStateインスタンス"' + this._name + '"がアクティブ化されました。');
        
        this.completion();
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('FinalStateインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        if (!_.isNull(this._container)) {
            this._container._previousState = null;
        }
        
        logger.info('FinalStateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
}, mixin.disable));

PseudoState = function (name) {
    BaseState.call(this, name);
    
    this._type = 'pseudo-state';
};

PseudoState.prototype = _.create(BaseState.prototype, _.extend({
    constructor: PseudoState,
}, mixin.disable));

InitialPseudoState = function (name) {
    PseudoState.call(this, name);
};

InitialPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: InitialPseudoState,
    
    _activate: function () {
        var transit;
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn('InitialPseudoStateインスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        logger.info('InitialPseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');
        
        if (!_.isNull(this._container)) {
            transit = _findFirstTransition(this._container);
            if (!_.isUndefined(transit)) {
                transit.trigger();
            }
        }
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('InitialPseudoStateインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        if (!_.isNull(this._container)) {
            this._container._previousState = null;
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
    
    completion: function () {
        logger.error('HistoryPseudoStateインスタンスは完了状態に移行できません。');
    },
});

ChoicePseudoState = function (name, condition) {
    PseudoState.call(this, name);
    
    this._condition = _.isFunction(condition) ? condition : _.noop;
};

ChoicePseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ChoicePseudoState,
    
    _activate: function () {
        var targetId;
        
        if (!this.isActive()) {
            this._status = 'active';
            
        } else {
            logger.warn('ChoicePseudoStateインスタンス"' + this._name + '"はすでにアクティブ化されています。');
            return;
        }
        
        targetId = this._condition();
        
        
        logger.info('ChoicePseudoStateインスタンス"' + this._name + '"がアクティブ化されました。');
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('ChoicePseudoStateインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        logger.info('ChoicePseudoStateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
});

EntryPointPseudoState = function (name) {
    PseudoState.call(this, name);
    
    this._machine = null;
};

EntryPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: EntryPointPseudoState,
});

ExitPointPseudoState = function (name) {
    PseudoState.call(this, name);
    
    this._machine = null;
};

ExitPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ExitPointPseudoState,
});

Transition = function (name, source, target, options) {
    Element.call(this, name, options);
    
	this._type = 'transition';
    
    if (source instanceof BaseState || isFalsy(source)) {
        this._rawSource = source;
        
    } else {
        logger.error('第2引数に遷移元のStateインスタンス、またはfalseを指定してください。');
    }
    
    if (target instanceof BaseState || isFalsy(target)) {
        this._rawTarget = target;
        
    } else {
        logger.error('第3引数に遷移元のStateインスタンス、またはfalseを指定してください。');
    }
    
    options = _.defaults(options || {}, _.clone(Transition.options));
    
    if (_.isObject(options.data)) {
        this.extend(options.data);
    }
    
    this.save();
    
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
    
    locked: false,
    explicitEntry: false,
};

Transition.prototype = _.create(Element.prototype, _.extend({
    constructor: Transition,
    
    trigger: function () {
        this.notify('machine', 'stack', _.bind(function () {
        var message;
        
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
            if (!this._guard()) {
                logger.info('ガードが成立しませんでした。遷移は発生しません。');
                return;
            }
        }
        
        if (this._internal) {
            if (!_.isNull(this._effect)) {
                this._effect();
            }
            logger.info('内部遷移を実行しました。');
            return;
        }
        
        this._activate();
        this.notify('source-state', 'exit');
        
        /* エフェクト発動 */
        if (!_.isNull(this._effect)) {
            this._effect();
        }
        
        message = this._explicitEntry ? 'explicit-entry' : 'entry';
        debugger;this.notify('target-state', message);
        
        this._inactivate();
        }, this));
    },
}, mixin.helper));

Region = function (name, options) {
    Entity.call(this, name);
    
	this._type = 'region';
    
    options = options || {};
    
    if (_.isObject(options.data)) {
        this.extend(options.data);
    }
    
    this.save();
    
    this._parent = null;
    this._level = 0;
    
	this._historyPseudo = null;
	this._previousState = null;
    
	this._states = [];
	this._transits = [];
    
	this._initialPseudo = new InitialPseudoState('initial-pseudo-state-of-' + this._name);
	this._final = new FinalState('final-state-of-' + this._name);
	
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
        var states, i, l, state;
        states = _.toArray(arguments);
        
        for (i = 0, l = states.length; i < l; i += 1) {
            state = states[i];
            
            if (!(state instanceof BaseState)) {
                logger.error('Stateインスタンスを指定してください。');
            }
            
            if (state instanceof HistoryPseudoState) {
                this._historyPseudo = state;
            }
            
            this._states.push(state);
            this._states[state._id] = state;
            this.addObserver('states', state);
            
            state._container = this;
            state.addObserver('container', this);
            
            _.invoke(state._regions, '_updateEntity');
            
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
                this.removeObserver('states', state);

                state._container = null;
                state.addObserver('container', this);
                
                _.invoke(state._regions, '_updateEntity');
            }
        }
        
        return states.length > 1 ? states : _.first(states);
    },
    
    addTransition: function () {
        var transits, i, l, transit, result;
        transits = _.toArray(arguments);
        
        for (i = 0, l = transits.length; i < l; i += 1) {
            transit = transits[i];
            
            if (!(transit instanceof Transition)) {
                logger.error('Transitionインスタンスを指定してください。');
            }
            
            if (transit._rawSource instanceof InitialPseudoState || isFalsy(transit._rawSource)) {
                transit._source = this._initialPseudo;
                
            } else {
                if (_.indexOf(this._states, transit._rawSource) === -1) {
                    logger.error('遷移元のStateインスタンスが見つかりません。');
                }
                
                transit._source = transit._rawSource;
            }
            
            if (transit._rawTarget instanceof FinalState || isFalsy(transit._rawTarget)) {
                transit._target = this._final;
                
            } else {
                if (transit._explicitEntry) {
                    result = _findState(this, transit._rawTarget);
                    
                    if (_.isUndefined(result)) {
                        logger.error('遷移先のStateインスタンスが見つかりません。');
                    }
                    
                    if (state.getCurrentLevel() - this._level !== 1) {
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
            this.addObserver('transits', transit);
            
            transit._container = this;
            transit.addObserver('container', this);
            
            ////////////
            /////
            transit._source.addObserver('outgoing-transits', transit);
            transit._target.addObserver('incoming-transits', transit);
            
            transit.addObserver('source-state', transit._source);
            transit.addObserver('target-state', transit._target);///////////
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
                this.removeObserver('transits', transit);
                
                transit._source = null;
                transit._target = null;
                
                transit._container = null;
                transit.removeObserver('container', this);
                
                //////
                ////////////
                transit._source.removeObserver('outgoing-transits');
                transit._target.removeObserver('incoming-transits');
                
                transit.removeObserver('source-state', transit._source);
                transit.removeObserver('target-state', transit._target);//////
            }
        }
        
        return states.length > 1 ? states : _.first(states);
    },
    
    _updateEntity: function (reference) {
        var i, j, l, m, state, region;
        
        if (_.isNull(this._parent)) {
            this._level = 0;
            
        } else {
            this._level = this._parent.getCurrentLevel() + 1;
        }
        
        if (_.isUndefined(reference)) {
            if (_.isNull(this._parent)) {
                reference = null;
                
            } else {
                reference = this._parent.getReference();
            }
        }
        
        this._reference = reference;
        
        for (i = 0, l = this._states.length; i < l; i += 1) {
            state = this._states[i];
            
            for (j = 0, m = state._regions.length; j < m; j += 1) {
                region = state._regions[j];
                region._updateEntity(reference);
            }
        }
    },
    
    update: function (event, state) {
        //////
    },
    
    completion: function () {
        this._inactivate();
        if (!_.isNull(this._parent)) {
            if (_.every(this._parent._regions, function (region) {
                return !region.isActive();
            })) {
                this._parent.completion();
            }
        } else {
            logger.error('Regionインスタンス"' + this._name + '"の「親」状態が存在しません。');
        }
        
    },
});

function _each(state, callback) {
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
            _each(subState, callback);
        }
    }
}

function _findState(region, object) {
    var i, j, l, m, state, subRegion;
    
    for (i = 0, l = region._states.length; i < l; i += 1) {
        state = region._states[i];
        
        if (state === object) {
            return state;
        }
        
        for (j = 0, m = state._regions.length; j < m; j += 1) {
            subRegion = state._regions[j];
            return _findState(subRegion, object);
        }
    }
}

function _findHistoryPseudoState(region) {
    var superState;
    
    if (!_.isNull(region._historyPseudo)) {
        return region._historyPseudo;
    }
    
    superState = region._parent;
    if (!_.isNull(superState._container)) {
        return _findHistoryPseudoState(superState._container);
    }
}

function _findFirstTransition(region) {
    var transits = region._transits;
    return _.find(transits, function (transit) {
        return transit._source === region._initialPseudo; 
    });
}

function _findNextTransition(state) {
    var container, transits;
    container = state._container;
    
    if (!_.isNull(container)) {
        transits= container._transits;
        return _.find(transits, function (transit) {
            return transit._source === state && !transit._locked;
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

if (isNode) {
    module.exports = FSM;
    
} else if (!_.isUndefined(window)) {
    window.FSM = FSM;   
}

