/**
 * Classes to support integration
 */

import {BaseValue, TYPE} from "./math-types";
import {DefiniteIntegral, IndefiniteIntegral, IndefiniteIntegralImpl, PCalculus, PFunction, TIMESTEP} from "./pfunction";
import {IPCompiled, IPCompileResult, IPFunction, PFunctionDefaults} from "./base";

const makeDefiniteIntegral = <T extends BaseValue> (f: IPFunction<T>) =>
    (t0: number) => new DefiniteIntegralImpl<T>(f, t0).f;

export class DefiniteIntegralImpl<T extends BaseValue> extends PCalculus<T> implements DefiniteIntegral<T> {
    readonly from: IPFunction<T>;
    readonly t0: number;

    get returnType() {
        return this.from.returnType;
    }

    constructor(f: IPFunction<T>, t0: number) {
        super(makeDefiniteIntegral(f)(t0));
        this.from = f;
        this.t0 = t0;
    }

    differentiate(): IPFunction<T> {
        return this.from;
    }

    integrate(): IndefiniteIntegral<T> {
        return this.from.integrate();
    }

    protected compileFn(): IPCompileResult<T> {
        return makeDefiniteIntegral(this.from)(this.t0);
    }
}

// noinspection JSUnusedGlobalSymbols
export class AnalyticIntegral extends IndefiniteIntegralImpl<number> {
    constructor(pf: IPFunction<number>, options = PFunctionDefaults[2]) {
        super(pf, options);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}
export const integrate = (f: IPCompiled<number>) => (t0:number, t: number) => {
    const timestep = TIMESTEP;
    let a = 0;
    let v = f(t0);
    for (let i = 0; i < t; i += timestep) {
        const nv = f(i + timestep);
        a += ((v + nv) * timestep) / 2;
        v = nv;
    }
    return a;
};

export class NumericIntegral extends PFunction<number, 2> {
    get returnType(): TYPE {
        return TYPE.SCALAR;
    }
    readonly integrand: IPFunction<number>;
    constructor(integrand: IPFunction<number>, options = PFunctionDefaults[2] ) {
        super(options);
        this.integrand = integrand;
    }

    protected compileFn(): IPCompileResult<number, 2> {
        return integrate(this.integrand.compile());
    }

    differentiate(): IPFunction<number> {
        return this.integrand;
    }

    integrate(): IPFunction<number> {
        throw new Error('Double integral not supported yet.');
    }
}
