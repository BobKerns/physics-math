/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
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
import {
    BaseUnit,
    completeKey,
    CompleteTerms,
    CUnit,
    CUnitTerms,
    DivideTerms,
    Exponent,
    makeLookupKey,
    MultiplyTerms,
    orderUnits,
    Primitive,
    PRIMITIVE_MAP,
    primitiveKeys,
    PrimitiveUnitAttributes,
    SI,
    TeX,
    Unit,
    UnitAttributes,
    UnitTerms
} from "./primitive-units";

/**
 * A map from unit key's string representation to the Unit instance.
 */
const UNITS: {
    [k: string]: CUnit;
} = {};

/**
 * A map from name to the Unit representing that unit.
 */
const NAMED_UNITS: {[key: string]: CUnit } = { };

/**
 * A map from symbol for a Unit representing that unit.
 */
const SYMBOL_UNITS: {[key: string]: CUnit } = { };

/**
 * Derived units build on the primitive units through multiplication (integration)
 * and division (differentiation).
 */
// noinspection JSUnusedLocalSymbols
class DerivedUnit<T extends CUnitTerms> extends BaseUnit<T> implements CUnit<T>, SI {
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
        if (!name) {
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
        } else {
            this.name = name;
        }
    }

    get si(): CUnit<T> & SI {
        return this as unknown as CUnit<T> & SI;
    }

    readonly name: string;

    add(u: CUnit<T>): CUnit<T> {
        const t = this;
        if (u !== (t as unknown)) {
            throw new Error(`Incompatible types: ${t.name} and ${u.name}`);
        }
        return u;
    }

    private combine<X extends UnitTerms>(u: Unit<X>, dir = 1 | -1): CUnit {
        const nkey: Writeable<UnitTerms> = {};
        const add = (k: Primitive) => {
            const n = (this.key[k] || 0) + (u.key[k] || 0) * dir;
            if (n != 0) {
                nkey[k] = n as Exponent;
            }
        }
        primitiveKeys.forEach(add);
        return defineUnit(nkey as CUnitTerms);
    }

    multiply<X extends CUnitTerms>(u: CUnit<X>): CUnit<MultiplyTerms<T, X>> {
        return this.combine(u, 1) as CUnit<MultiplyTerms<T, X>>;
    }

    divide<X extends CUnitTerms>(u: CUnit<X>): CUnit<DivideTerms<T, X>> {
        return this.combine(u, -1) as CUnit<DivideTerms<T, X>>;
    }

    fromSI(v: number, unit: CUnit): [number, this] {
        return [v, this];
    }

    toSI(v: number): [number, CUnit] {
        return [v, this];
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
    <T extends UnitTerms>(key: T, attributes: UnitAttributes = {}, ...names: string[]): CUnit<CompleteTerms<T>> => {
        const cKey = completeKey(key);
        const lookupKey = makeLookupKey(cKey);
        const addName = (u: CUnit) => (n?: string, table = NAMED_UNITS) => {
            if (n) {
                const eNamed = table[n];
                if (eNamed) {
                    if (eNamed !== u) {
                            throw new Error(`Conflict of name ${n}: ${eNamed.name} => ${u.name}`);
                    }
                } else {
                    table[n] = u;
                }
            }
            return u;
        };
        const {name, symbol} = attributes;
        const addSpecials = (u: CUnit) => {
            const an = addName(u);
            an((name || u.name).toLowerCase());
            an(symbol, SYMBOL_UNITS);
        };
        const addNames = (u: CUnit) => {
            const an = addName(u);
            names.forEach(n => an(n.toLowerCase()));
            addSpecials(u);
        };
        const existing = UNITS[lookupKey];
        if (existing) {
            addNames(existing);
            // Once set, attributes cannot be modified, but new ones can be added.
            Object.assign(existing.attributes, {...attributes, ...existing.attributes});
            return existing as CUnit<CompleteTerms<T>>;
        }
        const newUnit = new DerivedUnit(cKey, attributes);
        UNITS[lookupKey] = newUnit;
        addNames(newUnit);
    return newUnit as CUnit<CompleteTerms<T>>;
};

export interface AliasAttributes extends Partial<PrimitiveUnitAttributes> {
    prefixed?: boolean;
}

/**
 * Marker interface for aliases.
 */
export interface Alias {

}
export class AliasUnit<T extends CUnitTerms> extends BaseUnit<T> implements Alias, CUnit<T> {
    readonly name: string;
    readonly symbol?: string;
    readonly si: CUnit<T>;
    readonly scale: number;
    readonly offset: number;

    constructor(name: string, symbol: string|undefined, attributes: AliasAttributes, si: CUnit<T> & SI, scale: number, offset: number = 0) {
        super(si.key, attributes);
        this.name = name;
        this.symbol = symbol;
        this.si = si.si;
        this.scale = scale;
        this.offset = offset;
    }

    toSI<R extends number>(v: R): [R, CUnit] {
        const siScale = this.si.attributes.scale || 1;
        const siOffset = this.si.attributes.offset || 0;
        return [((v * this.scale + this.offset) / siScale - siOffset) as R, this.si];
    }

    fromSI<R extends number>(v: R, unit: CUnit): [R, this] {
        const siScale = this.si.attributes.scale || 1;
        const siOffset = this.si.attributes.offset || 0;
        return [((((v - siOffset) * siScale) - this.offset) / this.scale) as R, this];
    }

    add(u: CUnit<T>): CUnit<T> {
        return this.si.add(u);
    }

    divide<T2 extends CUnitTerms>(u: CUnit<T2>): CUnit<DivideTerms<T, T2>> {
        return this.si.divide(u);
    }

    multiply<T2 extends CUnitTerms>(u: CUnit<T2>): CUnit<MultiplyTerms<T, T2>> {
        return this.si.multiply(u);
    }
}

/**
 * Our defined aliases.
 */
const ALIASES: {[k: string]: CUnit & Alias} = {};

const SYMBOL_ALIASES: {[k: string]: CUnit & Alias} = {};

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
    <T extends CUnitTerms>(
        name: string, symbol: string|undefined, attributes: AliasAttributes
        , si: CUnit<T>, scale: number, offset: number = 0,
        ...names: string[]
    ): CUnit<T> & Alias => {
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
        symbol && addName(symbol, SYMBOL_ALIASES);
        names.forEach(n => addName(n.toLowerCase()));
        return alias as AliasUnit<T>;
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

const RE_prefix_name = /yotta|zetta|exa|peta|tera|giga|mega|kilo|hecto|deka|deci|centi|milli|micro|nano|pico|fempto|atto|zepto|yocto/;
const RE_prefix_symbol = /Y|Z|E|P|T|G|M|k|h|da|d|c|m|μ|u|n|p|f|a|z|y/;
const RE_identifier = /[\p{L}\p{Pc}\p{Pd}\p{S}][\p{L}\p{Pc}\p{Pd}\p{S}\p{N}]*/u;
const RE_whitespace = /[\p{Z}\p{C}\p{M}]+/u;
const RE_whitespace_sep = /[\p{Z}\p{C}\p{M}\p{Pd}]+/u;
const RE_prefix_name_concat = new RegExp(`(${RE_prefix_name.source})${RE_whitespace_sep.source}(${RE_identifier.source})`, 'ug');
const RE_name = new RegExp(`(${RE_prefix_name.source})?(${RE_identifier.source})`, 'u');
const RE_symbol = new RegExp(`(${RE_prefix_symbol.source})?(${RE_identifier.source})`, 'u');

/**
 * Parse a prefixed expression into a suitable Alias. Returns null if not found.
 * @param u
 * @param siOnly true if only non-aliases should be considered.
 */
const parsePrefix = (u: string, siOnly: boolean = false): CUnit | null => {
    u = u.replace(RE_whitespace, ' ');
    u = u.replace(RE_prefix_name_concat, (s: string, name: string, sym: string) => `${name}${sym}`);
    const name = RE_name.exec(u);
    if (name) {
        const prefix = PREFIXES[name[1] as PrefixSymbol];
        const base = NAMED_UNITS[name[2]] || (!siOnly && ALIASES[name[2]]);
        if (base && !base.attributes.prefixed) {
            const sym = (prefix.symbol && base.symbol) ? `${prefix.symbol}${base.symbol}` : undefined;
            const aName = `${prefix.name}${base.name}`;
            return ALIASES[aName] || defineAlias(aName, sym, {
                prefixed: true
            }, base, Math.pow(10, prefix.exponent));
        } else if (prefix) {
            return null;
        }
    }
    const sym = RE_symbol.exec(u);
    if (!sym) {
        return null;
    }
    const prefix = PREFIXES[sym[1] as PrefixSymbol];
    const base = SYMBOL_UNITS[sym[2]] || (!siOnly && SYMBOL_ALIASES[sym[2]]);
    if (base && !base.attributes.prefixed) {
        const sym = (prefix.symbol && base.symbol) ? `${prefix.symbol}${base.symbol}` : undefined;
        const aName = `${prefix.name}${base.name}`;
        return ALIASES[aName]
        || defineAlias(aName, sym, {
            prefixed: true
        }, base, Math.pow(10, prefix.exponent));
    }
    return null;
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
 * A namespace for unit test access
 */
export namespace TEST {
    export const PRIMITIVES_MAP_ = PRIMITIVE_MAP;
    // noinspection JSUnusedGlobalSymbols
    export const UNITS_ = UNITS;
    export const NAMED_UNITS_ = NAMED_UNITS;
    // noinspection JSUnusedGlobalSymbols
    export const SYMBOL_UNITS_ = SYMBOL_UNITS;
    export const ALIASES_ = ALIASES;
    // noinspection JSUnusedGlobalSymbols
    export const SYMBOL_ALIASES_ = SYMBOL_ALIASES;
    // noinspection JSUnusedGlobalSymbols
    export const RE_prefix_name_ = RE_prefix_name;
    // noinspection JSUnusedGlobalSymbols
    export const RE_prefix_symbol_ = RE_prefix_symbol;
    // noinspection JSUnusedGlobalSymbols
    export const RE_identifier_ = RE_identifier;
    export const RE_whitespace_ = RE_whitespace;
    export const RE_prefix_name_concat_ = RE_prefix_name_concat;
    // noinspection JSUnusedGlobalSymbols
    export const RE_name_ = RE_name;
    export const RE_symbol_ = RE_symbol;
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
    // noinspection JSUnusedGlobalSymbols
    export const parsePrefix_ = parsePrefix;
}
