/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {ZERO} from "./scalar";
import {IndefiniteIntegral, PCalculus} from "./pfunction";
import {TYPE} from "./math-types";
import {IPCompileResult, IPFunction} from "./base";
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
    differentiate(): IPFunction<number> {
        if (this.coefficients.length < 2) {
            return ZERO;
        } else {
            return new Poly(...this.coefficients.slice(1))
        }
    }

    integrate(): IndefiniteIntegral<number> {
        return new AnalyticIntegral(new Poly(0, ...this.coefficients));
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
