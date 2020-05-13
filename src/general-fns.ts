/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */


import {NumericDerivative} from "./derivative";
import {BaseValue, TYPE} from "./math-types";
import {integrate, NumericIntegral} from "./integral";
import {PFunction} from "./pfunction";
import {IPFunctionBare} from "./base";

/**
 * Functions that have to be numerically integrated/diffentiated.
 */

export class GFunction extends PFunction<number> {
    constructor(f: IPFunctionBare<number>) {
        super(f);
    }
    differentiate(): PFunction<number> {
        return new NumericDerivative(this);
    }

    integrate(): PFunction<number> {
        return new GFunction((t: number) => integrate(this.f)(0, t))
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}
