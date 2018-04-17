var assert = require('assert');
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
            result = state.appendRegion(region);
            assert.equal(result, region);
        });

        it('children prop of state should have 1 element', function () {
            state.appendRegion(region);
            assert.equal(state.children.length, 1);
        });

        it('parent prop of region should be state instance', function () {
            state.appendRegion(region);
            assert.equal(region.parent, state);
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
            result = state.removeRegion(region);
            assert.equal(result, region);
        });

        it('children prop of state should have no element', function () {
            state.removeRegion(region);
            assert.equal(state.children.length, 0);
        });

        it('parent prop of region should be null', function () {
            state.removeRegion(region);
            assert.equal(region.parent, null);
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
            result = state.getRegionById(regionId);
            assert.equal(result, region);
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
            result = state.getRegionByName('region');
            assert.equal(result, region);
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
            region1._activate();
            region2._activate();
            result = state.filterActiveRegion();
            assert.equal(result.length, 2);
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
            result = state.getRegion(1);
            assert.equal(result, region2);
        });
    });

});
