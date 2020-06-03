/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Functions defined piecewise.
 * @packageDocumentation
 * @module Functionals
 */

import {PCalculus} from "./pfunction";
import {BaseValueRelative, TYPE} from "./math-types";
import {Divide, Multiply, Unit} from "./units";
import {Units} from "./unit-defs";
import {IndefiniteIntegral, IPCalculus, IPCompileResult, IPFunctionCalculus, PFunctionDefaults, Variable} from "./base";
import {ScalarConstant} from "./scalar";
import {IndefiniteIntegralBase} from "./integral";
import {gadd} from "./arith";
import {DEFAULT_STYLE, StyleContext} from "./latex";
import {NYI, tex} from "./utils";

export class Piecewise<
    R extends BaseValueRelative = BaseValueRelative,
    C extends Unit = Unit,
    D extends Unit = Divide<C, Units.time>,
    I extends Unit = Multiply<C, Units.time>
    > extends PCalculus<R, C, D, I> {
    private start_times: number[] = [];
    private functions: IPFunctionCalculus<R, C, 0|1, D, I>[] = [];
    private readonly type: TYPE;
    constructor(unit: Unit, type: TYPE = unit.attributes.type || TYPE.SCALAR) {
        super({unit});
        this.type = type;
    }

    /**
     * Add a piece of the function starting at `t` and continuing up to the next time.
     * @param t
     * @param f
     */
    add(t: number, f: number|IPFunctionCalculus<R, C, 0|1, D, I>): this {
        if (typeof f === 'number') {
            if (this.returnType === TYPE.SCALAR) {
                return this.add(t, new ScalarConstant(f, this.unit) as unknown as IPFunctionCalculus<R, C, 1, D, I>);
            }
            throw new Error(`Scalar data where ${this.returnType} expected.`);
        }
        if (f.returnType !== this.returnType) {
            throw new Error(`Inconsistent return datatypes: ${f.returnType} cannot be supplied piecewise to ${this.returnType}`);
        }
        if (f.unit !== this.unit) {
            throw new Error(`Inconsistent units: ${f.unit} vs ${this.unit}`);
        }
        for (let i = 0; i < this.start_times.length; i++) {
            if (this.start_times[i] === t) {
                const equiv = this.functions[i].equiv(f);
                if (equiv) {
                    this.functions[i] = equiv;
                } else {
                    throw new Error(`Conflicting functions at t=${t}`);
                }
                return this;
            } else if (this.start_times[i] > t) {
                const equiv = this.functions[i].equiv(f);
                if (equiv) {
                    // collapse identical regions.
                    this.functions[i] = equiv;
                    return this;
                }
                this.start_times.splice(i, 0, t);
                this.functions.splice(i, 0, f);
                return this;
            }
        }
        // To infinity and beyond!
        this.start_times.push(t);
        this.functions.push(f);
        return this;
    }

    /**
     * Add a series of segments, e.g. pw.at(t0, f0, t1, f1, t2, f2, ...);
     * @param pairs alternating time and value pairs.
     */
    at(...pairs: [number, number|IPFunctionCalculus<R, C, 0|1, D, I>][]): this {
        pairs.map(([t, v]) => this.add(t, v));
        return this;
    }

    /**
     * Add a value for t = -∞.
     * @param f
     */
    initial(f: number|IPFunctionCalculus<R, C, 1, D, I>): this {
        return this.add(Number.NEGATIVE_INFINITY, f);
    }

    protected compileFn(): IPCompileResult<R> {
        if (this.functions.length === 0) {
            throw new Error(`No functions have been added in Piecewise.`);
        }
        const start_times = this.start_times;
        const functions = this.functions.map(f => f.f);
        return t => {
            for (let i = 0; i < start_times.length; i++) {
                if ((t >= start_times[i]) && ((i === start_times.length - 1) || (t < start_times[i+1]))) {
                    return functions[i](t);
                }
            }
            throw new Error(`Out of range: ${t}`);
        };
    }

    differentiate(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C> {
        const result = new Piecewise<R, D, Divide<D, Units.time>, C>(this.unit.divide(Units.time), this.type);
        for (let i = 0; i < this.start_times.length; i++) {
            result.add(this.start_times[i], this.functions[i].derivative());
        }
        return result;
    }

    integrate(): IndefiniteIntegral<R, I, C> {
        const integrand = this as IPFunctionCalculus<R, C, 1, D, I>;
        const integral = new PiecewiseIndefiniteIntegral<R, I, C, Multiply<I, Units.time>>(
            integrand,
            this.unit.multiply(Units.time) as I
        );
        for (let i = 0; i < this.start_times.length; i++) {
            integral.add(this.start_times[i], this.functions[i].integral());
        }
        return integral;
    }

    get returnType(): TYPE {
        return this.type;
    }

    toTex(varName?: Variable, ctx?: StyleContext): string {
        const cond = (min: number, max: number) => {
            const left = min === Number.NEGATIVE_INFINITY ? tex`{-\negthickspace\infty}<` : tex`{${min}}<`;
            const right = max === Number.POSITIVE_INFINITY ? tex`\le{\infty}` : tex`\le{${max}}`;
            return tex`\text{if\ } ${left}{${varName}}${right}`;
        }
        let result: string[] = [];
        for (let i = 0; i < this.start_times.length; i++) {
            const c = cond(this.start_times[i], this.start_times[i + 1] || Number.POSITIVE_INFINITY);
            result.push(`${this.functions[i].toTex(varName, ctx)} &${c}`)
        }
        return tex`\left.\begin{cases}${result.join(tex`\\`)}\end{cases}\right\}`;
    }
}

class PiecewiseIndefiniteIntegral<
    R extends BaseValueRelative = BaseValueRelative,
    C extends Unit = Unit,
    D extends Unit = Divide<C, Units.time>,
    I extends Unit = Multiply<C, Units.time>
    > extends IndefiniteIntegralBase<R, C, D, I> {

    private start_times: number[] = [];
    private integrals: IndefiniteIntegral<R, C, D, I>[] = [];
    constructor(integrand: IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C>,
                unit: C,
                options = PFunctionDefaults[2]) {
        super(integrand, unit, options);
    }

    add(t: number, integral: IndefiniteIntegral<R, C, D, I>) {
        if (integral.returnType !== this.returnType) {
            throw new Error(`Inconsistent return datatypes: ${integral.returnType} cannot be supplied piecewise to ${this.returnType}`);
        }
        if (integral.unit !== this.unit) {
            throw new Error(`Inconsistent units: ${integral.unit} vs ${this.unit}`);
        }
        for (let i = 0; i < this.start_times.length; i++) {
            if (this.start_times[i] === t) {
                this.integrals[i] = integral;
                return this;
            } else if (this.start_times[i] > t) {
                this.start_times.splice(i, 0, t);
                this.integrals.splice(i, 0, integral);
                return this;
            }
        }
        // To infinity and beyond!
        this.start_times.push(t);
        this.integrals.push(integral);
        return this;
    }

    protected compileFn(): IPCompileResult<R, 2> {
        return (t0, t) => {
            const starts = this.start_times;
            let result: R|null = null;
            let tx = t0;
            for (let i = 0; i < this.start_times.length; i++) {
                const lim = (this.start_times[i + 1] === undefined) ? t : this.start_times[i + 1];
                if (starts[i] <= tx) {
                    const l = Math.max(starts[i], tx);
                    const u = Math.min(t, lim);
                    if (tx < u) {
                        if (result === null) {
                            result = this.integrals[i].f(l, u);
                        } else {
                            result = gadd(result, this.integrals[i].f(tx, u)) as R;
                        }
                    }
                }
                tx = Math.max(tx, lim);
            }
            return result!;
        };
    }

    integrate(): IndefiniteIntegral<R, I, C> {
        throw NYI(`Double Piecewise Integration`);
    }

    toTex(varName?: Variable, ctx?: StyleContext): string {
        const cond = (min: number, max: number) => {
            const left = min === Number.NEGATIVE_INFINITY ? tex`{-\negthickspace\infty}<` : tex`{${min}}<`;
            const right = max === Number.POSITIVE_INFINITY ? tex`\le{\infty}` : tex`\le{${max}}`;
            return tex`\text{if\ } ${left}{${varName}}${right}`;
        }
        let result: string[] = [];
        for (let i = 0; i < this.start_times.length; i++) {
            const c = cond(this.start_times[i], this.start_times[i + 1] || Number.POSITIVE_INFINITY);
            result.push(`${this.integrals[i].toTex(varName, ctx)} &${c}`)
        }
        return tex`\left.\begin{cases}${result.join(tex`\\`)}\end{cases}\right\}`;
    }
}
