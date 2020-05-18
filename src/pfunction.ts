/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {BaseValue, BaseValueRelative, TYPE} from "./math-types";
import {ArgCount, IndefiniteIntegral, IPCompiled, IPCompileResult, IPFunction, IPFunctionBase, IPFunctionCalculus, PFunctionOpts, TexFormatter} from "./base";
import {idGen, ViewOf} from "./utils";

/**
 * Default integration timestep. This can be adjusted per-function.
 */
export let TIMESTEP: number = 0.001;

export abstract class  PFunction<R extends BaseValue = BaseValue, N extends ArgCount = 1> implements IPFunctionBase<R, N> {
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

    protected constructor({name, vars = ['t'], nargs}: PFunctionOpts<N>) {
        nargs = nargs === undefined ? vars?.length as N : nargs;
        if (nargs !== vars.length) {
            throw new Error(`Supplied argument names [${vars.join(', ')}do not match defined nargs=${nargs}.`);
        }
        this.nargs = nargs;
        this.name = idGen(name || this.constructor.name);
    }

    protected abstract compileFn(): IPCompileResult<R, N>;

    f_?: IPCompiled<R, N>;

    /**
     * The implementing function
     */
    get f(): IPCompiled<R, N> {
        return this.f_ || (this.f_ = this.compile());
    }

    compile(): IPCompiled<R, N> {
        const bare = this.compileFn();
        Reflect.defineProperty(bare, 'pfunction', {
            value: this,
            configurable: false,
            writable: false
        });
        Reflect.defineProperty(bare, 'html', {
            get: () => this.html(false)
        });
        Reflect.defineProperty(bare, 'tex', {
            get: () => this.tex()
        });
        return bare as IPCompiled<R, N>;
    }

    /**
     * Compute the LaTeX representation of this function.
     * @param tv The parameter name (or expression)
     */
    toTex(tv: string = 't') {
        return `\\operatorname{${this.name}}(${tv})`;
    }

    /**
     * Get the LaTeX representation of this function.  The value is cached.
     * @param tv The parameter name (or expression)
     */
    tex(tv = 't') {
        return this.tex_ || (this.tex_ = this.toTex(tv));
    }

    /**
     * Produce HTML from the LaTeX representation. Produces a new HTML element on each call
     * @param block
     */
    html(block: boolean = false): ViewOf<PFunction<R>> & Element {
        const h = PFunction.formatter(this.tex(), block) as ViewOf<PFunction<R>> & Element;
        h.value = this as unknown as PFunction<R>;
        return h;
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

    /**
     * Configurable formatter. For ObservableHQ, set it to:
     * ```
     * (tx, block=false) => block ? tex.block`${tx}` : tex`${tx}`
     * ```
     */
    static formatter: TexFormatter;
}

// noinspection JSUnusedGlobalSymbols
/**
 * Base class for our object representation, which is bidirectionally paired with implementing functions.
 */
export abstract class PCalculus<
    R extends BaseValueRelative = BaseValueRelative
    >
    extends PFunction<R>
    implements IPFunctionCalculus<R>
{
    /**
     * Cached derivative
     */
    private derivative_?: IPFunctionCalculus<R>;
    /**
     * Cached integral
     */
    private integral_?: IndefiniteIntegral<R>;
    /**
     * Construct a PFFunction, and extend the supplied function with our IPFunction interface.
     * @param opts
     */
    protected constructor(opts: any) {
        super(opts);
    }

    derivative(): IPFunctionCalculus<R> {
        return this.derivative_ || (this.derivative_ = this.differentiate());
    }

    /**
     * Compute the derivative of this function. The default is to perform numeric differentiation.
     */
    abstract differentiate(): IPFunctionCalculus<R>;

    /**
     * Return the indefinite integral of this function.
     */
    integral(): IndefiniteIntegral<R> {
        return this.integral_ || (this.integral_ = this.integrate());
    }

    /**
     * Compute the integral of this function. We fall back to numeric integration if necessary.
     */
    abstract integrate(): IndefiniteIntegral<R>;
}

export function isPFunction<N extends ArgCount>(a: any, n: N): a is IPFunction<BaseValue, N>;
export function isPFunction(a: any): a is IPFunction;
export function isPFunction(a: any, n?: ArgCount){
    return a instanceof PFunction && ((n === undefined) || a.nargs === n);
}

export function isPCompiled<N extends ArgCount>(a: any, n: N): a is IPCompiled<BaseValue, N>;
export function isPCompiled(a: any): a is IPCompiled<BaseValue,ArgCount>;
export function isPCompiled(a: any, n?: ArgCount) {
    return typeof a === 'function' && !!a.pfunction && ((n === undefined) || a.pfunction.nargs === n);
}

