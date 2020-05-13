/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

import {IPFunction, PFunction} from "./base";
import {quat} from "gl-matrix";
import {isPoint, isRotationish, isRotation, isVector, Orientation, Point, Rotation, Vector, BaseValue, BaseValueRelative} from "./math-types";

/**
 * Add two BaseValue quantities or BaseValue-valued functions together.
 */


export function add(a: number, ...rest: number[]): number;
export function add<R extends Point|Vector>(a: R, ...rest: Vector[]): R;
export function add(a: Vector, ...rest: Vector[]): Vector;
export function add<R extends Orientation|Rotation>(a: R, ...rest: Rotation[]): R;
export function add<R extends Point|Vector>(a:R, ...rest: PFunction<Vector>[]): R;
export function add<R extends Orientation|Rotation>(a: R, ...rest: PFunction<Rotation>[]): R;
export function add(a: IPFunction<number>, ...rest: IPFunction<number>[]): IPFunction<number>;
export function add<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function add<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function add(a: PFunction<number>, ...rest: PFunction<number>[]): PFunction<number>;
export function add<R extends Point|Vector>(a: PFunction<R>, ...rest: PFunction<Vector>[]): PFunction<R>;
export function add<R extends Orientation|Rotation>(a: PFunction<R>, ...rest: PFunction<Rotation>[]): PFunction<R>;
export function add(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[]):
    BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>
{
    if (typeof a === 'number') {
        return (rest as number[]).reduce((acc, v) => acc + v, a);
    } else if (isPoint(a)) {
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax += v[0], ay += v[1], az += v[2]));
        return new Point(ax, ay, az);
    } else if (isVector(a)) {
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Vector(ax, ay, az);
    } else if (isRotationish(a)) {
        const acc = a.clone();
        for (const v of rest) {
            acc.addf(v as Rotation);
        }
        return acc;
    } else if (a instanceof PFunction) {
        return (rest as PFunction<Vector>[]).reduce((ra, v) => new PAdd(ra, v), a);
    } else if (a instanceof Function) {
        const pf = a.pfunction as PFunction<Vector>;
        const ri = rest as IPFunction<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return add(pf, ...rpf).f;
    } else {
        throw new TypeError(`Unknown type in add: ${{a}}`);
    }
}
const pfAddImpl = <R extends BaseValue>(a: PFunction<R>, b: PFunction<R>) => {

};

export class PAdd<R extends BaseValue, X extends BaseValueRelative > extends PFunction<R> {
    l: PFunction<R>;
    r: PFunction<X>;
    constructor(a: PFunction<R>, b: PFunction<X>) {
        const av = a.f(0);
        const bv = b.f(0);
        super((t: number): R => add(a.f(t), b.f(t)).f);
        this.l = a;
        this.r = b;
    }

    protected differentiate(): PFunction<R> {
        return add();
    }

    protected integrate(): PFunction<R> {
        return undefined;
    }
}

export class PSub<X extends Vector, R extends Vector | Point = X> extends PFunction<R> {
    constructor(a: PFunction<R>, b: PFunction<X>) {
        const av = a.f(0);
        const bv = b.f(0);
        super((t: number): R => add(a.f(t), b.f(t)));
    }
}

export function sub(a: number, ...rest: number[]): number;
export function sub<R extends Point|Vector>(a: R, ...rest: Vector[]): R;
export function sub(a: Vector, ...rest: Vector[]): Vector;
export function sub<R extends Orientation|Rotation>(a: R, ...rest: Rotation[]): R;
export function sub<R extends Point|Vector>(a:R, ...rest: PFunction<Vector>[]): R;
export function sub<R extends Orientation|Rotation>(a: R, ...rest: PFunction<Rotation>[]): R;
export function sub(a: IPFunction<number>, ...rest: IPFunction<number>[]): IPFunction<number>;
export function sub<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function sub<R extends Orientation|Rotation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
export function sub(a: PFunction<number>, ...rest: PFunction<number>[]): PFunction<number>;
export function sub<R extends Point|Vector>(a: PFunction<R>, ...rest: PFunction<Vector>[]): PFunction<R>;
export function sub<R extends Orientation|Rotation>(a: PFunction<R>, ...rest: PFunction<Rotation>[]): PFunction<R>;
export function sub(
    a: BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>,
    ...rest: (BaseValueRelative|PFunction<BaseValueRelative>|IPFunction<BaseValueRelative>)[]):
    BaseValue|PFunction<BaseValue>|IPFunction<BaseValue>
{
    if (typeof a === 'number') {
        return (rest as number[]).reduce((acc, v) => acc - v, a);
    } else if (isPoint(a)) {
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Point(ax, ay, az);
    } else if (isVector(a)) {
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Vector(ax, ay, az);
    } else if (isRotationish(a)) {
        const acc = a.clone();
        for (const v of rest) {
            acc.subf(v as Rotation);
        }
        return acc;
    } else if (a instanceof PFunction) {
        return (rest as PFunction<Vector>[]).reduce((ra, v) => new PSub(ra, v), a);
    } else if (a instanceof Function) {
        const pf = a.pfunction as PFunction<Vector>;
        const ri = rest as IPFunction<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return sub(pf, ...rpf).f;
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}

