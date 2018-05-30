'use strict';

var assert = require('assert');
var Promise = require('es6-promise');
var FSM = require('../../src');
var sinon = require('sinon');

FSM.globalize();
FSM.logger.setLogLevel('error');

describe('State', function () {
    describe('#setMethod()', function () {
        var state;

        before(function () {
            state = new State('state', {
                methods: {
                    init: function (done) {
                        if (this.getName() === 'state') {
                            done();
                        }
                    },
                },
            });
        });

        it('should bind "self" with "this", when init() invoked', function (done) {
            state.methods.init(done);
        });
    });

    describe('#entryAction()', function () {
        var machine, state, transit, spy;

        before(function () {
            machine = new Machine('my-machine');

            state = new State('state', {
                data: {
                    done: false,
                },
                entryAction: function () {
                    this.set('done', true);
                },
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
            //spy = sinon.spy(state, 'entryAction');
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
                data: {
                    done: false,
                },
                doActivity: function () {
                    if (this.getTicks() >= 10) {
                        this.set('done', true);
                        this.completion();
                    }
                },
                loop: true,
                useRAF: true,
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
            //spy = sinon.spy(state, 'doActivity');
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
                data: {
                    done: false,
                },
                exitAction: function () {
                    console.log('exit');
                    this.set('done', true);
                },
                autoTransition: true,
            });

            state2 = new State('state2');

            transit1 = new Transition(false, false, state1);
            transit2 = new Transition(false, state1, state2, {unlocked: true});

            machine.addState(state1, state2);
            machine.addTransition(transit1, transit2);

            machine.deploy();
        });

        after(function () {
            machine.finish();
        });

        it('exit action should occur always once', function (done) {
            //spy = sinon.spy(state2, 'exitAction');
            state1.watch('done', function (e) {
                done();
            });
            machine.start();
        });
    });
});
