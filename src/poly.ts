/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {ZERO} from "./scalar";
import {PCalculus} from "./pfunction";
import {TYPE} from "./math-types";
import {IndefiniteIntegral, IPCompileResult, IPFunctionCalculus} from "./base";
import {AnalyticIntegral} from "./integral";

/**
 * Polynomial functions
 */


export class Poly extends PCalculus<number> {
    coefficients: number[];
    constructor(...coeffs: number[]) {
        super({});
        this.coefficients = coeffs;
    }

    differentiate(): IPFunctionCalculus<number> {
        if (this.coefficients.length < 2) {
            return ZERO;
        } else {
            return new Poly(...this.coefficients.slice(1))
        }
    }

    integrate(): IndefiniteIntegral<number> {
        return new AnalyticIntegral(this, new Poly(0, ...this.coefficients));
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
