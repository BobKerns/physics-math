/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */


import {NumericDerivative} from "./derivative";
import {TYPE} from "./math-types";
import {NumericIntegral} from "./integral";
import {IndefiniteIntegral, PCalculus} from "./pfunction";
import {IPCompileResult, IPFunction} from "./base";

/**
 * Functions that have to be numerically integrated/diffentiated.
 */

export class GFunction extends PCalculus<number> {
    explicit: IPCompileResult<number>;
    constructor(f: IPCompileResult<number>) {
        super({});
        this.explicit = f;
    }
    differentiate(): IPFunction<number> {
        return new NumericDerivative(this);
    }

    integrate(): IndefiniteIntegral<number> {
        return new NumericIntegral(this);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return this.explicit;
    }
}
