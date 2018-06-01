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
    dest = dest || (_.isArray(src) ? [] : {});

    _.each(src, function (value, key) {
        if (_.isArray(value) || _isPlainObject(value)) {
            dest[key] = _extend(dest[key], value);

        } else {
            dest[key] = value;
        }
    });

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
                            j: {
                                k: [4, 5, 6],
                            },
                            l: 'new element',
                        },
                    ],
                },
            ];

            var first = function (e) {
                assert.equal(e.value, 1);
            };
            var second = function (e) {
                assert.equal(e.value, 4);
            };

            model.watch('h/i/0/j/k/0', first);

            var start = performance.now();
            model.merge(mergeData[0]);
            var duration = performance.now() - start;
            console.log('#merge() performance', duration, 'ms');

            model.unwatch('h/i/0/j/k/0', first);
            model.watch('h/i/0/j/k/0', second);

            var merged = _merge(data, mergeData[0]);
            var isEqual = _.isEqual(model.get(), merged);
            assert.ok(isEqual);

            model.merge('h', mergeData[1]);
            //model.merge({h: mergeData[1]});
            assert.equal(model.get('h/i/0/l'), 'new element');
            var isEqual = _.isEqual(model.get(), _merge(merged, {h: mergeData[1]}));
            assert.ok(isEqual);
            //console.log(JSON.stringify(model._data));
            done();
        });

        after(function () {
            //
        });
    });

    describe('#mergeProp()', function () {
        before(function () {
            //
        });

        it('should merge model data with other objects', function (done) {
            var model = new Model();

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

        it('should merge model data with other objects', function (done) {
            var model = new Model();

            done();
        });

        after(function () {
            //
        });
    });
});
