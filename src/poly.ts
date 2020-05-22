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
import {IndefiniteIntegral, IPCalculus, IPCompileResult, IPFunctionCalculus} from "./base";
import {AnalyticIntegral} from "./integral";
import {Units} from './unit-defs';
import {Unit, Divide, Multiply} from "./units";

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
            const poly = new Poly<D, Divide<D, Units.time>, U>(du, ...this.coefficients.slice(1));
            return poly as unknown as IPFunctionCalculus<number, D, 1, Divide<D, Units.time>, U>;
        }
    }

    integrate(): IndefiniteIntegral<number, I, U> {
        const iu = this.unit.multiply(Units.time) as I;
        const p = new Poly(iu, 0, ...this.coefficients) as IPFunctionCalculus<number, I, 1, U>;
        const base = this as unknown as IPFunctionCalculus<number, U, 1, D, I>;
        return new AnalyticIntegral(base, p, iu) as unknown as IndefiniteIntegral<number, I, U>;
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

