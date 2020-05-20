/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */


import {NumericDerivative} from "./derivative";
import {TYPE} from "./math-types";
import {NumericIntegral} from "./integral";
import {PCalculus} from "./pfunction";
import {IndefiniteIntegral, IPCompileResult, IPFunctionCalculus} from "./base";
import {U} from "./unit-defs";
import {CUnit} from "./primitive-units";

/**
 * Functions that have to be numerically integrated/differentiated.
 */

export class GFunction extends PCalculus<number> {
    explicit: IPCompileResult<number>;
    constructor(f: IPCompileResult<number>, unit: CUnit) {
        super({unit});
        this.explicit = f;
    }

    differentiate(): IPFunctionCalculus<number> {
        return new NumericDerivative(this);
    }

    integrate(): IndefiniteIntegral<number> {
        return new NumericIntegral(this, this.unit.multiply(U.time));
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return this.explicit;
    }
}
