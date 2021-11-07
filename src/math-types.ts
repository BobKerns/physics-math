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

import {quat, vec4} from "gl-matrix";
import {callSite, Constructor, defineTag, NYI, Throw, ViewOf} from "./utils";
import {isPCompiled, PFunction} from "./pfunction";
import {Value, ValueInFrame, IPCompiled, IPFunction, Relative, IPFunctionCalculus, IPCompileResult, TEX_FORMATTER, IndefiniteIntegral, IPFunctionBase, Variable} from "./base";
import {Units} from "./unit-defs";
import {InertialFrame} from "./frame";
import {Divide, Multiply, Unit} from "./units";
import {DEFAULT_STYLE, Style, StyleContext} from "./latex";

type Constructor3N<R> = Constructor<R, [Unit, number, number, number]>;
type Constructor4N<R> = Constructor<R, [Unit, number, number, number, number]>;

export enum TYPE {
    SCALAR,
    VECTOR,
    ROTATION,
    POINT = 9,
    ORIENTATION = 10
}

interface DataType<T extends TYPE> {
    readonly type: T;
}

export type DataTypeOf<D> = D extends number ? TYPE.SCALAR : D extends DataType<infer T> ? T : never;

export const datatype = (d: any): TYPE => typeof d === 'number' ? TYPE.SCALAR : d.type;

/**
 * Marker for all non-scalar values
 */
/**
 * Marker for all non-scalar values
 */
export interface NonScalarValue extends DataType<TYPE.VECTOR | TYPE.POINT | TYPE.ROTATION | TYPE.ORIENTATION> {
    0: number;
    1: number;
    2: number;
    3: number;
    type: TYPE.POINT | TYPE.VECTOR | TYPE.ORIENTATION | TYPE.ROTATION;
}

export type RelativeOf<T> = T extends Point ? Vector : T extends Orientation ? Rotation : T;
export type InFrameOf<T> = T extends Vector ? Point : T extends Rotation ? Orientation : T;

/**
 * Our primitive datatypes
 */
export type ScalarValue<U extends Unit> = number;
export type BaseValueRelative<U extends Unit = Unit> = ScalarValue<U> | Vector<U> | Rotation<U>;
export type BaseValueInFrame = Point | Orientation;
// noinspection JSUnusedGlobalSymbols
export type BaseValueNonScalar = Point | Vector | Orientation | Rotation | NonScalarValue;
// noinspection JSUnusedGlobalSymbols
export type BaseValueRelativeNonScalar<U extends Unit = Unit> = Vector<U> | Rotation<U>;
export type BaseValue = number | BaseValueNonScalar;

abstract class ArrayBase<
    C extends Unit<any>
    >
    extends Float64Array
    implements
        NonScalarValue,
        Value<NonScalarValue, C>
{
    0: number;
    1: number;
    2: number;
    3: number;
    readonly unit: C;

    protected constructor(unit: C) {
        super(4);
        this.unit = unit;
    }
    get value(): this { return this; }
    abstract get type(): TYPE.POINT | TYPE.VECTOR | TYPE.ORIENTATION | TYPE.ROTATION;
    assign(): this;
    assign(other: ArrayBase<C>): this;
    assign(a: number, b: number, c: number): this;
    assign(a: number, b: number, c: number, d: number): this;
    assign(a: number|ArrayBase<C> = 0, b: number = 0, c: number = 0, d: number = this[3]): this {
        if (typeof a === 'number') {
            this[0] = a;
            this[1] = b;
            this[2] = c;
            this[3] = d;
        } else {
            this[0] = a[0];
            this[1] = a[1];
            this[2] = a[2];
            this[3] = a[3];
        }
        return this;
    }


    // noinspection JSUnusedGlobalSymbols
    magnitude(): number {
        return vec4.len(this as unknown as vec4);
    }

    magnitudeSqr(): number {
        return vec4.squaredLength(this as unknown as vec4);
    }

    equiv<T>(f: T): this | null {
        if (Object.getPrototypeOf(f) !== Object.getPrototypeOf(this)) return null;
        const x = f as unknown as ArrayBase<C>
        if (x.unit !== this.unit) return null;
        if (x.length !== this.length) return null;
        if (x[0] !== this[0]) return null;
        if (x[0] !== this[0]) return null;
        if (x[0] !== this[0]) return null;
        if (x[0] !== this[0]) return null;
        return this;
    }

    protected compileFn(): IPCompileResult<NonScalarValue, 0> {
        return () => this;
    }

    f_?: IPCompiled<BaseValue, C, 0>;

    /**
     * The implementing function
     */
    get f(): IPCompiled<BaseValue, C, 0> {
        return this.f_ || (this.f_ = this.compile());
    }

    compile(): IPCompiled<NonScalarValue, C, 0> {
        const bare = this.compileFn();
        Reflect.defineProperty(bare, 'pfunction', {
            value: this,
            configurable: false,
            writable: false
        });
        Reflect.defineProperty(bare, 'html', {
            get: () => this.toHtml('t', false)
        });
        Reflect.defineProperty(bare, 'toTex', {
            value: (varName: string) => this.toTex(varName)
        });
        Reflect.defineProperty(bare, 'tex', {
            get: () => this.toTex()
        });
        return bare as IPCompiled<NonScalarValue, C, 0>;
    }

    /**
     * Compute the LaTeX representation of this function.
     * @param varName? The parameter name (or expression)
     * @param ctx?
     */
    abstract toTex(varName?: Variable, ctx?: StyleContext): string;

    toTexWithUnits(varName: Variable = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        const call = this.toTex(varName, ctx);
        return ctx.applyUnitFunction(call, this.unit);
    }

    /**
     * Cached LaTeX string
     */
    tex_?: string;
    style_?: Style;

    /**
     * Get the LaTeX representation of this function.  The value is cached.
     */
    get tex() {
        if (this.tex_ && this.style_ === DEFAULT_STYLE) {
            return this.tex_;
        }
        this.style_ = DEFAULT_STYLE;
        return (this.tex_ = this.toTexWithUnits());
    }


    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param varName?? The variable name to be used; ordinarily t (time).
     * @param block??
     * @param ctx??
     */
    toHtml(varName?: Variable, block?: boolean, ctx?: StyleContext): ViewOf<this> & Element {
        // callSite prepares it for ObservableHQ's tex string interpolator.
        const latex = callSite(this.toTexWithUnits(varName, ctx));
        const fmt = block ? TEX_FORMATTER.block : TEX_FORMATTER.inline;
        const h = fmt(latex) as ViewOf<this> & Element;
        h.value = this;
        return h;
    }

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each reference,
     * equivalent to:
     * ```
     * pFun.toHtml();
     * ```
     */
    get html(): ViewOf<this> & Element {
        return this.toHtml();
    }
}

const checkUnits = (a: Value, b: Value): true | never =>
    (a.unit === b.unit)
    || Throw(`Incompatible units: ${a.unit} vs ${b.unit}`);

abstract class Vectorish<C extends Unit, W extends 0 | 1 = 0 | 1>
    extends ArrayBase<C>
    implements DataType<TYPE.VECTOR|TYPE.POINT> {
    declare 0: number;
    declare 1: number;
    declare 2: number;
    declare 3: W;
    protected constructor(unit: C, x = 0, y = 0, z = 0, w: W) {
        super(unit);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
    }
    abstract get type(): TYPE.POINT | TYPE.VECTOR;

    // noinspection JSUnusedGlobalSymbols
    get vec4() {
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

    add(v: Vector<C>): this {
        checkUnits(this, v);
        const c = this.constructor as Constructor3N<Vectorish<C, W>>;
        return new c(this.unit, this[0] + v[0], this[1] + v[1], this[2] + v[2]) as unknown as this;
    }

    // noinspection JSUnusedGlobalSymbols
    addf(v: Vector<C>): this {
        checkUnits(this, v);
        this[0] += v[0];
        this[1] += v[1];
        this[2] += v[2];
        return this;
    }

    sub(v: Vector<C>): this {
        checkUnits(this, v);
        const c = this.constructor as Constructor3N<Vectorish<C, W>>;
        return new c(this.unit, this[0] - v[0], this[1] - v[1], this[2] - v[2]) as unknown as this;
    }

    // noinspection JSUnusedGlobalSymbols
    subf(v: Vector<C>): this {
        checkUnits(this, v);
        this[0] -= v[0];
        this[1] -= v[1];
        this[2] -= v[2];
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    mult(n: number): this {
        const c = this.constructor as Constructor3N<Vectorish<C, W>>;
        return new c(this.unit, this[0] * n, this[1] * n, this[2] * n) as unknown as this;
    }

    // noinspection JSUnusedGlobalSymbols
    multf(n: number): this {
        this[0] -= n;
        this[1] -= n;
        this[2] -= n;
        return this;
    }

    clone(): this {
        const c = this.constructor as Constructor3N<Vectorish<C, W>>;
        return new c(this.unit, this[0], this[1], this[2]) as this;
    }
}

export class Point
    extends Vectorish<Units.length, 1>
    implements
        DataType<TYPE.POINT>,
        ValueInFrame<Point, Units.length>
{
    get type(): TYPE.POINT { return TYPE.POINT; }

    readonly frame: InertialFrame;

    constructor(frame: InertialFrame, x = 0, y = 0, z = 0) {
        super(Units.length, x, y, z, 1);
        this.frame = frame;
    }


    clone(): this {
        return new Point(this.frame, this[0], this[1], this[2]) as this;
    }

    toTex(varName: string | undefined, ctx: StyleContext | undefined): string {
        return "";
    }
}

export class Vector<
    U extends Unit = Units.length,
    D extends Divide<U, Units.time> = Divide<U, Units.time>,
    I extends Multiply<U, Units.time> = Multiply<U, Units.time>
>
    extends Vectorish<U, 0>
    implements
        Relative,
        Value<Vector<U, D, I>,U>,
        DataType<TYPE.VECTOR>,
        IPFunctionCalculus<Vector<U, D, I>, U, 0, D, I>
{
    get type(): TYPE.VECTOR { return TYPE.VECTOR; }

    constructor(unit: U, x = 0, y = 0, z = 0, w: 0 = 0) {
        super(unit, x, y, z, w);
    }

    get returnType() : TYPE.VECTOR { return TYPE.VECTOR; }

    // @ts-ignore
    derivative(): IPFunctionCalculus<Vector<D, Divide<D, Units.time>, U>, D, 1, Divide<D, Units.time>, U> {
        type T = Divide<D, Units.time>;
        const v = new Vector<D, T>(this.unit.divide(Units.time) as D);
        return v as unknown as IPFunctionCalculus<Vector<D, T>, D, 1, T, U> ;
    }

    // @ts-ignore
    integral(): IndefiniteIntegral<Vector<U>, Multiply<Unit, Units.time>, Unit> {
        return NYI();
    }

    simplify(options?: any): IPFunctionBase<Vector<U, D, I>, U, 0> {
        return this as unknown as IPFunctionCalculus<Vector<U, D, I>, U, 0, D, I>;
    }

    toTex(varName?: Variable, ctx?: StyleContext): string {
        return "";
    }

    toTexWithUnits(varName?: Variable, ctx?: StyleContext): string {
        return "";
    }

    get name(): string { return 'V'; };
    get nargs(): 0 { return 0; };
}

/**
 * Rotation or Orientation represented as a versor, aka a unit quaternion.
 */
abstract class Rotationish<C extends Unit> extends ArrayBase<C> implements DataType<TYPE.ROTATION|TYPE.ORIENTATION> {
    protected constructor(unit: C, i = 0, j = 0, k = 0, w = 1) {
        super(unit);
        this[0] = i;
        this[1] = j;
        this[2] = k;
        this[3] = w;
    }
    abstract get type(): TYPE.ROTATION | TYPE.ORIENTATION;

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
    add(a: Rotationish<C>): this {
        checkUnits(this, a);
        return quat.multiply(
            this.create() as unknown as quat,
            this as unknown as quat,
            a as unknown as quat
        ) as unknown as this;
    }

    abstract create(): Rotationish<C>;
    abstract clone(): Rotationish<C>;

    // noinspection JSUnusedGlobalSymbols
    addf(a: Rotationish<C>): this {
        checkUnits(this, a);
        return quat.multiply(
            this as unknown as quat,
            this as unknown as quat,
            a as unknown as quat
        ) as unknown as this;
    }

    sub(a: Rotationish<C>): this {
        checkUnits(this, a);
        return quat.multiply(
            this.create() as unknown as quat,
            this as unknown as quat,
            quat.conjugate(quat.create(),
                a as unknown as quat)
        ) as unknown as this;
    }

    // noinspection JSUnusedGlobalSymbols
    subf(a: Rotationish<C>): this {
        checkUnits(this, a);
        return quat.multiply(
            this as unknown as quat,
            this as unknown as quat,
            quat.conjugate(quat.create(),
                a as unknown as quat)
        ) as unknown as this;
    }

    /**
     * Because multiplication of quaternions is equal to addition of spherical vectors on the
     * 3D unit sphere, multiplication of those vectors by a real is the same as exponentiation of
     * their quaternions by a real.
     * @param n
     */
    // noinspection JSUnusedGlobalSymbols
    mult(n: number): this {
        return quat.pow(
            this.create() as unknown as quat,
            this as unknown as quat,
            n
        ) as unknown as this;
    }

    /**
     * Because multiplication of quaternions is equal to addition of spherical vectors on the
     * 3D unit sphere, multiplication of those vectors by a real is the same as exponentiation of
     * their quaternions by a real.
     * @param n
     */
    // noinspection JSUnusedGlobalSymbols
    multf(n: number): this {
        return quat.pow(
            this as unknown as quat,
            this as unknown as quat,
            n
        ) as unknown as this;
    }

    /**
     * Normalizes in-place.
     */
    normalize() {
        quat.normalize(this.quat, this.quat);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    conjugate() {
        const c = this.constructor as Constructor4N<Rotationish<C>>;
        return new c(this.unit, -this[0], -this[1], -this[2], this[3]);
    }

    // noinspection JSUnusedGlobalSymbols
    rotate<T extends Rotationish<C>>(b: T) {
        const ax = this[0];
        const ay = this[1];
        const az = this[2];
        const aw = this[3];
        const bx = b[0];
        const by = b[1];
        const bz = b[2];

        const cx = aw * bx + ay * bz - az * by;
        const cy = aw * by + az * bx - ax * bz;
        const cz = aw * bz + ax * by - ay * bx;
        const cw = ax * bx - ay * by - az * bz;

        const dx = cx * aw + cw * -ax + cy * -az - cz * -ay;
        const dy = cy * aw + cw * -ay + cz * -ax - cx * -az;
        const dz = cz * aw + cw * -az + cx * -ay - cy * -ax;
        const dw = cw * aw - cx * -ax - cy * -ay - cz * -az;

        const w = dw === 0 ? 1 : dw;
        let c = b.constructor as Constructor3N<T>;
        return new c(this.unit,dx/2, dy/w, dz/w);
    }

    static fromEulerX<U extends Unit, T extends Rotationish<U>>(
        f: (i:number, j: number, k: number, w: number) => T,
        x: number, y: number, z: number) {
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
        return f(i, j, k, w);
    }
}

export type Positional = Point | Vector;
export type Rotational = Orientation | Rotation;

export class Orientation
    extends Rotationish<Units.angle>
    implements
        DataType<TYPE.ORIENTATION>,
        ValueInFrame<Orientation, Units.angle>
{
    readonly frame: InertialFrame;

    constructor(frame: InertialFrame, i = 0, j = 0, k = 0, w = 1) {
        super(Units.angle, i, j, k, w);
        this.frame = frame;
    }
    get type(): TYPE.ORIENTATION { return TYPE.ORIENTATION; }

    // noinspection JSUnusedGlobalSymbols
    clone(): this {
        return new Orientation(this.frame, this[0], this[1], this[2], this[3]) as this;
    }

    create(frame: InertialFrame = this.frame): this {
        return new Orientation(frame) as this;
    }

    static coerce<U extends Unit>(frame: InertialFrame, q: Rotationish<U> | quat): Orientation {
        if (isOrientation(q)) {
            return q;
        } else if (isRotation(q)) {
            return new Orientation(frame, q[0], q[1], q[2], q[3])
        } else {
            return new Orientation(frame, q[0], q[1], q[2], q[3])
        }
    }
    static fromEuler(frame: InertialFrame, x: number, y: number, z: number) {
        const maker = (i: number, j: number, k: number, w: number) =>
            new Orientation(frame, i, j, k, w);
        return Rotationish.fromEulerX(maker, x, y, z);
    }

    toTex(varName: string | undefined, ctx: StyleContext | undefined): string {
        return NYI('toTex');
    }
}

export class Rotation<C extends Unit = Units.angle>
    extends Rotationish<C>
    implements Relative
{
    toTex(varName?: string | undefined, ctx?: StyleContext | undefined): string {
        throw NYI('toTex');
    }
    constructor(unit: C, i = 0, j = 0, k = 0, w = 1) {
        super(unit, i, j, k, w);
    }
    get type(): TYPE.ROTATION { return TYPE.ROTATION; }

    clone(): Rotation<C> {
        return new Rotation(this.unit, this[0], this[1], this[2], this[3]);
    }

    create(): Rotation<C> {
        return new Rotation(this.unit);
    }

    /**
     * Addition here is the group operator on the rotation group, i.e. addition of spherical (great-circle)
     * on the versor surface. This corresponds to multiplication of the underlying quaternions.
     * @param a
     */
    add(a: Rotationish<C>): this {
        checkUnits(this, a);
        return quat.multiply(
            this.create() as unknown as quat,
            this as unknown as quat,
            a as unknown as quat
        ) as unknown as this;
    }

    static fromEuler<U extends Unit>(unit: U, x: number, y: number, z: number) {
        const maker = (i: number, j: number, k: number, w: number) =>
            new Rotation(unit, i, j, k, w);
        return Rotationish.fromEulerX<U, Rotation<U>>(maker, x, y, z);
    }
}

// noinspection JSUnusedGlobalSymbols
export const isBaseValue = (v: any): v is BaseValue => typeof v === 'number' || v instanceof Vectorish || v instanceof Rotationish;
export const valueType = (v: any): TYPE =>
    typeof v === 'number'
        ? TYPE.SCALAR
        : v instanceof ArrayBase
        ? v.type
        : v instanceof PFunction
            ? v.returnType
            : isPCompiled(v)
                ? v.pfunction.returnType
                : Throw(`Invalid value: ${v}`);

export const isPositional = (v: any): v is Positional => v instanceof Vectorish;
export const isPoint = (v: any): v is Point => v instanceof Point;
export const isVector = (v: any): v is Vector => v instanceof Vector;
export const isRotational = (v: any): v is Rotational => v instanceof Rotationish;
export const isOrientation = (v: any): v is Orientation => v instanceof Orientation;
export const isRotation = (v: any): v is Rotation => v instanceof Rotation;
// noinspection JSUnusedGlobalSymbols
export const isIntrinsicValue = (v: any): v is BaseValueInFrame => v instanceof Point || v instanceof Orientation;
// noinspection JSUnusedGlobalSymbols
export const isScalarValue = (v: any): v is ScalarValue<Unit> => typeof v === 'number';
// noinspection JSUnusedGlobalSymbols
export const isNonScalarValue = (v: any): v is NonScalarValue => isPositional(v) || isRotational(v);

export function vector<U extends Unit>(unit: U): (x?: number, y?: number, z?: number) => Vector<U>;
export function vector<U extends Unit>(unit: U, x?: number, y?: number, z?: number): Vector<U>;
export function vector<U extends Unit>(unit: U, x?: number, y?: number, z?: number) {
    if (x === undefined) {
        return (x?: number, y?: number, z?: number) => new Vector<U>(unit, x || 0, y || 0, z || 0);
    }
    return new Vector<U>(unit, x, y || 0, z || 0);
}

export function point<F extends InertialFrame>(frame: F): (x?: number, y?: number, z?: number) => Point;
export function point<F extends InertialFrame>(frame: F, x?: number, y?: number, z?: number): Point;
export function point<F extends InertialFrame>(frame: F, x?: number, y?: number, z?: number) {
    if (x === undefined) {
        return (x?: number, y?: number, z?: number) => new Point(frame, x || 0, y || 0, z || 0);
    }
    return new Point(frame, x, y || 0, z || 0);
}

// noinspection JSUnusedGlobalSymbols
export function rotation<U extends Unit>(unit: U): (x?: number, y?: number, z?: number, w?: number) => Rotation<U>;
export function rotation<U extends Unit>(unit: U, x?: number, y?: number, z?: number, w?: number): Rotation<U>;
export function rotation<U extends Unit>(unit: U, x?: number, y?: number, z?: number, w?: number) {
    if (x === undefined) {
        return (x?: number, y?: number, z?: number, w?: number) => new Rotation<U>(unit, x || 0, y || 0, z || 0, w || 1);
    }
    return new Rotation<U>(unit, x, y || 0, z || 0, w || 0);
}

// noinspection JSUnusedGlobalSymbols
export function orientation<F extends InertialFrame>(frame: F): (x?: number, y?: number, z?: number, w?: number) => Orientation;
export function orientation<F extends InertialFrame>(frame: F, x?: number, y?: number, z?: number, w?: number): Orientation;
export function orientation<F extends InertialFrame>(frame: F, x?: number, y?: number, z?: number, w?: number) {
    if (x === undefined) {
        return (x?: number, y?: number, z?: number, w?: number) => new Orientation(frame, x || 0, y || 0, z || 0, w || 1);
    }
    return new Orientation(frame, x, y || 0, z || 0, w || 1);
}

export function isRelative(v: IPFunction): v is IPFunction<BaseValueRelative>;
export function isRelative(v: IPCompiled): v is IPCompiled<BaseValueRelative>;
export function isRelative(v: number): v is number;
export function isRelative(v: Positional): v is Vector;
export function isRelative(v: Rotational): v is Orientation;
export function isRelative(v: BaseValue): v is BaseValueRelative;
export function isRelative(v: any): boolean {
    const relType = (v: any) => {
        switch (v.returnType) {
            case TYPE.ROTATION: return true;
            case TYPE.VECTOR: return true;
            case TYPE.SCALAR: return true;
            default: return false;
        }
    };
    if (typeof v === 'number') return true;
    if (v instanceof Vector) return true;
    if (v instanceof Rotation) return true;
    if (v instanceof PFunction) return relType(v);
    if (isPCompiled(v)) return relType(v.pfunction);
    return false;
}

export function isScalar(v: IPFunction): v is IPFunction<number>;
export function isScalar(v: IPCompiled): v is IPCompiled<number>;
export function isScalar(v: number): v is number;
export function isScalar(v: Positional): false;
export function isScalar(v: Rotational): false;
export function isScalar(v: BaseValue): v is number;
export function isScalar(v: any): boolean {
    const relType = (v: any) => {
        switch (v.returnType) {
            case TYPE.SCALAR: return true;
            default: return false;
        }
    };
    if (typeof v === 'number') return true;
    if (v instanceof Vectorish) return false;
    if (v instanceof Rotationish) return false;
    if (v instanceof PFunction) return relType(v);
    if (isPCompiled(v)) return relType(v.pfunction);
    return false;
}

defineTag(Vector, 'Vector');
defineTag(Point, 'Point');
defineTag(Rotation, 'Rotation');
defineTag(Orientation, 'Orientation');

