/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {Poly} from "./poly";
import {BaseValue, BaseValueInFrame, BaseValueRelative, isBaseValue, TYPE, valueType} from "./math-types";
import {isPFunction, PCalculus} from "./pfunction";
import {IndefiniteIntegral, IPCalculus, IPCompileResult, IPFunction, IPFunctionBase, IPFunctionCalculus, Value} from "./base";
import {AnalyticIntegral} from "./integral";
import {U as UX, U} from "./unit-defs";
import {CUnit, Divide, Multiply} from "./primitive-units";

/**
 * Scalar constants
 */

export interface IConstant<
    R extends BaseValueRelative,
    U extends CUnit = CUnit,
    D extends CUnit = Divide<U, UX.time>,
    I extends CUnit = Multiply<U, UX.time>
    >
    extends IPFunctionBase<R, U>,
        IPCalculus<R, U, D, I>
{

}

export interface IConstantInFrame<
    R extends BaseValueInFrame,
    U extends CUnit = CUnit
    >
    extends IPFunctionBase<R, U>
{

}

export class ScalarConstant<C extends CUnit = CUnit>
    extends PCalculus<number, C>
    implements IConstant<number, C> {
    readonly value: number;
    readonly unit: C;
    constructor(value: number, unit: C) {
        // noinspection JSUnusedLocalSymbols
        super({});
        this.value = value;
        this.unit = unit;
    }

    protected compileFn(): IPCompileResult<number> {
        const value = this.value;
        return () => value;
    }

    toTex(tv: string) {
        return `${this.value}`;
    }

    differentiate(): IPFunctionCalculus<number, Divide<C, U.time>, 1, Divide<Divide<C, U.time>, U.time>, C> {
        const t1 = (this.unit as C).divide(U.time);
        const a = new ScalarConstant(0, t1);
        return a as unknown as IPFunctionCalculus<number, Divide<C, U.time>, 1, Divide<Divide<C, U.time>, U.time>, C>;
    }

    integrate(): IndefiniteIntegral<number, Multiply<C, U.time>, C> {
        const iUnit = this.unit.multiply(U.time);
        const p = new Poly(iUnit, 0, this.value);
        const a = new AnalyticIntegral(this, p, iUnit);
        return a as unknown as IndefiniteIntegral<number, Multiply<C, U.time>>;
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }
}

/**
 * Get an IConstant from a value or a function at T=0;
 * @param v A value, a PFunction, or a Value.
 * @param unit a Unit describing the type of constant.
 */
export function constant<T extends BaseValueRelative, U extends CUnit>(v: T | IPFunction<T, U> | Value<T, U> | IConstant<T, U>,
                                                                       unit: U)
: IConstant<T,  U>;
export function constant<T extends BaseValueInFrame, U extends CUnit>(v: T | IPFunction<T, U> | Value<T, U> | IConstantInFrame<T, U>,
                                                                      unit: U)
: IConstantInFrame<T, U>;
export function constant<T extends BaseValue, U extends CUnit>(v: BaseValue|IPFunction, unit: U)
    : any {
    if (isPFunction(v, unit, 1)) {
        if (v as unknown instanceof ScalarConstant) {
            return v;
        }
        return v.f(0);
    } else if (isBaseValue(v)) {
        if (!unit) {
            throw new Error('unit argument is required with BaseValues.');
        }
        switch (valueType(v)) {
            case TYPE.SCALAR: return new ScalarConstant(v as number, unit) as unknown as IConstant<number, U>;
            case TYPE.VECTOR: return v as unknown as IConstant<BaseValueRelative, U>;
            case TYPE.ROTATION: return v as unknown as IConstant<BaseValueRelative, U>;
            case TYPE.POINT: return v as unknown as IConstantInFrame<BaseValueInFrame, U>;
            case TYPE.ORIENTATION: return v as unknown as IConstantInFrame<BaseValueInFrame, U>;
        }
        throw new Error(`Unknown value type ${valueType(v)}`);
    }
    throw new Error(`Invalid constant`);
}
