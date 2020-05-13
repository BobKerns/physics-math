/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {Poly} from "./poly";
import {BaseValue, TYPE} from "./math-types";
import {PFunction} from "./pfunction";

/**
 * Scalar constants
 */

export abstract class Constant<T extends BaseValue> extends PFunction<T> {
    readonly value: T;
    protected constructor(value: T) {
        // noinspection JSUnusedLocalSymbols
        super((t: number) => value);
        this.value = value;
    }
}

export class Scalar extends Constant<number> {
    constructor(value: number) {
        super(value);
    }

    toTex(tv: string) {
        return `${this.value}`;
    }

    differentiate(): PFunction<number> {
        return ZERO;
    }

    integrate() {
        return new Poly(0, this.value);
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}

export const ZERO = new Scalar(0).setName_('ZERO');
