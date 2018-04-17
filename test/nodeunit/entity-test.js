var Entity = require('../../src/entity');
var Elem = require('../../src/elem');

var entity = new Entity('hoge');
var elem = new Elem('foo');

module.exports = {
    'Entity Test': function (test) {
        test.expect(12);

        var entity = new Entity(false);
        test.equal(entity.getId(), entity.getName());
        test.equal(entity._originalName, false);

        entity = new Entity('hoge');

        test.equal(entity.getId(), entity._id);
        test.equal(entity.getName(), 'hoge');
        test.equal(entity._originalName, 'hoge');

        entity.setName('fuga');

        test.equal(entity.getName(), 'fuga');
        test.equal(entity.isActive(), false);

        entity._activate();
        test.equal(entity.isActive(), true);

        entity._deactivate();
        test.equal(entity.isActive(), false);

        entity.clear();
        entity.set([
            {name: 'wiz-code', score: 0},
        ]);
        test.ok(entity.has('/0/name'));
        var listener = function (e) {
            test.equal(e.value, 10000);

        };
        entity.watch('/0/score/', listener);
        entity.set('0/score', 10000);
        entity.unwatch('0/score', listener);
        test.equal(entity.model.hasListener('/0/score', listener), false);

        test.done();
    },
    'Elem Test': function (test) {
        test.expect(3);

        test.equal(elem.getCurrentDepth(), 0);

        elem._entry();
        test.equal(elem.isActive(), true);

        elem._exit();
        test.equal(elem.isActive(), false);
        test.done();
    },
};
