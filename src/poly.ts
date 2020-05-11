/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {PFunction} from "./base";
import {ZERO} from "./scalar";

/**
 * Polynomial functions
 */


export class Poly extends PFunction<number> {
    coefficients: number[];
    constructor(...coeffs: number[]) {
        super(makePoly());
        this.coefficients = coeffs;
    }
    protected differentiate(): PFunction<number> {
        if (this.coefficients.length < 2) {
            return ZERO;
        } else {
            return new Poly(...this.coefficients.slice(1))
        }
    }

    protected integrate(): PFunction<number> {
        return new Poly(0, ...this.coefficients);
    }

}

const makePoly = (...coeffs: number[]) => (t: number) => 0;
