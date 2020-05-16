import {defineUnit} from "./units";

export const U_unity = defineUnit({},
    {name: '1', symbol: '', si_base: true},
    'unity');
export const U_velocity = defineUnit({length: 1, time: -1},
    {varName: 'V'},
    'velocity');
export const U_angularVelocity = defineUnit({angle: 1, time: -1},
    {varName: 'ω'},
    'angularVelocity');
// noinspection JSUnusedGlobalSymbols
export const U_acceleration = defineUnit({length: 1, time: -2},
    {varName: 'a'},
    'acceleration');
// noinspection JSUnusedGlobalSymbols
export const U_force = defineUnit({mass: 1, length: 1, time: -2},
    {name: 'newton', symbol: 'N', varName: 'F'},
    'force');
// noinspection JSUnusedGlobalSymbols
export const U_torque = defineUnit({mass: 1, length: 2, time: -2},
    {},
    'torque');
// noinspection JSUnusedGlobalSymbols
export const U_energy = defineUnit({mass: 1, length: 2, time: -2},
    {symbol: 'J', varName: 'E', name: 'joule'},
    'energy');
// noinspection JSUnusedGlobalSymbols
export const U_momentum = defineUnit({mass: 1, length: 1, time: -1},
    {varName: 'p'},
    'momentum', 'impulse');
export const U_area = defineUnit({length: 2},
    {varName: 'a'},
    'area');
// noinspection JSUnusedGlobalSymbols
export const U_volume = defineUnit({length: 3},
    {varName: 'V'},
    'volume');
// noinspection JSUnusedGlobalSymbols
export const U_density = defineUnit({mass: 1, length: -3},
    {},
    'density');
// noinspection JSUnusedGlobalSymbols
export const U_frequency = defineUnit({cycles: 1, time: -1},
    {name: 'hertz', symbol: 'Hz', varName: 'f'},
    'frequency');
// noinspection JSUnusedGlobalSymbols
export const U_wavelength = defineUnit({length: 1, cycles: -1},
    {},
    'wavelength');
// noinspection JSUnusedGlobalSymbols
export const U_power = defineUnit({mass: 1, length: 2, time: -3},
    {name: 'watt', symbol: 'W'},
    'power');
// noinspection JSUnusedGlobalSymbols
export const U_charge = defineUnit({current: 1, time: 1},
    {name: 'coulomb', symbol: 'C'},
    'charge');
// noinspection JSUnusedGlobalSymbols
export const U_capacitance = defineUnit({length: -2, mass: -1, time: 4, current: 2},
    {name: 'farad', symbol: 'F'},
    'capacitance');
// noinspection JSUnusedGlobalSymbols
export const U_voltage = defineUnit({length: 2, mass: 1, time: -3, current: -1},
    {name: 'volt', symbol: 'V', varName: 'V'},
    'voltage', 'EMF');
// noinspection JSUnusedGlobalSymbols
export const U_resistance = defineUnit({length: 2, mass: 1, time: -3, current: -1},
    {name: 'ohm', symbol: 'Ω', varName: 'R'},
    'resistance');
// noinspection JSUnusedGlobalSymbols
export const U_conductance = defineUnit({length: -2, mass: -1, time: 3, current: 1},
    {name: 'seimen', symbol: 'S'},
    'conductance');
// noinspection JSUnusedGlobalSymbols
export const U_flux = defineUnit({length: 2, mass: 1, time: -2, current: -1},
    {name: 'weber', symbol: 'Wb'},
    'flux');
// noinspection JSUnusedGlobalSymbols
export const U_fluxDensity = defineUnit({mass: 1, time: -2, current: -1},
    {name: 'tesla', symbol: 'T'},
    'fluxDensity');
// noinspection JSUnusedGlobalSymbols
export const U_inductace = defineUnit({length: 2, mass: 1, time: -2, current: -2},
    {name: 'henry', symbol: 'H'},
    'inductance');
