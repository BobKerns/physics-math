/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */


import {PFunction} from "./base";
import {NumericDerivative} from "./derivative";
import {BaseValue} from "./math-types";
import {integrate, NumericIntegral} from "./integral";

/**
 * Functions that have to be numerically integrated/diffentiated.
 */

class GFunction extends PFunction<number> {
    differentiate(): PFunction<number> {
        return new NumericDerivative(this);
    }

    integrate(): PFunction<number> {
        return new GFunction((t: number) => integrate(this.f)(0, t))
    }
}
