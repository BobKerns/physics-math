/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {Poly} from "./poly";
import {BaseValueIntrinsic, BaseValueRelative, orientation, Orientation, point, Point, rotation, Rotation, TYPE, vector, Vector} from "./math-types";
import {PCalculus, PFunction} from "./pfunction";
import {IndefiniteIntegral, IPCompileResult} from "./base";
import {AnalyticIntegral} from "./integral";
import {Throw} from "./utils";

/**
 * Scalar constants
 */

export abstract class Constant<R extends BaseValueRelative> extends PCalculus<R> {
    readonly value: R;
    protected constructor(value: R) {
        // noinspection JSUnusedLocalSymbols
        super({});
        this.value = value;
    }

    protected compileFn(): IPCompileResult<R> {
        const value = this.value;
        return () => value;
    }
}

export abstract class ConstantIntrinsic<R extends BaseValueIntrinsic> extends PFunction<R> {
    readonly value: R;
    protected constructor(value: R) {
        // noinspection JSUnusedLocalSymbols
        super({});
        this.value = value;
    }

    protected compileFn(): IPCompileResult<R> {
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

    differentiate(): Scalar {
        return ZERO;
    }

    integrate(): IndefiniteIntegral<number> {
        return new AnalyticIntegral(this, new Poly(0, this.value));
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}

export class VectorConstant<R extends Vector> extends Constant<R> {
    constructor(value: R) {
        super(value);
    }

    differentiate(): VectorConstant<R> {
        return NULL_VECTOR as VectorConstant<R>;
    }

    integrate(): IndefiniteIntegral<R> {
        return Throw("Not yet defined");
    }

    get returnType(): TYPE.VECTOR {
        return TYPE.VECTOR;
    }
}

export class PointConstant<R extends Point> extends ConstantIntrinsic<R> {
    constructor(value: R) {
        super(value);
    }

    get returnType(): TYPE.POINT {
        return TYPE.POINT;
    }
}

export class RotationConstant<R extends Rotation> extends Constant<R> {
    constructor(value: R) {
        super(value);
    }

    get returnType(): TYPE.ROTATION {
        return TYPE.ROTATION;
    }

    differentiate(): RotationConstant<R> {
        return NULL_ROTATION as RotationConstant<R>;
    }

    integrate(): IndefiniteIntegral<R> {
        return Throw(`Not implemented yet.`);
    }
}

export class OrientationConstant<R extends Orientation> extends ConstantIntrinsic<R> {
    constructor(value: R) {
        super(value);
    }

    get returnType(): TYPE.ORIENTATION {
        return TYPE.ORIENTATION;
    }
}

export const ZERO = new Scalar(0).setName_('ZERO');
export const ORIGIN = new PointConstant(point());
export const NULL_VECTOR = new VectorConstant(vector());
export const ORIGIN_ORIENTATION = new OrientationConstant(orientation());
export const NULL_ROTATION = new RotationConstant(rotation());
