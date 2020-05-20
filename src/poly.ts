/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {ScalarConstant} from "./scalar";
import {PCalculus} from "./pfunction";
import {TYPE} from "./math-types";
import {IndefiniteIntegral, IPCalculus, IPCompileResult, IPFunctionCalculus} from "./base";
import {AnalyticIntegral} from "./integral";
import {U as UX} from './unit-defs';
import {CUnit, Divide, Multiply} from "./primitive-units";

/**
 * Polynomial functions
 */

export class Poly<
    U extends CUnit,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
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

    differentiate(): IPFunctionCalculus<number, D, 1, Divide<D, UX.time>, U> {
        const du = this.unit.divide(UX.time) as D;
        if (this.coefficients.length < 2) {
            return new ScalarConstant(0, du) as unknown as IPFunctionCalculus<number, D, 1, Divide<D, UX.time>, U>;
        } else {
            const poly = new Poly<D, Divide<D, UX.time>, U>(du, ...this.coefficients.slice(1));
            return poly as unknown as IPFunctionCalculus<number, D, 1, Divide<D, UX.time>, U>;
        }
    }

    integrate(): IndefiniteIntegral<number, I, U> {
        const iu = this.unit.multiply(UX.time) as I;
        const p = new Poly(iu, 0, ...this.coefficients) as IPFunctionCalculus<number, I, 1, U>;
        const base = this as IPFunctionCalculus<number, U, 1, D, I>;
        return new AnalyticIntegral(base, p, iu);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return makePoly(...this.coefficients);
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

