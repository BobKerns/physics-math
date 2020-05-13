/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

import {IPFunctionBare} from "./base";
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
import {IPFunction, isIPFunction, isPFunction, PFunction} from "./pfunction";

/**
 * Add two BaseValue quantities or BaseValue-valued functions together.
 */


export function add<R extends number>(a: R, ...rest: R[]): R;
export function add<R extends Point|Vector>(a: R, ...rest: Vector[]): R;
export function add<R extends Orientation|Rotation>(a: R, ...rest: Rotation[]): R;
export function add<R extends number>(a: IPFunction<R>, ...rest: IPFunction<R>[]): IPFunction<R>;
export function add<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function add<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function add<R extends number>(a: PFunction<R>, ...rest: PFunction<R>[]): PFunction<R>;
export function add<R extends Point|Vector>(a: PFunction<R>, ...rest: PFunction<Vector>[]): PFunction<R>;
export function add<R extends Orientation|Rotation>(a: PFunction<R>, ...rest: PFunction<Rotation>[]): PFunction<R>;
export function add(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[])
    : BaseValue|PFunction<BaseValue>|IPFunction<BaseValue> {
    return gadd(a, ...rest);
}

export function gadd(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[])
    : BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>
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
    } else if (a instanceof PFunction) {
        check(isPFunction)(rest);
        return (rest as PFunction<Vector>[]).reduce((ra, v) => new PAdd(ra, v), a);
    } else if ((a as unknown) instanceof Function) {
        check(isPFunction)(rest);
        const pf = a.pfunction as PFunction<Vector>;
        const ri = rest as IPFunction<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return add(pf, ...rpf).f;
    } else {
        throw new TypeError(`Unknown type in add: ${{a}}`);
    }
}

abstract class BinaryOp<R extends BaseValue, X extends BaseValue> extends PFunction<R> {
    l: PFunction<R>;
    r: PFunction<X>;
    protected constructor(f: IPFunctionBare<R>, l: PFunction<R>, r: PFunction<X>) {
        super(f);
        this.l = l;
        this.r = r;
    }

    get returnType(): TYPE {
        return this.l.returnType;
    }
}

export class PAdd<R extends BaseValue, X extends RelativeOf<R> > extends BinaryOp<R, X> {
    constructor(a: PFunction<R>, b: PFunction<X>) {
        super(gadd(a.f, b.f) as IPFunction<R>, a, b);
    }

    differentiate(): PFunction<R> {
        return gadd(this.l.differentiate(), this.r.differentiate()) as PFunction<R>;
    }

    integrate(): PFunction<R> {
        return gadd(this.l.integrate(), this.r.integrate()) as PFunction<R>;
    }
}

export class PSub<R extends BaseValue, X extends RelativeOf<R> > extends BinaryOp<R, X> {
    constructor(a: PFunction<R>, b: PFunction<X>) {
        super(gsub(a.f, b.f) as IPFunction<R>, a, b);
    }

    differentiate(): PFunction<R> {
        return gsub(this.l.differentiate(), this.r.differentiate()) as PFunction<R>;
    }

    integrate(): PFunction<R> {
        return gsub(this.l.integrate(), this.r.integrate()) as PFunction<R>;
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
export function sub(a: Point, ...rest: Vector[]): Point;
export function sub(a: Vector, ...rest: Vector[]): Vector;
export function sub<R extends Orientation>(a: R, ...rest: Rotation[]): Orientation;
export function sub<R extends Rotation>(a: R, ...rest: Rotation[]): Rotation;
export function sub<R extends number>(a: IPFunction<R>, ...rest: IPFunction<R>[]): IPFunction<R>;
export function sub<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function sub<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function sub<R extends number>(a: PFunction<R>, ...rest: PFunction<R>[]): PFunction<R>;
export function sub(a: PFunction<Point>, ...rest: PFunction<Vector>[]): PFunction<Point>;
export function sub(a: PFunction<Vector>, ...rest: PFunction<Vector>[]): PFunction<Vector>;
export function sub(a: PFunction<Orientation>, ...rest: PFunction<Rotation>[]): PFunction<Orientation>;
export function sub(a: PFunction<Rotation>, ...rest: PFunction<Rotation>[]): PFunction<Rotation>;
export function sub(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[])
    : BaseValue|PFunction<BaseValue>|IPFunction<BaseValue> {
    return gsub(a, ...rest);
}

export function gsub(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[])
    : BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>
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
    } else if (a instanceof PFunction) {
        check(isPFunction)(rest);
        return (rest as PFunction<Vector>[]).reduce((ra, v) => new PSub(ra, v), a);
    } else if ((a as unknown) instanceof Function) {
        check(isIPFunction)(rest);
        const pf = a.pfunction as PFunction<Vector>;
        const ri = rest as IPFunction<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return sub(pf, ...rpf).f;
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}


export class PMul<R extends BaseValueRelative> extends BinaryOp<R, number> {
    constructor(a: PFunction<R>, b: PFunction<number>) {
        super(mul(a, b).f, a, b);
    }

    differentiate(): PFunction<R> {
        return gsub(this.l.differentiate(), this.r.differentiate()) as PFunction<R>;
    }

    integrate(): PFunction<R> {
        return gsub(this.l.integrate(), this.r.integrate()) as PFunction<R>;
    }
}

export function mul<R extends BaseValueRelative>(a: R, ...rest: number[]): number;
// noinspection JSUnusedGlobalSymbols
export function mul<R extends BaseValueRelative>(a: IPFunction<R>, ...rest: (IPFunction<number>|number)[]): IPFunction<R>;
export function mul<R extends BaseValueRelative>(a: PFunction<R>, ...rest: (PFunction<number>|number)[]): PFunction<R>;
export function mul(
    a: BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>,
    ...rest: (number|PFunction<number>|IPFunction<number>)[])
    : BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative> {
    return gmul(a, ...rest);
}

export function gmul(
    a: BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>,
    ...rest: (number|PFunction<number>|IPFunction<number>)[])
    : BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>
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
            acc.mult(v);
        }
        return acc;
    } else if (a instanceof PFunction) {
        check(isPFunction)(rest);
        return (rest as PFunction<number>[]).reduce((ra, v) => new PMul(ra, v), a);
    } else if ((a as unknown) instanceof Function) {
        check(isIPFunction)(rest);
        const pf = a.pfunction as PFunction<BaseValueRelative>;
        const ri = rest as IPFunction<number>[];
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
