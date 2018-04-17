var Model = require('../../src/model');
var _ = require('underscore');

exports.model = function (test) {
    test.expect(31);

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

    model.set('hoge', 'fuga');
    test.equal(model.get('hoge'), 'fuga');

    var callback2 = function (e) {
        test.equal(e.event, 'update');
        test.equal(e.currentTarget, 'hoge');
        test.equal(e.target, 'hoge');
        test.equal(e.value, 'foo');
        test.equal(e.oldValue, 'fuga');
    };

    model.observe('hoge', callback2);
    model.set('hoge', 'foo');

    model.clear();
    test.equal(model._data, null);

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
        test.equal(e.target, 'a/b/2/f/g');
        test.equal(e.currentTarget, 'a/b/2');
        test.equal(model.get('a/b/2/f/g'), 100);
    };

    model.observe('a/b/2', callback3);
    model.set('a/b/2/f/g', 100);
    model.unobserve('a/b/2', callback3);

    model.unset('a/b/2/f/g');
    test.equal(model.get('a/b/2/f/g'), undefined);

    model.clear();
    model.set({
        user: [
            {
                id: 'wiz-code',
            },
        ]
    });
    test.equal(model.get('user/0/id'), 'wiz-code');
    model.save();
    model.set('user/0/id', 'wizard-code');
    test.equal(model.get('user/0/id'), 'wizard-code');
    model.restore();
    test.equal(model.get('user/0/id'), 'wiz-code');

    test.throws(model.addProp.bind(null, {func: _.noop}));

    model.addProp({
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
    model.addProp({password: 'new-secret'});
    test.equal(model.props.password, 'new-secret');

    test.throws(function () {
        model.addMethod({
            name: 'John',
        }, model);
    });

    test.throws(function () {
        model.addMethod({
            user: {
                loggedOn: false,
            }
        }, model);
    });

    var track = {
        '#1': 'jazz',
        '#2': 'click',
    };
    model.addMethod({
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

    test.done();
};
