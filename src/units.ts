/**
 * Representation and manipulation of physical units.
 *
 * These are based on SI, and in particular the
 * (Guide for the Use of the International System of Units (SI))[https://physics.nist.gov/cuu/pdf/sp811.pdf]
 * However, this does not try to be complete, and extends the set of base units somewhat
 * to aid clarity (for example, 'cycles/revolutions') while preserving semantics and standardized presentation.
 * Having units that map to SI '1' is not very helpful sometimes.
 *
 * See the [[Units.Units]] namespace for definitions of individual units.
 *
 * @packageDocumentation
 * @preferred
 * @module Units
 */

import {defineTag, Throw, Writeable} from "./utils";
import {Exponent, IUnitBase, makeLookupKey, orderUnits, Primitive, PRIMITIVE_MAP, primitiveKeys, PrimitiveUnitAttributes, SI, TeX, UnitAttributes, UnitBase, PUnitTerms} from "./primitive-units";

/**
 * For addition of positive numbers, we let 9 stand for all larger numbers.
 */
type XADD = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 9],
    [2, 3, 4, 5, 6, 7, 8, 9, 9, 9],
    [3, 4, 5, 6, 7, 8, 9, 9, 9, 9],
    [4, 5, 6, 7, 8, 9, 9, 9, 9, 9],
    [5, 6, 7, 8, 9, 9, 9, 9, 9, 9],
    [6, 7, 8, 9, 9, 9, 9, 9, 9, 9],
    [7, 8, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
];
/**
 * For subtraction of positive numbers, we have to allow for 9 standing in for larger numbers.
 */
type XSUB = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8 | 9],
    [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7 | 8 | 9],
    [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6 | 7 | 8 | 9],
    [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5 | 6 | 7 | 8 | 9],
    [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4 | 5 | 6 | 7 | 8 | 9],
    [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3 | 4 | 5 | 6 | 7 | 8 | 9],
    [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9],
    [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9],
    [-9, -8 | -9, -7 | -8 | -9, -6 | -7 | -8 | -9, -5 | -6 | -7 | -8 | -9,
        -4 | -5 | -6 | -7 | -8 | -9, -3 | -4 | -5 | -6 | -7 | -8 | -9, -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9,
        -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9, 0 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9]
];
type M<K extends number, V extends number> = { [k in K]: V };
type XNEGATE = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
    & M<-1, 1> & M<-2, 2> & M<-3, 3> & M<-4, 4> & M<-5, 5> & M<-6, 6> & M<-7, 7> & M<-8, 8> & M<-9, 9>;
type Negate<A extends number> = XNEGATE[A];
type Add<A extends number, B extends number> = A extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    ? B extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        ? XADD[A][B]
        : XSUB[Negate<B>][A]
    : B extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        ? XSUB[Negate<A>][B]
        : Negate<XADD[Negate<A>][Negate<B>]>;
type Sub<A extends number, B extends number> = A extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    ? B extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        ? XSUB[B][A]
        : XADD[Negate<B>][A]
    : B extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        ? Negate<XADD[Negate<A>][B]>
        : Negate<XSUB[Negate<B>][Negate<A>]>;

/**
 * An object with keys being the name of [[Primitive]] types and the values being exponents.
 * All values are required; supply zero for values not supplied.
 *
 * See [[PUnitTerms]] for a partial set where types can be left undefined.
 * @module Units
 */
export type UnitTerms = {
    [u in keyof typeof Primitive]: Exponent;
};

/**
 * If not a number (e.g. undefined), the 0 type literal.
 */
type OrZero<A> = A extends number ? A : 0;

/**
 * Multiply two [[UnitTerms]] (by adding the exponents.)
 * @module Physical Units
 */
export type MultiplyTerms<A extends PUnitTerms, B extends PUnitTerms> =
    { [K in keyof typeof Primitive]: Add<OrZero<A[K]>, OrZero<B[K]>> };

// noinspection JSUnusedGlobalSymbols
/**
 * Invert a [[UnitTerms]] (by negating the exponents).
 * @module Physical Units
 */
export type InvertTerms<A extends PUnitTerms> = { [K in keyof typeof Primitive]: Negate<OrZero<A[K]>> };

/**
 * Divide two [[UnitTerms]], A/B
 * @module Physical Units
 */
export type DivideTerms<A extends PUnitTerms, B extends PUnitTerms> = { [K in keyof typeof Primitive]: Sub<OrZero<A[K]>, OrZero<B[K]>> };

/**
 * Multiply two [[Unit]] types (by adding the exponents).
 * @module Physical Units
 */
export type Multiply<A extends IUnitBase, B extends IUnitBase> =
    A extends IUnitBase<infer TA>
        ? B extends IUnitBase<infer TB>
        ? Unit<MultiplyTerms<TA, TB>>
        : never
        : never;

/**
 * Divide two [[Unit]] types, A/B (by subtracting the exponents).
 * @module Physical Units
 */
export type Divide<A extends Unit, B extends Unit> =
    A extends Unit<infer TA>
        ? B extends Unit<infer TB>
        ? Unit<DivideTerms<TA, TB>>
        : never
        : never;

/**
 * Take a partial set of [[UnitTerms]], and fills in the missing exponents with 0.
 *
 * @module Physical Units
 */
export type CompleteTerms<A extends PUnitTerms> = { [K in keyof typeof Primitive]: OrZero<A[K]> };

// noinspection JSUnusedGlobalSymbols
/**
 * Takes an [[IUnitBase]] with partially-supplied [[UnitTerms]] and fill in the missing
 * exponents with 0.
 *
 * @internal
 * @module Physical Units
 */
export type Complete<U extends IUnitBase> = U extends IUnitBase<infer T> ? Unit<CompleteTerms<T>> : never;
// noinspection JSUnusedGlobalSymbols
export type TermsOfUnitBase<U extends IUnitBase> = U extends IUnitBase<infer T> ? T : never;
// noinspection JSUnusedGlobalSymbols
export type TermsOfUnit<U extends Unit> = U extends Unit<infer T> ? CompleteTerms<T> : never;

/**
 * @internal
 */
const nullTerms: CompleteTerms<{}> = {
    time: 0,
    mass: 0,
    length: 0,
    cycles: 0,
    angle: 0,
    solidAngle: 0,
    current: 0,
    temperature: 0,
    amount: 0,
    candela: 0
};
/**
 * @param key
 * @internal
 */
const validateKey = (key: PUnitTerms) => {
    (Object.keys(key) as Primitive[])
        .forEach(k => Primitive[k] || Throw(`Unknown primitive type: ${k}`));
    return key;
}
/**
 *
 * @param key
 * @internal
 */
export const completeKey = <T extends PUnitTerms>(key: T): CompleteTerms<T> => ({
    ...nullTerms, ...validateKey(key)
}) as CompleteTerms<T>;

/**
 * A Typescript type corresponding to a specific runtime [[Unit]].
 *
 * @module Physical Units
 */
export interface Unit<T extends UnitTerms = UnitTerms> extends IUnitBase<T> {
    /**
     * Call to check units for addition/subtraction.
     * Throws an error if the units are not the same.
     * @param u
     */
    add(u: Unit<T>): Unit<T>;

    /**
     * Produce new units multiplying these units.
     * @param u
     */
    multiply<T2 extends UnitTerms>(u: Unit<T2>): Unit<MultiplyTerms<T, T2>>;

    /**
     * Produce new units dividing by these units.
     * @param u
     */
    divide<T2 extends UnitTerms>(u: Unit<T2>): Unit<DivideTerms<T, T2>>;

    readonly si: Unit<T> & SI;

    /**
     * Convert the given value to (unprefixed) SI units, and return the converted value and the
     * corresponding SI unit.
     *
     * @param v
     * @return [number, Unit]
     */
    toSI(v: number): [number, Unit];

    /**
     * Convert the given value from (unprefixed) SI units, and return the converted value and
     * corresponding unit (i.e. this unit).
     * @param v
     * @param unit
     */
    fromSI(v: number, unit: Unit): [number, this];

    readonly names: string[];
}

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
 * Derived units build on the primitive units through multiplication (integration)
 * and division (differentiation).
 */
// noinspection JSUnusedLocalSymbols
class DerivedUnit<T extends UnitTerms> extends UnitBase<T> implements Unit<T>, SI {
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

    get si(): Unit<T> & SI {
        return this as unknown as Unit<T> & SI;
    }

    readonly name: string;

    add(u: Unit<T>): Unit<T> {
        const t = this;
        if (u !== (t as unknown)) {
            throw new Error(`Incompatible types: ${t.name} and ${u.name}`);
        }
        return u;
    }

    private combine<X extends PUnitTerms>(u: IUnitBase<X>, dir = 1 | -1): Unit {
        const nkey: Writeable<PUnitTerms> = {};
        const add = (k: Primitive) => {
            const n = (this.key[k] || 0) + (u.key[k] || 0) * dir;
            if (n != 0) {
                nkey[k] = n as Exponent;
            }
        }
        primitiveKeys.forEach(add);
        return defineUnit(nkey as UnitTerms);
    }

    multiply<X extends UnitTerms>(u: Unit<X>): Unit<MultiplyTerms<T, X>> {
        return this.combine(u, 1) as Unit<MultiplyTerms<T, X>>;
    }

    divide<X extends UnitTerms>(u: Unit<X>): Unit<DivideTerms<T, X>> {
        return this.combine(u, -1) as Unit<DivideTerms<T, X>>;
    }

    fromSI(v: number, unit: Unit): [number, this] {
        return [v, this];
    }

    toSI(v: number): [number, Unit] {
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
 * @module Physical Units
 *
 * @param key The key defining the type composition
 * @param attributes Additional attributes describing the type.
 * @param names Additional names to use for this type, e.g. newton.
 * @module Physical Units
 */
export const defineUnit =
    <T extends PUnitTerms>(key: T, attributes: UnitAttributes = {}, ...names: string[]): Unit<CompleteTerms<T>> => {
        const cKey = completeKey(key);
        const lookupKey = makeLookupKey(cKey);
        const addName = (u: Unit) => (n?: string, table = NAMED_UNITS) => {
            if (n) {
                const eNamed = table[n];
                if (eNamed) {
                    if (eNamed !== u) {
                            throw new Error(`Conflict of name ${n}: ${eNamed.name} => ${u.name}`);
                    }
                } else {
                    table[n] = u;
                }
                if (!u.names.some(un => un === n)) {
                    u.names.push(n);
                }
            }
            return u;
        };
        const {name, symbol} = attributes;
        const addSpecials = (u: Unit) => {
            const an = addName(u);
            an((name || u.name).toLowerCase());
            an(symbol, SYMBOL_UNITS);
        };
        const addNames = (u: Unit) => {
            const an = addName(u);
            names.forEach(n => an(n.toLowerCase()));
            attributes.names?.forEach(n => an(n.toLowerCase()));
            addSpecials(u);
        };
        const existing = UNITS[lookupKey];
        if (existing) {
            addNames(existing);
            // Once set, attributes cannot be modified, but new ones can be added.
            Object.assign(existing.attributes, {...attributes, ...existing.attributes});
            return existing as Unit<CompleteTerms<T>>;
        }
        const newUnit = new DerivedUnit(cKey, attributes);
        UNITS[lookupKey] = newUnit;
        addNames(newUnit);
    return newUnit as Unit<CompleteTerms<T>>;
};

export interface AliasAttributes extends Partial<PrimitiveUnitAttributes> {
    prefixed?: boolean;
}

/**
 * Marker interface for aliases.
 * @internal
 */
export interface Alias {

}

/**
 * @internal
 */
export class AliasUnit<T extends UnitTerms> extends UnitBase<T> implements Alias, Unit<T> {
    readonly name: string;
    readonly symbol?: string;
    readonly si: Unit<T>;
    readonly scale: number;
    readonly offset: number;

    constructor(name: string, symbol: string|undefined, attributes: AliasAttributes, si: Unit<T> & SI, scale: number, offset: number = 0) {
        super(si.key, attributes);
        this.name = name;
        this.symbol = symbol;
        this.si = si.si;
        this.scale = scale;
        this.offset = offset;
        this.names.push(name);
        symbol && this.names.push(symbol);
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

    add(u: Unit<T>): Unit<T> {
        return this.si.add(u);
    }

    divide<T2 extends UnitTerms>(u: Unit<T2>): Unit<DivideTerms<T, T2>> {
        return this.si.divide(u);
    }

    multiply<T2 extends UnitTerms>(u: Unit<T2>): Unit<MultiplyTerms<T, T2>> {
        return this.si.multiply(u);
    }
}

/**
 * Our defined aliases.
 */
const ALIASES: {[k: string]: Unit & Alias} = {};

const SYMBOL_ALIASES: {[k: string]: Unit & Alias} = {};

/**
 * Define a unit alias, which can convert to/from a corresponding standard unprefixed SI unit.
 *
 * @param name
 * @param symbol
 * @param attributes
 * @param si
 * @param scale
 * @param offset
 * @param names
 * @module Physical Units
 */
export const defineAlias =
    <T extends UnitTerms>(
        name: string, symbol: string|undefined, attributes: AliasAttributes
        , si: Unit<T>, scale: number, offset: number = 0,
        ...names: string[]
    ): Unit<T> & Alias => {
        const alias = new AliasUnit(
            name, symbol, attributes,
            si, scale, offset);
        const addName = (n: string, table = ALIASES) => {
            const lc = n.toLowerCase();
            const conflict = ALIASES[lc] || NAMED_UNITS[lc] || SYMBOL_ALIASES[n] || SYMBOL_UNITS[n];
            alias.names.push(n);
            conflict ?
                conflict !== alias
                    ? Throw(`Name conflict for alias ${n} with unit ${conflict.name}`)
                    :null
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
const parsePrefix = (u: string, siOnly: boolean = false): Unit | null => {
    u = u.replace(RE_whitespace, ' ');
    u = u.replace(RE_prefix_name_concat, (s: string, name: string, sym: string) => `${name}${sym}`);
    const name = RE_name.exec(u);
    if (name) {
        const prefix = PREFIXES[name[1] as PrefixSymbol];
        const base = NAMED_UNITS[name[2]] || (!siOnly && ALIASES[name[2]]);
        if (base && !base.attributes.prefixed) {
            const sym = (prefix.symbol && base.symbol) ? `${prefix.symbol}${base.symbol}` : undefined;
            const aName = `${prefix.name}${base.name}`;
            if ((prefix.symbol === name[1] && base.name === name[2])
                || (prefix.name === name[1] && base.symbol === name[2])) {
                throw new Error(`Don't mix abbreviations and full names. E.g. ${aName}, not ${u}}`);
            }
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
 * @ignore
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
    export const deleteUnit_ = (u: IUnitBase | null | undefined) => {
        if (u) {
            const delFrom = (table: { [k: string]: IUnitBase }) =>
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

export const isUnit = (u: any): u is Unit => u instanceof DerivedUnit || u instanceof AliasUnit;

defineTag(DerivedUnit, 'Unit');
defineTag(AliasUnit, 'Unit');
