/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Integrable/differentiable phyics functions with LaTex display.
 *
 * Each PFFunction object has a corresponding function object and vice versa.
 */
import {BaseValue, TYPE} from "./math-types";
import {IndefiniteIntegral, PFunction} from "./pfunction";
import {ViewOf} from "./utils";

/**
 * A function that generates a LaTeX string.
 */
export type TexGenerator = (tv: string) => string;

/**
 * Hook to provide a compatible LaTeX parser, such as an existing KaTeX
 * implementation, such as provided by ObservableHQ.
 */
export type TexFormatter = (tex: string, block: boolean) => Element;


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


export interface IPFunctionPtr<P extends IPFunction<BaseValue,ArgCount>> {
    pfunction: P;
}

export type IPCompiled<
    R extends BaseValue = BaseValue,
    N extends ArgCount = 1,
    P extends IPFunction<R, N> = IPFunction<R, N>
    > = (
        IPCompileResult<R, N> & IPFunctionPtr<P> & IPCompiledDisplay
    );

export interface PFunctionOpts<N extends ArgCount = 1> {
    name?: string,
    vars?: string[],
    nargs?: N
}

export const PFunctionDefaults: [
    PFunctionOpts<0>,
    PFunctionOpts,
    PFunctionOpts<2>,
    PFunctionOpts<3>,
    PFunctionOpts<4>,
    PFunctionOpts<5>,
    PFunctionOpts<6>
] = [
    {vars: [], nargs: 0},
    {vars: ['t'], nargs: 1},
    {vars: ['t0', 't'], nargs: 2},
    {vars: ['t1', 't0', 't'], nargs: 3},
    {vars: ['t2', 't1', 't0', 't'], nargs: 4},
    {vars: ['t3', 't2', 't1', 't0', 't'], nargs: 5},
    {vars: ['t4', 't3', 't2', 't1', 't0', 't'], nargs: 6}
];

export interface IPFunctionBase<R extends BaseValue = BaseValue, N extends ArgCount = 1> {
    tex_?: string;
    name: string;
    readonly returnType: TYPE;

    nargs: N;

    f: IPCompiled<R, N>;

    compile(): IPCompiled<R, N>;

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

export type IPFunction<
    R extends BaseValue = BaseValue,
    N extends ArgCount = 1
    > = N extends 1 ? IPCalculus<R> & IPFunctionBase<R, N> : IPFunctionBase<R, N>;

/**
 * Implementing function for a PFunction, extended for derivatrives and integrals.
 */
export interface IPCalculus<R extends BaseValue> {
    timestep: number;
    /**
     * Returns the derivative of this IPFunction
     */
    derivative(): IPFunction<R>;
    /**
     * Returns the integral of this IPFunction.
     */
    integrate(): IndefiniteIntegral<R>;
    /**
     * Returns the integral of this IPFunction.
     */
    integral(): IndefiniteIntegral<R>;
}
