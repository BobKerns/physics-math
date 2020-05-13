/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

import {PFunction} from "./base";
import {Poly} from "./poly";
import {BaseValue} from "./math-types";

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

class Scalar extends Constant<number> {
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
}

export const ZERO = new Scalar(0).setName_('ZERO');
