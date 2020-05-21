/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Primitive units
 * @packageDocumentation
 * @ignore
 */


import {Throw} from "./utils";

/**
 * String literal parser for LaTeX literals (avoids the need for quoting backslash).
 */
export const TeX = String.raw;

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

export const primitiveKeys: Primitive[] = Object.keys(Primitive) as Primitive[];
/**
 * A total order on units, for canonical display and key generation.
 */

const ORDER: { [K in Primitive]: number } = (i => {
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
export const orderUnits = (a: Primitive, b: Primitive) => {
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
export type Exponent = -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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
 * An object of primitive UNIT: Exponent pairs that uniquely describes each type.
 */
export type UnitTerms = {
    [u in keyof typeof Primitive]?: Exponent;
};
export type CUnitTerms = {
    [u in keyof typeof Primitive]: Exponent;
};
type OrZero<A> = A extends number ? A : 0;
export type MultiplyTerms<A extends UnitTerms, B extends UnitTerms> = { [K in keyof typeof Primitive]: Add<OrZero<A[K]>, OrZero<B[K]>> };
// noinspection JSUnusedGlobalSymbols
export type InvertTerms<A extends UnitTerms> = { [K in keyof typeof Primitive]: Negate<OrZero<A[K]>> };
export type DivideTerms<A extends UnitTerms, B extends UnitTerms> = { [K in keyof typeof Primitive]: Sub<OrZero<A[K]>, OrZero<B[K]>> };
export type Multiply<A extends Unit, B extends Unit> =
    A extends Unit<infer TA>
        ? B extends Unit<infer TB>
        ? CUnit<MultiplyTerms<TA, TB>>
        : never
        : never;
export type Divide<A extends CUnit, B extends CUnit> =
    A extends CUnit<infer TA>
        ? B extends CUnit<infer TB>
        ? CUnit<DivideTerms<TA, TB>>
        : never
        : never;
export type CompleteTerms<A extends UnitTerms> = { [K in keyof typeof Primitive]: OrZero<A[K]> };
// noinspection JSUnusedGlobalSymbols
export type Complete<U extends Unit> = U extends Unit<infer T> ? CUnit<CompleteTerms<T>> : never;
// noinspection JSUnusedGlobalSymbols
export type TermsOfUnit<U extends Unit> = U extends Unit<infer T> ? T : never;
// noinspection JSUnusedGlobalSymbols
export type TermsOfCUnit<U extends CUnit> = U extends CUnit<infer T> ? CompleteTerms<T> : never;
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
const validateKey = (key: UnitTerms) => {
    (Object.keys(key) as Primitive[])
        .forEach(k => Primitive[k] || Throw(`Unknown primitive type: ${k}`));
    return key;
}
export const completeKey = <T extends UnitTerms>(key: T): CompleteTerms<T> => ({
    ...nullTerms, ...validateKey(key)
}) as CompleteTerms<T>;
/**
 * Turn the structured UnitTerms key into a string to do the lookup for unique types.
 * @param key
 */
export const makeLookupKey = (key: UnitTerms) => {
    const units = Object.keys(Primitive) as Primitive[];
    return units
        .sort(orderUnits)
        .map(k => `${PRIMITIVE_MAP[k]?.symbol || Throw(`Invalid primitive type name "${k} in type key.`)}^${key[k] || 0}`)
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
 * The public interface to all units and aliases.
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
}

export interface CUnit<T extends CUnitTerms = CUnitTerms> extends Unit<T> {
    /**
     * Call to check units for addition/subtraction.
     * Throws an error if the units are not the same.
     * @param u
     */
    add(u: CUnit<T>): CUnit<T>;

    /**
     * Produce new units multiplying these units.
     * @param u
     */
    multiply<T2 extends CUnitTerms>(u: CUnit<T2>): CUnit<MultiplyTerms<T, T2>>;

    /**
     * Produce new units dividing by these units.
     * @param u
     */
    divide<T2 extends CUnitTerms>(u: CUnit<T2>): CUnit<DivideTerms<T, T2>>;

    readonly si: CUnit<T> & SI;

    /**
     * Convert the given value to (unprefixed) SI units, and return the converted value and the
     * corresponding SI unit.
     *
     * @param v
     * @return [number, Unit]
     */
    toSI(v: number): [number, CUnit];

    /**
     * Convert the given value from (unprefixed) SI units, and return the converted value and
     * corresponding unit (i.e. this unit).
     * @param v
     * @param unit
     */
    fromSI(v: number, unit: CUnit): [number, this];
}

/**
 * Base class for all units (and aliases).
 */
export abstract class BaseUnit<T extends UnitTerms> implements Unit<T> {
    readonly key: T;
    readonly symbol?: string;
    readonly attributes: UnitAttributes;
    private id_?: string;
    // Our cached or supplied LaTeX string.
    private tex_?: string;

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

    abstract readonly name: string;
}

/**
 * Our primitive (non-decomposable) units.
 */
class PrimitiveUnit<U extends Primitive> extends BaseUnit<{ [K in U]: 1 }> implements SI, PrimitiveSI {
    readonly symbol: string;
    readonly name: string;
    readonly varName?: string;
    readonly unit: Primitive;

    constructor(u: U, name: string, symbol: string, varName?: string, attributes: UnitAttributes = {}) {
        super({[u]: 1} as { [K in U]: 1 }, {name, symbol, varName, ...attributes});
        this.name = name;
        this.symbol = symbol;
        this.varName = varName;
        this.unit = u;
    }
}

/**
 * Type of our PRIMITIVE_MAP map. This provides one key/value entry for each primitive,
 * indexed by the UNIT enum.
 */
export type PrimitiveMap = {
    [k in keyof typeof Primitive]: PrimitiveUnit<(typeof Primitive)[k]>
};
/**
 * A map from primitive name to its Unit instance.
 */
export const PRIMITIVE_MAP: Readonly<PrimitiveMap> = (() => {
    const val: PrimitiveMap = {} as PrimitiveMap;
    const defPrimitive = (u: Primitive, name: string, symbol: string, varName?: string,
                          attributes: UnitAttributes = {}) => {
        const primitive = new PrimitiveUnit(u, name, symbol, varName, attributes);
        (val as any)[u] = primitive;
        return primitive;
    }
    defPrimitive(Primitive.time, 'second', 's', 't', {si_base: true});
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
/**
 * Namespace for primitives only; merged into the U namespace.
 */
export namespace P {
    export const mass: Unit<{ mass: 1 }> = PRIMITIVE_MAP.mass;
    // noinspection JSUnusedGlobalSymbols
    export type mass = typeof mass;
    export const time: Unit<{ time: 1 }> = PRIMITIVE_MAP.time;
    export type time = typeof time;
    export const length: Unit<{ length: 1 }> = PRIMITIVE_MAP.length;
    export type length = typeof length;
    export const angle: Unit<{ angle: 1 }> = PRIMITIVE_MAP.angle;
    export type angle = typeof angle;
    export const solidAngle: Unit<{ solidAngle: 1 }> = PRIMITIVE_MAP.solidAngle;
    // noinspection JSUnusedGlobalSymbols
    export type solidAngle = typeof solidAngle;
    export const amount: Unit<{ amount: 1 }> = PRIMITIVE_MAP.amount;
    // noinspection JSUnusedGlobalSymbols
    export type amount = typeof amount;
    export const cycles: Unit<{ cycles: 1 }> = PRIMITIVE_MAP.cycles;
    // noinspection JSUnusedGlobalSymbols
    export type cycles = typeof cycles;
    export const current: Unit<{ current: 1 }> = PRIMITIVE_MAP.current;
    // noinspection JSUnusedGlobalSymbols
    export type current = typeof current;
    export const temperature: Unit<{ temperature: 1 }> = PRIMITIVE_MAP.temperature;
    // noinspection JSUnusedGlobalSymbols
    export type temperature = typeof temperature;
    export const candela: Unit<{ candela: 1 }> = PRIMITIVE_MAP.candela;
    export type candela = typeof candela;
}
