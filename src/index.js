/* Async-FSM.js
 * version 0.4.91
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
};

module.exports = FSM;
