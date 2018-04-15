'use strict';

var _ = require('underscore');

var Elem = require('./elem');
var Region = require('./region');
var logger = require('./logger');
var util = require('./util');

var ProtoState = function (name) {
    Elem.call(this, name);

    this._type = 'state';
    this.container = null;
    this.region = null;

    this.children = [];

    this.setObserverType('container');
};

ProtoState.prototype = _.create(Elem.prototype, {
    constructor: ProtoState,

    _cname: 'ProtoState',

    getRegion: function (index) {
        var result;
        if (_.isNumber(index)) {
            result = this.children[index];

        } else {
            result = this.region;
        }

        return result;
    },

    getRegionByName: function (regionName) {
        return _.find(this.children, function (region) {
            return region.getName() === regionName;
        });
    },

    getRegionById: function (regionId) {
        return _.find(this.children, function (region) {
            return region.getId() === regionId;
        });
    },

    findActiveRegion: function () {
        return _.find(this.children, function (region) {
            return region.isActive();
        });
    },

    completion: function () {
        if (!this.isActive()) {
            logger.error(this._cname + 'インスタンス"' + this._name + '"はすでに非アクティブ化されています。');
        }

        this._async(function () {
            this._exit();

            if (!_.isNull(this.container)) {
                this.notify('container', 'completion');
            }
        });
    },

    _getParentState: function () {
        var result = null;
        if (!_.isNull(this.container) && !_.isNull(this.container.parent)) {
            result = this.container.parent;
        }

        return result;
    },

    _hasSubState: function () {
        var result = _.some(this.children, function (region) {
            return region.children.states.length > 0;
        });

        return result;
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

    _refresh: function (depth) {
        this._depth = depth;
        this.parent = this._getParentState();
        this.notify('children', 'refresh', depth);
    },

    _entry: function (message) {
        if (!this.isActive()) {
            this._activate();
            this.notify('children', 'entry', message);
        }
    },

    addState: function () {
        var states = _.toArray(arguments);
        if (_.isNull(this.region)) {
            this.appendRegion();
        }

        return this.region.addState.apply(this.region, states);
    },

    removeState: function () {
        var states = _.toArray(arguments);
        if (_.isNull(this.region)) {
            logger.error('デフォルトのRegionインスタンスが存在しません。');
        }

        return this.region.removeState.apply(this.region, states);
    },

    addTransition: function () {
        var transits = _.toArray(arguments);
        if (_.isNull(this.region)) {
            this.appendRegion();
        }

        return this.region.addTransition.apply(this.region, transits);
    },

    removeTransition: function () {
        var transits = _.toArray(arguments);
        if (_.isNull(this.region)) {
            logger.error('デフォルトのRegionインスタンスが存在しません。');
        }

        return this.region.removeTransition.apply(this.region, transits);
    },

    appendRegion: function (region) {
        var Region = require('./region');
        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        if (_.isNull(this.region)) {
            if (_.isUndefined(region)) {
                region = new Region('default-region-of-' + this._name);
                logger.info(this._cname + 'インスタンス"' + this._name + '"のRegionインスタンスが自動作成されました。');

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

        region.parent = this;
        this.children.push(region);

        this.addObserver('children', region);
        region.addObserver('parent', this);

        if (!region._originalName) {
            region.setName('region-index-' + region.getIndex() + '-of-' + this._name, true);
            region._setDefaultStateName();
        }

        region._refresh(this._depth);

        return region;
    },

    removeRegion: function (region) {
        var Region, index;
        Region = require('./region');
        if (this._attached) {
            logger.error('デプロイ後は要素の追加/削除はできません。Machineクラスのundeploy()メソッドでデプロイを取り消してください。');
        }

        if (!(region instanceof Region)) {
            logger.error('Regionインスタンスを指定してください。');
        }

        index = _.indexOf(this.children, region);
        if (index > -1) {
            this.children.splice(index, 1);

        } else {
            logger.error('削除対象のRegionインスタンスが見つかりません。');
        }

        region.parent = null;

        if (this.region === region) {
            this.region = null;
        }

        region._refresh();

        this.removeObserver('children', region);
        region.removeObserver('parent', this);

        if (!region._originalName) {
            region.setName(region.getId(), true);
            region._setDefaultStateName();
        }

        return region;
    },
});

module.exports = ProtoState;
