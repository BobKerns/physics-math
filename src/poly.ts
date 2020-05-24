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
import {IPCalculus, IPCompileResult, IPFunctionCalculus} from "./base";
import {AnalyticIntegral} from "./integral";
import {Units} from './unit-defs';
import {Unit, Divide, Multiply} from "./units";
import {DEFAULT_STYLE, StyleContext} from "./latex";
import {tex} from './utils';

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
            .map((v, i) => v / (i + 1))) as IPFunctionCalculus<number, I, 1, U>;
        const base = this as IPFunctionCalculus<number, U, 1, D, I>;
        return new AnalyticIntegral(base, p, iu);
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

    toTex(varName: string = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
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
                            ? tex`${ctx.variable(varName)}^{${ctx.number(i)}}`
                            : `{${ctx.number(v)} ${ctx.variable(varName)}^{${ctx.number(i)}}}`
            )
            .filter( s => s !== '')
            .join(' + ')
            || '0';
    }

    toTexWithUnits(varName: string = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        const val = this.toTex(varName, ctx)
        const nz = this.coefficients.filter(k => k !== 0).length;
        return nz > 1
            ? ctx.applyUnitFunction(`(${val})`, this.unit)
            : this.coefficients[0] === 0
                ? ctx.applyUnit(val, this.unit)
            : ctx.applyUnitFunction(val, this.unit);
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

