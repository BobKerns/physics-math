/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {Poly} from "./poly";
import {BaseValue, TYPE} from "./math-types";
import {IndefiniteIntegral, PCalculus} from "./pfunction";
import {IPCompileResult, IPFunction} from "./base";
import {AnalyticIntegral} from "./integral";

/**
 * Scalar constants
 */

export abstract class Constant<T extends BaseValue> extends PCalculus<T> {
    readonly value: T;
    protected constructor(value: T) {
        // noinspection JSUnusedLocalSymbols
        super({});
        this.value = value;
    }

    protected compileFn(): IPCompileResult<T> {
        const value = this.value;
        return () => value;
    }
}

export class Scalar extends Constant<number> {
    constructor(value: number) {
        super(value);
    }

    toTex(tv: string) {
        return `${this.value}`;
    }

    differentiate(): IPFunction<number> {
        return ZERO;
    }

    integrate(): IndefiniteIntegral<number> {
        return new AnalyticIntegral(new Poly(0, this.value));
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}

export const ZERO = new Scalar(0).setName_('ZERO');
