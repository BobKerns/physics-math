/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {quat, vec4} from 'gl-matrix';
import {BaseValue} from "./base";

/**
 * Miscellaneous utilities
 */

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    let x = start;
    if (step > 0) {
        while (x < end) {
            yield x;
            x += step;
        }
    } else if (step < 0) {
        while (x > end) {
            yield x;
            x += step;
        }
    } else {
        throw new Error("Step must not be zero.");
    }
}

export function idGen(prefix = 'gen', sep = '-'): string {
    const fn: idGen = idGen as unknown as idGen;

    const seqs = fn.seqs || (fn.seqs = {});
    const seq =
        seqs[prefix] || (seqs[prefix] = range(0, Number.MAX_SAFE_INTEGER));
    return `${prefix}${sep}${seq.next().value}`;
}

/**
 * We extend our returned HTML element with Observable's 'viewof' support.
 */
export interface ViewOf<T = any> {
    value: T;
}

abstract class Vectorish<W extends 0 | 1> extends Float64Array {
    0: number;
    1: number;
    2: number;
    3: W;
    protected constructor(x = 0, y = 0, z = 0, w: W) {
        super(4);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
    }
    get vec4() { return this as unknown as vec4; }
    get x() { return this[0]; }
    set x(v) { this[0] = v; }
    get y() { return this[1]; }
    set y(v) { this[1] = v; }
    get z() { return this[2]; }
    set z(v) { this[2] = v; }
    get w() { return this[3]; }
}

export class Point extends Vectorish<1> {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z, 1);
    }
    clone() { return new Point(this[0], this[1], this[2]); }
    static coerce(p: Point | vec4) {
        if (isPoint(p)) {
            return p;
        } else {
            return new Point(p[0], p[1], p[2])
        }
    }
}

export class Vector extends Vectorish<0> {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z, 0);
    }
    clone() { return new Vector(this[0], this[1], this[2]); }
    static coerce(v: Vector | vec4) {
        if (isVector(v)) {
            return v;
        } else {
            return new Vector(v[0], v[1], v[2])
        }
    }
}

export class Quaternion extends Float64Array {
    constructor(i = 0, j = 0, k = 0, w = 1) {
        super(4);
        this[0] = i;
        this[1] = j;
        this[2] = k;
        this[3] = w;
    }
    get i() { return this[0]; }
    set i(v) { this[0] = v; }
    get j() { return this[1]; }
    set j(v) { this[1] = v; }
    get k() { return this[2]; }
    set k(v) { this[2] = v; }
    get w() { return this[3]; }
    set w(v) { this[3] = v; }
    get quat() { return this as unknown as quat; }
    clone() { return new Quaternion(this[0], this[1], this[2], this[3]); }
    normalize() {
        return quat.normalize(this.quat, this.quat);
    }

    conjugate() {
        return new Quaternion(-this[0], -this[1], -this[2], this[3]);
    }

    rotate(b: Point | Vector) {
        const ax = this[0];
        const ay = this[1];
        const az = this[2];
        const aw = this[3];
        const bx = b[0];
        const by = b[1];
        const bz = b[2];
        const bw = b[3];

        const cx = ax * bw + aw * bx + ay * bz - az * by;
        const cy = ay * bw + aw * by + az * bx - ax * bz;
        const cz = az * bw + aw * bz + ax * by - ay * bx;
        const cw = aw * bw - ax * bx - ay * by - az * bz;

        const dx = cx * aw + cw * -ax + cy * -az - cz * -ay;
        const dy = cy * aw + cw * -ay + cz * -ax - cx * -az;
        const dz = cz * aw + cw * -az + cx * -ay - cy * -ax;
        const dw = cw * aw - cx * -ax - cy * -ay - cz * -az;

        const w = dw === 0 ? 1 : dw;
        if (isPoint(b)) {
            return new Point(dx/w, dy/w, dz/w);
        } else {
            return new Vector(dx/w, dy/w, dz/w);
        }
    }
    static coerce(q: Quaternion | quat) {
        if (isQuaternion(q)) {
            return q;
        } else {
            return new Quaternion(q[0], q[1], q[2], q[3])
        }
    }

    static fromEuler(x: number, y: number, z: number) {
        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);

        const i = sx * cy * cz - cx * sy * sz;
        const j = cx * sy * cz + sx * cy * sz;
        const k = cx * cy * sz - sx * sy * cz;
        const w = cx * cy * cz + sx * sy * sz;
        return new Quaternion(i, j, k, w);
    }
}

export const isPoint = (v: any): v is Point => v instanceof Point;

export const isVector = (v: any): v is Vector => v instanceof Vector;

export const isQuaternion = (v: any): v is Quaternion => v instanceof Quaternion;

export const vector = (x: number, y: number, z: number) => new Vector(x, y, z);

export const point = (x: number, y: number, z: number) => new Point(x, y, z);

export const quaternion = (i = 0, j= 0, k= 0, w= 1) => new Quaternion(i, j, k, w);

export function add(a: Point, ...rest: Vector[]): Point;
export function add(a: Vector, ...rest: Vector[]): Vector;
export function add(a: Quaternion, ...rest: Quaternion[]): Quaternion;
export function add(a: number, ...rest: number[]): number;
export function add(a: BaseValue, ...rest: BaseValue[]): BaseValue {
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
    } else if (isQuaternion(a)) {
        return Quaternion.coerce((rest as Quaternion[]).reduce(
                (acc, v) =>
                    quat.multiply(acc, acc, v.quat),
                a.clone().quat));
    } else {
        throw new TypeError(`Unknown type in add: ${{a}}`);
    }
}

export function sub(a: Point, ...rest: Vector[]): Point;
export function sub(a: Vector, ...rest: Vector[]): Vector;
export function sub(a: Quaternion, ...rest: Quaternion[]): Quaternion;
export function sub(a: number, ...rest: number[]): number;
export function sub(a: BaseValue, ...rest: BaseValue[]): BaseValue;
export function sub(a: BaseValue, ...rest: BaseValue[]): BaseValue {
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
    } else if (isQuaternion(a)) {
        return Quaternion.coerce((rest as Quaternion[]).reduce(
            (acc, v) =>quat.multiply(acc, acc, v.quat),
            a.clone().quat));
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}

