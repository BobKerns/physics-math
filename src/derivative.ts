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

import {BaseValue, Point, Rotation, TYPE, Vector} from "./math-types";
import {PCalculus, PFunction, TIMESTEP} from "./pfunction";
import {IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionBase, IPFunctionCalculus, Variable} from "./base";
import {AnalyticIntegral} from "./integral";
import {Units} from "./unit-defs";
import {Unit} from "./units";
import {DEFAULT_STYLE, StyleContext} from "./latex";
import {defineTag, tex} from './utils';

const bounds = <R extends BaseValue>(f: IPCompiled<R>, t: number): [R, R, number] => {
    const timestep = f.pfunction.timestep || TIMESTEP;
    const l = f(t - timestep / 2);
    const u = f(t + timestep / 2);
    return [l, u, timestep];
};

/**
 * Calculate the derivative of a function numerically, by examining nearby values on either side of
 * the point. Points that are technically no-differentiable (such as where piecewise-define segments
 * meet) are computed as an average.
 * @param f
 */
const makeDerivative = (f: IPCompiled<number>) => (t: number) => {
    const [l, u, timestep] = bounds<number>(f, t);
    return (u - l) / timestep;
}
export class NumericDerivative extends PCalculus<number> {
    private readonly from: IPFunction<number>;
    private readonly base: IPFunction<number>;
    readonly time_derivative: number;
    constructor(f: IPFunction<number>, base: IPFunction<number>, unit: Unit, attributes: any = {}) {
        super({...attributes, unit});
        this.from = f;
        this.base = base;
        this.time_derivative = attributes.time_derivative || 1;
    }

    differentiate(): IPFunctionCalculus<number> {
        return new NumericDerivative(this, this.base, this.unit.divide(Units.time),
            {
                time_derivative: this.time_derivative + 1
            });
    }

    integrate(): IndefiniteIntegral<number> {
        return new AnalyticIntegral(this.from, this);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    protected compileFn(): IPCompileResult<number> {
        return makeDerivative(this.from.f);
    }

    toTex(varName: Variable = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        if (!this.time_derivative) return super.toTex(varName, ctx);
        const call = ctx.call(this.base, [varName]);
        const exp = this.time_derivative !== 1 ? tex`^{${this.time_derivative}}` : '';
        const op = tex`\dfrac{d${exp}}{d${varName}}`;
        return tex`{{${op}}{${call}}}`
    }
}

const makeDerivativeV = <U extends Unit>(f: IPCompiled<Vector<U>|Point>) => (t: number) => {
    const [l, u, timestep] = bounds<Vector<U>|Point>(f, t);
    const dx = (u.x - l.x) / timestep;
    const dy = (u.y - l.y) / timestep;
    const dz = (u.z - l.z) / timestep;
    return new Vector(f.pfunction.unit.divide(Units.time), dx, dy, dz);
}
// noinspection JSUnusedGlobalSymbols
export class VectorDerivative extends PCalculus<Vector<Unit>> {
    private readonly from: IPFunctionBase<Vector<Unit>>;
    constructor(f: IPFunctionBase<Vector<Unit>>) {
        super({});
        this.from = f;
    }

    differentiate(): IPFunctionCalculus<Vector<Unit>> {
        return new VectorDerivative(this);
    }

    integrate(): IndefiniteIntegral<Vector<Unit>> {
        throw new Error(`Integrating vectors not yet supported.`)
        // return new AnalyticIntegral(this.from);
    }

    get returnType(): TYPE.VECTOR {
        return TYPE.VECTOR;
    }

    protected compileFn(): IPCompileResult<Vector<Unit>> {
        return makeDerivativeV(this.from.f);
    }
}

const makeDerivativeQ = <U extends Unit>(f: IPCompiled<Rotation<U>>) => (t: number) => {
    const [l, u, timestep] = bounds<Rotation<U>>(f, t);
    const di = (u.i - l.i) / timestep;
    const dj = (u.j - l.j) / timestep;
    const dk = (u.k - l.k) / timestep;
    const dw = (u.w - l.w) / timestep;
    return new Rotation(f.pfunction.unit.divide(Units.time), di, dj, dk, dw).normalize();
}
// noinspection JSUnusedGlobalSymbols
export class RotationDerivative extends PFunction<Rotation<Unit>> {
    private readonly from: PFunction<Rotation<Unit>>;
    constructor(f: PFunction<Rotation<Unit>>, unit: Unit) {
        super({unit});
        this.from = f;
        this.setName_(`deriv[${f.name}]`);
    }

    differentiate(): PFunction<Rotation<Unit>> {
        return new RotationDerivative(this, this.unit.divide(Units.time));
    }

    integrate() {
        return this.from;
    }

    get returnType(): TYPE.ROTATION {
        return TYPE.ROTATION;
    }

    protected compileFn(): IPCompileResult<Rotation<Unit>> {
        return makeDerivativeQ(this.from.f);
    }
}

defineTag(RotationDerivative, 'RDeriv');
defineTag(VectorDerivative, 'VDeriv');
defineTag(NumericDerivative, 'NDeriv');
