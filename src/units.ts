/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Representation and manipulation of physical units.
 *
 * These are based on SI, and in particular the
 * (Guide for the Use of the International System of Units (SI))[https://physics.nist.gov/cuu/pdf/sp811.pdf]
 * However, this does not try to be complete, and extends the set of base units somewhat
 * to aid clarity (for example, 'cycles/revolutions') while preserving semantics and standardized presentation.
 * Having units that map to SI '1' is not very helpful sometimes.
 */

import {Throw, Writeable} from "./utils";

export enum UNIT {
    time = 'time',
    mass = 'mass',
    length = 'length',
    cycles = 'cycles', // Not SI base
    angle = 'angle',   // Not SI base
    voltage = 'voltage',   // Not SI base
    current = 'current', // Dunno why this is the SI base
    temperature = 'temperature',
    amount = 'amount', // Amount
    candela = 'candela' // An SI base unit for some reason
}

/**
 * A total order on units, for canonical display and key generation.
 */

const ORDER: {[K in UNIT]: number} = (i => {
    return {
        mass: i++,
        length: i++,
        angle: i++,
        cycles: i++,
        amount: i++,
        voltage: i++, // EMF, technically, but better known by the unit.
        current: i++,
        temperature: i++,
        time: i++,
        candela: i++
    };
})(0);

const orderUnits = (a: UNIT, b: UNIT) => {
    if (a === b) return 0;
    const ia = ORDER[a];
    const ib = ORDER[b];
    if (ia === ib) {
        // Shouldn't happen unless we're extending the set.
        return a < b ? -1 : 1;
    }
    return ia < ib ? -1 : 1;
};

export type Exponent = -5|-4|-3|-2|-1|1|2|3|4|5;

type UnitTerms = {
    [u in keyof typeof UNIT]?: Exponent;
};

/**
 * Turn the sttructured UnitTerms key into a string to do the lookup for unique types.
 * @param key
 */
const makeLookupKey = (key: UnitTerms) => {
    const units = Object.keys(key) as UNIT[];
    return units
        .filter(k => (key[k] || 0) !== 0)
        .sort(orderUnits)
        .map(k => `${PRIMITIVES[k]?.symbol || Throw(`Invalid primitive type name "${k} in type key.`)}^${key[k]}`)
        .join(' ');
}

export interface PrimitiveUnitAttributes {
    name: string;
    symbol: string;
    varName: string;
    absolute?: boolean;
    si_base?: boolean;
    [k: string]: any;
}

export interface UnitAttributes extends Partial<PrimitiveUnitAttributes> {
    tex?: string;
    scale?: number;
    offset?: number;
}

export interface Unit<T extends UnitTerms = UnitTerms> {
    /**
     * Unique lookup key for this type.
     */
    readonly key: T;
    readonly id: string;

    readonly name: string;

    readonly symbol?: string;
    readonly varName?: string;
    readonly attributes: UnitAttributes;

    /**
     * Call to check units for addition/subtraction.
     * Throws an error if the units are not the same.
     * @param u
     */
    add(u: Unit<T>): this;

    /**
     * Produce new units multipying these units.
     * @param u
     */
    multiply(u: Unit): Unit;

    /**
     * Produce new units dividing by these units.
     * @param u
     */
    divide(u: Unit): Unit;
}

abstract class BaseUnit<T extends UnitTerms> implements Unit<T> {
    readonly key: T;
    readonly attributes: UnitAttributes;
    private id_?: string;

    protected constructor(key: T, attributes: UnitAttributes) {
        this.key = key;
        this.attributes = attributes;
    }

    get id() {
        return this.id_ || (this.id_ = makeLookupKey(this.key));
    }
    add(u: Unit<T>): this {
        const t = this;
        if (u !== t) {
            throw new Error(`Incompatible types: ${t.name} and ${u.name}`);
        }
        return this;
    }

    abstract readonly name: string;

    private combine<X extends UnitTerms>(u: Unit<X>, dir = 1 | -1): Unit {
        const nkey: Writeable<UnitTerms> = {};
        const add = (k: UNIT) => {
            const n = (this.key[k] || 0) + (u.key[k] || 0) * dir;
            if (n != 0) {
                nkey[k] = n as Exponent;
            }
        }
        const scan = (u: Unit) => (Object.keys(u.key) as UNIT[]).forEach(add);
        scan(this);
        scan(u);
        return defineUnit(nkey);
    }

    multiply<X extends UnitTerms>(u: Unit<X>): Unit {
        return this.combine(u, 1);
    }

    divide<X extends UnitTerms>(u: Unit<X>): Unit {
        return this.combine(u, -1);
    }
}

class PrimitiveUnit<U extends UNIT> extends BaseUnit<{[K in U]: 1}> {
    readonly symbol: string;
    readonly name: string;
    readonly varName: string;
    readonly unit: UNIT;
    constructor(u: U, name: string, symbol: string, varName: string, attributes: UnitAttributes) {
        super({[u]: 1} as {[K in U]: 1}, {name, symbol, varName, ...attributes});
        this.name = name;
        this.symbol = symbol;
        this.varName = varName;
        this.unit = u;
    }
}

type PrimitiveMap = {
    [k in keyof typeof UNIT]: PrimitiveUnit<(typeof UNIT)[k]>
};

/**
 * A map from unit key's string representation to the Unit instance.
 */
const UNITS: {
    [k: string]: Unit;
} = {};

/**
 * A map from name to the Unit representing that unit.
 */
const NAMED_UNITS: {[key: string]: Unit } = { };
export const getUnit = (name: string) =>
    NAMED_UNITS[name]
    || Throw(`No unit named ${{name}}`);

/**
 * A map from primitive name to its Unit instance.
 */
const PRIMITIVES: Readonly<PrimitiveMap> = (() => {
    const val: PrimitiveMap = {} as PrimitiveMap;
    const defPrimitive = (u: UNIT, name: string, symbol: string, varName: string,
                          attributes: UnitAttributes = {}) =>
    {
        const primitive = new PrimitiveUnit(u, name, symbol, varName, attributes);
        (val as any)[u] = primitive;
        NAMED_UNITS[u] = primitive;
        NAMED_UNITS[name] = primitive;
        NAMED_UNITS[symbol] = primitive;
        return primitive;
    }
    defPrimitive(UNIT.time, 'second','s', 't', {si_base: true});
    defPrimitive(UNIT.mass, 'kilogram', 'kg', 'm',
        {si_base: true, scale: 1000});
    defPrimitive(UNIT.length, 'meter', 'm', 'l', {si_base: true});
    defPrimitive(UNIT.amount, 'mole', 'mol', 'n', {si_base: true});
    defPrimitive(UNIT.cycles, 'cycle', 'cycle', 'c');
    defPrimitive(UNIT.angle, 'radian', 'rad', '𝜃');
    defPrimitive(UNIT.voltage, 'volt', 'V', 'V');
    defPrimitive(UNIT.current, 'ampere', 'A', 'A', {si_base: true});
    defPrimitive(UNIT.temperature, 'kelvin', 'K', 'T',
        {absolute: true, si_base: true});
    defPrimitive(UNIT.candela, 'candela', 'cd', 'c', {si_base: true})
    return val as PrimitiveMap;
})();

Object.values(PRIMITIVES)
    .forEach(u => UNITS[u.id] = u);

class DerivedUnit<T extends UnitTerms> extends BaseUnit<T> {
    readonly name: string;
    readonly symbol?: string;
    readonly varName?: string;
    constructor(key: T, attributes: UnitAttributes = {}) {
        super(key, attributes);
        const {name, symbol, varName} = attributes;
        if (symbol) {
            this.symbol = symbol;
        }
        if (varName) {
            this.varName = varName;
        }
        if (name) {
            this.name = name;
        } else {
            const units = Object.keys(key) as UNIT[];
            const num = units
                .filter(k => (key[k] || 0) > 0)
                .sort(orderUnits)
                .reduce((acc, k) => acc + ` ${PRIMITIVES[k].symbol}${(key[k] || 0) > 1 ? `^${key[k]}` : ''}`, '')
                .trim();
            const denom = units
                .filter(k => (key[k] || 0) < 0)
                .sort(orderUnits)
                .reduce((acc, k) => acc + ` ${PRIMITIVES[k].symbol}${(key[k] || 0) < -1 ? `^${-(key[k] || 0)}` : ''}`, '')
                .trim();
            this.name = denom ? `${num || 1}/${denom}` : num;
        }
    }
}

/**
 * Define a derived type.
 *
 * The numbers in the keys are exponents for primitive types. They are taken as type literals,
 *
 * This ensures, for example, that the types of U_velocity and U_acceleration are distinct.
 * ```javascript
 * const U_velocity     = defineUnit({distance: 1, time: -1});
 * const U_acceleration = defineUnit({distance: 1, time: -2});
 * ```
 * Results in types of:
 * ```
 * type U_velocity     = Unit<{distance: 1, time: -1}>
 * type U_acceleration = Unit<{distance: 1, time: -2}>
 * ```
 *
 * @param key The key defining the type composition
 * @param attributes Additional attributes describing the type.
 * @param names Additional names to use for this type, e.g. newton.
 */
export const defineUnit =
    <T extends UnitTerms>(key: T, attributes: UnitAttributes = {}, ...names: string[]): Unit<T> => {
        const lookupKey = makeLookupKey(key);
        const addName = (u: Unit<T>) => (n?: string) => {
            if (n) {
                const enamed = NAMED_UNITS[n];
                if (enamed) {
                    if (enamed !== u) {
                            throw new Error(`Conflict of name ${n}: ${enamed.name} => ${u.name}`);
                    }
                } else {
                    NAMED_UNITS[n] = u;
                }
            }
            return u;
        };
        const {name, symbol} = attributes;
        const addSpecials = (u: Unit<T>) => {
            const an = addName(u);
            an(name || u.name);
            an(symbol);
        };
        const addNames = (u: Unit<T>) => {
            names.forEach(addName(u));
            addSpecials(u);
        }
        const existing = UNITS[lookupKey] as Unit<T>;
        if (existing) {
            addNames(existing);
            // Once set, attributes cannot be modified, but new ones can be added.
            Object.assign(existing.attributes, {...attributes, ...existing.attributes});
            return existing;
        }
        const newUnit = new DerivedUnit(key, attributes);
        UNITS[lookupKey] = newUnit;
        addNames(newUnit);
    return newUnit;
};

// noinspection JSUnusedGlobalSymbols
export const U_mass: Unit<{mass: 1}> = PRIMITIVES.mass;
// noinspection JSUnusedGlobalSymbols
export const U_time = PRIMITIVES.time;
// noinspection JSUnusedGlobalSymbols
export const U_length: Unit<{length: 1}> = PRIMITIVES.length;
// noinspection JSUnusedGlobalSymbols
export const U_angle = PRIMITIVES.angle;
// noinspection JSUnusedGlobalSymbols
export const U_amount = PRIMITIVES.amount;
// noinspection JSUnusedGlobalSymbols
export const U_cycles = PRIMITIVES.cycles;
// noinspection JSUnusedGlobalSymbols
export const U_current = PRIMITIVES.current;
// noinspection JSUnusedGlobalSymbols
export const U_voltage = PRIMITIVES.voltage;
// noinspection JSUnusedGlobalSymbols
export const U_temperature = PRIMITIVES.temperature;
// noinspection JSUnusedGlobalSymbols
export const U_candela = PRIMITIVES.candela;

export const U_unity = defineUnit({}, {si_base: true});

export const U_velocity = defineUnit({length: 1, time: -1},
    {varName: 'V'});
// noinspection JSUnusedGlobalSymbols
export const U_acceleration = defineUnit({length: 1, time: -2},
    {varName: 'a'});
// noinspection JSUnusedGlobalSymbols
export const U_force = defineUnit({mass: 1, length: 1, time: -2},
    {symbol: 'N', varName: 'F'},
    'newton');
// noinspection JSUnusedGlobalSymbols
export const U_energy = defineUnit({mass: 1, length: 2, time: -2},
    {symbol: 'J', varName: 'E', name: 'joule'},
    'joule', 'J');
// noinspection JSUnusedGlobalSymbols
export const U_momentum = defineUnit({mass: 1, length: 1, time: -1},
    {varName: 'p'});
export const U_area = defineUnit({length: 2},
    {varName: 'a'},
    'area');
// noinspection JSUnusedGlobalSymbols
export const U_volume = defineUnit({length: 3},
    {varName: 'V'},
    'volume');

/**
 * A namespace for unit test access
 */
export namespace TEST {
    export const PRIMITIVES_ = PRIMITIVES;
    export const NAMED_UNITS_ = NAMED_UNITS;
    /**
     * Delete a unit created by a test case.
     * @param u
     */
    export const deleteUnit = (u: Unit | null | undefined) => {
        if (u) {
            const delFrom = (table: { [k: string]: Unit }) =>
                Object.keys(table)
                    .forEach(k => table[k] === u && delete table[k]);
            delFrom(NAMED_UNITS_);
            delFrom(UNITS);
        }
    };
}
