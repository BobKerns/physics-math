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
import {IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionCalculus} from "./base";
import {defineTag, Throw} from "./utils";
import {isPCompiled, isPFunction, PCalculus} from "./pfunction";
import {glMatrix} from "gl-matrix";
import {Units} from './unit-defs';
import {ScalarConstant} from "./scalar";
import {Unit, Divide, Multiply} from "./units";
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
    RelativeOf, isScalarValue, Rotational, isPositional, isNonScalarValue, TYPE, BaseValueInFrame
} from "./math-types";
import {Poly} from "./poly";

/**
 * Add two BaseValue quantities or BaseValue-valued functions together.
 */


export function add<R extends BaseValueRelative>(a: R, ...rest: R[]): R;
export function add<R extends BaseValueInFrame>(a: R, ...rest: RelativeOf<R>[]): R;
export function add<U extends Unit, R extends Vector<U>|Rotation<U>>(a: IPCompiled<R>, ...rest: IPCompiled<R>[]): IPCompiled<R>;
export function add<R extends BaseValueInFrame>(a: IPCompiled<R>, ...rest: IPCompiled<RelativeOf<R>>[]): IPCompiled<R>;
export function add<R extends Point|Vector>(a: IPCompiled<R>, ...rest: IPCompiled<Vector>[]): IPCompiled<R>;
export function add<U extends Unit, R extends Rotation<U>>(a: R, ...rest: R[]): R;
export function add<R extends Orientation>(a: R, ...rest: Rotation<Units.angle>[]): R;
export function add<U extends Unit, R extends Rotation<U>>(a: IPCompiled<R>, ...rest: IPCompiled<R>[]): IPCompiled<R>;
export function add<R extends Orientation>(a: IPCompiled<R>, ...rest: IPCompiled<Rotation>[]): IPCompiled<R>;
export function add<R extends number>(a: IPFunction<R>, ...rest: IPFunction<BaseValueRelative>[]): IPFunction<R>;
export function add<R extends Point|Vector>(a: IPFunction<R>, ...rest: IPFunction<Vector>[]): IPFunction<R>;
export function add<U extends Unit, R extends Rotation<U>>(a: IPFunction<R>, ...rest: IPFunction<R>[]): IPFunction<R>;
export function add<R extends Orientation>(a: IPFunction<R>, ...rest: IPFunction<Rotation>[]): IPFunction<R>;
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
        check(v => isVector(v) && a.unit === v.unit)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax += v[0], ay += v[1], az += v[2]));
        return a.clone().assign(ax, ay, az);
    } else if (isRotational(a)) {
        check(v => isRotation(v) && a.unit === v.unit)(rest);
        const acc = a.clone();
        for (const v of rest as Rotational[]) {
            acc.addf(v);
        }
        return acc;
    } else if (isPFunction(a)) {
        check(v => isPFunction(v) && a.unit === v.unit)(rest);
        if (a instanceof Poly) {
            const polys = [a, ...rest.filter(v => v instanceof Poly)] as unknown as Poly<Unit>[];
            if (polys.length > 1) {
                const len = Math.max(...polys.map(p => p.coefficients.length))
                const result: number[] = [];
                for (let i = 0; i < len; i++) {
                    polys.forEach(p => result[i] = (result[i] || 0) + p.coefficients[i]);
                }
                const nonPolys: typeof rest = rest.filter(v => !(v instanceof Poly)) as unknown as typeof rest;
                if (nonPolys.length === 0) {
                    return new Poly<Unit>(a.unit, ...result);
                }
                return gadd(new Poly<Unit>(a.unit, ...result), ...nonPolys);
            }
        }
        return (rest as IPFunction<Vector>[]).reduce((ra, v) => new PAdd(ra, v), a as IPFunction<Vector>);
    } else if (isPCompiled(a)) {
        check(v => isPCompiled(v) && a.pfunction.unit === v.pfunction.unit)(rest);
        const pf = a.pfunction;
        const ri = rest as IPCompiled<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return (gadd(pf, ...rpf) as IPFunction).f;
    } else if (a === null) {
        throw new TypeError(`Null argument in add`);
    } else {
        throw new TypeError(`Unknown type in add: ${(a as any).constructor.name}`);
    }
}

abstract class BinaryOp<
    R extends BaseValueRelative,
    X extends BaseValueRelative,
    C extends Unit,
    D extends Unit,
    I extends Unit>
    extends PCalculus<R, C, D, I> {
    l: IPFunctionCalculus<R, C, 1, D, I>;
    r: IPFunctionCalculus<X, C, 1, D, I>;
    protected constructor( l: IPFunctionCalculus<R, C, 1, D, I>, r: IPFunctionCalculus<X, C, 1, D, I>) {
        super({unit: l.unit});
        this.l = l;
        this.r = r;
    }

    get returnType(): TYPE {
        return this.l.returnType;
    }
    equiv<T>(f: T): null | this | T {
        // @ts-ignore
        if (this === f) return this;
        if (!super.equiv(f)) return null;
        // @ts-ignore
        if (!this.l.equiv(f.l)) return null;
        // @ts-ignore
        if (!this.r.equiv(f.r)) return null;
        return this;
    }
}

export class PAdd<
    R extends BaseValueRelative,
    C extends Unit,
    D extends Unit = Divide<C, Units.time>,
    I extends Unit = Multiply<C, Units.time>
    >
    extends BinaryOp<R, R, C, D, I>
    implements IPFunctionCalculus<R, C, 1, D, I> {
    constructor(a: IPFunctionCalculus<R, C, 1, D, I>, b: IPFunctionCalculus<R, C, 1, D, I>) {
        super(a, b);
        if (a.unit !== b.unit) {
            throw new Error(`Incompatible units: ${a.unit} vs ${b.unit}`);
        }
    }

    differentiate(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C> {
        const dl = this.l.derivative();
        const dr = this.r.derivative();
        return new PAdd(dl, dr);
    }

    integrate(): IndefiniteIntegral<R, I, C> {
        throw new Error(`Integrals of sums not yet supported`);
    }

    protected compileFn(): IPCompileResult<R> {
        const lf = this.l.f;
        const rf = this.r.f;
        return (t: number) => add(lf(t), rf(t));
    }
}

export class PSub<
    R extends BaseValueRelative,
    U extends Unit,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
    >
    extends BinaryOp<R, R, U, D, I>
    implements IPFunctionCalculus<R, U, 1, D, I>
{
    constructor(a: IPFunctionCalculus<R, U, 1, D, I>, b: IPFunctionCalculus<R, U, 1, D, I>) {
        super(a, b);
        if (a.unit !== b.unit) {
            throw new Error(`Incompatible units: ${a.unit} vs ${b.unit}`);
        }
    }

    differentiate(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, U> {
        const dl = this.l.derivative();
        const dr = this.r.derivative();
        return new PSub(dl, dr);
    }

    integrate(): IndefiniteIntegral<R, I, U> {
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
export function sub<R extends BaseValueInFrame>(a: R, ...rest: RelativeOf<R>[]): R;
export function sub<R extends BaseValueInFrame>(a: R, b: R): RelativeOf<R>;
export function sub<R extends BaseValueRelative>(a: R, ...b: R[]): R;

export function sub<R extends BaseValueInFrame>(a: IPCompiled<R>, ...rest: IPCompiled<RelativeOf<R>>[]): IPCompiled<R>;
export function sub<R extends BaseValueInFrame>(a: IPCompiled<R>, b: IPCompiled<R>): IPCompiled<RelativeOf<R>>;
export function sub<R extends BaseValueRelative>(a: IPCompiled<R>, ...b: IPCompiled<R>[]): IPCompiled<R>;

export function sub<R extends BaseValueInFrame>(a: IPFunction<R>, ...rest: IPFunction<RelativeOf<R>>[]): IPFunction<R>;
export function sub<R extends BaseValueInFrame>(a: IPFunction<R>, b: IPFunction<R>): IPFunction<RelativeOf<R>>;
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
        check(v => isVector(v) && a.unit === v.unit)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Point(a.frame, ax, ay, az);
    } else if (isVector(a)) {
        check(v => isVector(v) && a.unit === v.unit)(rest);
        let [ax, ay, az] = a;
        (rest as Vector[]).forEach(v => (ax -= v[0], ay -= v[1], az -= v[2]));
        return new Vector(a.unit, ax, ay, az);
    } else if (isRotational(a)) {
        check(v => isRotation(v) && a.unit === v.unit)(rest);
        const acc = a.clone();
        for (const v of rest) {
            acc.subf(v as Rotation);
        }
        return acc;
    } else if (isPFunction(a)) {
        check(v => isPFunction(v) && a.unit === v.unit)(rest);
        if (a instanceof Poly) {
            const polys = [a, ...rest.filter(v => v instanceof Poly)] as unknown as Poly<Unit>[];
            if (polys.length > 1) {
                const len = Math.max(...polys.map(p => p.coefficients.length))
                const result: number[] = a.coefficients.slice();
                for (let i = 1; i < len; i++) {
                    polys.forEach(p => result[i] = (result[i] || 0) - p.coefficients[i]);
                }
                const nonPolys: typeof rest = rest.filter(v => !(v instanceof Poly)) as unknown as typeof rest;
                if (nonPolys.length === 0) {
                    return new Poly<Unit>(a.unit, ...result);
                }
                return gsub(new Poly<Unit>(a.unit, ...result), ...nonPolys);
            }
        }
        // Vector stands in here for any one type.
        return (rest as unknown as IPFunction<Vector>[])
            .reduce((ra, v) => new PSub(ra, v),
                a as IPFunctionCalculus<Vector>);
    } else if (isPCompiled(a)) {
        check(v => isPCompiled(v) && a.pfunction.unit === v.pfunction.unit)(rest);
        const pf = a.pfunction;
        const ri = rest as IPCompiled<Vector>[];
        const rpf = ri.map(v => v.pfunction);
        return (gsub(pf, ...rpf) as IPFunction).f;
    } else {
        throw new TypeError(`Unknown type in sub: ${{a}}`);
    }
}


export class PMul<
    R extends BaseValueRelative,
    U extends Unit,
    D extends Unit,
    I extends Unit
    >
    extends BinaryOp<R, number, U, D, I> {
    constructor(a: IPFunctionCalculus<R, U, 1, D, I>, b: IPFunctionCalculus<number, U, 1, D, I>) {
        super(a, b);
    }

    differentiate(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, U> {
        throw new Error(`Differentiation of products not yet supported.`);
    }

    integrate(): IndefiniteIntegral<R, I, U>  {
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
    : BaseValueRelative|IPFunction<BaseValueRelative>|IPCompiled<BaseValueRelative>|IPFunctionCalculus<BaseValueRelative>
{
    const check = (pred: (v: any) => boolean) => (rest: any[]) => rest.forEach(v => pred(v) || Throw('Bad value in add'));
    const isScalar = (u: Unit) => (v: any) => isScalarValue(v) || ((v instanceof ScalarConstant) && v.unit === u);
    if (typeof a === 'number') {
        check(isScalarValue)(rest);
        return (rest as number[]).reduce((acc, v) => acc * v, a);
    } else if (isVector(a)) {
        check(isScalar(a.unit))(rest);
        let [ax, ay, az] = a;
        (rest as number[]).forEach(v => (ax *= v, ay *= v, az *= v));
        return new Vector(a.unit, ax, ay, az);
    } else if (isRotation(a)) {
        check(isScalar(a.unit))(rest);
        const acc = a.clone();
        for (const v of rest as number[]) {
            acc.multf(v);
        }
        return acc;
    } else if (isPFunction(a)) {
        if (a instanceof Poly) {
            const polys = [a, ...(rest as unknown[]).filter(v => v instanceof Poly)] as unknown as Poly<Unit>[];
            if (polys.length > 1) {
                const result: number[] = [];
                for (let i = 0; i < polys.length; i++) {
                    const p = polys[i];
                    for (let j = 0; j < result.length; j++) {
                        for (let k = 0; k < p.coefficients.length; k++) {
                            result[j + k] = (result[j + k] || 0) * p.coefficients[k];
                        }
                    }
                }
                const nonPolys: typeof rest = (rest as unknown[]).filter(v => !(v instanceof Poly)) as unknown as typeof rest;
                if (nonPolys.length === 0) {
                    return new Poly<Unit>(a.unit, ...result);
                }
                return gmul(new Poly<Unit>(a.unit, ...result), ...nonPolys);
            }
            return (rest as unknown as (IPFunctionCalculus<number>|number)[])
                .reduce((ra, v) =>
                        new PMul(ra, typeof v === 'number'
                            ? new ScalarConstant(v, a.unit)
                            : v as IPFunctionCalculus<number>),
                    a as unknown as PMul<number, Unit, any, any>);
        }
        check(v => isPFunction(v) && a.unit === v.unit)(rest);
        return (rest as unknown as (IPFunctionCalculus<number> | number)[])
            .reduce((ra, v) =>
                    new PMul(ra, typeof v === 'number'
                        ? new ScalarConstant(v, a.unit)
                        : v as IPFunctionCalculus<number>),
                a as IPFunctionCalculus<BaseValueRelative>);
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

defineTag(PAdd, 'Add');
defineTag(PSub, 'Sub');
defineTag(PMul, 'Mul');
