/**
 * Classes to support integration
 */

import {BaseValue, IPFunctionBare, PFunction, PFunction2} from "./base";
import {sub} from "./utils";

export class DefiniteIntegral<T extends BaseValue> extends PFunction<T> {
    private readonly from: PFunction<T>;
    private readonly t0: number;
    constructor(f: PFunction<T>, t0: number) {
        super(makeDefiniteIntegral(f)(t0));
        this.from = f;
        this.t0 = t0;
    }

    protected differentiate(): PFunction<T> {
        return this.from;
    }

    protected integrate(): PFunction<T> {
        return this.from.integral().definite;
    }
}

const makeDefiniteIntegral = <T extends BaseValue> (f: PFunction<T>) =>
    (t0: number) => new DefiniteIntegral<T>(f, t0).f;

export class IndefiniteIntegral<T extends BaseValue> extends PFunction2<BaseValue> {
    definite: PFunction<T>;
    constructor(f: PFunction<T>) {
        super((t0: number, t: number): T =>
            ((di: IPFunctionBare<T>) => sub(di(t0), di(t)) as T)(
                new DefiniteIntegral<T>(f, t0).f
            ));
        this.definite = f;
    }
}
