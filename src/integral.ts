/**
 * Classes to support integration
 */

import {curry2} from "./curry";
import {BaseValue, TYPE} from "./math-types";
import {DefiniteIntegral, IndefiniteIntegralImpl, IPFunction, PFunction, PFunction2} from "./pfunction";

const makeDefiniteIntegral = <T extends BaseValue> (f: PFunction<T>) =>
    (t0: number) => new DefiniteIntegralImpl<T>(f, t0).f;

export class DefiniteIntegralImpl<T extends BaseValue> extends PFunction<T> implements DefiniteIntegral<T> {
    readonly from: PFunction<T>;
    readonly t0: number;
    get returnType() {
        return this.from.returnType;
    }
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

// noinspection JSUnusedGlobalSymbols
export class AnalyticIntegral extends IndefiniteIntegralImpl<number> {
    constructor(pf: PFunction<number>) {
        super(pf, ((f = pf.f) => curry2((t0: number, t: number) => f(t) - f(t0)))());
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
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
    get returnType(): TYPE {
        return TYPE.SCALAR;
    }
    constructor(f: PFunction<number>) {
        super(integrate(f.f));
    }
}
