/**
 * Classes to support integration
 */

import {IPFunction, IPFunctionBare2, PFunction, PFunction2} from "./base";
import {curry2} from "./curry";
import {BaseValue} from "./math-types";

export class DefiniteIntegral<T extends BaseValue> extends PFunction<T> {
    private readonly from: PFunction<T>;
    private readonly t0: number;
    constructor(f: PFunction<T>, t0: number) {
        super(makeDefiniteIntegral(f)(t0));
        this.from = f;
        this.t0 = t0;
    }

    differentiate(): PFunction<T> {
        return this.from;
    }

    integrate(): PFunction<T> {
        return this.from.integrate();
    }
}

const makeDefiniteIntegral = <T extends BaseValue> (f: PFunction<T>) =>
    (t0: number) => new DefiniteIntegral<T>(f, t0).f;

export class IndefiniteIntegral<T extends BaseValue> extends PFunction2<BaseValue> {
    integrand: PFunction<T>;
    constructor(pf: PFunction<T>, f: IPFunctionBare2<T>) {
        super(f);
        this.integrand = pf;
    }
}

// noinspection JSUnusedGlobalSymbols
export class AnalyticIntegral extends IndefiniteIntegral<number> {
    constructor(pf: PFunction<number>) {
        super(pf, ((f = pf.f) => curry2((t0: number, t: number) => f(t) - f(t0)))());
    }
}
export const integrate = (f: IPFunction<number>) => (t0:number, t: number) => {
    const timestep = f.pfunction.timestep;
    let a = 0;
    let v = f(t0);
    for (let i = 0; i < t; i += timestep) {
        const nv = f(i + timestep);
        a += ((v + nv) * timestep) / 2;
        v = nv;
    }
    return a;
};

export class NumericIntegral extends PFunction2<number> {
    constructor(f: PFunction<number>) {
        super(integrate(f.f));
    }
}
