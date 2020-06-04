/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * @packageDocumentation
 * @module Functionals
 */

import {ScalarConstant} from "./scalar";
import {PCalculus} from "./pfunction";
import {TYPE} from "./math-types";
import {IPCalculus, IPCompileResult, IPFunctionCalculus, Variable} from "./base";
import {AnalyticIntegral} from "./integral";
import {Units} from './unit-defs';
import {Unit, Divide, Multiply} from "./units";
import {DEFAULT_STYLE, StyleContext} from "./latex";
import {defineTag, tex} from './utils';

/**
 * Polynomial functions
 */

export class Poly<
    U extends Unit,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
    >
    extends PCalculus<number, U, D, I>
    implements
        IPCalculus<number, U, D, I>,
        IPFunctionCalculus<number, U, 1, D, I>
{
    coefficients: number[];
    constructor(unit: U, ...coeffs: number[]) {
        super({unit});
        this.coefficients = coeffs;
    }

    differentiate(): IPFunctionCalculus<number, D, 1, Divide<D, Units.time>, U> {
        const du = this.unit.divide(Units.time) as D;
        if (this.coefficients.length < 2) {
            return new ScalarConstant(0, du) as unknown as IPFunctionCalculus<number, D, 1, Divide<D, Units.time>, U>;
        } else {
            const poly = new Poly<D, Divide<D, Units.time>, U>(du,
                ...this.coefficients
                    .map((v, i) => v * i)
                    .slice(1));
            return poly as unknown as IPFunctionCalculus<number, D, 1, Divide<D, Units.time>, U>;
        }
    }

    integrate(): AnalyticIntegral<number, I, U, Multiply<I, Units.time>> {
        const iu = this.unit.multiply(Units.time) as I;
        const p = new Poly(iu, 0, ...this.coefficients
            .map((v, i) => v / (i + 1))) as unknown as IPFunctionCalculus<number, I, 1, U>;
        const base = this as unknown as IPFunctionCalculus<number, U, 1, D, I>;
        return new AnalyticIntegral<number, I, U, Multiply<I, Units.time>>(base, p, iu);
    }

    integral(): AnalyticIntegral<number, I, U, Multiply<I, Units.time>> {
        return super.integral() as AnalyticIntegral<number, I, U, Multiply<I, Units.time>>;
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return makePoly(...this.coefficients);
    }

    toTex(varName: Variable = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        return this.coefficients
            .map((v, i) =>
                v === 0
                    ? ''
                    : i === 0
                    ? ctx.number(v)
                    : i === 1
                        ? v === 1
                            ? ctx.variable(varName)
                            : tex`{${ctx.number(v)} ${ctx.variable(varName)}}`
                        : v === 1
                            ? tex`${ctx.variable(varName)}^{${ctx.exponentStyle.number(i)}}`
                            : `{${ctx.number(v)} ${ctx.variable(varName)}^{${ctx.exponentStyle.number(i)}}}`
            )
            .filter( s => s !== '')
            .join(' + ')
            || '0';
    }

    toTexWithUnits(varName: Variable = 't', ctx: StyleContext= DEFAULT_STYLE.context): string {
        const val = this.toTex(varName, ctx)
        const nz = this.coefficients.filter(k => k !== 0).length;
        return nz > 1
            ? ctx.applyUnitFunction(`(${val})`, this.unit)
            : this.coefficients[0] === 0
                ? ctx.applyUnit(val, this.unit)
            : ctx.applyUnitFunction(val, this.unit);
    }

    equiv<T>(f: T): null| this | T {
        // @ts-ignore
        if (this === f) return this;
        if (f instanceof ScalarConstant) {
            if (this.coefficients.length === 1) {
                if (this.coefficients[0] === f.value) return f;
            }
            return null;
        } else if (f instanceof Poly) {
            if (!super.equiv(f)) return null;
            if (this.coefficients.length !== f.coefficients.length) return null;
            for (let i = 0; i < f.coefficients.length; i++) {
                if (this.coefficients[i] !== f.coefficients[i]) return null;
            }
            return this;
        }
        return null;
    }

    /**
     * Returns the equivalent value for [[Poly]] instances of degree 0 or 1, null otherwise.
     */
    asConstantValue(): number | null {
        switch (this.coefficients.length) {
            case 0: return 0;
            case 1: return this.coefficients[0];
            default:
                return null;
        }
    }
}

const makePoly = (...coeffs: number[]) => (t: number) => {
    let acc = 0;
    let tx = 1;
    for (const k of coeffs) {
        acc += k * tx;
        tx *= t;
    }
    return acc;
};

export const poly = (unit: Unit, ...coefficients: number[]) => new Poly(unit, ...coefficients);

defineTag(Poly, 'Poly');
