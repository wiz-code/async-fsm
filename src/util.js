'use strict';

var _ = require('underscore');

var util = {
    isFalsy: _.negate(Boolean),

    eachElem: function (state, callback) {
        var i, j, l, m, region, subState, transit;

        callback(state);

        for (i = 0, l = state.children.length; i < l; i += 1) {
            region = state.children[i];
            callback(region);

            for (j = 0, m = region.children.transitions.length; j < m; j += 1) {
                transit = region.children.transitions[j];
                callback(transit);
            }

            for (j = 0, m = region.children.states.length; j < m; j += 1) {
                subState = region.children.states[j];
                this.eachElem(subState, callback);
            }
        }
    },

    findDeepHistoryPseudoState: function (region) {
        var container;

        if (region.hasHistory(true)) {
            return region._historyPseudo;
        }

        container = region._getUpperContainer();
        if (!_.isNull(container)) {
            return this.findDeepHistoryPseudoState(container);
        }
    },

    findFirstTransition: function (region, from) {
        var EntryPointPseudoState, transits;
        EntryPointPseudoState = require('./pseudo-states').EntryPointPseudoState;
        transits = region.children.transitions;

        if (_.isUndefined(from)) {
            from = region._initialPseudo;
        }

        return _.find(transits, function (transit) {
            return transit.source === from;
        });
    },

    findNextTransition: function (region, from, to) {
        var ExitPointPseudoState, transits;
        ExitPointPseudoState = require('./pseudo-states').ExitPointPseudoState;
        transits = region.children.transitions;

        return _.find(transits, function (transit) {
            if (!_.isUndefined(to)) {
                return transit.source === from && transit.target === to;

            } else if (from instanceof ExitPointPseudoState) {
                return transit.source === from;

            } else {
                return transit.source === from && transit.unlocked;
            }
        });
    },

    findState: function (region, targetState, depth) {
        var i, j, l, m, state, subRegion, result;

        depth = !_.isUndefined(depth) ? depth : Infinity;

        if (depth >= 0) {
            depth -= 1;

            for (i = 0, l = region.children.states.length; i < l; i += 1) {
                state = region.children.states[i];

                if (state === targetState) {
                    return state;
                }

                for (j = 0, m = state.children.length; j < m; j += 1) {
                    subRegion = state.children[j];
                    result = this.findState(subRegion, targetState, depth);
                    if (!_.isUndefined(result)) {
                        return result;
                    }
                }
            }
        }
    },

    findRelatedTransition: function (state) {
        var container, result;
        container = state.container;
        if (!_.isNull(container)) {
            result = _.find(container.children.transitions, function (transit) {
                return transit.isActive() && (transit.source === state || transit.target === state);
            });
        }

        return result;
    },
};

module.exports = util;
