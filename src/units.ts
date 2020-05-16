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

/**
 * String literal parser for LaTeX literals (avoids the need for quoting backslash).
 */
const TeX = String.raw;

/**
 * Our enumerated primitive units.
 */
export enum Primitive {
    time = 'time',
    mass = 'mass',
    length = 'length',
    cycles = 'cycles', // Not SI base
    angle = 'angle',   // Not SI base
    solidAngle = 'solidAngle',   // Not SI base
    current = 'current', // Dunno why this is the SI base
    temperature = 'temperature',
    amount = 'amount', // Amount
    candela = 'candela' // An SI base unit for some reason
}

/**
 * A total order on units, for canonical display and key generation.
 */

const ORDER: {[K in Primitive]: number} = (i => {
    return {
        mass: i++,
        length: i++,
        angle: i++,
        solidAngle: i++,
        cycles: i++,
        amount: i++,
        current: i++,
        temperature: i++,
        time: i++,
        candela: i++
    };
})(0);

/**
 * Comparison predicate for primitive units to allow sorting them into a
 * canonical total order.
 *
 * @param a
 * @param b
 */
const orderUnits = (a: Primitive, b: Primitive) => {
    if (a === b) return 0;
    const ia = ORDER[a];
    const ib = ORDER[b];
    if (ia === ib) {
        // Shouldn't happen unless we're extending the set.
        return a < b ? -1 : 1;
    }
    return ia < ib ? -1 : 1;
};

/**
 * Our supported exponents. A finite list of exponents allows TypeScript to
 * automatically type exponents as numeric literal types.
 */
export type Exponent = -9|-8|-7|-6|-5|-4|-3|-2|-1|1|2|3|4|5|6|7|8|9;

/**
 * An object of primitive UNIT: Exponent pairs that uniquely describes each type.
 */
type UnitTerms = {
    [u in keyof typeof Primitive]?: Exponent;
};

/**
 * Turn the sttructured UnitTerms key into a string to do the lookup for unique types.
 * @param key
 */
const makeLookupKey = (key: UnitTerms) => {
    const units = Object.keys(key) as Primitive[];
    return units
        .filter(k => (key[k] || 0) !== 0)
        .sort(orderUnits)
        .map(k => `${PRIMITIVE_MAP[k]?.symbol || Throw(`Invalid primitive type name "${k} in type key.`)}^${key[k]}`)
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

/**
 * Marker interface indicating standard non-prefixed SI-compatible units.
 */
export interface SI {

}

/**
 * Marker interface indicating primitive standard non-prefixed SI-compatible units.
 */
export interface PrimitiveSI {

}

/**
 * The public interface to all units and alieses.
 */
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
    readonly tex: string;

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

    readonly si: Unit<T> & SI;
    /**
     * Convert the given value to (unprefixed) SI units, and return the converted value and the
     * corresponding SI unit.
     *
     * @param v
     * @return [number, Unit]
     */
    toSI<R extends number>(v: R): [R, Unit];

    /**
     * Convert the given value from (unprefixed) SI units, and return the converted value and
     * corresponding unit (i.e. this unit).
     * @param v
     * @param unit
     */
    fromSI<R extends number>(v: R, unit: Unit): [R, this];
}

/**
 * Base class for all units (and aliases).
 */
abstract class BaseUnit<T extends UnitTerms> implements Unit<T> {
    readonly key: T;
    readonly symbol?: string;
    readonly attributes: UnitAttributes;
    private id_?: string;
    // Our cached or supplied LaTeX string.
    private tex_?: string;

    abstract readonly si: Unit<T> & SI;

    protected constructor(key: T, attributes: UnitAttributes) {
        this.key = key;
        this.attributes = attributes;
        const {tex} = attributes;
        if (tex) {
            this.tex_ = tex;
        }
    }

    get tex(): string {
        const makeTex = (key: UnitTerms) => {
            const units = Object.keys(key) as Primitive[];
            const numUnits = units
                .filter(k => (key[k] || 0) > 0)
                .sort(orderUnits);
            const num = numUnits
                .map(k => TeX`${PRIMITIVE_MAP[k].tex}${(key[k] || 0) > 1 ? TeX`^(${key[k]})` : TeX``}`)
                .join(TeX`\dot`);
            const denomUnits = units
                .filter(k => (key[k] || 0) < 0)
                .sort(orderUnits);
            const denom = denomUnits
                .map(k => TeX`${PRIMITIVE_MAP[k].tex}${(key[k] || 0) < -1 ? TeX`^{${-(key[k] || 0)}}` : TeX``}`)
                .join(TeX`\dot`);
            return denomUnits.length === 0
                ? num
                : TeX`\frac{${num || 1}}{${denom}}`;
        };
        return this.tex_ || (
            this.tex_ = (
                this.symbol
                    ? TeX`\text{${this.symbol}}`
                    : makeTex(this.key)
            )
        );
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
        const add = (k: Primitive) => {
            const n = (this.key[k] || 0) + (u.key[k] || 0) * dir;
            if (n != 0) {
                nkey[k] = n as Exponent;
            }
        }
        const scan = (u: Unit) => (Object.keys(u.key) as Primitive[]).forEach(add);
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

    fromSI<R extends number>(v: R, unit: Unit): [R, this] {
        return [v, this];
    }

    toSI<R extends number>(v: R): [R, Unit] {
        return [v, this];
    }
}

/**
 * Our primitive (non-decomposable) units.
 */
class PrimitiveUnit<U extends Primitive> extends BaseUnit<{[K in U]: 1}>  implements SI, PrimitiveSI {
    readonly symbol: string;
    readonly name: string;
    readonly varName?: string;
    readonly unit: Primitive;
    constructor(u: U, name: string, symbol: string, varName?: string, attributes: UnitAttributes = {}) {
        super({[u]: 1} as {[K in U]: 1}, {name, symbol, varName, ...attributes});
        this.name = name;
        this.symbol = symbol;
        this.varName = varName;
        this.unit = u;
    }

    get si(): Unit<{ [K in U]: 1 }> & SI & PrimitiveSI {
        return this;
    }
}

/**
 * Type of our PRIMITIVE_MAP map. This provides one key/value entry for each primitive,
 * indexed by the UNIT enum.
 */
type PrimitiveMap = {
    [k in keyof typeof Primitive]: PrimitiveUnit<(typeof Primitive)[k]>
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

/**
 * A map from symbol for a Unit representing that unit.
 */
const SYMBOL_UNITS: {[key: string]: Unit } = { };

/**
 * A map from primitive name to its Unit instance.
 */
const PRIMITIVE_MAP: Readonly<PrimitiveMap> = (() => {
    const val: PrimitiveMap = {} as PrimitiveMap;
    const defPrimitive = (u: Primitive, name: string, symbol: string, varName?: string,
                          attributes: UnitAttributes = {}) =>
    {
        const primitive = new PrimitiveUnit(u, name, symbol, varName, attributes);
        (val as any)[u] = primitive;
        NAMED_UNITS[u] = primitive;
        NAMED_UNITS[name.toLowerCase()] = primitive;
        SYMBOL_UNITS[symbol] = primitive;
        return primitive;
    }
    defPrimitive(Primitive.time, 'second','s', 't', {si_base: true});
    defPrimitive(Primitive.mass, 'kilogram', 'kg', 'm',
        {si_base: true, scale: 1000});
    defPrimitive(Primitive.length, 'meter', 'm', 'l', {si_base: true});
    defPrimitive(Primitive.amount, 'mole', 'mol', 'n', {si_base: true});
    defPrimitive(Primitive.cycles, 'cycle', 'cycle', 'c');
    defPrimitive(Primitive.angle, 'radian', 'rad', '𝜃',
        {tex: TeX`\theta`});
    defPrimitive(Primitive.solidAngle, 'steridian', 'sr', undefined);
    defPrimitive(Primitive.current, 'ampere', 'A', 'A', {si_base: true});
    defPrimitive(Primitive.temperature, 'kelvin', 'K', 'T',
        {absolute: true, si_base: true});
    defPrimitive(Primitive.candela, 'candela', 'cd', 'c', {si_base: true})
    return val as PrimitiveMap;
})();

// Enter each primitive into the UNITS table by ID.
Object.values(PRIMITIVE_MAP)
    .forEach(u => UNITS[u.id] = u);

/**
 * Derived units build on the primitive units through multiplication (integration)
 * and division (differentiation).
 */
class DerivedUnit<T extends UnitTerms> extends BaseUnit<T> implements SI {
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
            const units = Object.keys(key) as Primitive[];
            const numUnits = units
                .filter(k => (key[k] || 0) > 0)
                .sort(orderUnits);
            const num = numUnits
                .map(k => `${PRIMITIVE_MAP[k].symbol}${(key[k] || 0) > 1 ? `^${key[k]}` : ''}`)
                .join(`·`);
            const denomUnits = units
                .filter(k => (key[k] || 0) < 0)
                .sort(orderUnits);
            const denom = denomUnits
                .map(k => `${PRIMITIVE_MAP[k].symbol}${(key[k] || 0) < -1 ? `^${-(key[k] || 0)}` : ''}`)
                .join(`·`);
            this.name = denomUnits.length === 0
                ? num
                : denomUnits.length === 1
                    ? `${num || 1}/${denom}`
                    : `${num || 1}/(${denom})`;
        }
    }

    get si(): Unit<T> & SI {
        return this;
    }
}

/**
 * Define a derived type.
 *
 * The numbers in the keys are exponents for primitive types. They are taken as type literals,
 *
 * This ensures, for example, that the types of U.velocity and U.acceleration are distinct.
 * ```javascript
 * const U.velocity     = defineUnit({distance: 1, time: -1});
 * const U.acceleration = defineUnit({distance: 1, time: -2});
 * ```
 * Results in types of:
 * ```
 * type U.velocity     = Unit<{distance: 1, time: -1}>
 * type U.acceleration = Unit<{distance: 1, time: -2}>
 * ```
 *
 * @param key The key defining the type composition
 * @param attributes Additional attributes describing the type.
 * @param names Additional names to use for this type, e.g. newton.
 */
export const defineUnit =
    <T extends UnitTerms>(key: T, attributes: UnitAttributes = {}, ...names: string[]): Unit<T> => {
        const lookupKey = makeLookupKey(key);
        const addName = (u: Unit<T>) => (n?: string, table = NAMED_UNITS) => {
            if (n) {
                const enamed = table[n];
                if (enamed) {
                    if (enamed !== u) {
                            throw new Error(`Conflict of name ${n}: ${enamed.name} => ${u.name}`);
                    }
                } else {
                    table[n] = u;
                }
            }
            return u;
        };
        const {name, symbol} = attributes;
        const addSpecials = (u: Unit<T>) => {
            const an = addName(u);
            an((name || u.name).toLowerCase());
            an(symbol, SYMBOL_UNITS);
        };
        const addNames = (u: Unit<T>) => {
            const an = addName(u);
            names.forEach(n => an(n.toLowerCase()));
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

export interface AliasAttributes extends Partial<PrimitiveUnitAttributes> {

}

/**
 * Marker interface for aliases.
 */
export interface Alias {

}
export class AliasUnit<T extends UnitTerms> extends BaseUnit<T> implements Alias {
    readonly name: string;
    readonly symbol: string;
    readonly si: Unit<T>;
    readonly scale: number;
    readonly offset: number;

    constructor(name: string, symbol: string, attributes: AliasAttributes, si: Unit<T> & SI, scale: number, offset: number = 0) {
        super(si.key, attributes);
        this.name = name;
        this.symbol = symbol;
        this.si = si.si;
        this.scale = scale;
        this.offset = offset;
    }

    toSI<R extends number>(v: R): [R, Unit] {
        const siScale = this.si.attributes.scale || 1;
        const siOffset = this.si.attributes.offset || 0;
        return [((v * this.scale + this.offset) / siScale - siOffset) as R, this.si];
    }

    fromSI<R extends number>(v: R, unit: Unit): [R, this] {
        const siScale = this.si.attributes.scale || 1;
        const siOffset = this.si.attributes.offset || 0;
        return [((((v - siOffset) * siScale) - this.offset) / this.scale) as R, this];
    }
}

/**
 * Our defined aliases.
 */
const ALIASES: {[k: string]: Unit & Alias} = {};

const SYMBOL_ALIASES: {[k: string]: Unit & Alias} = {};

/**
 * Define a unit alias, which can convert to/from a corresponding standard unprefixed SI unit.
 * @param name
 * @param symbol
 * @param attributes
 * @param si
 * @param scale
 * @param offset
 * @param names
 */
export const defineAlias =
    <T extends UnitTerms>(
        name: string, symbol: string, attributes: AliasAttributes
        , si: Unit<T>, scale: number, offset: number = 0,
        ...names: string[]
    ): Unit<T> & Alias => {
        const alias = new AliasUnit(
            name, symbol, attributes,
            si, scale, offset);
        const addName = (n: string, table = ALIASES) => {
            const lc = n.toLowerCase();
            const conflict = ALIASES[lc] || NAMED_UNITS[lc] || SYMBOL_ALIASES[n] || SYMBOL_UNITS[n];
            conflict
                ? Throw(`Name conflict for alias ${n} with unit ${conflict.name}`)
                : (table[n] = alias);
        };
        addName(name.toLowerCase());
        addName(symbol, SYMBOL_ALIASES);
        names.forEach(n => addName(n.toLowerCase()));
        return alias;
    };

export type PrefixSymbol = 'Y'|'Z'|'E'|'P'|'T'|'G'|'M'|'k'|'h'|'da'|'d'|'c'|'m'|'μ'|'u'|'n'|'p'|'f'|'a'|'z'|'y';
export type PrefixExponent = 24|21|18|15|12|9|6|3|2|1|-1|-2|-3|-6|-9|-12|-15|-18|-21|-24;
export type PrefixName = 'yotta'|'zetta'|'exa'|'peta'|'tera'|'giga'|'mega'|'kilo'|'hecto'|'deka'|
    'deci'|'centi'|'milli'|'micro'|'nano'|'pico'|'fempto'|'atto'|'zepto'|'yocto';

class Prefix {
    readonly symbol: PrefixSymbol;
    readonly name: PrefixName;
    readonly exponent: PrefixExponent;
    readonly tex?: string;

    constructor(sym: PrefixSymbol, exp: PrefixExponent, name: PrefixName, tex?: string) {
        this.symbol = sym;
        this.name = name;
        this.exponent = exp;
        this.tex = tex;
    }
}
// noinspection NonAsciiCharacters
const PREFIXES: {[K in PrefixSymbol|PrefixName|PrefixExponent]: Prefix} = ((t: {[K in PrefixSymbol]: [PrefixExponent, PrefixName, string?]} = {
    Y: [24, 'yotta'],
    Z: [21, 'zetta'],
    E: [18, 'exa'],
    P: [15, 'peta'],
    T: [12, 'tera'],
    G: [9, 'giga'],
    M: [6, 'mega'],
    k: [3, 'kilo'],
    h: [2, 'hecto'],
    da: [1, 'deka'],
    d: [-1, 'deci'],
    c: [-2, 'centi'],
    m: [-3, 'milli'],
    μ: [-6, 'micro', TeX`\mu`],
    u: [-6, 'micro', TeX`\mu`], // Alternative for typing-impaired.
    n: [-9, 'nano'],
    p: [-12, 'pico'],
    f: [-15, 'fempto'],
    a: [-18, 'atto'],
    z: [-21, 'zepto'],
    y: [-24, 'yocto']
}) => {
    const pt: any = {};
    Object.keys(t).forEach(k => {
        const kk = k === 'u' ? 'μ' : k;
        const a = t[kk as PrefixSymbol] as [PrefixExponent, PrefixName, string?];
        const p = new Prefix(kk as PrefixSymbol, ...a)
        pt[k] = p;
        pt[p.exponent] = p;
        pt[p.name] = p;
    });
    return pt as {[K in PrefixSymbol|PrefixName|PrefixExponent]: Prefix};
})();

/**
 * Parse a prefixed expression into a suitable Alias. Returns null if not found.
 * @param u
 * @param siOnly true if only non-aliases should be considered.
 */
const parsePrefix = (u: string, siOnly: boolean = false): Unit | null => {
    const n = /((?:yotta|zetta|exa|peta|tera|giga|mega|kilo|hecto|deka|deci|centi|milli|micro|nano|pico|fempto|atto|zepto|yocto))\s?-?\s?([^0-9^\/\s]+)/.exec(u);
    if (n) {
        const prefix = PREFIXES[n[1] as PrefixSymbol];
        const base = NAMED_UNITS[n[2]] || (!siOnly && ALIASES[n[2]]);
        if (!base) {
            return null;
        }
        return defineAlias(`${prefix.name}${u}`, u, {}, base, Math.pow(10, prefix.exponent))
    }
    const p = /(Y|Z|E|P|T|G|M|k|h|da|d|c|m|μ|u|n|p|f|a|z|y)([^0-9^\/\s]+)/.exec(u);
    if (!p) {
        return null;
    }
    const prefix = PREFIXES[p[1] as PrefixSymbol];
    const base = SYMBOL_UNITS[p[2]] || (!siOnly && SYMBOL_ALIASES[p[2]]);
    if (!base) {
        return null;
    }
    return defineAlias(`${prefix.name}${u}`, u, {}, base, Math.pow(10, prefix.exponent));
};

/**
 * Get a unit by name.
 *
 * To process a # + unit into standard unprefixed SI, do:
 * ```javascript
 * const [siVal, siUnit] = getUnit(unitName).toSI(val);
 * ```
 *
 * To just get the standard SI unit, do:
 * ```javascript
 * const siUnit = getUnit(unitName).si;
 * ```
 * @param name
 * @param siOnly if true, only unscaled SI units are returned.
 */
export const getUnit = (name: string, siOnly: boolean = false) => {
    const lc = name.toLowerCase();
    return NAMED_UNITS[lc] || SYMBOL_UNITS[name]
        || !siOnly && (ALIASES[lc] || SYMBOL_ALIASES[name])
        || parsePrefix(name, siOnly)
        || Throw(`No unit named ${name}`);
};

/**
 * Namespace for primitives only; merged into the U namespace.
 */
export namespace P {
    export const mass: Unit<{ mass: 1 }> = PRIMITIVE_MAP.mass;
    export const time: Unit<{ time: 1 }> = PRIMITIVE_MAP.time;
    export const length: Unit<{ length: 1 }> = PRIMITIVE_MAP.length;
    export const angle: Unit<{ angle: 1 }> = PRIMITIVE_MAP.angle;
    export const amount: Unit<{ amount: 1 }> = PRIMITIVE_MAP.amount;
    export const cycles: Unit<{ cycles: 1 }> = PRIMITIVE_MAP.cycles;
    export const current: Unit<{ current: 1 }> = PRIMITIVE_MAP.current;
    export const temperature: Unit<{ temperature: 1 }> = PRIMITIVE_MAP.temperature;
    export const candela: Unit<{ candela: 1 }> = PRIMITIVE_MAP.candela;
}

export {U} from './unit-defs';

/**
 * A namespace for unit test access
 */
export namespace TEST {
    export const PRIMITIVES_MAP_ = PRIMITIVE_MAP;
    // noinspection JSUnusedGlobalSymbols
    export const UNITS_ = UNITS;
    export const NAMED_UNITS_ = NAMED_UNITS;
    export const ALIASES_ = ALIASES;
    /**
     * Delete a unit created by a test case.
     * @param u
     */
    export const deleteUnit_ = (u: Unit | null | undefined) => {
        if (u) {
            const delFrom = (table: { [k: string]: Unit }) =>
                Object.keys(table)
                    .forEach(k => table[k] === u && delete table[k]);
            delFrom(NAMED_UNITS_);
            delFrom(UNITS_);
            delFrom(ALIASES_);
        }
    };
    export const parsePrefix_ = parsePrefix;
}
