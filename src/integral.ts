/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Classes to support integration
 */

import {BaseValueRelative, TYPE} from "./math-types";
import {PCalculus, PFunction, TIMESTEP} from "./pfunction";
import {DefiniteIntegral, IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionCalculus, PFunctionDefaults} from "./base";
import {sub} from "./arith";

const makeDefiniteIntegral = <T extends BaseValueRelative> (f: IndefiniteIntegral<T>) =>
    (t0: number) => new DefiniteIntegralImpl<T>(f, t0).f;

export class DefiniteIntegralImpl<R extends BaseValueRelative> extends PCalculus<R> implements DefiniteIntegral<R> {
    readonly from: IndefiniteIntegral<R>;
    readonly t0: number;

    get returnType() {
        return this.from.returnType;
    }

    constructor(f: IndefiniteIntegral<R>, t0: number) {
        super(makeDefiniteIntegral(f)(t0));
        this.from = f;
        this.t0 = t0;
    }

    differentiate(): IPFunctionCalculus<R> {
        return this.from.integrand;
    }

    integrate(): IndefiniteIntegral<R> {
        return this.from.integral();
    }

    protected compileFn(): IPCompileResult<R> {
        return makeDefiniteIntegral(this.from)(this.t0);
    }
}

abstract class IndefiniteIntegralBase<R extends BaseValueRelative> extends PFunction<R, 2> implements IndefiniteIntegral<R> {

    integrand: IPFunctionCalculus<R>;

    protected constructor(integrand: IPFunctionCalculus<R>, options = PFunctionDefaults[2]) {
        super(options);
        this.integrand = integrand;
    }

    get returnType(): TYPE {
        return this.integrand.returnType;
    }

    protected abstract compileFn(): IPCompileResult<R, 2>;

    abstract integrate(): IndefiniteIntegral<R>;

    derivative(): IPFunctionCalculus<R> {
        return this.integrand;
    }

    integral(): IndefiniteIntegral<R> {
        return this.integrate();
    }
}

// noinspection JSUnusedGlobalSymbols
export class AnalyticIntegral<R extends BaseValueRelative> extends IndefiniteIntegralBase<R> {
    readonly expression: IPFunctionCalculus<R>;
    constructor(integrand: IPFunctionCalculus<R>, integral: IPFunctionCalculus<R>, options = PFunctionDefaults[2]) {
        super(integrand, options);
        this.expression = integral;
    }

    protected compileFn(): IPCompileResult<R, 2> {
        const efn = this.expression.compile();
        return (t0: number, t: number): R => sub<R>(efn(t), efn(t0));
    }

    integrate(): IndefiniteIntegral<R> {
        return this.integrand.integral();
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

export class NumericIntegral extends IndefiniteIntegralBase<number> {
    get returnType(): TYPE {
        return TYPE.SCALAR;
    }
    readonly integrand: IPFunction<number>;
    constructor(integrand: IPFunction<number>, options = PFunctionDefaults[2] ) {
        super(integrand, options);
        this.integrand = integrand;
    }

    protected compileFn(): IPCompileResult<number, 2> {
        return integrate(this.integrand.compile());
    }

    differentiate(): IPFunction<number> {
        return this.integrand;
    }

    integrate(): IndefiniteIntegral<number> {
        throw new Error('Double integral not supported yet.');
    }
}
