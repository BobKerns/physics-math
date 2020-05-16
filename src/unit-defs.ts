import {defineUnit, P, Unit} from "./units";

/**
 * Collect common type constants under a U namespace.
 * Using a nsmespace allows precise typing, while keeping the namespace
 * distinct from the start. Otherwise, import * from './unit-defs' would
 * be dangerous as types are added.
 */
export namespace U {
    export const mass = P.mass;
    export const length = P.length;
    export const time = P.time;
    export const angle = P.angle;
    export const amount = P.amount;
    export const cycles = P.cycles;
    export const current = P.current;
    export const temperature = P.temperature;
    export const candela = P.candela;

    export const unity = defineUnit({},
        {name: '1', symbol: '', si_base: true},
        'unity');

    export const velocity = defineUnit({length: 1, time: -1},
        {varName: 'V'},
        'velocity');

    // noinspection JSUnusedGlobalSymbols
    export const angularVelocity = defineUnit({angle: 1, time: -1},
        {varName: 'ω'},
        'angularVelocity');

    export const acceleration = defineUnit({length: 1, time: -2},
        {varName: 'a'},
        'acceleration');

    export const force = defineUnit({mass: 1, length: 1, time: -2},
        {name: 'newton', symbol: 'N', varName: 'F'},
        'force');

    // noinspection JSUnusedGlobalSymbols
    export const torque = defineUnit({mass: 1, length: 2, time: -2},
        {},
        'torque');

    export const energy = defineUnit({mass: 1, length: 2, time: -2},
        {symbol: 'J', varName: 'E', name: 'joule'},
        'energy');

    export const momentum = defineUnit({mass: 1, length: 1, time: -1},
        {varName: 'p'},
        'momentum', 'impulse');

    export const area = defineUnit({length: 2},
        {varName: 'a'},
        'area');

    // noinspection JSUnusedGlobalSymbols
    export const volume = defineUnit({length: 3},
        {varName: 'V'},
        'volume');

    // noinspection JSUnusedGlobalSymbols
    export const density = defineUnit({mass: 1, length: -3},
        {},
        'density');

    // noinspection JSUnusedGlobalSymbols
    export const frequency = defineUnit({cycles: 1, time: -1},
        {name: 'hertz', symbol: 'Hz', varName: 'f'},
        'frequency');

    // noinspection JSUnusedGlobalSymbols
    export const wavelength = defineUnit({length: 1, cycles: -1},
        {},
        'wavelength');

    export const power = defineUnit({mass: 1, length: 2, time: -3},
        {name: 'watt', symbol: 'W'},
        'power');

    export const charge = defineUnit({current: 1, time: 1},
        {name: 'coulomb', symbol: 'C'},
        'charge');

    // noinspection JSUnusedGlobalSymbols
    export const capacitance = defineUnit({length: -2, mass: -1, time: 4, current: 2},
        {name: 'farad', symbol: 'F'},
        'capacitance');

    export const voltage = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'volt', symbol: 'V', varName: 'V'},
        'voltage', 'EMF');

    // noinspection JSUnusedGlobalSymbols
    export const resistance = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'ohm', symbol: 'Ω', varName: 'R'},
        'resistance');

    // noinspection JSUnusedGlobalSymbols
    export const conductance = defineUnit({length: -2, mass: -1, time: 3, current: 1},
        {name: 'seimen', symbol: 'S'},
        'conductance');

    // noinspection JSUnusedGlobalSymbols
    export const flux = defineUnit({length: 2, mass: 1, time: -2, current: -1},
        {name: 'weber', symbol: 'Wb'},
        'flux');

    // noinspection JSUnusedGlobalSymbols
    export const fluxDensity = defineUnit({mass: 1, time: -2, current: -1},
        {name: 'tesla', symbol: 'T'},
        'fluxDensity');

    // noinspection JSUnusedGlobalSymbols
    export const inductace = defineUnit({length: 2, mass: 1, time: -2, current: -2},
        {name: 'henry', symbol: 'H'},
        'inductance');
}
