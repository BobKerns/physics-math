/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {ZERO} from "./scalar";
import {PFunction} from "./pfunction";
import {TYPE} from "./math-types";

/**
 * Polynomial functions
 */


export class Poly extends PFunction<number> {
    coefficients: number[];
    constructor(...coeffs: number[]) {
        super(makePoly());
        this.coefficients = coeffs;
    }
    differentiate(): PFunction<number> {
        if (this.coefficients.length < 2) {
            return ZERO;
        } else {
            return new Poly(...this.coefficients.slice(1))
        }
    }

    integrate(): PFunction<number> {
        return new Poly(0, ...this.coefficients);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
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
