import {BaseValue, TYPE} from "./math-types";
import {IPFunctionBare, IPFunctionBare2, IPFunctionBase, IPFunctionDisplay, PFunctionBase, TexFormatter} from "./base";

/**
 * Default integration timestep. This can be adjusted per-function.
 */
export let TIMESTEP: number = 0.001;

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
        return this.integral_ || (this.integral_ = new IndefiniteIntegralImpl(this.integrate(), this.f));
    }

    /**
     * Compute the integral of this function. The default is to perform a numeric integration.
     */
    abstract integrate(): PFunction<R>;
}

export interface IPFunction2<R extends BaseValue>
    extends IPFunctionBare2<R>, IPFunctionBase<PFunction2<R>>, IPFunctionDisplay {
}

/**
 * Base class for our object representation of 2-arg functions (such as indefinite integrals),
 * which is bidirectionally paired with implementing functions.
 *
 * We do not provide differentiation or differentiation on multivariate functions such as PFunction2.
 * Instead, curry the multivariate function down to a single parameter and integrate or differentiate
 * over that variable.
 */
export abstract class PFunction2<R extends BaseValue> extends PFunctionBase<R, IPFunctionBare2<R>> {
    /**
     * Construct a PFFunction2, and extend the supplied function with our IPFunction2 interface.
     * @param f
     */
    protected constructor(f: IPFunctionBare2<R>) {
        super(f);
    }
}

export class IndefiniteIntegralImpl<T extends BaseValue> extends PFunction2<T> implements IndefiniteIntegral<T> {

    integrand: PFunction<T>;

    constructor(pf: PFunction<T>, f: IPFunctionBare2<T>) {
        super(f);
        this.integrand = pf;
    }

    get returnType(): TYPE {
        return this.integrand.returnType;
    }
}

export interface IndefiniteIntegral<T extends BaseValue> extends PFunction2<T> {
    integrand: PFunction<T>;
}

export const isPFunction = (a: any): a is PFunction<BaseValue> => a instanceof PFunction;
// noinspection JSUnusedGlobalSymbols
export const isPFunction2 = (a: any): a is PFunction2<BaseValue> => a instanceof PFunction2;
export const isIPFunction = (a: any): a is IPFunction<BaseValue> => typeof a === 'function' && !!a.pfunction;
// noinspection JSUnusedGlobalSymbols
export const isIPFunction2 = (a: any): a is IPFunction2<BaseValue> => typeof a === 'function' && !!a.pfunction;

export interface DefiniteIntegral<T extends BaseValue> {
    from: PFunction<T>;
    t0: number;
}
