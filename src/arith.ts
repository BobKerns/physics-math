/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionCalculus} from "./base";
import {
    isPoint,
    isRotational,
    isRotation,
    isVector,
    Orientation,
    Point,
    Rotation,
    Vector,
    BaseValue,
    BaseValueRelative,
    RelativeOf, isScalarValue, Rotational, isPositional, isNonScalarValue, TYPE, BaseValueIntrinsic
} from "./math-types";
import {Throw} from "./utils";
import {isPCompiled, isPFunction, PCalculus} from "./pfunction";
import {glMatrix} from "gl-matrix";
import {Scalar} from "./scalar";

/**
 * Add two BaseValue quantities or BaseValue-valued functions together.
 */


export function add<R extends BaseValueRelative>(a: R, ...rest: R[]): R;
export function add<R extends BaseValueIntrinsic>(a: R, ...rest: RelativeOf<R>[]): R;
export function add<R extends BaseValueRelative>(a: IPCompiled<R>, ...rest: IPCompiled<R>[]): IPCompiled<R>;
export function add<R extends BaseValueIntrinsic>(a: IPCompiled<R>, ...rest: IPCompiled<RelativeOf<R>>[]): IPCompiled<R>;
export function add<R extends Point|Vector>(a: IPCompiled<R>, ...rest: IPCompiled<Vector>[]): IPCompiled<R>;
export function add<R extends Orientation|Rotation>(a: IPCompiled<R>, ...rest: IPCompiled<Rotation>[]): IPCompiled<R>;
export function add<R extends number>(a: IPFunction<R>, ...rest: IPFunction<BaseValueRelative>[]): IPFunction<R>;
export function add<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function add<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function add(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction|IPCompiled)[])
    : BaseValue|IPFunction|IPCompiled {
    return gadd(a, ...rest);
}

export function gadd(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction|IPCompiled)[])
    : BaseValue|IPFunction|IPCompiled
{
    const check = (pred: (v: any) => boolean) => (rest: any[]) => rest.forEach(v => pred(v) || Throw('Bad value in add'));
    if (typeof a === 'number') {
        check(isScalarValue)(rest);
        return (rest as number[]).reduce((acc, v) => acc + v, a);
    } else if (isPositional(a)) {
        check(isVector)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax += v[0], ay += v[1], az += v[2]));
        return a.clone().assign(ax, ay, az);
    } else if (isVector(a)) {
        check(isVector)(rest);
        let [ax, ay, az] = a as unknown as number[];
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Vector(ax, ay, az);
    } else if (isRotational(a)) {
        check(isRotation)(rest);
        const acc = a.clone();
        for (const v of rest as Rotational[]) {
            acc.addf(v);
        }
        return acc;
    } else if (isPFunction(a)) {
        check(isPFunction)(rest);
        return (rest as IPFunction<Vector>[]).reduce((ra, v) => new PAdd(ra, v), a as IPFunction<Vector>);
    } else if (isPCompiled(a)) {
        check(isPCompiled)(rest);
        const pf = a.pfunction;
        const ri = rest as IPCompiled<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return (gadd(pf, ...rpf) as IPFunction).f;
    } else {
        throw new TypeError(`Unknown type in add: ${{a}}`);
    }
}

abstract class BinaryOp<R extends BaseValueRelative, X extends BaseValueRelative = R> extends PCalculus<R> {
    l: IPFunctionCalculus<R>;
    r: IPFunctionCalculus<X>;
    protected constructor( l: IPFunctionCalculus<R>, r: IPFunctionCalculus<X>) {
        super({});
        this.l = l;
        this.r = r;
    }

    get returnType(): TYPE {
        return this.l.returnType;
    }
}

export class PAdd<R extends BaseValueRelative> extends BinaryOp<R, R> implements IPFunctionCalculus<R> {
    constructor(a: IPFunctionCalculus<R>, b: IPFunctionCalculus<R>) {
        super(a, b);
    }

    differentiate(): IPFunctionCalculus<R> {
        const dl = this.l.derivative();
        const dr = this.r.derivative();
        return new PAdd(dl, dr);
    }

    integrate(): IndefiniteIntegral<R> {
        throw new Error(`Integrals of sums not yet supported`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => add(lf(t), rf(t));
    }
}

export class PSub<R extends BaseValueRelative> extends BinaryOp<R> {
    constructor(a: IPFunctionCalculus<R>, b: IPFunctionCalculus<R>) {
        super(a, b);
    }

    differentiate(): IPFunctionCalculus<R> {
        return new PSub(this.l.derivative(), this.r.derivative());
    }

    integrate(): IndefiniteIntegral<R> {
        throw new Error(`Integrals of differences not yet supported.`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => sub(lf(t), rf(t));
    }
}

/**
 * Multiply a number, Vector, or Rotation by 0 or more scalar values.
 * Works on individual values, or PFFunction or IPFunction's. (You cannot
 * mix levels, however).
 *
 * Returns the same type as the first argument.
 */
export function sub<R extends BaseValueIntrinsic>(a: R, ...rest: RelativeOf<R>[]): R;
export function sub<R extends BaseValueIntrinsic>(a: R, b: R): RelativeOf<R>;
export function sub<R extends BaseValueRelative>(a: R, ...b: R[]): R;

export function sub<R extends BaseValueIntrinsic>(a: IPCompiled<R>, ...rest: IPCompiled<RelativeOf<R>>[]): IPCompiled<R>;
export function sub<R extends BaseValueIntrinsic>(a: IPCompiled<R>, b: IPCompiled<R>): IPCompiled<RelativeOf<R>>;
export function sub<R extends BaseValueRelative>(a: IPCompiled<R>, ...b: IPCompiled<R>[]): IPCompiled<R>;

export function sub<R extends BaseValueIntrinsic>(a: IPFunction<R>, ...rest: IPFunction<RelativeOf<R>>[]): IPFunction<R>;
export function sub<R extends BaseValueIntrinsic>(a: IPFunction<R>, b: IPFunction<R>): IPFunction<RelativeOf<R>>;
export function sub<R extends BaseValueRelative>(a: IPFunction<R>, ...b: IPFunction<R>[]): IPFunction<R>;

export function sub(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValue|IPFunction|IPCompiled)[])
    : BaseValue|IPFunction|IPCompiled {
    return gsub(a, ...rest);
}

export function gsub(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValue|IPFunction|IPCompiled)[])
    : BaseValue|IPFunction|IPCompiled
{
    const check = (pred: (v: any) => boolean) => (rest: any[]) => rest.forEach(v => pred(v) || Throw('Bad value in add'));
    if (typeof a === 'number') {
        check(isScalarValue)(rest);
        return (rest as number[]).reduce((acc, v) => acc - v, a);
    } else if (isPoint(a)) {
        check(isVector)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Point(a.frame, ax, ay, az);
    } else if (isVector(a)) {
        check(isVector)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Vector(ax, ay, az);
    } else if (isRotational(a)) {
        check(isRotation)(rest);
        const acc = a.clone();
        for (const v of rest) {
            acc.subf(v as Rotation);
        }
        return acc;
    } else if (isPFunction(a)) {
        check(isPFunction)(rest);
            // Vector stands in here for any one type.
        return (rest as unknown as IPFunction<Vector>[])
            .reduce((ra, v) => new PSub<Vector>(ra, v),
                a as IPFunctionCalculus<Vector>);
    } else if (isPCompiled(a)) {
        check(isPCompiled)(rest);
        const pf = a.pfunction;
        const ri = rest as IPCompiled<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return (gsub(pf, ...rpf) as IPFunction).f;
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}


export class PMul<R extends BaseValueRelative> extends BinaryOp<R, number> {
    constructor(a: IPFunctionCalculus<R>, b: IPFunctionCalculus<number>) {
        super(a, b);
    }

    differentiate(): IPFunctionCalculus<R> {
        return new PMul(this.l.derivative(), this.r);
    }

    integrate(): IndefiniteIntegral<R> {
        throw new Error(`Integration of products not yet supported.`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => mul(lf(t), rf(t)) as R;
    }
}

export function mul<R extends BaseValueRelative>(a: R, ...rest: number[]): R;
export function mul<R extends BaseValueRelative>(a: IPCompiled<R>, ...rest: (IPCompiled<number>|number)[]): IPCompiled<R>;
export function mul<R extends BaseValueRelative>(a: IPFunction<R>, ...rest: (IPFunction<number>|number)[]): IPFunction<R>;
export function mul(
    a: BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>|any,
    ...rest: (number|IPFunction<number>|IPCompiled<number>)[])
    : BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>|any {
    return gmul(a, ...rest);
}

export function gmul(
    a: BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>,
    ...rest: (number|IPFunction<number>|IPCompiled<number>)[])
    : BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>
{
    const check = (pred: (v: any) => boolean) => (rest: any[]) => rest.forEach(v => pred(v) || Throw('Bad value in add'));
    if (typeof a === 'number') {
        check(isScalarValue)(rest);
        return (rest as number[]).reduce((acc, v) => acc * v, a);
    } else if (isVector(a)) {
        check(isScalarValue)(rest);
        let [ax, ay, az] = a;
        (rest as number[]).forEach(v => (ax *= v, ay *= v, az *= v));
        return new Vector(ax, ay, az);
    } else if (isRotation(a)) {
        check(isScalarValue)(rest);
        const acc = a.clone();
        for (const v of rest as number[]) {
            acc.multf(v);
        }
        return acc;
    } else if (isPFunction(a)) {
        check(isPFunction)(rest);
        return (rest as unknown as (IPFunctionCalculus<number> | number)[])
            .reduce((ra, v) => new PMul(ra, typeof v === 'number' ? new Scalar(v) : v),
                a as IPFunctionCalculus<Vector>);
    } else if (isPCompiled(a)) {
        check(isPCompiled)(rest);
        const pf = a.pfunction;
        const ri = rest as IPCompiled<number>[];
        const rpf = ri.map(v => v.pfunction);
        return mul(pf, ...rpf).f;
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}

export function equal<T extends BaseValue>(a: T, b: T): boolean {
    if (a === b) return true;
    if (isNonScalarValue(a) && isNonScalarValue(b) && a.type === b.type) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    return false
}

export function near<T extends BaseValue>(a: T, b: T, epsilon: number = glMatrix.EPSILON): boolean {
    if (a === b) return true;
    if (isNonScalarValue(a) && isNonScalarValue(b) && a.type === b.type) {
        const d0 = a[0] - b[0];
        const d1 = a[1] - b[1];
        const d2 = a[2] - b[2];
        const d3 = a[3] - b[3];
        return d0*d0 + d1*d1 + d2*d2 + d3*d3 < epsilon * epsilon;
    }
    return false
}
