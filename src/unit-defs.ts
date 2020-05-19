/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {defineAlias, defineUnit, P} from "./units";

/**
 * Collect common unit constants under a U namespace.
 * Using a namespace allows precise typescript typing, while keeping the namespace
 * distinct from the start. Otherwise, import * from './unit-defs' would
 * be dangerous as types are added.
 *
 * This is a better alternative to prefixing all the names with U_.
 */
export namespace U {
    export const mass = P.mass;
    // noinspection JSUnusedGlobalSymbols
    export type mass = typeof mass;
    export const length = P.length;
    export type length = typeof length;
    export const time = P.time;
    export type time = typeof time;
    // noinspection JSUnusedGlobalSymbols
    export const angle = P.angle;
    export type angle = typeof angle;
    // noinspection JSUnusedGlobalSymbols
    export const amount = P.amount;
    // noinspection JSUnusedGlobalSymbols
    export type amount = typeof amount;
    // noinspection JSUnusedGlobalSymbols
    export const cycles = P.cycles;
    // noinspection JSUnusedGlobalSymbols
    export type cycles = typeof cycles;
    export const current = P.current;
    export type current = typeof current;
    // noinspection JSUnusedGlobalSymbols
    export const temperature = P.temperature;
    // noinspection JSUnusedGlobalSymbols
    export type temperature = typeof temperature;
    export const candela = P.candela;
    export type candela = typeof candela;

    export const unity = defineUnit({},
        {name: '1', symbol: '', si_base: true},
        'unity');
    export type unity = typeof unity;

    export const velocity = defineUnit({length: 1, time: -1},
        {varName: 'V'},
        'velocity');
    export type velocity = typeof velocity;

    // noinspection JSUnusedGlobalSymbols
    export const angularVelocity = defineUnit({angle: 1, time: -1},
        {varName: 'ω'},
        'angularVelocity');
    export type angularVelocity = typeof angularVelocity;

    export const acceleration = defineUnit({length: 1, time: -2},
        {varName: 'a'},
        'acceleration');
    export type acceleration = typeof acceleration;

    export const force = defineUnit({mass: 1, length: 1, time: -2},
        {name: 'newton', symbol: 'N', varName: 'F'},
        'force');
    export type force = typeof force;

    // noinspection JSUnusedGlobalSymbols
    export const torque = defineUnit({mass: 1, length: 2, time: -2},
        {},
        'torque');
    export type torque = typeof torque;

    export const energy = defineUnit({mass: 1, length: 2, time: -2},
        {symbol: 'J', varName: 'E', name: 'joule'},
        'energy');
    export type energy = typeof energy;

    export const momentum = defineUnit({mass: 1, length: 1, time: -1},
        {varName: 'p'},
        'momentum', 'impulse');
    export type momentum = typeof momentum;

    export const area = defineUnit({length: 2},
        {varName: 'a'},
        'area');
    export type area = typeof area;

    // noinspection JSUnusedGlobalSymbols
    export const volume = defineUnit({length: 3},
        {varName: 'V'},
        'volume');
    export type volume = typeof volume;

    // noinspection JSUnusedGlobalSymbols
    export const density = defineUnit({mass: 1, length: -3},
        {},
        'density');
    export type density = typeof density;

    // noinspection JSUnusedGlobalSymbols
    export const frequency = defineUnit({cycles: 1, time: -1},
        {name: 'hertz', symbol: 'Hz', varName: 'f'},
        'frequency');
    export type frequency = typeof frequency;

    // noinspection JSUnusedGlobalSymbols
    export const wavelength = defineUnit({length: 1, cycles: -1},
        {},
        'wavelength');
    export type wavelength = typeof wavelength;

    export const power = defineUnit({mass: 1, length: 2, time: -3},
        {name: 'watt', symbol: 'W'},
        'power');
    export type power = typeof power;

    export const charge = defineUnit({current: 1, time: 1},
        {name: 'coulomb', symbol: 'C'},
        'charge');
    export type charge = typeof charge;

    // noinspection JSUnusedGlobalSymbols
    export const capacitance = defineUnit({length: -2, mass: -1, time: 4, current: 2},
        {name: 'farad', symbol: 'F'},
        'capacitance');
    export type capacitance = typeof capacitance;

    export const voltage = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'volt', symbol: 'V', varName: 'V'},
        'voltage', 'EMF');
    export type voltage = typeof voltage;

    // noinspection JSUnusedGlobalSymbols
    export const resistance = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'ohm', symbol: 'Ω', varName: 'R'},
        'resistance');
    export type resistance = typeof resistance;

    // noinspection JSUnusedGlobalSymbols
    export const conductance = defineUnit({length: -2, mass: -1, time: 3, current: 1},
        {name: 'siemen', symbol: 'S'},
        'conductance');
    export type conductance = typeof conductance;

    // noinspection JSUnusedGlobalSymbols
    export const flux = defineUnit({length: 2, mass: 1, time: -2, current: -1},
        {name: 'weber', symbol: 'Wb'},
        'flux');
    export type flux = typeof flux;

    // noinspection JSUnusedGlobalSymbols
    export const fluxDensity = defineUnit({mass: 1, time: -2, current: -1},
        {name: 'tesla', symbol: 'T'},
        'fluxDensity');
    export type fluxDensity = typeof fluxDensity;

    // noinspection JSUnusedGlobalSymbols
    export const inductance = defineUnit({length: 2, mass: 1, time: -2, current: -2},
        {name: 'henry', symbol: 'H'},
        'inductance');
    export type inductance = typeof inductance;

    // noinspection JSUnusedGlobalSymbols
    export const liter = defineAlias('liter', 'L', {},
        volume, 0.001, 0,
        'litre');

    // noinspection JSUnusedGlobalSymbols
    export const minute = defineAlias('minute', 'min', {},
        U.time, 60);

    // noinspection JSUnusedGlobalSymbols
    export const hour = defineAlias('hour', 'h', {},
        U.time, 3600, 0,
        'hr');

    // noinspection JSUnusedGlobalSymbols
    export const day = defineAlias('day', 'd', {},
        U.time, 3600 * 24);

    // noinspection JSUnusedGlobalSymbols
    export const week = defineAlias('week', 'wk', {},
        U.time, 3600 * 24 * 7);

    // noinspection JSUnusedGlobalSymbols
    export const celsius = defineAlias('celsius', '°C', {},
        U.temperature, 273.15);

    // noinspection JSUnusedGlobalSymbols
    export const degreeArc = defineAlias('degreeArc', '°', {},
        U.angle, Math.PI / 180);

    // noinspection JSUnusedGlobalSymbols
    export const minuteArc = defineAlias('minuteArc', `'`, {},
        U.angle, Math.PI / (180 * 60));

    // noinspection JSUnusedGlobalSymbols
    export const secondArc = defineAlias('secondArc', `"`, {},
        U.angle, Math.PI / (180 * 3600));

    // noinspection JSUnusedGlobalSymbols
    export const hectare = defineAlias('hectare', `ha`, {},
        U.area, 10000);

    // 'T' would conflict with 'tesla'
    // noinspection JSUnusedGlobalSymbols
    export const tonne = defineAlias('tonne', 'Ton', {},
        U.mass, 1000);

    // noinspection JSUnusedGlobalSymbols
    export const inch = defineAlias('inch', 'in', {},
        U.length, 0.0254);

    // noinspection JSUnusedGlobalSymbols
    export const foot = defineAlias('foot', 'ft', {},
        U.length, 0.3048);

    // noinspection JSUnusedGlobalSymbols
    export const yard = defineAlias('yard', 'yd', {},
        U.length, 0.9144);

    // noinspection JSUnusedGlobalSymbols
    export const mile = defineAlias('mile', 'mi', {},
        U.length, 1609.344);

    // noinspection JSUnusedGlobalSymbols
    export const angstrom = defineAlias('angstrom', 'Å', {},
        U.length, 0.0000000001, 0,
        'ångstrom');

    // noinspection JSUnusedGlobalSymbols
    export const gram = defineAlias('gram', 'g', {},
        U.mass, 0.001);
}
