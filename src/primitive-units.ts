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
 * An object of primitive UNIT: Exponent pairs that uniquely describes each type.
 */
export type PUnitTerms = {
    [u in keyof typeof Primitive]?: Exponent;
};

export interface PrimitiveUnitAttributes {
    name: string;
    symbol: string;
    varName: string;
    absolute?: boolean;
    si_base?: boolean;

    [k: string]: any;
}

/**
 * Marker interface indicating primitive standard non-prefixed SI-compatible units.
 */
export interface PrimitiveSI {

}

export interface UnitAttributes extends Partial<PrimitiveUnitAttributes> {
    tex?: string;
    scale?: number;
    offset?: number;
}

/**
 * The public interface to all units and aliases.
 */
export interface IUnitBase<T extends PUnitTerms = PUnitTerms> {
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

/**
 * Turn the structured UnitTerms key into a string to do the lookup for unique types.
 * @param key
 */
export const makeLookupKey = (key: PUnitTerms) => {
    const units = Object.keys(Primitive) as Primitive[];
    return units
        .sort(orderUnits)
        .map(k => `${PRIMITIVE_MAP[k]?.symbol || Throw(`Invalid primitive type name "${k} in type key.`)}^${key[k] || 0}`)
        .join(' ');
}

/**
 * Marker interface indicating standard non-prefixed SI-compatible units.
 */
export interface SI {

}

/**
 * Base class for all units (and aliases).
 */
export abstract class UnitBase<T extends PUnitTerms> implements IUnitBase<T> {
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
        const makeTex = (key: PUnitTerms) => {
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
                : TeX`\dfrac{${num || 1}}{${denom}}`;
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
class PrimitiveUnit<U extends Primitive> extends UnitBase<{ [K in U]: 1 }> implements SI, PrimitiveSI {
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
 * Type of our [[PRIMITIVE_MAP]] map. This provides one key/value entry for each primitive,
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
 * @internal
 */
export namespace P {
    export const mass: IUnitBase<{ mass: 1 }> = PRIMITIVE_MAP.mass;
    // noinspection JSUnusedGlobalSymbols
    export type mass = typeof mass;
    export const time: IUnitBase<{ time: 1 }> = PRIMITIVE_MAP.time;
    export type time = typeof time;
    export const length: IUnitBase<{ length: 1 }> = PRIMITIVE_MAP.length;
    export type length = typeof length;
    export const angle: IUnitBase<{ angle: 1 }> = PRIMITIVE_MAP.angle;
    export type angle = typeof angle;
    export const solidAngle: IUnitBase<{ solidAngle: 1 }> = PRIMITIVE_MAP.solidAngle;
    // noinspection JSUnusedGlobalSymbols
    export type solidAngle = typeof solidAngle;
    export const amount: IUnitBase<{ amount: 1 }> = PRIMITIVE_MAP.amount;
    // noinspection JSUnusedGlobalSymbols
    export type amount = typeof amount;
    export const cycles: IUnitBase<{ cycles: 1 }> = PRIMITIVE_MAP.cycles;
    // noinspection JSUnusedGlobalSymbols
    export type cycles = typeof cycles;
    export const current: IUnitBase<{ current: 1 }> = PRIMITIVE_MAP.current;
    // noinspection JSUnusedGlobalSymbols
    export type current = typeof current;
    export const temperature: IUnitBase<{ temperature: 1 }> = PRIMITIVE_MAP.temperature;
    // noinspection JSUnusedGlobalSymbols
    export type temperature = typeof temperature;
    export const candela: IUnitBase<{ candela: 1 }> = PRIMITIVE_MAP.candela;
    export type candela = typeof candela;
}
