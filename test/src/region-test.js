var assert = require('assert');
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
            result = region.addState(state);
            assert.equal(result, state);
        });

        it('children.states prop of region should have 3 elements', function () {
            region.addState(state);
            assert.equal(region.children.states.length, 3);
        });

        it('container prop of state should be region instance', function () {
            region.addState(state);
            assert.equal(state.container, region);
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
            result = region.removeState(state);
            assert.equal(result, state);
        });

        it('children.states prop of region should have 2 elements', function () {
            region.removeState(state);
            assert.equal(region.children.states.length, 2);
        });

        it('container prop of state should be null', function () {
            region.removeState(state);
            assert.equal(state.container, null);
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
            result = region.addTransition(transit);
            assert.equal(result, transit);
        });

        it('children.transitions prop of region should have 1 element', function () {
            region.addTransition(transit);
            assert.equal(region.children.transitions.length, 1);
        });

        it('container prop of transition should be region instance', function () {
            region.addTransition(transit);
            assert.equal(transit.container, region);
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
            result = region.removeTransition(transit);
            assert.equal(result, transit);
        });

        it('children.transitions prop of region should have no element', function () {
            region.removeTransition(transit);
            assert.equal(region.children.transitions.length, 0);
        });

        it('container prop of transition should be null', function () {
            region.removeTransition(transit);
            assert.equal(transit.container, null);
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
            region.addState(history);
            result = region.hasHistory();
            assert.equal(result, true);
        });

        it('should return true when the region have the history state that is deep', function () {
            region.addState(deepHistory);
            result = region.hasHistory(true);
            assert.equal(result, true);
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
            result = region2.getIndex();
            assert.equal(result, 1);
        });

        it('should return -1 when the region doesn\'t have no parent', function () {
            state.removeRegion(region2);
            result = region2.getIndex();
            assert.equal(result, -1);
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
            result = region.getStateById(stateId);
            assert.equal(result, state);
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
            result = region.getStateByName('state');
            assert.equal(result, state);
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
            result = region.getTransitionById(transitId);
            assert.equal(result, transit);
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
            result = region.getTransitionByName('transit');
            assert.equal(result, transit);
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
            state._activate();
            result = region.findActiveState();
            assert.equal(result, state);
        });
    });
});
