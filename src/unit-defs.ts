/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */
/**
 * @packageDocumentation
 * @module Units
 */
import {IUnitBase, P, PUnitTerms} from "./primitive-units";
import {defineAlias, defineUnit} from "./units";

/**
 * Collect common unit constants under a U namespace.
 * Using a namespace allows precise typescript typing, while keeping the namespace
 * distinct from the start. Otherwise, import * from './unit-defs' would
 * be dangerous as types are added.
 *
 * This is a better alternative to prefixing all the names with U_.
 */
export namespace Units {
    const cu = <T extends PUnitTerms>(p: IUnitBase<T>) =>
        defineUnit(p.key, {
            name: p.name,
            ...p.attributes,
            names: [p.name, ...p.names || []]
        });
    export const mass = cu(P.mass);
    export type mass = typeof mass;
    export const length = cu(P.length);
    export type length = typeof length;
    export const time = cu(P.time);
    export type time = typeof time;
    export const angle = cu(P.angle);
    export type angle = typeof angle;
    export const solidAngle = cu(P.solidAngle);
    export type solidAngle = typeof solidAngle;
    export const amount = cu(P.amount);
    export type amount = typeof amount;
    export const cycles = cu(P.cycles);
    export type cycles = typeof cycles;
    export const current = cu(P.current);
    export type current = typeof current;
    export const temperature = cu(P.temperature);
    export type temperature = typeof temperature;
    export const candela = cu(P.candela);
    export type candela = typeof candela;
    export const money = cu(P.money);
    export type money = typeof money;

    export const unity = defineUnit({},
        {name: '1', symbol: '', si_base: true},
        'unity');
    export type unity = typeof unity;

    export const velocity = defineUnit({length: 1, time: -1},
        {varName: 'V'},
        'velocity');
    export type velocity = typeof velocity;

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

    export const volume = defineUnit({length: 3},
        {varName: 'V'},
        'volume');
    export type volume = typeof volume;

    export const density = defineUnit({mass: 1, length: -3},
        {},
        'density');
    export type density = typeof density;

    export const frequency = defineUnit({cycles: 1, time: -1},
        {name: 'hertz', symbol: 'Hz', varName: 'f'},
        'frequency');
    export type frequency = typeof frequency;

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

    export const capacitance = defineUnit({length: -2, mass: -1, time: 4, current: 2},
        {name: 'farad', symbol: 'F'},
        'capacitance');
    export type capacitance = typeof capacitance;

    export const voltage = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'volt', symbol: 'V', varName: 'V'},
        'voltage', 'EMF');
    export type voltage = typeof voltage;

    export const resistance = defineUnit({length: 2, mass: 1, time: -3, current: -1},
        {name: 'ohm', symbol: 'Ω', varName: 'R'},
        'resistance');
    export type resistance = typeof resistance;

    export const conductance = defineUnit({length: -2, mass: -1, time: 3, current: 1},
        {name: 'siemen', symbol: 'S'},
        'conductance');
    export type conductance = typeof conductance;

    export const flux = defineUnit({length: 2, mass: 1, time: -2, current: -1},
        {name: 'weber', symbol: 'Wb'},
        'flux');
    export type flux = typeof flux;

    export const fluxDensity = defineUnit({mass: 1, time: -2, current: -1},
        {name: 'tesla', symbol: 'T'},
        'fluxDensity');
    export type fluxDensity = typeof fluxDensity;

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
        Units.time, 60);

    // noinspection JSUnusedGlobalSymbols
    export const hour = defineAlias('hour', 'h', {},
        Units.time, 3600, 0,
        'hr');

    // noinspection JSUnusedGlobalSymbols
    export const day = defineAlias('day', 'd', {},
        Units.time, 3600 * 24);

    // noinspection JSUnusedGlobalSymbols
    export const week = defineAlias('week', 'wk', {},
        Units.time, 3600 * 24 * 7);

    // noinspection JSUnusedGlobalSymbols
    export const celsius = defineAlias('celsius', '°C', {},
        Units.temperature, 273.15);

    // noinspection JSUnusedGlobalSymbols
    export const degreeArc = defineAlias('degreeArc', '°', {},
        Units.angle, Math.PI / 180);

    // noinspection JSUnusedGlobalSymbols
    export const minuteArc = defineAlias('minuteArc', `'`, {},
        Units.angle, Math.PI / (180 * 60));

    // noinspection JSUnusedGlobalSymbols
    export const secondArc = defineAlias('secondArc', `"`, {},
        Units.angle, Math.PI / (180 * 3600));

    // noinspection JSUnusedGlobalSymbols
    export const hectare = defineAlias('hectare', `ha`, {},
        Units.area, 10000);

    // 'T' would conflict with 'tesla'
    // noinspection JSUnusedGlobalSymbols
    export const tonne = defineAlias('tonne', 'Ton', {},
        Units.mass, 1000);

    // noinspection JSUnusedGlobalSymbols
    export const tonUS = defineAlias('ton (US)', 'Ton (US)', {},
        Units.mass, 987.186);

    // noinspection JSUnusedGlobalSymbols
    export const inch = defineAlias('inch', 'in', {},
        Units.length, 0.0254);

    // noinspection JSUnusedGlobalSymbols
    export const foot = defineAlias('foot', 'ft', {},
        Units.length, 0.3048);

    // noinspection JSUnusedGlobalSymbols
    export const yard = defineAlias('yard', 'yd', {},
        Units.length, 0.9144);

    // noinspection JSUnusedGlobalSymbols
    export const mile = defineAlias('mile', 'mi', {},
        Units.length, 1609.344);

    // noinspection JSUnusedGlobalSymbols
    export const nautical_mile = defineAlias('nautical mile', 'NM', {},
        Units.length, 1852);

    // noinspection JSUnusedGlobalSymbols
    export const knot = defineAlias('knot', 'kt', {},
        Units.velocity, 1852 / 3600);

    // noinspection JSUnusedGlobalSymbols
    export const angstrom = defineAlias('angstrom', 'Å', {},
        Units.length, 0.0000000001, 0,
        'ångstrom');

    // noinspection JSUnusedGlobalSymbols
    export const gram = defineAlias('gram', 'g', {},
        Units.mass, 0.001);

    // noinspection JSUnusedGlobalSymbols
    export const barrel = defineAlias('barrel', 'bbl', {},
        Units.volume, 158.98729492);

    // noinspection JSUnusedGlobalSymbols
    export const gallon = defineAlias('gallon', 'gal', {},
        Units.volume, 3.785411784);

    // noinspection JSUnusedGlobalSymbols
    export const quart = defineAlias('quart', 'qt', {},
        Units.volume, 3.785411784 / 4);

    // noinspection JSUnusedGlobalSymbols
    export const pint = defineAlias('pint', 'pt', {},
        Units.volume, 3.785411784 / 8);

    // noinspection JSUnusedGlobalSymbols
    export const cup = defineAlias('cup', 'cp', {},
        Units.volume, 3.785411784 / 16);

    // noinspection JSUnusedGlobalSymbols
    export const tablespoon = defineAlias('tablespoon', 'Tbl', {},
        Units.volume, 0.0147868);

    // noinspection JSUnusedGlobalSymbols
    export const teaspoon = defineAlias('teaspoon', 'tsp', {},
        Units.volume, 0.0147868/3);

    // noinspection JSUnusedGlobalSymbols
    export const btu = defineAlias('british thermal unit', 'btu', {},
        Units.energy, 1055.06);

    // noinspection JSUnusedGlobalSymbols
    export const ounce = defineAlias('ounce', 'oz', {},
        Units.force, 0.278);

    // noinspection JSUnusedGlobalSymbols
    export const pound = defineAlias('pound', 'lb', {},
        Units.force, 0.278 * 16);

    // noinspection JSUnusedGlobalSymbols
    export const stone = defineAlias('stone', 'stone', {},
        Units.force, 201.168);

    // noinspection JSUnusedGlobalSymbols
    export const furlong = defineAlias('furlong', 'furlong', {},
        Units.length, 201.168);

    // noinspection JSUnusedGlobalSymbols
    export const fortnight = defineAlias('fortnight', 'fortnight', {},
        Units.time, 14*24*60*60);

    // noinspection JSUnusedGlobalSymbols
    export const smoot = defineAlias('smoot', 'smoot', {},
        Units.length, 1.7018);
}
