'use strict';

var _ = require('underscore');
var assert = require('power-assert');
var FSM = require('../../src');
var Model = require('../../src/model');
var sinon = require('sinon');

FSM.globalize();
FSM.logger.setLogLevel('error');

var toString = Object.prototype.toString;
var getPrototypeOf = Object.getPrototypeOf;

function _extend(dest, src) {
    var i, l, keys, key, value;
    if (_.isArray(src)) {
        dest = _.isArray(dest) ? dest : [];

        for (i = 0, l = src.length; i < l; i += 1) {
            value = !_.isObject(src[i]) ? src[i] : _extend(undefined, src[i]);
            dest.push(value);
        }
    } else {
        dest = _isPlainObject(dest) ? dest : {};
        keys = _.keys(src);

        for (i = 0, l = keys.length; i < l; i += 1) {
            key = keys[i];
            value = !_.isObject(src[key]) ? src[key] : _extend(dest[key], src[key]);
            dest[key] = value;
        }
    }

    return dest;
}

function _merge(dest) {
    var srcs = _.toArray(arguments).slice(1);

    _.each(srcs, function (src) {
        dest = _extend(dest, src);
    });

    return dest;
}

function _isPlainObject(obj) {
    var result, proto;
    result = false;
    if (toString.call(obj) === '[object Object]') {
        proto = obj;
        while (!_.isNull(getPrototypeOf(proto))) {
            proto = getPrototypeOf(proto);
        }
        result = getPrototypeOf(obj) === proto;
    }
    return result;
}

describe('Model', function () {
    describe('#set()', function () {
        it('should overwrite old value with new value', function (done) {
            var model = new Model();

            var data1 = {
                a: {
                    b: {
                        c: 'hoge',
                        d: true,
                    },
                },
                e: [
                    {f: 'fuga', g: 100},
                    'foo',
                    'bar',
                ],
            };

            var data2 = {
                h: 'new fuga',
                i: 11111,
            };

            model.set(data1);

            var callback = function (e) {
                assert.equal(e.currentTarget, 'e/0');
                if (e.target === 'e/0/f') {
                    assert.equal(e.event, 'delete');
                    assert.equal(e.value, 'fuga');
                }

                if (e.target === 'e/0/g') {
                    assert.equal(e.event, 'delete');
                    assert.equal(e.value, 100);
                }

                if (e.target === 'e/0/h') {
                    assert.equal(e.event, 'create');
                    assert.equal(e.value, 'new fuga');
                }

                if (e.target === 'e/0/i') {
                    assert.equal(e.event, 'create');
                    assert.equal(e.value, 11111);
                }
            };

            model.watch('e/0', callback);
            model.set('e/0', data2);
            model.unwatch('e/0', callback);

            done();
        });
    });

    describe('#merge()', function () {
        before(function () {
            //
        });

        it('should merge model data with other objects', function (done) {
            var model = new Model();

            var data = {
                a: {
                    b: {
                        c: 'hoge',
                        d: true,
                    },
                },
                e: [
                    {f: 'fuga', g: 100},
                    'foo',
                    'bar',
                ],
            };
            var cloneData = _extend(undefined, data);

            var start = performance.now();
            model.set(data);
            var duration = performance.now() - start;
            console.log('#set() performance', duration, 'ms');

            var mergeData = [
                {
                    a: {
                        b: {
                            c: 'hoge',
                            d: true,
                            prop: 'additional value',
                        },
                    },
                    e: [
                        {f: 'fuga', g: 10000},
                        'hello',
                        'world',
                        'new element',
                    ],
                    h: {
                        i: [
                            {
                                j: {
                                    k: [1, 2, 3],
                                },
                            },
                        ],
                    },
                },
                {
                    i: [
                        {
                            l: {
                                m: [4, 5, 6],
                            },
                            n: 'new element',
                        },
                    ],
                },
            ];

            var callback = function (e) {
                assert.equal(e.value, 1);
            };

            model.watch('h/i/0/j/k/0', callback);

            var start = performance.now();
            model.merge(mergeData[0]);
            var duration = performance.now() - start;
            console.log('#merge() performance', duration, 'ms');

            model.unwatch('h/i/0/j/k/0', callback);

            var merged = _merge(cloneData, mergeData[0]);
            var isEqual = _.isEqual(model.get(), merged);
            assert.ok(isEqual);

            var callback = function (e) {
                assert.equal(e.event, 'create');
                assert.equal(e.value, 'new element');
            };

            model.watch('h/i/1/n', callback);
            model.merge('h', mergeData[1]);
            var isEqual = _.isEqual(model.get(), _merge(merged, {h: mergeData[1]}));
            assert.ok(isEqual);

            done();
        });

        after(function () {
            //
        });
    });

    /*describe('#mergeProp()', function () {
        before(function () {
            //
        });

        it('should merge props with other objects', function (done) {
            var model = new Model();

            model.mergeProp('value');
            assert.equal(model.props, 'value');

            model.mergeProp({
                prop1: 'value1',
                prop2: 'value2',
                prop3: {
                    subProp: 'value3'
                }
            });

            assert.equal(model.props.prop1, 'value1');
            assert.equal(model.props.prop2, 'value2');
            assert.equal(model.getProp('prop3/subProp'), 'value3');

            model.mergeProp({
                prop1: 'new value1',
                prop2: 'new value2',
            });

            assert.equal(model.props.prop1, 'new value1');
            assert.equal(model.props.prop2, 'new value2');

            model.mergeProp('prop3', {
                subProp: 'new value3',
                anotherSubProp: 'new value4',
            });
            assert.equal(model.getProp('prop3/subProp'), 'new value3');
            assert.equal(model.getProp('prop3/anotherSubProp'), 'new value4');

            assert.throws(function () {
                model.mergeProp({
                    method: _.noop
                });
            });

            done();
        });

        after(function () {
            //
        });
    });

    describe('#mergeMethod()', function () {
        before(function () {
            //
        });

        it('should merge methods with other objects', function (done) {
            var model = new Model();

            var func1 = function (arg) {
                assert.equal(arg, 'func1');
            };
            var func2 = function (arg) {
                assert.equal(arg, 'func2');
            };
            var func3 = function (arg) {
                assert.equal(arg, 'func3');
            };
            model.setMethod({
                hoge: {
                    func1: func1,
                    func2: func2
                }
            });

            model.mergeMethod('hoge', {
                func3: func3
            });

            assert.throws(function () {
                model.mergeMethod('hoge', 'function');
            });

            model.getMethod('hoge/func1', model)('func1');
            model.getMethod('hoge/func3', model)('func3');

            done();
        });

        after(function () {
            //
        });
    });*/
});
