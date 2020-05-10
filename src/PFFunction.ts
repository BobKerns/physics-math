/**
 * @module StatusMonitor
 * Copyright © 2019 by Bob Kerns. Licensed under MIT license
 */

/**
 * Integrable/differentiable phyics functions with LaTex display.
 *
 * Each PFFunction object has a corresponding function object and vice versa.
 */
import {idGen} from "./utils";
import {DefiniteIntegral} from "./Integral";
import {NumericDerivative} from "./Derivative";

/**
 * Implementing function for a PFunction.
 */
export interface IPFunction extends Function {
    /**
     * The corresponding PFunction for this implementing function
     */
    pfunction: PFunction;
    /**
     * Function to generate LaTeX for this implementing function
     */
    tex: TexGenerator;

    /**
     * Computes an HTML representation for this element.
     */
    html:Element;
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

/**
 * We extend our returned HTML element with Observable's 'viewof' support.
 */
export interface ViewOf {
    value: PFunction;
}

/**
 * Base class for our object representation, which is bidirectionally paired with implementing functions.
 */
export abstract class PFunction {
    /**
     * The implementing function
     */
    readonly f: IPFunction;
    /**
     * Name of this PFunction, for disambiguation and well-known functions (such as constants).
     */
    readonly name: string;
    /**
     * Cached derivative
     */
    private derivative_?: PFunction;
    /**
     * Cached integral
     */
    private integral_?: PFunction;
    /**
     * Cached LaTeX string
     */
    private tex_?: string;

    /**
     * Configurable formatter. For ObservableHQ, set it to:
     * ```javascript
     * (tx, block=false) => block ? tex.block`${tx}` : tex`${tx}`
     * ```
     */
    static formatter: TexFormatter;

    /**
     * Construct a PFFunction, and extend the supplied function with our IPFunction interface.
     * @param f
     */
    constructor(f: IPFunction) {
        const ipf = this.f = f instanceof PFunction ? f.f : f;
        ipf.pfunction = this;
        ipf.tex = (tv = 't') => this.toTex(tv);
        Reflect.defineProperty(f, 'derivative', {
            get: () => this.derivative().f
        });
        Reflect.defineProperty(f, 'integral', {
            get: () => this.integral().f
        });
        Reflect.defineProperty(f, 'html', {
            get: () => this.html()
        });
        this.name = idGen(this.constructor.name);
    }

    derivative() {
        return this.derivative_ || (this.derivative_ = this.differentiate());
    }

    /**
     * Compute the derivative of this function. The default is to perform numneric differentiation.
     */
    protected differentiate(): PFunction {
        return new NumericDerivative(this);
    }

    /**
     * Return the indefinite integral of this function.
     */
    integral() {
        return this.integral_ || (this.integral_ = new IndefiniteIntegral(this.integrate()));
    }

    /**
     * Compute the integral of this function. The default is to perform a numeric integration.
     */
    protected integrate() : DefiniteIntegral {
        return new DefiniteIntegral(this);
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
    html(block: boolean = false) : ViewOf & Element {
        const h = PFunction.formatter(this.tex(), block) as ViewOf & Element;
        h.value = this;
        return h;
    }

    /**
     * Set a name of the function
     * @param name
     * @private
     */
    setName_(name: string) {
        (this as any).name = name;
        return this;
    }
}

