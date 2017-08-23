var _, uuid, logger, isNode, mixin, FSM, Model, Subject, Entity, Element, BaseState, State, Machine, FinalState, PseudoState, InitialPseudoState, HistoryPseudoState, ChoicePseudoState, EntryPointPseudoState, ExitPointPseudoState, Transition, Region;

_ = require('../node_modules/underscore');
uuid = require('../node_modules/uuid/v4');

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
    this._name = !_isFalsy(name) ? name : this._id;
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

Element = function () {
    Entity.call(this, name);
    
    this._type = 'element';
    
    this._container = null;
    this._level = 0;
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
});

BaseState = function (name) {
    Element.call(this, name);
	
    this._type = 'state';
    this._regions = [];
};

BaseState.prototype = _.create(Element.prototype, _.extend({
    constructor: BaseState,
    
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
    BaseState.call(this, name);
    
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
    this.region = this.appendRegion();
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
    
    appendRegion: function (region) {
        if (_.isUndefined(region)) {
            region = new Region();
            
        } else if (!region instanceof Region) {
            logger.error('Regionインスタンスを指定してください。');
        }
        
        region._parent = this;
        this._regions.push(region);
        
        this.addObserver('regions', region);
        region.addObserver('parent', this);
        
        region._updateEntity();
        
        return region;
    },
    
    removeRegion: function (region) {
        var index;
        
        if (!region instanceof Region) {
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
    
    completion: function () {
        var transit;
        
        this._exit();
        
        if (!_.isNull(this._container)) {
            transit = _findNextTransition(this._container);
            if (!_.isUndefined(transit)) {
                transit.trigger();

            } else {
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
        
        _.defer(_.bind(function () {
            if (!this.isActive()) {
                logger.warn('Stateインスタンス"' + this._name + '"はすでに非アクティブ化されています。DoActivity()は実行されません。');
                return;
            }
            
            this._doActivity();
            
            if (this._autoTransition) {
                this.completion();
            }
        }, this));
    },
    
    _inactivate: function () {
        if (this.isActive()) {
            this._status = 'inactive';
            
        } else {
            logger.warn('Stateインスタンス"' + this._name + '"はすでに非アクティブ化されています。');
            return;
        }
        
        if (!_.isNull(this._container)) {
            this._container._previousState = this;
        }
        
        /* 退場時の振る舞いを実行 */
        this._exitAction();
        
        logger.info('Stateインスタンス"' + this._name + '"が非アクティブ化されました。');
    },
    
    _entry: function (currentState, history) {
        var result, i, l, region, state;
        
        if (_.isUndefined(currentState)) {
            currentState = this;
        }
        
        if (_.isUndefined(history)) {
            if (!_.isNull(currentState._container)) {
                result = _findHistoryPseudoState(currentState._container);
            }
            
            history = !_.isUndefined(result);
        }
        
        currentState._activate();
        
        for (i = 0, l = currentState._regions.length; i < l; i += 1) {
            region = currentState._regions[i];
            
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
                
                if (_.indexOf(region._states, this) > -1) {
                    state = this;
                }
                
                this._entry(state, history);
            }
        }
    },
});

Machine = function (name, options) {
    State.call(this, name, options);
    
    options = _.defaults(options || {}, _.clone(Machine.options));
    
    this.entryPoint = null;
    this.exitPoint = null;
    
    if (options.isSubMachine) {
        this.createSubMachine();
    }
};

Machine.options = {
    isSubMachine: false,
};

Machine.prototype = _.create(State.prototype, {
    constructor: Machine,
    
    start: function () {
        if (!this.isActive()) {
            //入場点をアクティブにする。
            
            logger.info('Machineインスタンス"' + this._name + '"が動作を開始しました。');
            this._entry();
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
    
    completion: function () {
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
    
    update: function (event) {
        switch (event) {
            case 'entry':
                console.log();
                break;
        }
    },
});

FinalState = function () {
    BaseState.call(this);
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

PseudoState = function () {
    BaseState.call(this);
    
    this._type = 'pseudo-state';
};

PseudoState.prototype = _.create(BaseState.prototype, _.extend({
    constructor: PseudoState,
}, mixin.disable));

InitialPseudoState = function () {
    PseudoState.call(this);
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

HistoryPseudoState = function (deep) {
    PseudoState.call(this);
    
    this._isDeep = !_.isUndefined(deep) ? deep : false;
};

HistoryPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: HistoryPseudoState,
    
    completion: function () {
        logger.error('HistoryPseudoStateインスタンスは完了状態に移行できません。');
    },
});

ChoicePseudoState = function (condition) {
    PseudoState.call(this);
    
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

EntryPointPseudoState = function (condition) {
    PseudoState.call(this);
    
    this._machine = null;
};

EntryPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: EntryPointPseudoState,
});

ExitPointPseudoState = function (condition) {
    PseudoState.call(this);
    
    this._machine = null;
};

ExitPointPseudoState.prototype = _.create(PseudoState.prototype, {
    constructor: ExitPointPseudoState,
});

Transition = function (name, source, target, options) {
    Element.call(this, name);
    
	this._type = 'transition';
    
    this._source = null;
    this._target = null;
    
    if (source instanceof BaseState || _isFalsy(source)) {
        this._rawSource = source;
        
    } else {
        logger.error('第2引数に遷移元のStateインスタンス、またはfalseを指定してください。');
    }
    
    if (target instanceof BaseState || _isFalsy(target)) {
        this._rawTarget = target;
        
    } else {
        logger.error('第3引数に遷移元のStateインスタンス、またはfalseを指定してください。');
    }
    
    options = _.defaults(options || {}, _.clone(Transition.options));
    
    if (_.isObject(options.data)) {
        this.extend(options.data);
    }
    
    this.save();
    
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
        this.notify('container', 'exit', this._source);
        
        /* エフェクト発動 */
        if (!_.isNull(this._effect)) {
            this._effect();
        }
        
        message = this._explicitEntry ? 'explicit-entry' : 'entry';
        this.notify('container', message, this._target);
        
        this._inactivate();
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
    
	this._initialPseudo = new InitialPseudoState();
	this._final = new FinalState();
	
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
            
            if (!state instanceof BaseState) {
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
            
            if (!transit instanceof Transition) {
                logger.error('Transitionインスタンスを指定してください。');
            }
            
            if (transit._rawSource instanceof InitialPseudoState || _isFalsy(transit._rawSource)) {
                transit._source = this._initialPseudo;
                
            } else {
                if (_.indexOf(this._states, transit._rawSource) === -1) {
                    logger.error('遷移元のStateインスタンスが見つかりません。');
                }
                
                transit._source = transit._rawSource;
            }
            
            if (transit._rawTarget instanceof FinalState || _isFalsy(transit._rawTarget)) {
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
        var superState;
        
        switch (event) {
            case 'exit':
                state._exit();
                break;
                
            case 'explicit-entry':
                if (!_.isNull(state._container) && !_.isNull(state._container._parent)) {
                    superState = state._container._parent;
                
                } else {
                    logger.error('Stateインスタンス"' + state._name + '"の「親」状態が存在しません。');
                }
                
                state._entry(superState);
                break;
                
            case 'entry':
                state._entry();
                break;
        }
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

function _isFalsy(value) {
    if (value === false || value === 0 || _.isUndefined(value) || value === '' || _.isNull(value) || _.isNaN(value)) {
        return true;
    }
    
    return false;
}

function _findState(region, object) {
    var i, j, l, m, state, subRegion;
    
    for (i = 0, l = region._states.length; i < l; i += 1) {
        state = region._states[i];
        
        if (state === object) {
            return state;
        }
        
        for (j = 0, m = state._regions.length; j < m; j += 1) {
            subRegion = state._regions[i];
            return _findState(subRegion, object);
        }
    }
}
/*function _findSubState(state, object) {
    var i, j, l, m, region, subState, result;
    if (_.isMatch(state, object)) {
        return state;
    }
    
    for (i = 0, l = state._regions.length; i < l; i += 1) {
        region = state._regions[i];
        
        for (j = 0, m = region._states.length; j < m; j += 1) {
            subState = region._states[j];
            
            result = _findSubState(subState, object);
            if (!_.isUndefined(result)) {
                return result;
            }
        }
    }
}*/

/*function _findParentState(state, object) {
    var container, superState;
    if (_.isMatch(state, object)) {
        return state;
    }
    
    container = state._container;
    if (!_.isNull(container)) {
        superState = container._parent;
        
        if (!_.isNull(superState)) {
            return _findParentState(superState, object);
        }
    }
}*/

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

function _findNextTransition(region) {
    var transits = region._transits;
    return _.find(transits, function (transit) {
        return transit._source === state && !transit._locked;
    });
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

