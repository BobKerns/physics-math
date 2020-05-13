/**
 * Classes to support integration
 */

import {IPFunction, IPFunction2, IPFunctionBare, PFunction, PFunction2} from "./base";
import {sub} from "./utils";
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

    protected differentiate(): PFunction<T> {
        return this.from;
    }

    protected integrate(): PFunction<T> {
        return this.from.integral().definite;
    }
}

const makeDefiniteIntegral = <T extends BaseValue> (f: PFunction<T>) =>
    (t0: number) => new DefiniteIntegral<T>(f, t0).f;

export class IndefiniteIntegral<T extends BaseValue> extends PFunction2<BaseValue> {
    integrand: PFunction<T>;
    constructor(pf: PFunction<T>, f: IPFunction2<T>) {
        super(f);
        this.integrand = pf;
    }
}

export class AnalyticIntegral<T extends BaseValue> extends IndefiniteIntegral<T> {
    constructor(pf: PFunction<T>) {
        super(pf, ((f = pf.f) => curry2((t0: number, t: number) => f(t) - f(t0)))());
    }
}
const integrate = (f: IPFunction<number>) => (t0:number, t: number) => {
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
