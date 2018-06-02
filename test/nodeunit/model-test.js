var Model = require('../../src/model');
var _ = require('underscore');

exports.ModelTest = function (test) {
    test.expect(51);

    var model = new Model({hoge: 'fuga'});
    var callback1 = function (a, b, c) {
        test.equal(a + b + c, 6);

    };

    test.strictEqual(model.get('hoge'), 'fuga');

    model.observe('foo', callback1);
    test.ok(model.hasListener('foo', callback1));

    model.unobserve('foo', callback1);
    test.ok(!model.hasListener('foo', callback1));

    model.observe('foo', callback1);
    model.notifyListeners('foo', [1, 2, 3]);
    model.unobserve('foo', callback1);

    model.set('foo', 'bar');
    test.equal(model.get('foo'), 'bar');

    var callback2 = function (e) {
        test.equal(e.event, 'update');
        test.equal(e.currentTarget, 'hoge');
        test.equal(e.target, 'hoge');
        test.equal(e.value, 'piyo');
        test.equal(e.oldValue, 'fuga');
    };

    model.observe('hoge', callback2);
    model.set('hoge', 'piyo');

    model.clear();
    test.ok(_.isEmpty(model._cache));
    test.strictEqual(model._data, undefined);

    model.set({
        a: {
            b: [1, 2, {f: {g: 3}}],
            c: {
                d: 'dog',
                e: 'cat',
            },
        },
    });

    var callback3 = function (e) {
        if (e.target === 'a/b/2/f/g') {
            test.equal(e.event, 'update');
            test.equal(e.currentTarget, 'a/b/2');
            test.equal(e.value, 100);
            test.equal(e.oldValue, 3);
        }
    };

    var callback4 = function (e) {
        if (e.target === 'a/b/2/f/g') {
            test.equal(e.event, 'delete');
            test.equal(e.value, 100);
        }

        if (e.target === 'a/b/2/f') {
            test.equal(e.event, 'delete');
            test.ok(_.isEqual(e.value, {g: 100}));
        }

        if (e.target === 'a/b/2') {
            test.equal(e.event, 'update');
            test.ok(_.isEqual(e.value, {f: {g: 100}}));
        }
    };

    model.observe('a/b/2', callback3);
    model.set('a/b/2/f/g', 100);
    model.unobserve('a/b/2', callback3);

    model.watch('a/b', callback4);
    model.unset('a/b/2/f');
    test.equal(model.get('a/b/2/f/g'), undefined);

    model.clear();

    var callback5 = function (e) {
        test.equal(e.event, 'update');
        test.equal(e.value, 'fuga');
        test.equal(e.oldValue, 'hoge');
    };

    model.set('hoge');
    test.equal(model.get(), 'hoge');
    model.save();
    test.equal(model._cache['/'], 'hoge');
    model.clear();
    test.equal(model._cache['/'], undefined);


    model.set('hoge');
    model.watch('/', callback5);
    model.set('fuga');
    model.unwatch('/', callback5);

    model.restore();
    test.equal(model._cache['/'], undefined);
    model.get();
    test.equal(model._cache['/'], 'hoge');



    model.set({
        user: [
            {
                id: 'user-1'
            },
            {
                id: 'wiz-code',
            },
        ]
    });
    test.equal(model._cache['user/1/id'], undefined);
    test.equal(model.get('user/1/id'), 'wiz-code');
    test.equal(model._cache['user/1/id'], 'wiz-code');
    model.save();
    model.set('user/1/id', 'hogehoge-code');
    test.equal(model._cache['user/1/id'], 'hogehoge-code');
    test.equal(model.get('user/1/id'), 'hogehoge-code');
    model.restore();
    test.equal(model.get('user/1/id'), 'wiz-code');
    test.equal(model._cache['user/1/id'], 'wiz-code');

    test.throws(function () {
        model.setProp({func: _.noop});
    });

    model.setProp({
        id: 'wiz-code',
        password: 'secret',
        credit: {
            number: '12345',
        },
    });

    test.equal(model.getProp('credit/number'), '12345');
    model.setProp('credit/number', '77777');
    test.equal(model.props.credit.number, '77777');
    test.equal(model.props.id, 'wiz-code');
    test.equal(model.props.password, 'secret');
    model.setProp('password', 'new-secret');
    test.equal(model.props.password, 'new-secret');


    test.throws(function () {
        model.setMethod({
            name: 'John',
        }, model);
    });

    test.throws(function () {
        model.setMethod({
            user: {
                loggedOn: false,
            }
        }, model);
    });

    var track = {
        '#1': 'jazz',
        '#2': 'click',
    };
    model.setMethod({
        play: {
            music: function () {
                test.equal(this['#1'], 'jazz');
            },
            se: function () {
                test.equal(this['#2'], 'click');
            },
        },
    }, track);
    model.methods.play.music();
    model.methods.play.se();

    model.getMethod('play/music')();
    model.getMethod('play/se')();

    model.setMethod('play/random', function (param) {
        test.equal(param, 'play random!');
    }, model);
    model.getMethod('play/random')('play random!');

    model.clear();

    test.done();
};
