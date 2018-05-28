var _PowerAssertRecorder1 = function () {
    function PowerAssertRecorder() {
        this.captured = [];
    }
    PowerAssertRecorder.prototype._capt = function _capt(value, espath) {
        this.captured.push({
            value: value,
            espath: espath
        });
        return value;
    };
    PowerAssertRecorder.prototype._expr = function _expr(value, source) {
        var capturedValues = this.captured;
        this.captured = [];
        return {
            powerAssertContext: {
                value: value,
                events: capturedValues
            },
            source: source
        };
    };
    return PowerAssertRecorder;
}();
var assert = require('power-assert');
var FSM = require('../../src');
FSM.globalize();
FSM.logger.setLogLevel('error');
describe('State', function () {
    describe('#appendRegion()', function () {
        var region, state, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            done();
        });
        it('should throw error when the parameter is not Region instance', function () {
            assert.throws(function () {
                state.appendRegion(new State());
            });
        });
        it('should return region instance', function () {
            var _rec1 = new _PowerAssertRecorder1();
            var _rec2 = new _PowerAssertRecorder1();
            result = state.appendRegion(region);
            assert.equal(_rec1._expr(_rec1._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 27
            }), _rec2._expr(_rec2._capt(region, 'arguments/1'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 27
            }));
        });
        it('children prop of state should have 1 element', function () {
            var _rec3 = new _PowerAssertRecorder1();
            state.appendRegion(region);
            assert.equal(_rec3._expr(_rec3._capt(_rec3._capt(_rec3._capt(state, 'arguments/0/object/object').children, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(state.children.length, 1)',
                filepath: 'test/dest/bundle.js',
                line: 32
            }), 1);
        });
        it('parent prop of region should be state instance', function () {
            var _rec4 = new _PowerAssertRecorder1();
            var _rec5 = new _PowerAssertRecorder1();
            state.appendRegion(region);
            assert.equal(_rec4._expr(_rec4._capt(_rec4._capt(region, 'arguments/0/object').parent, 'arguments/0'), {
                content: 'assert.equal(region.parent, state)',
                filepath: 'test/dest/bundle.js',
                line: 37
            }), _rec5._expr(_rec5._capt(state, 'arguments/1'), {
                content: 'assert.equal(region.parent, state)',
                filepath: 'test/dest/bundle.js',
                line: 37
            }));
        });
    });
    describe('#removeRegion()', function () {
        var region, state, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            state.appendRegion(region);
            done();
        });
        it('should return region instance', function () {
            var _rec6 = new _PowerAssertRecorder1();
            var _rec7 = new _PowerAssertRecorder1();
            result = state.removeRegion(region);
            assert.equal(_rec6._expr(_rec6._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 54
            }), _rec7._expr(_rec7._capt(region, 'arguments/1'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 54
            }));
        });
        it('children prop of state should have no element', function () {
            var _rec8 = new _PowerAssertRecorder1();
            state.removeRegion(region);
            assert.equal(_rec8._expr(_rec8._capt(_rec8._capt(_rec8._capt(state, 'arguments/0/object/object').children, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(state.children.length, 0)',
                filepath: 'test/dest/bundle.js',
                line: 59
            }), 0);
        });
        it('parent prop of region should be null', function () {
            var _rec9 = new _PowerAssertRecorder1();
            state.removeRegion(region);
            assert.equal(_rec9._expr(_rec9._capt(_rec9._capt(region, 'arguments/0/object').parent, 'arguments/0'), {
                content: 'assert.equal(region.parent, null)',
                filepath: 'test/dest/bundle.js',
                line: 64
            }), null);
        });
    });
    describe('#getRegionById()', function () {
        var state, region, regionId, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            regionId = region.getId();
            state.appendRegion(region);
            done();
        });
        it('should return region', function () {
            var _rec10 = new _PowerAssertRecorder1();
            var _rec11 = new _PowerAssertRecorder1();
            result = state.getRegionById(regionId);
            assert.equal(_rec10._expr(_rec10._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 81
            }), _rec11._expr(_rec11._capt(region, 'arguments/1'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 81
            }));
        });
    });
    describe('#getRegionByName()', function () {
        var state, region, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            state.appendRegion(region);
            done();
        });
        it('should return region', function () {
            var _rec12 = new _PowerAssertRecorder1();
            var _rec13 = new _PowerAssertRecorder1();
            result = state.getRegionByName('region');
            assert.equal(_rec12._expr(_rec12._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 97
            }), _rec13._expr(_rec13._capt(region, 'arguments/1'), {
                content: 'assert.equal(result, region)',
                filepath: 'test/dest/bundle.js',
                line: 97
            }));
        });
    });
    describe('#filterActiveRegion()', function () {
        var state, region1, region2, result;
        beforeEach(function (done) {
            region1 = new Region('region1');
            region2 = new Region('region2');
            state = new State('state');
            state.appendRegion(region1);
            state.appendRegion(region2);
            done();
        });
        it('should return the array that have 2 elements', function () {
            var _rec14 = new _PowerAssertRecorder1();
            region1._activate();
            region2._activate();
            result = state.filterActiveRegion();
            assert.equal(_rec14._expr(_rec14._capt(_rec14._capt(result, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(result.length, 2)',
                filepath: 'test/dest/bundle.js',
                line: 117
            }), 2);
        });
    });
    describe('#getRegion()', function () {
        var state, region1, region2, result;
        beforeEach(function (done) {
            region1 = new Region('region1');
            region2 = new Region('region2');
            state = new State('state');
            state.appendRegion(region1);
            state.appendRegion(region2);
            done();
        });
        it('should return region', function () {
            var _rec15 = new _PowerAssertRecorder1();
            var _rec16 = new _PowerAssertRecorder1();
            result = state.getRegion(1);
            assert.equal(_rec15._expr(_rec15._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, region2)',
                filepath: 'test/dest/bundle.js',
                line: 135
            }), _rec16._expr(_rec16._capt(region2, 'arguments/1'), {
                content: 'assert.equal(result, region2)',
                filepath: 'test/dest/bundle.js',
                line: 135
            }));
        });
    });
});
var assert = require('power-assert');
var FSM = require('../../src');
FSM.globalize();
FSM.logger.setLogLevel('error');
describe('Region', function () {
    describe('#addState()', function () {
        var region, state, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            done();
        });
        it('should throw error when the parameter is Machine instance', function () {
            assert.throws(function () {
                region.addState(new Machine());
            });
        });
        it('should throw error when the parameter is not BaseState instance that except Machine', function () {
            assert.throws(function () {
                region.addState(new Transition());
            });
        });
        it('should return state instance', function () {
            var _rec17 = new _PowerAssertRecorder1();
            var _rec18 = new _PowerAssertRecorder1();
            result = region.addState(state);
            assert.equal(_rec17._expr(_rec17._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 173
            }), _rec18._expr(_rec18._capt(state, 'arguments/1'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 173
            }));
        });
        it('children.states prop of region should have 3 elements', function () {
            var _rec19 = new _PowerAssertRecorder1();
            region.addState(state);
            assert.equal(_rec19._expr(_rec19._capt(_rec19._capt(_rec19._capt(_rec19._capt(region, 'arguments/0/object/object/object').children, 'arguments/0/object/object').states, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(region.children.states.length, 3)',
                filepath: 'test/dest/bundle.js',
                line: 178
            }), 3);
        });
        it('container prop of state should be region instance', function () {
            var _rec20 = new _PowerAssertRecorder1();
            var _rec21 = new _PowerAssertRecorder1();
            region.addState(state);
            assert.equal(_rec20._expr(_rec20._capt(_rec20._capt(state, 'arguments/0/object').container, 'arguments/0'), {
                content: 'assert.equal(state.container, region)',
                filepath: 'test/dest/bundle.js',
                line: 183
            }), _rec21._expr(_rec21._capt(region, 'arguments/1'), {
                content: 'assert.equal(state.container, region)',
                filepath: 'test/dest/bundle.js',
                line: 183
            }));
        });
    });
    describe('#removeState()', function () {
        var region, state, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            region.addState(state);
            done();
        });
        it('should return state instance', function () {
            var _rec22 = new _PowerAssertRecorder1();
            var _rec23 = new _PowerAssertRecorder1();
            result = region.removeState(state);
            assert.equal(_rec22._expr(_rec22._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 200
            }), _rec23._expr(_rec23._capt(state, 'arguments/1'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 200
            }));
        });
        it('children.states prop of region should have 2 elements', function () {
            var _rec24 = new _PowerAssertRecorder1();
            region.removeState(state);
            assert.equal(_rec24._expr(_rec24._capt(_rec24._capt(_rec24._capt(_rec24._capt(region, 'arguments/0/object/object/object').children, 'arguments/0/object/object').states, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(region.children.states.length, 2)',
                filepath: 'test/dest/bundle.js',
                line: 205
            }), 2);
        });
        it('container prop of state should be null', function () {
            var _rec25 = new _PowerAssertRecorder1();
            region.removeState(state);
            assert.equal(_rec25._expr(_rec25._capt(_rec25._capt(state, 'arguments/0/object').container, 'arguments/0'), {
                content: 'assert.equal(state.container, null)',
                filepath: 'test/dest/bundle.js',
                line: 210
            }), null);
        });
    });
    describe('#addTransition()', function () {
        var region, target, transit, source, result;
        beforeEach(function (done) {
            region = new Region('region');
            source = new State('source');
            target = new State('target');
            transit = new Transition('transit', source, target);
            region.addState(source, target);
            done();
        });
        it('should throw error when the parameter is not Transition instance', function () {
            assert.throws(function () {
                region.addTransition(new State());
            });
        });
        it('should throw error when the source or target state doesn\'t exist in the container region', function () {
            assert.throws(function () {
                region.addTransition(new Transition('transit', new State(), new State()));
            });
        });
        it('should return transition instance', function () {
            var _rec26 = new _PowerAssertRecorder1();
            var _rec27 = new _PowerAssertRecorder1();
            result = region.addTransition(transit);
            assert.equal(_rec26._expr(_rec26._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 240
            }), _rec27._expr(_rec27._capt(transit, 'arguments/1'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 240
            }));
        });
        it('children.transitions prop of region should have 1 element', function () {
            var _rec28 = new _PowerAssertRecorder1();
            region.addTransition(transit);
            assert.equal(_rec28._expr(_rec28._capt(_rec28._capt(_rec28._capt(_rec28._capt(region, 'arguments/0/object/object/object').children, 'arguments/0/object/object').transitions, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(region.children.transitions.length, 1)',
                filepath: 'test/dest/bundle.js',
                line: 245
            }), 1);
        });
        it('container prop of transition should be region instance', function () {
            var _rec29 = new _PowerAssertRecorder1();
            var _rec30 = new _PowerAssertRecorder1();
            region.addTransition(transit);
            assert.equal(_rec29._expr(_rec29._capt(_rec29._capt(transit, 'arguments/0/object').container, 'arguments/0'), {
                content: 'assert.equal(transit.container, region)',
                filepath: 'test/dest/bundle.js',
                line: 250
            }), _rec30._expr(_rec30._capt(region, 'arguments/1'), {
                content: 'assert.equal(transit.container, region)',
                filepath: 'test/dest/bundle.js',
                line: 250
            }));
        });
    });
    describe('#removeTransition()', function () {
        var region, target, transit, source, result;
        beforeEach(function (done) {
            region = new Region('region');
            source = new State('source');
            target = new State('target');
            transit = new Transition('transit', source, target);
            region.addState(source, target);
            region.addTransition(transit);
            done();
        });
        it('should return transition instance', function () {
            var _rec31 = new _PowerAssertRecorder1();
            var _rec32 = new _PowerAssertRecorder1();
            result = region.removeTransition(transit);
            assert.equal(_rec31._expr(_rec31._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 269
            }), _rec32._expr(_rec32._capt(transit, 'arguments/1'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 269
            }));
        });
        it('children.transitions prop of region should have no element', function () {
            var _rec33 = new _PowerAssertRecorder1();
            region.removeTransition(transit);
            assert.equal(_rec33._expr(_rec33._capt(_rec33._capt(_rec33._capt(_rec33._capt(region, 'arguments/0/object/object/object').children, 'arguments/0/object/object').transitions, 'arguments/0/object').length, 'arguments/0'), {
                content: 'assert.equal(region.children.transitions.length, 0)',
                filepath: 'test/dest/bundle.js',
                line: 274
            }), 0);
        });
        it('container prop of transition should be null', function () {
            var _rec34 = new _PowerAssertRecorder1();
            region.removeTransition(transit);
            assert.equal(_rec34._expr(_rec34._capt(_rec34._capt(transit, 'arguments/0/object').container, 'arguments/0'), {
                content: 'assert.equal(transit.container, null)',
                filepath: 'test/dest/bundle.js',
                line: 279
            }), null);
        });
    });
    describe('#hasHistory()', function () {
        var region, history, deepHistory, result;
        beforeEach(function (done) {
            region = new Region('region');
            history = new HistoryPseudoState('history');
            deepHistory = new HistoryPseudoState('deep-history', true);
            done();
        });
        it('should return true when the region have the history state', function () {
            var _rec35 = new _PowerAssertRecorder1();
            region.addState(history);
            result = region.hasHistory();
            assert.equal(_rec35._expr(_rec35._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, true)',
                filepath: 'test/dest/bundle.js',
                line: 296
            }), true);
        });
        it('should return true when the region have the history state that is deep', function () {
            var _rec36 = new _PowerAssertRecorder1();
            region.addState(deepHistory);
            result = region.hasHistory(true);
            assert.equal(_rec36._expr(_rec36._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, true)',
                filepath: 'test/dest/bundle.js',
                line: 302
            }), true);
        });
    });
    describe('#getIndex()', function () {
        var region1, region2, state, result;
        beforeEach(function (done) {
            region1 = new Region('region1');
            region2 = new Region('region2');
            state = new State('state');
            state.appendRegion(region1);
            state.appendRegion(region2);
            done();
        });
        it('should return 1', function () {
            var _rec37 = new _PowerAssertRecorder1();
            result = region2.getIndex();
            assert.equal(_rec37._expr(_rec37._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, 1)',
                filepath: 'test/dest/bundle.js',
                line: 320
            }), 1);
        });
        it('should return -1 when the region doesn\'t have no parent', function () {
            var _rec38 = new _PowerAssertRecorder1();
            var _rec39 = new _PowerAssertRecorder1();
            state.removeRegion(region2);
            result = region2.getIndex();
            assert.equal(_rec38._expr(_rec38._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, -1)',
                filepath: 'test/dest/bundle.js',
                line: 326
            }), _rec39._expr(_rec39._capt(-1, 'arguments/1'), {
                content: 'assert.equal(result, -1)',
                filepath: 'test/dest/bundle.js',
                line: 326
            }));
        });
    });
    describe('#getStateById()', function () {
        var state, region, stateId, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            stateId = state.getId();
            region.addState(state);
            done();
        });
        it('should return state', function () {
            var _rec40 = new _PowerAssertRecorder1();
            var _rec41 = new _PowerAssertRecorder1();
            result = region.getStateById(stateId);
            assert.equal(_rec40._expr(_rec40._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 343
            }), _rec41._expr(_rec41._capt(state, 'arguments/1'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 343
            }));
        });
    });
    describe('#getStateByName()', function () {
        var state, region, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            region.addState(state);
            done();
        });
        it('should return state', function () {
            var _rec42 = new _PowerAssertRecorder1();
            var _rec43 = new _PowerAssertRecorder1();
            result = region.getStateByName('state');
            assert.equal(_rec42._expr(_rec42._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 359
            }), _rec43._expr(_rec43._capt(state, 'arguments/1'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 359
            }));
        });
    });
    describe('#getTransitionById()', function () {
        var transit, region, transitId, result;
        beforeEach(function (done) {
            region = new Region('region');
            transit = new Transition('transit');
            transitId = transit.getId();
            region.addTransition(transit);
            done();
        });
        it('should return transit', function () {
            var _rec44 = new _PowerAssertRecorder1();
            var _rec45 = new _PowerAssertRecorder1();
            result = region.getTransitionById(transitId);
            assert.equal(_rec44._expr(_rec44._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 376
            }), _rec45._expr(_rec45._capt(transit, 'arguments/1'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 376
            }));
        });
    });
    describe('#getTransitionByName()', function () {
        var transit, region, result;
        beforeEach(function (done) {
            region = new Region('region');
            transit = new Transition('transit');
            region.addTransition(transit);
            done();
        });
        it('should return transit', function () {
            var _rec46 = new _PowerAssertRecorder1();
            var _rec47 = new _PowerAssertRecorder1();
            result = region.getTransitionByName('transit');
            assert.equal(_rec46._expr(_rec46._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 392
            }), _rec47._expr(_rec47._capt(transit, 'arguments/1'), {
                content: 'assert.equal(result, transit)',
                filepath: 'test/dest/bundle.js',
                line: 392
            }));
        });
    });
    describe('#findActiveState()', function () {
        var state, region, result;
        beforeEach(function (done) {
            region = new Region('region');
            state = new State('state');
            region.addState(state);
            done();
        });
        it('should return state', function () {
            var _rec48 = new _PowerAssertRecorder1();
            var _rec49 = new _PowerAssertRecorder1();
            state._activate();
            result = region.findActiveState();
            assert.equal(_rec48._expr(_rec48._capt(result, 'arguments/0'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 409
            }), _rec49._expr(_rec49._capt(state, 'arguments/1'), {
                content: 'assert.equal(result, state)',
                filepath: 'test/dest/bundle.js',
                line: 409
            }));
        });
    });
});
'use strict';
var assert = require('power-assert');
var Promise = require('es6-promise');
var FSM = require('../../src');
var sinon = require('sinon');
FSM.globalize();
FSM.logger.setLogLevel('error');
describe('State', function () {
    describe('#entryAction()', function () {
        var machine, state, transit, spy;
        before(function () {
            machine = new Machine('my-machine');
            state = new State('state', {
                data: { done: false },
                entryAction: function () {
                    this.set('done', true);
                }
            });
            transit = new Transition(false, false, state);
            machine.addState(state);
            machine.addTransition(transit);
            machine.deploy();
        });
        after(function () {
            machine.finish();
        });
        it('entry action should occur always once', function (done) {
            state.watch('done', function (e) {
                done();
            });
            machine.start();
        });
    });
    describe('#doActivity()', function () {
        var machine, state, transit, spy;
        before(function () {
            machine = new Machine('my-machine');
            state = new State('state', {
                data: { done: false },
                doActivity: function () {
                    if (this.getTicks() >= 10) {
                        this.set('done', true);
                        this.completion();
                    }
                },
                loop: true,
                useRAF: true
            });
            transit = new Transition(false, false, state);
            machine.addState(state);
            machine.addTransition(transit);
            machine.deploy();
        });
        after(function () {
            machine.finish();
        });
        it('do activity should occur 10 times', function (done) {
            state.watch('done', function (e) {
                done();
            });
            machine.start();
        });
    });
    describe('#exitAction()', function () {
        var machine, state1, state2, transit1, transit2, spy;
        before(function () {
            machine = new Machine('my-machine');
            state1 = new State('state1', {
                data: { done: false },
                exitAction: function () {
                    console.log('exit');
                    this.set('done', true);
                },
                autoTransition: true
            });
            state2 = new State('state2');
            transit1 = new Transition(false, false, state1);
            transit2 = new Transition(false, state1, state2, { unlocked: true });
            machine.addState(state1, state2);
            machine.addTransition(transit1, transit2);
            machine.deploy();
        });
        after(function () {
            machine.finish();
        });
        it('exit action should occur always once', function (done) {
            state1.watch('done', function (e) {
                done();
            });
            machine.start();
        });
    });
});