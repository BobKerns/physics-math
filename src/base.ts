/*
 * @module physics-math
 * Integrable/differentiable physics functions with LaTex display.
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 *
 * Each PFFunction object has a corresponding function object and vice versa.
 */
import {BaseValue, BaseValueInFrame, BaseValueRelative, Orientation, Point, rotation, Rotation, TYPE, vector, Vector} from "./math-types";
import {PFunction} from "./pfunction";
import {NYI, ViewOf} from "./utils";
import {U as UX} from './unit-defs';
import {constant, IConstant} from "./scalar";
import {CUnit, Divide, Multiply, Unit} from "./primitive-units";

/**
 * A function that generates a LaTeX string.
 */
export type TexGenerator = (tv: string) => string;

/**
 * Hook to provide a compatible LaTeX parser, such as an existing KaTeX
 * implementation, such as provided by ObservableHQ.
 */
export type TexFormatter = (tex: string, block: boolean) => Element;

export interface Value<T extends BaseValue = BaseValue, U extends Unit = Unit> {
    value: T;
    readonly unit: U;
}

export interface ValueInFrame<T extends BaseValue = BaseValue, U extends Unit = Unit> extends Value<T, U> {
    readonly frame: InertialFrame;
}

export abstract class ExplicitValueBase<T extends BaseValue = BaseValue, U extends Unit = Unit> implements Value<T, U> {
    value: T;
    readonly unit: U;
    protected constructor(value: T, unit: U) {
        this.value = value;
        this.unit = unit;
    }
}

// noinspection JSUnusedGlobalSymbols
export class ExplicitValue<T extends BaseValueRelative = BaseValueRelative, U extends Unit = Unit> extends ExplicitValueBase<T, U> {
    constructor(value: T, unit: U) {
        super(value, unit);
    }
}

// noinspection JSUnusedGlobalSymbols
export class ExplicitValueInFrame<T extends BaseValueInFrame = BaseValueInFrame, U extends Unit = Unit>
    extends ExplicitValueBase<T, U>
    implements ValueInFrame<T, U> {
    readonly frame: InertialFrame;
    constructor(value: T, unit: U, frame: InertialFrame) {
        super(value, unit);
        this.frame = frame;
    }
}

export type Velocity = Value<Vector,UX.velocity>;
export type Time = Value<number, UX.time>;

export interface Transform {
  readonly positionOffset: Vector;
  readonly angleOffset: Rotation;
  readonly positionVelocity: Vector;
  readonly angleVelocity: Rotation;
  transform(p: Point): Point;
  transform(v: Vector): Vector;
  transform(v: Velocity): Velocity;
  transform(f: Frame): Frame;
}

export interface Frame {
    readonly name: string;
    isInertial(t: number|Time): boolean;
    transform(other: Frame): (t: number|Time) => Transform;
}

abstract class FrameImpl implements Frame {
    parent?: Frame;
    readonly name: string;
    protected offset: IConstant<Vector, UX.length>
    protected rotated: IConstant<Rotation, UX.angle>;
    isInertial(t: number | Time): boolean {
        return false;
    }
    transform(other: Frame): (t: (number | Time)) => Transform {
        return NYI(`Transform`);
    }
    protected constructor(name: string, parent: Frame|undefined,
                          offset: IConstant<Vector, UX.length>,
                          rotated: IConstant<Rotation, UX.angle>) {
        this.name = name;
        this.parent = parent;
        this.offset = offset;
        this.rotated = rotated;
    }
}

export interface InertialFrame extends Frame {
    isInertial(t: number | Time): true;
}

class InertialFrameImpl extends FrameImpl implements InertialFrame {
    isInertial(t: number|Time): true {
        return true;
    }

    constructor(name: string, parent?: Frame,
                offset: IConstant<Vector, UX.length> = constant(vector(), UX.length),
                rotated: IConstant<Rotation, UX.angle> = constant(rotation(), UX.angle)) {
        super(name, parent, offset, rotated);
    }
}

// noinspection JSUnusedGlobalSymbols
export class World {
    private parentFrame: InertialFrame = new InertialFrameImpl('Initial', undefined);
    // noinspection JSUnusedGlobalSymbols
    createInertialFrame(offset: Vector, velocity: Velocity, angle: Rotation): InertialFrame {
        return new InertialFrameImpl('Initial', this.parentFrame,
            constant(offset, UX.length), constant(angle, UX.angle));
    }
}

/**
 * Implementing function for a PFunction of 0 arguments.
 */
interface IPCompileResult0<T extends BaseValue> extends Function {
    (t: number): T;
}

/**
 * Implementing function for a PFunction of 1 argument.
 */
interface IPCompileResult1<T extends BaseValue> extends Function {
    (t: number): T;
}

/**
 * Implementing function for a PFunction of 2 arguments.
 */
interface IPCompileResult2<T extends BaseValue> extends Function {
    (t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 3 arguments.
 */
interface IPCompileResult3<T extends BaseValue> extends Function {
    (t1: number, t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 4 arguments.
 */
interface IPCompileResult4<T extends BaseValue> extends Function {
    (t2: number, t1: number, t0: number, t: number): T;
}

/**
 * Implementing function for a PFunction of 5 arguments.
 */
interface IPCompileResult5<T extends BaseValue> extends Function {
    (t3: number, t2: number, t1: number, t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 6 arguments.
 */
interface IPCompileResult6<T extends BaseValue> extends Function {
    (t4: number, t3: number, t2: number, t1: number, t0: number, t: number): T;
}

/**
 * Convenience methods added to compiled functions.
 */
export interface IPCompiledDisplay {
    /**
     * Function to generate LaTeX for this implementing function
     */
    tex: TexGenerator;

    /**
     * Computes an HTML representation for this element.
     */
    html: Element;
}

/**
 * Number of arguments supplied to a function.
 */
export type ArgCount = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The result of compilation is a function of N arguments, annotated with originating PFunction
 * and convenience methods.
 */
export type IPCompileResult<
    R extends BaseValue = BaseValue,
    N extends ArgCount = 1
    > = (
    N extends 0
        ? IPCompileResult0<R>
        : N extends 1
        ? IPCompileResult1<R>
        : N extends 2
            ? IPCompileResult2<R>
            : N extends 3
                ? IPCompileResult3<R>
                : N extends 4
                    ? IPCompileResult4<R>
                    : N extends 5
                        ? IPCompileResult5<R>
                        : N extends 6
                            ? IPCompileResult6<R>
                            : never
    );


export interface IPFunctionPtr<P extends IPFunction<BaseValue, CUnit, ArgCount>> {
    pfunction: P;
}

export type IPCompiled<
    R extends BaseValue = BaseValue,
    U extends CUnit = CUnit,
    N extends ArgCount = 1,
    P extends IPFunction<R, U, N> = IPFunction<R, U, N>
    > = (
        IPCompileResult<R, N> & IPFunctionPtr<P> & IPCompiledDisplay
    );

export interface PFunctionOpts<U extends CUnit, N extends ArgCount = 1> {
    name?: string,
    vars?: string[],
    unit: U,
    nargs?: N
}

export const PFunctionDefaults: [
    Omit<PFunctionOpts<CUnit, 0>, 'unit'>,
    Omit<PFunctionOpts<CUnit>, 'unit'>,
    Omit<PFunctionOpts<CUnit, 2>, 'unit'>,
    Omit<PFunctionOpts<CUnit, 3>, 'unit'>,
    Omit<PFunctionOpts<CUnit, 4>, 'unit'>,
    Omit<PFunctionOpts<CUnit, 5>, 'unit'>,
    Omit<PFunctionOpts<CUnit, 6>, 'unit'>
] = [
    {vars: [], nargs: 0},
    {vars: ['t'], nargs: 1},
    {vars: ['t0', 't'], nargs: 2},
    {vars: ['t1', 't0', 't'], nargs: 3},
    {vars: ['t2', 't1', 't0', 't'], nargs: 4},
    {vars: ['t3', 't2', 't1', 't0', 't'], nargs: 5},
    {vars: ['t4', 't3', 't2', 't1', 't0', 't'], nargs: 6}
];

export interface IPFunctionBase<R extends BaseValue = BaseValue, U extends CUnit = CUnit, N extends ArgCount = 1> {
    timestep: number;
    tex_?: string;
    name: string;
    readonly returnType: TYPE;
    readonly unit: U;
    nargs: N;

    f: IPCompiled<R, U, N>;

    compile(): IPCompiled<R, U, N>;

    /**
     * Compute the LaTeX representation of this function.
     * @param tv The parameter name (or expression)
     */
    toTex(tv?: string): string;

    /**
     * Get the LaTeX representation of this function.  The value is cached.
     * @param tv The parameter name (or expression)
     */
    tex(tv?: string): any;

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param block
     */
    html(block?: boolean): ViewOf<PFunction<R>> & Element;

    /**
     *
     * Set a name of the function
     * @param name
     * @private
     */
    setName_(name: string): this;
}

export interface IPFunctionCalculus<
    R extends BaseValueRelative,
    U extends CUnit = CUnit,
    N extends ArgCount = 1,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
    >
    extends IPFunctionBase<R, U, N>,
        IPCalculus<R, U, D, I>
{

}

export type IPFunction<
    R extends BaseValue = BaseValue,
    U extends CUnit = CUnit,
    N extends ArgCount = 1,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
    > = N extends 1
    ? R extends number
        ? IPFunctionCalculus<number, U, N, D, I>
        : R extends Rotation
            ? IPFunctionCalculus<Rotation, U, N, D, I>
            : R extends Vector
                ? IPFunctionCalculus<Vector, U, N, D, I>
                : R extends Point
                    ? IPFunctionBase<Point, U, N>
                    : R extends Orientation
                        ? IPFunctionBase<Orientation, U, N>
                        : never
    : IPFunctionBase<R, U, N>;


/**
 * Implementing function for a PFunction, extended for derivatives and integrals.
 */
export interface IPDifferentiable<
    R extends BaseValueRelative,
    U extends CUnit,
    D extends CUnit
    >
{
    timestep: number;
    /**
     * Returns the derivative of this IPFunction
     */
    derivative(): IPFunctionCalculus<R, D, 1, Divide<D, UX.time>, U>;
}

/**
 * Implementing function for a PFunction, extended for derivatives and integrals.
 */
export interface IPIntegrable<
    R extends BaseValueRelative,
    U extends CUnit,
    I extends CUnit
    >
{
    timestep: number;
    /**
     * Returns the integral of this IPFunction.
     */
    integral(): IndefiniteIntegral<R, I, U>;
}
/**
 * Implementing function for a PFunction, extended for derivatives and integrals.
 */
export interface IPCalculus<
    R extends BaseValueRelative,
    U extends CUnit,
    D extends CUnit,
    I extends CUnit
    >
    extends
        IPDifferentiable<R, U, D>,
        IPIntegrable<R, U, I>
{
}

export interface IndefiniteIntegral<
    R extends BaseValueRelative,
    U extends CUnit = CUnit,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
    >
    extends IPFunctionCalculus<R, U, 2, D, I>
{
    integrand: IPFunctionCalculus<R, D, 1, Divide<D, UX.time>, U>;
}

export interface DefiniteIntegral<
    R extends BaseValueRelative,
    U extends CUnit = CUnit,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
    >
    extends
        IPCalculus<R, U, D, I>,
        IPFunctionBase<R, U>
{
    from: IndefiniteIntegral<R, U, D, I>;
    t0: number;
}
