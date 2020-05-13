/**
 * @module StatusMonitor
 * Copyright © 2019 by Bob Kerns. Licensed under MIT license
 */

/**
 * Integrable/differentiable phyics functions with LaTex display.
 *
 * Each PFFunction object has a corresponding function object and vice versa.
 */
import {idGen, ViewOf} from "./utils";
import {IndefiniteIntegral} from "./integral";
import {BaseValue} from "./math-types";

/**
 * Default integration timestep. This can be adjusted per-function.
 */
export let TIMESTEP: number = 0.001;

/**
 * Implementing function for a PFunction.
 */
export interface IPFunctionBare<T extends BaseValue> extends Function {
    (t: number): T;
}

/**
 * Implementing function for a PFunction2.
 */
export interface IPFunctionBare2<T extends BaseValue> {
    (t0: number, t: number): T;
}

interface IPFunctionDisplay {
    /**
     * Function to generate LaTeX for this implementing function
     */
    tex: TexGenerator;

    /**
     * Computes an HTML representation for this element.
     */
    html: Element;
}

interface IPFunctionBase<P> {
    pfunction: P;
}
/**
 * Implementing function for a PFunction, extended.
 */
export interface IPFunction<R extends BaseValue> extends IPFunctionBare<R>, IPFunctionBase<PFunction<R>>, IPFunctionDisplay {
    /**
     * Returns the derivative of this IPFunction
     */
    derivative: IPFunction<R>

    /**
     * Returns the integral of this IPFunction.
     */
    integral: IPFunction2<R>;
}

export interface IPFunction2<R extends BaseValue>
    extends IPFunctionBare2<R>, IPFunctionBase<PFunction2<R>>, IPFunctionDisplay {
}

/**
 * A function that generates a LaTeX string.
 */
export type TexGenerator = (tv: string) => string;

/**
 * Hook to provide a compatible LaTeX parser, such as an existing KaTeX
 * implementation, such as provided by ObservableHQ.
 */
export type TexFormatter = (tex: string, block: boolean) => Element;

export abstract class PFunctionBase<R extends BaseValue, F extends Function> {
    /**
     * The time step to be used for numerical integration. Ignored for functions with a defined analytic integral.
     */
    timestep: number = TIMESTEP;
    /**
     * The implementing function
     */
    readonly f: IPFunction<R>;
    /**
     * Cached LaTeX string
     */
    private tex_?: string;
    /**
     * Name of this PFunction, for disambiguation and well-known functions (such as constants).
     */
    readonly name: string;

    protected constructor(f: F) {
        this.f = f as unknown as IPFunction<R>;
        const b = f as unknown as IPFunctionDisplay;
        b.tex = (tv = 't') => this.toTex(tv);
        Reflect.defineProperty(b, 'html', {
            get: () => this.html()
        });
        (b as any).pfunction = this;
        this.name = idGen(this.constructor.name);
    }

    /**
     * Compute the LaTeX representation of this function.
     * @param tv The parameter name (or expression)
     */
    protected toTex(tv: string = 't') {
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
    html(block: boolean = false) : ViewOf<PFunction<R>> & Element {
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
    setName_(name: string) {
        (this as any).name = name;
        return this;
    }
}

/**
 * Base class for our object representation, which is bidirectionally paired with implementing functions.
 */
export abstract class PFunction<R extends BaseValue> extends PFunctionBase<R, IPFunctionBare<R>> {
    /**
     * Cached derivative
     */
    private derivative_?: PFunction<R>;
    /**
     * Cached integral
     */
    private integral_?: IndefiniteIntegral<R>;

    /**
     * Configurable formatter. For ObservableHQ, set it to:
     * ```
     * (tx, block=false) => block ? tex.block`${tx}` : tex`${tx}`
     * ```
     */
    static formatter: TexFormatter;

    /**
     * Construct a PFFunction, and extend the supplied function with our IPFunction interface.
     * @param f
     */
    protected constructor(f: IPFunctionBare<R>) {
        super(f);
        Reflect.defineProperty(f, 'derivative', {
            get: () => this.derivative().f
        });
        Reflect.defineProperty(f, 'integral', {
            get: () => this.integral().f
        });
    }

    derivative() {
        return this.derivative_ || (this.derivative_ = this.differentiate());
    }

    /**
     * Compute the derivative of this function. The default is to perform numneric differentiation.
     */
    abstract differentiate(): PFunction<R>;

    /**
     * Return the indefinite integral of this function.
     */
    integral(): IndefiniteIntegral<R> {
        return this.integral_ || (this.integral_ = new IndefiniteIntegral(this.integrate(), this.f));
    }

    /**
     * Compute the integral of this function. The default is to perform a numeric integration.
     */
    abstract integrate() : PFunction<R>;
}

/**
 * Base class for our object representation of 2-arg functions (such as indefinite integrals),
 * which is bidirectionally paired with implementing functions.
 *
 * We do not provide differentiation or differentiation on multivariate functions such as PFunction2.
 * Instead, curry the multivariate function down to a single parameter and integrate or differentiate
 * over that variable.
 */
export abstract class PFunction2<R extends BaseValue>
    extends PFunctionBase<R, IPFunctionBare2<R>>
{
    /**
     * Construct a PFFunction2, and extend the supplied function with our IPFunction2 interface.
     * @param f
     */
    protected constructor(f: IPFunctionBare2<R>) {
        super(f);
    }
}

export const isPFunction = (a: any): a is PFunction<BaseValue> => a instanceof PFunction;
// noinspection JSUnusedGlobalSymbols
export const isPFunction2 = (a: any): a is PFunction2<BaseValue> => a instanceof PFunction2;
export const isIPFunction = (a: any): a is IPFunction<BaseValue> => typeof a === 'function' && !!a.pfunction;
// noinspection JSUnusedGlobalSymbols
export const isIPFunction2 = (a: any): a is IPFunction2<BaseValue> => typeof a === 'function' && !!a.pfunction;
