/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

import {IPCompiled, IPCompileResult, IPFunction} from "./base";
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
    RelativeOf, isScalarValue, Rotational, isPositional, isNonScalarValue, TYPE
} from "./math-types";
import {Throw} from "./utils";
import {IndefiniteIntegral, isPCompiled, isPFunction, PCalculus} from "./pfunction";
import {glMatrix} from "gl-matrix";

/**
 * Add two BaseValue quantities or BaseValue-valued functions together.
 */


export function add<R extends number>(a: R, ...rest: R[]): R;
export function add<R extends Point|Vector>(a: R, ...rest: Vector[]): R;
export function add<R extends Orientation|Rotation>(a: R, ...rest: Rotation[]): R;
export function add<R extends number>(a: IPCompiled<R>, ...rest: IPCompiled<R>[]): IPCompiled<R>;
export function add<R extends Point|Vector>(a: IPCompiled<R>, ...rest: IPCompiled<Vector>[]): IPCompiled<R>;
export function add<R extends Orientation|Rotation>(a: IPCompiled<R>, ...rest: IPCompiled<Rotation>[]): IPCompiled<R>;
export function add<R extends number>(a: IPFunction<R>, ...rest: IPFunction<R>[]): IPFunction<R>;
export function add<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function add<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function add(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>)[])
    : BaseValue|IPFunction|IPCompiled {
    return gadd(a, ...rest);
}

export function gadd(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>)[])
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

abstract class BinaryOp<R extends BaseValue, X extends BaseValue> extends PCalculus<R> {
    l: IPFunction<R>;
    r: IPFunction<X>;
    protected constructor( l: IPFunction<R>, r: IPFunction<X>) {
        super({});
        this.l = l;
        this.r = r;
    }

    get returnType(): TYPE {
        return this.l.returnType;
    }
}

export class PAdd<R extends BaseValue, X extends RelativeOf<R> > extends BinaryOp<R, X> {
    constructor(a: IPFunction<R>, b: IPFunction<X>) {
        super(a, b);
    }

    differentiate(): IPFunction<R> {
        return new PAdd(this.l.derivative(), this.r.derivative());
    }

    integrate(): IndefiniteIntegral<R> {
        throw new Error(`Integrals of sums not yet supported`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => gadd(lf(t), rf(t)) as R;
    }
}

export class PSub<R extends BaseValue, X extends RelativeOf<R> > extends BinaryOp<R, X> {
    constructor(a: IPFunction<R>, b: IPFunction<X>) {
        super(a, b);
    }

    differentiate(): IPFunction<R> {
        return new PSub(this.l.derivative(), this.r.derivative());
    }

    integrate(): IndefiniteIntegral<R> {
        throw new Error(`Integrals of differences not yet supported.`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => gsub(lf(t), rf(t)) as R;
    }
}

/**
 * Multiply a number, Vector, or Rotation by 0 or more scalar values.
 * Works on individual values, or PFFunction or IPFunction's. (You cannot
 * mix levels, however).
 *
 * Returns the same type as the first argument.
 */
export function sub<R extends number>(a: R, ...rest: R[]): R;
export function sub<R extends Point|Vector>(a: R, ...rest: Vector[]): Point;
export function sub<R extends Orientation|Rotation>(a: R, ...rest: Rotation[]): R;
export function sub<R extends number>(a: IPCompiled<R>, ...rest: IPCompiled<R>[]): IPCompiled<R>;
export function sub<R extends Point|Vector>(a: IPCompiled<R>, ...rest: IPCompiled<Vector>[]): IPCompiled<R>;
export function sub<R extends Orientation|Rotation>(a: IPCompiled<R>, ...rest: IPCompiled<Rotation>[]): IPCompiled<R>;
export function sub<R extends number>(a: IPFunction<R>, ...rest: IPFunction<R>[]): IPFunction<R>;
export function sub(a: IPFunction<Point>, ...rest: IPFunction<Vector>[]): IPFunction<Point>;
export function sub(a: IPFunction<Vector>, ...rest: IPFunction<Vector>[]): IPFunction<Vector>;
export function sub(a: IPFunction<Orientation>, ...rest: IPFunction<Rotation>[]): IPFunction<Orientation>;
export function sub(a: IPFunction<Rotation>, ...rest: IPFunction<Rotation>[]): IPFunction<Rotation>;
export function sub(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>)[])
    : BaseValue|IPFunction|IPCompiled {
    return gsub(a, ...rest);
}

export function gsub(
    a: BaseValue|IPFunction|IPCompiled,
    ...rest: (BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>)[])
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
        return new Point(ax, ay, az);
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
        return (rest as unknown as IPFunction<Vector>[]).reduce((ra, v) => new PSub(ra, v), a);
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
    constructor(a: IPFunction<R>, b: IPFunction<number>) {
        super(a, b);
    }

    differentiate(): IPFunction<R> {
        return new PMul(this.l.derivative(), this.r.derivative());
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

export function mul(a: number, ...rest: number[]): number;
export function mul<R extends BaseValueRelative>(a: R, ...rest: number[]): R;
// noinspection JSUnusedGlobalSymbols
export function mul<R extends BaseValueRelative>(a: IPCompiled<R>, ...rest: (IPCompiled<number>|number)[]): IPCompiled<R>;
export function mul<R extends BaseValueRelative>(a: IPFunction<R>, ...rest: (IPFunction<number>|number)[]): IPFunction<R>;
export function mul(
    a: BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>,
    ...rest: (number|IPFunction<number>|IPCompiled<number>)[])
    : BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative> {
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
        return (rest as unknown as IPFunction<number>[]).reduce((ra, v) => new PMul(ra, v), a);
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
