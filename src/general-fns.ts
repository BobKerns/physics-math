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

import {NumericDerivative} from "./derivative";
import {TYPE} from "./math-types";
import {NumericIntegral} from "./integral";
import {PCalculus} from "./pfunction";
import {IndefiniteIntegral, IPCompileResult, IPFunctionCalculus} from "./base";
import {Units} from "./unit-defs";
import {Unit} from "./units";
import {defineTag} from "./utils";

/**
 * Functions that have to be numerically integrated/differentiated.
 */

export class GFunction extends PCalculus<number> {
    explicit: IPCompileResult<number>;
    constructor(f: IPCompileResult<number>, unit: Unit, attributes: any = {}) {
        super({...attributes, unit});
        this.explicit = f;
    }

    differentiate(): IPFunctionCalculus<number> {
        return new NumericDerivative(this, this.unit.divide(Units.time));
    }

    integrate(): IndefiniteIntegral<number> {
        return new NumericIntegral(this, this.unit.multiply(Units.time));
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return this.explicit;
    }
}

defineTag(GFunction, 'GFun');
