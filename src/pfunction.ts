/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {BaseValue, BaseValueRelative, TYPE} from "./math-types";
import {ArgCount, IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionBase, IPFunctionCalculus, PFunctionOpts, TEX_FORMATTER} from "./base";
import {callSite, idGen, Throw, ViewOf} from "./utils";
import {Units} from './unit-defs';
import {Unit, Divide, Multiply} from "./units";
import {STYLES} from "./latex";

/**
 * Default integration timestep. This can be adjusted per-function.
 */
export let TIMESTEP: number = 0.001;

const tex = String.raw;

export abstract class  PFunction<
    R extends BaseValue = BaseValue,
    C extends Unit = Unit,
    N extends ArgCount = 1>
    implements IPFunctionBase<R, C, N> {
    /**
     * The time step to be used for numerical integration. Ignored for functions with a defined analytic integral.
     */
    timestep: number = TIMESTEP;
    /**
     * Cached LaTeX string
     */
    tex_?: string;
    /**
     * Name of this PFunction, for disambiguation and well-known functions (such as constants).
     */
    readonly name: string;

    readonly nargs: N;

    abstract get returnType(): TYPE;
    readonly unit: C;

    protected constructor({name, vars = ['t'], unit, nargs}: PFunctionOpts<C, N>) {
        nargs = nargs === undefined ? vars?.length as N : nargs;
        if (nargs !== vars.length) {
            throw new Error(`Supplied argument names [${vars.join(', ')}do not match defined nargs=${nargs}.`);
        }
        this.nargs = nargs;
        this.name = idGen(name || this.constructor.name);
        this.unit = unit || Throw(`Missing unit argument`);
    }

    protected abstract compileFn(): IPCompileResult<R, N>;

    f_?: IPCompiled<R, C, N>;

    /**
     * The implementing function
     */
    get f(): IPCompiled<R, C, N> {
        return this.f_ || (this.f_ = this.compile());
    }

    compile(): IPCompiled<R, C, N> {
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
        return bare as IPCompiled<R, C, N>;
    }

    /**
     * Compute the LaTeX representation of this function.
     * @param varName The parameter name (or expression)
     */
    toTex(varName: string = 't') {
        const unit = STYLES.unit(this.unit.tex);
        const op = STYLES.function(this.name);
        const call = STYLES.call(tex`${op}(${varName})`);
        return tex`{{${call}} \Rightarrow {${unit}}}`;
    }

    /**
     * Get the LaTeX representation of this function.  The value is cached.
     */
    get tex() {
        return this.tex_ || (this.tex_ = this.toTex());
    }

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param varName The variable name to be used; ordinarily t (time).
     * @param block
     */
    toHtml(varName: string = 't', block: boolean = false): ViewOf<PFunction<R>> & Element {
        const latex = callSite(this.toTex(varName)); // callSite prepares it for ObservableHQ's tex string interpolator.
        const fmt = block ? TEX_FORMATTER.block : TEX_FORMATTER.inline;
        const h = fmt(latex) as ViewOf<PFunction<R>> & Element;
        h.value = this as unknown as PFunction<R>;
        return h;
    }

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each reference,
     * equivalent to:
     * ```
     * pFun.toHtml('t', false);
     * ```
     */
    get html(): ViewOf<PFunction<R>> & Element {
        return this.toHtml();
    }


    /**
     *
     * Set a name of the function
     * @param name
     * @private
     */
    setName_(name: string): this {
        (this as any).name = name;
        return this;
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Base class for our object representation, which is bidirectionally paired with implementing functions.
 */
export abstract class PCalculus<
    R extends BaseValueRelative = BaseValueRelative,
    C extends Unit = Unit,
    D extends Unit = Divide<C, Units.time>,
    I extends Unit = Multiply<C, Units.time>
    >
    extends PFunction<R, C>
    implements IPFunctionCalculus<R, C, 1, D, I>
{
    /**
     * Cached derivative
     */
    private derivative_?: IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C>;
    /**
     * Cached integral
     */
    private integral_?: IndefiniteIntegral<R, I, C>;
    /**
     * Construct a PFFunction, and extend the supplied function with our IPFunction interface.
     * @param opts
     */
    protected constructor(opts: any) {
        super(opts);
    }

    derivative(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C> {
        return this.derivative_ || (this.derivative_ = this.differentiate());
    }

    /**
     * Compute the derivative of this function. The default is to perform numeric differentiation.
     */
    abstract differentiate(): IPFunctionCalculus<R, D, 1, Divide<D, Units.time>, C>;

    /**
     * Return the indefinite integral of this function.
     */
    integral(): IndefiniteIntegral<R, I, C> {
        return this.integral_ || (this.integral_ = this.integrate());
    }

    /**
     * Compute the integral of this function. We fall back to numeric integration if necessary.
     */
    abstract integrate(): IndefiniteIntegral<R, I, C>;
}

export function isPFunction<U extends Unit, N extends ArgCount>(a: any, u: U, n: N): a is IPFunction<BaseValue, U, N>;
export function isPFunction(a: any): a is IPFunction;
export function isPFunction(a: any, u?: Unit, n?: ArgCount){
    return a instanceof PFunction
        && ((u === undefined) || a.unit === u)
        && ((n === undefined) || a.nargs === n);
}

export function isPCompiled<U extends Unit, N extends ArgCount>(a: any, u: U, n: N): a is IPCompiled<BaseValue, U, N>;
export function isPCompiled(a: any): a is IPCompiled<BaseValue, Unit, ArgCount>;
export function isPCompiled(a: any, u?: Unit, n?: ArgCount) {
    return typeof a === 'function' && !!a.pfunction
        && ((u === undefined) || a.pfunction.unit === u)
        && ((n === undefined) || a.pfunction.nargs === n);
}

