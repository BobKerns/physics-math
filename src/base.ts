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
import {BaseValue, TYPE} from "./math-types";
import {IPFunction, PFunction, TIMESTEP} from "./pfunction";

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

export interface IPFunctionDisplay {
    /**
     * Function to generate LaTeX for this implementing function
     */
    tex: TexGenerator;

    /**
     * Computes an HTML representation for this element.
     */
    html: Element;
}

export interface IPFunctionBase<P> {
    pfunction: P;
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

    abstract get returnType(): TYPE;

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


