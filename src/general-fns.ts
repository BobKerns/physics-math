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
import {curry3} from "./curry";

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
        return new NumericDerivative(this, this, this.unit.divide(Units.time));
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

    equiv<T>(f: T): null | this | T {
        // @ts-ignore
        if (this === f) return this;
        if(!super.equiv(f)) return null;
        // @ts-ignore
        if (this.explicit !== f.explicit) return this;
        return null;
    }
}

defineTag(GFunction, 'GFun');

/**
 * Construct a numeric PFunction.
 */
export const gFunction = curry3((unit: Unit, name: string, fn: (t: number) => number) => new GFunction(fn, unit, {name}));

