/*
 * @module physics-math
 * Integrable/differentiable physics functions with LaTex display.
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */
/**
 * Functions that know their type and units, and can display themselves meaningfully.
 *
 * Each PFFunction object has a corresponding function object and vice versa.
 * @packageDocumentation
 * @preferred
 * @module Functionals
 */

import {IUnitBase} from "./primitive-units";
import {BaseValue, BaseValueInFrame, BaseValueRelative, Orientation, Point, Rotation, TYPE, Vector} from "./math-types";
import {PFunction} from "./pfunction";
import {Throw, ViewOf} from "./utils";
import {Divide, Multiply, Unit} from "./units";
import {Units} from './unit-defs';
import {StyleContext} from "./latex";
import {Frame, InertialFrame} from "./frame";

/**
 * Hook to provide a compatible LaTeX parser, such as an existing KaTeX
 * implementation, such as provided by ObservableHQ.
 */
export type TexFormatter = (tex: string) => Element;
interface TexDrivers {
    inline: TexFormatter;
    block: TexFormatter;
}

/**
 * @internal
 */
export let TEX_FORMATTER: TexDrivers = {
    inline: () => Throw(`Call setFormatter(TexFormatter) to enable HTML.`),
    block: () => Throw(`Call setFormatter(TexFormatter) to enable HTML.`)
} ;

// noinspection JSUnusedGlobalSymbols
/**
 * Set the converter to convert LaTeX to HTML. This csn be ObservableHQ's tex`...`
 * string interpolator—the argument will be set up properly.
 * @param inline
 * @param block
 */
export const setFormatter = (inline: TexFormatter, block: TexFormatter = (inline as any).block || inline) =>
    TEX_FORMATTER = {inline, block};

export interface Value<T extends BaseValue = BaseValue, U extends IUnitBase = IUnitBase> {
    value: T;
    readonly unit: U;
}

export interface ValueInFrame<T extends BaseValue = BaseValue, U extends IUnitBase = IUnitBase> extends Value<T, U> {
    readonly frame: InertialFrame;
}

/**
 * @internal
 */
export abstract class ExplicitValueBase<T extends BaseValue = BaseValue, U extends IUnitBase = IUnitBase> implements Value<T, U> {
    value: T;
    readonly unit: U;
    protected constructor(value: T, unit: U) {
        this.value = value;
        this.unit = unit;
    }
}

// noinspection JSUnusedGlobalSymbols
export class ExplicitValue<T extends BaseValueRelative = BaseValueRelative, U extends IUnitBase = IUnitBase> extends ExplicitValueBase<T, U> {
    constructor(value: T, unit: U) {
        super(value, unit);
    }
}

// noinspection JSUnusedGlobalSymbols
export class ExplicitValueInFrame<T extends BaseValueInFrame = BaseValueInFrame, U extends IUnitBase = IUnitBase>
    extends ExplicitValueBase<T, U>
    implements ValueInFrame<T, U> {
    readonly frame: InertialFrame;
    constructor(value: T, unit: U, frame: InertialFrame) {
        super(value, unit);
        this.frame = frame;
    }
}

/**
 * @Category Value type
 */
export type Velocity = Value<Vector,Units.velocity>;

/**
 * @Category Value type
 */
export type Time = Value<number, Units.time>;

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

/**
 * Implementing function for a PFunction of 0 arguments.
 * @internal
 */
interface IPCompileResult0<T extends BaseValue> extends Function {
    (t: number): T;
}

/**
 * Implementing function for a PFunction of 1 argument.
 * @internal
 */
interface IPCompileResult1<T extends BaseValue> extends Function {
    (t: number): T;
}

/**
 * Implementing function for a PFunction of 2 arguments.
 * @internal
 */
interface IPCompileResult2<T extends BaseValue> extends Function {
    (t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 3 arguments.
 * @internal
 */
interface IPCompileResult3<T extends BaseValue> extends Function {
    (t1: number, t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 4 arguments.
 * @internal
 */
interface IPCompileResult4<T extends BaseValue> extends Function {
    (t2: number, t1: number, t0: number, t: number): T;
}

/**
 * Implementing function for a PFunction of 5 arguments.
 * @internal
 */
interface IPCompileResult5<T extends BaseValue> extends Function {
    (t3: number, t2: number, t1: number, t0: number, t: number): T;
}
/**
 * Implementing function for a PFunction of 6 arguments.
 * @internal
 */
interface IPCompileResult6<T extends BaseValue> extends Function {
    (t4: number, t3: number, t2: number, t1: number, t0: number, t: number): T;
}

/**
 * Convenience methods added to compiled functions.
 */
export interface IPCompiledDisplay {
    tex: string;

    toTex(varName: string): string;

    /**
     * Computes an HTML representation for this element.
     */
    html: Element;

    toHtml(varName: string, block: boolean): Element;
}

/**
 * Number of arguments supplied to a function.
 * @internal
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


export interface IPFunctionPtr<P extends IPFunction<BaseValue, Unit, ArgCount>> {
    pfunction: P;
}

export type IPCompiled<
    R extends BaseValue = BaseValue,
    U extends Unit = Unit,
    N extends ArgCount = 1,
    P extends IPFunction<R, U, N> = IPFunction<R, U, N>
    > = (
        IPCompileResult<R, N> & IPFunctionPtr<P> & IPCompiledDisplay
    );

export interface PFunctionOpts<U extends Unit, N extends ArgCount = 1> {
    name?: string,
    vars?: string[],
    unit: U,
    nargs?: N
}

export const PFunctionDefaults: [
    Omit<PFunctionOpts<Unit, 0>, 'unit'>,
    Omit<PFunctionOpts<Unit>, 'unit'>,
    Omit<PFunctionOpts<Unit, 2>, 'unit'>,
    Omit<PFunctionOpts<Unit, 3>, 'unit'>,
    Omit<PFunctionOpts<Unit, 4>, 'unit'>,
    Omit<PFunctionOpts<Unit, 5>, 'unit'>,
    Omit<PFunctionOpts<Unit, 6>, 'unit'>
] = [
    {vars: [], nargs: 0},
    {vars: ['t'], nargs: 1},
    {vars: ['t0', 't'], nargs: 2},
    {vars: ['t1', 't0', 't'], nargs: 3},
    {vars: ['t2', 't1', 't0', 't'], nargs: 4},
    {vars: ['t3', 't2', 't1', 't0', 't'], nargs: 5},
    {vars: ['t4', 't3', 't2', 't1', 't0', 't'], nargs: 6}
];

export interface IPFunctionBase<R extends BaseValue = BaseValue, U extends Unit = Unit, N extends ArgCount = 1> {
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
     * @param varName? The parameter name (or expression)
     * @param ctx?
     */
    toTex(varName?: string, ctx?: StyleContext): string;

    /**
     * Compute the LaTeX representation of this function including units.
     * @param varName? The parameter name (or expression)
     * @param ctx?
     */
    toTexWithUnits(varName?: string, ctx?: StyleContext): string;

    /**
     * Get the LaTeX representation of this function.  The value is cached.
     * @param tv The parameter name (or expression)
     */
    readonly tex: string;

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param varName? Defaults to 't', the name of the variable used in generating LaTeX.
     * @param block?
     * @param ctx?
     */
    toHtml(varName?: string, block?: boolean, ctx?: StyleContext): ViewOf<PFunction<R>> & Element;

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param block
     */
    readonly html: ViewOf<PFunction<R>> & Element;

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
    U extends Unit = Unit,
    N extends ArgCount = 1,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
    >
    extends IPFunctionBase<R, U, N>,
        IPCalculus<R, U, D, I>
{

}

export type IPFunction<
    R extends BaseValue = BaseValue,
    U extends Unit = Unit,
    N extends ArgCount = 1,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
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
    U extends Unit,
    D extends Unit
    >
{
    timestep: number;
    /**
     * Returns the derivative of this IPFunction
     */
    derivative(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, U>;
}

/**
 * Implementing function for a PFunction, extended for derivatives and integrals.
 */
export interface IPIntegrable<
    R extends BaseValueRelative,
    U extends Unit,
    I extends Unit
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
    U extends Unit,
    D extends Unit,
    I extends Unit
    >
    extends
        IPDifferentiable<R, U, D>,
        IPIntegrable<R, U, I>
{
}

export interface IndefiniteIntegral<
    R extends BaseValueRelative,
    U extends Unit = Unit,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
    >
    extends IPFunctionCalculus<R, U, 2, D, I>
{
    readonly integrand: IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, U>;
    from(t0: number): DefiniteIntegral<R, U, D, I>;
}

export interface DefiniteIntegral<
    R extends BaseValueRelative,
    U extends Unit = Unit,
    D extends Unit = Divide<U, Units.time>,
    I extends Unit = Multiply<U, Units.time>
    >
    extends
        IPCalculus<R, U, D, I>,
        IPFunctionBase<R, U>
{
    readonly evaluating: IndefiniteIntegral<R, U, D, I>;
    readonly from: number;
}
