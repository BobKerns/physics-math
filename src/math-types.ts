import {quat, vec4} from "gl-matrix";


/**
 * Marker interface for types which represent relative info, such as vectors or rotations
 */
export interface Relative<A> {}

/**
 * Marker interface for types which represent info intrinsic to a particular object,
 * such as position in space (point) or orientation
 */
export interface Intrinsic<R> {}

/**
 * Marker for all non-scalar values
 */
export interface NonScalar<T> {

}

/**
 * Our primitive datatypes
 */
export type BaseValueRelative = number | Vector | Rotation;
export type BaseValueIntrinsic = Point | Orientation;
export type BaseValue = BaseValueRelative | BaseValueIntrinsic;

abstract class Vectorish<W extends 0 | 1 = 0 | 1> extends Float64Array {
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

    protected get vec4() {
        return this as unknown as vec4;
    }

    get x() {
        return this[0];
    }

    set x(v) {
        this[0] = v;
    }

    get y() {
        return this[1];
    }

    set y(v) {
        this[1] = v;
    }

    get z() {
        return this[2];
    }

    set z(v) {
        this[2] = v;
    }

    get w() {
        return this[3];
    }

    add(v: Vector): this {
        const c = this.constructor as typeof Vector;
        return new c(this[0] + v[0], this[1] + v[1], this[2] + v[2]) as unknown as this;
    }

    addf(v: Vector): this {
        this[0] += v[0];
        this[1] += v[1];
        this[2] += v[2];
        return this;
    }

    sub(v: Vector): this {
        const c = this.constructor as typeof Vector;
        return new c(this[0] - v[0], this[1] - v[1], this[2] - v[2]) as unknown as this;
    }

    subf(v: Vector): this {
        this[0] -= v[0];
        this[1] -= v[1];
        this[2] -= v[2];
        return this;
    }

    mult(n: number): this {
        const c = this.constructor as typeof Vector;
        return new c(this[0] * n, this[1] * n, this[2] * n) as unknown as this;
    }

    multf(n: number): this {
        this[0] -= n;
        this[1] -= n;
        this[2] -= n;
        return this;
    }
}

export class Point extends Vectorish<1> implements Intrinsic<Vector> {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z, 1);
    }

    clone() {
        return new Point(this[0], this[1], this[2]);
    }

    static coerce(p: Point | vec4) {
        if (isPoint(p)) {
            return p;
        } else {
            return new Point(p[0], p[1], p[2])
        }
    }
}

export class Vector extends Vectorish<0> implements Relative<Point> {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z, 0);
    }

    clone() {
        return new Vector(this[0], this[1], this[2]);
    }

    static coerce(v: Vector | vec4) {
        if (isVector(v)) {
            return v;
        } else {
            return new Vector(v[0], v[1], v[2])
        }
    }
}

/**
 * Rotation or Orientationm represented as a versor, aka a unit quaternion.
 */
class Rotationish extends Float64Array {
    constructor(i = 0, j = 0, k = 0, w = 1) {
        super(4);
        this[0] = i;
        this[1] = j;
        this[2] = k;
        this[3] = w;
    }

    get i() {
        return this[0];
    }

    set i(v) {
        this[0] = v;
    }

    get j() {
        return this[1];
    }

    set j(v) {
        this[1] = v;
    }

    get k() {
        return this[2];
    }

    set k(v) {
        this[2] = v;
    }

    get w() {
        return this[3];
    }

    set w(v) {
        this[3] = v;
    }

    protected get quat() {
        return this as unknown as quat;
    }

    /**
     * Addition here is the group operator on the rotation group, i.e. addition of spherical (great-circle)
     * on the versor surface. This corresponds to multiplication of the underlying quaternions.
     * @param a
     */
    add(a: Rotationish): this {
        return quat.multiply(
            this.create() as unknown as quat,
            this as unknown as quat,
            a as unknown as quat
        ) as unknown as this;
    }

    addf(a: Rotationish): this {
        return quat.multiply(
            this as unknown as quat,
            this as unknown as quat,
            a as unknown as quat
        ) as unknown as this;
    }

    sub(a: Rotationish): this {
        return quat.multiply(
            this.create() as unknown as quat,
            this as unknown as quat,
            quat.conjugate(quat.create(),
                a as unknown as quat)
        ) as unknown as this;
    }

    subf(a: Rotationish): this {
        return quat.multiply(
            this as unknown as quat,
            this as unknown as quat,
            quat.conjugate(quat.create(),
                a as unknown as quat)
        ) as unknown as this;
    }

    mult(n: number): this {
        return quat.scale(
            this.create() as unknown as quat,
            this as unknown as quat,
            n
        ) as unknown as this;
    }

    multf(n: number): this {
        return quat.scale(
            this as unknown as quat,
            this as unknown as quat,
            n
        ) as unknown as this;
    }

    clone(): this {
        const c = this.constructor as typeof Rotationish;
        return new c(this[0], this[1], this[2], this[3]) as this;
    }

    create(): this {
        const c = this.constructor as typeof Rotationish;
        return new c() as this;
    }

    /**
     * Normalizes in-place.
     */
    normalize() {
        quat.normalize(this.quat, this.quat);
        return this;
    }

    conjugate() {
        const c = this.constructor as typeof Rotationish;
        return new c(-this[0], -this[1], -this[2], this[3]);
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
            return new Point(dx / w, dy / w, dz / w);
        } else {
            return new Vector(dx / w, dy / w, dz / w);
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
        return new Rotation(i, j, k, w);
    }
}

export type Positional = Point | Vector;
export type Rotational = Orientation | Rotation;

export class Orientation extends Rotationish implements Intrinsic<Rotation> {
    constructor(i = 0, j = 0, k = 0, w = 1) {
        super(i, j, k, w);
    }
    static coerce(q: Rotationish | quat): Orientation {
        if (isOrientation(q)) {
            return q;
        } else if (isRotation(q)) {
            return new Orientation(q.i, q.j, q.k)
        } else {
            return new Orientation(q[0], q[1], q[2], q[3])
        }
    }
}

export class Rotation extends Rotationish implements Relative<Orientation> {
    constructor(i = 0, j = 0, k = 0, w = 1) {
        super(i, j, k, w);
    }
    static coerce(q: Rotationish | quat): Rotation {
        if (isRotation(q)) {
            return q;
        } else if (isOrientation(q)) {
            return new Rotation(q.i, q.j, q.k)
        } else {
            return new Rotation(q[0], q[1], q[2], q[3])
        }
    }
}

export const isBaseValue = (v: any): v is BaseValue => typeof v === 'number' || v instanceof Vectorish || v instanceof Rotationish;
export const isVectorish = (v: any): v is Vectorish => v instanceof Vectorish;
export const isPoint = (v: any): v is Point => v instanceof Point;
export const isVector = (v: any): v is Vector => v instanceof Vector;
export const isRotationish = (v: any): v is Rotationish => v instanceof Rotationish;
export const isOrientation = (v: any): v is Orientation => v instanceof Orientation;
export const isRotation = (v: any): v is Rotation => v instanceof Rotation;
export const isIntrinsic = (v: any): v is BaseValueIntrinsic => v instanceof Point || v instanceof Orientation;

export const vector = (x: number, y: number, z: number) => new Vector(x, y, z);
export const point = (x: number, y: number, z: number) => new Point(x, y, z);
export const rotation = (i = 0, j = 0, k = 0, w = 1) => new Rotation(i, j, k, w);
export const orientation = (i = 0, j = 0, k = 0, w = 1) => new Orientation(i, j, k, w);
