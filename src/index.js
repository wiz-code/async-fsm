/* Async-FSM.js
 * version 0.5.01
 *
 * Copyright (c) 2018 Masa (http://wiz-code.digick.jp)
 * LICENSE: MIT license
 */

var FSM, logger, State, FinalState, Machine, SubMachine, InitialPseudoState, HistoryPseudoState, TerminatePseudoState, ChoicePseudoState, EntryPointPseudoState, ExitPointPseudoState, Transition, Region;

logger = require('./logger');
State = require('./states').State;
FinalState = require('./states').FinalState;
Machine = require('./machines').Machine;
SubMachine = require('./machines').SubMachine;
InitialPseudoState = require('./pseudo-states').InitialPseudoState;
HistoryPseudoState = require('./pseudo-states').HistoryPseudoState;
TerminatePseudoState = require('./pseudo-states').TerminatePseudoState;
ChoicePseudoState = require('./pseudo-states').ChoicePseudoState;
EntryPointPseudoState = require('./pseudo-states').EntryPointPseudoState;
ExitPointPseudoState = require('./pseudo-states').ExitPointPseudoState;
Transition = require('./transition');
Region = require('./region');

FSM = {
    logger: logger,

    Machine: Machine,
    State: State,
    Transition: Transition,
    Region: Region,

    InitialPseudoState: InitialPseudoState,
    FinalState: FinalState,
    SubMachine: SubMachine,
    HistoryPseudoState: HistoryPseudoState,
    TerminatePseudoState: TerminatePseudoState,
    ChoicePseudoState: ChoicePseudoState,

    EntryPointPseudoState: EntryPointPseudoState,
    ExitPointPseudoState: ExitPointPseudoState,

    globalize: globalize,
};

function globalize() {
    var g = (Function('return this')());

    g.Machine = Machine;
    g.State = State;
    g.Transition = Transition;
    g.Region = Region;

    g.InitialPseudoState = InitialPseudoState;
    g.FinalState = FinalState;
    g.SubMachine = SubMachine;
    g.HistoryPseudoState = HistoryPseudoState;
    g.TerminatePseudoState = TerminatePseudoState;
    g.ChoicePseudoState = ChoicePseudoState;

    g.EntryPointPseudoState = EntryPointPseudoState;
    g.ExitPointPseudoState = ExitPointPseudoState;
}

module.exports = FSM;
