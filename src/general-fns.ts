/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */


import {PFunction} from "./base";
import {NumericDerivative} from "./derivative";
import {BaseValue} from "./math-types";

/**
 * Functions that have to be numerically integrated/diffentiated.
 */

class GFunction extends PFunction<number> {
    protected differentiate(): PFunction<number> {
        return new NumericDerivative(this);
    }

    protected integrate(): PFunction<number> {
        return undefined;
    }
}
