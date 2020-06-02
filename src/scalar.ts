/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */
/**
 * @packageDocumentation
 * @module Functionals
 */

import {Poly} from "./poly";
import {BaseValue, BaseValueInFrame, BaseValueRelative, isBaseValue, TYPE, valueType} from "./math-types";
import {isPFunction, PCalculus} from "./pfunction";
import {IndefiniteIntegral, IPCompileResult, IPFunction, IPFunctionCalculus, Value, Variable} from "./base";
import {AnalyticIntegral} from "./integral";
import {Units} from "./unit-defs";
import {Unit, Divide, Multiply} from "./units";
import {DEFAULT_STYLE, StyleContext} from "./latex";
import {defineTag, tex} from "./utils";

/**
 * Scalar constants
 */
export class ScalarConstant<C extends Unit = Unit>
    extends PCalculus<number, C, Divide<C, Units.time>, Multiply<C, Units.time>>
    implements Value<number, C>
{
    readonly value: number;
    constructor(value: number, unit: C) {
        // noinspection JSUnusedLocalSymbols
        super({unit});
        this.value = value;
    }

    protected compileFn(): IPCompileResult<number> {
        const value = this.value;
        return () => value;
    }

    toTex(varName: Variable = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        return ctx.number(this.value);
    }

    toTexWithUnits(varName: Variable = 't', ctx: StyleContext = DEFAULT_STYLE.context): string {
        const value = this.toTex(varName, ctx);
        const unit = ctx.unit(this.unit);
        return tex`{{${value}}\ {${unit}}}`;
    }

    differentiate(): ScalarConstant<Divide<C, Units.time>> &
        IPFunctionCalculus<number, Divide<C, Units.time>, 1, Multiply<C, Units.time>, C> {
        const dt = (this.unit as C).divide(Units.time) as Divide<C, Units.time>;
        const result = new ScalarConstant<Divide<C, Units.time>>(0, dt);
        return result as ScalarConstant<Divide<C, Units.time>> &
            IPFunctionCalculus<number, Divide<C, Units.time>, 1, Multiply<C, Units.time>, C>;
    }

    integrate(): IndefiniteIntegral<number, Multiply<C, Units.time>, C> {
        const iUnit = this.unit.multiply(Units.time);
        const p = new Poly(iUnit, 0, this.value);
        const a = new AnalyticIntegral(this, p, iUnit);
        return a as unknown as IndefiniteIntegral<number, Multiply<C, Units.time>, C>;
    }

    get returnType(): TYPE.SCALAR {
        return TYPE.SCALAR;
    }

    equiv<T>(f: T): null | this | T {
        // @ts-ignore
        if (this === f) return this;
        // noinspection SuspiciousTypeOfGuard
        if (f instanceof Poly) {
            if (this.value === f.asConstantValue()) return this;
            return null;
        }
        if (!super.equiv(f)) return null;
        if (this.value !== (f as never as ScalarConstant).value) return null;
        return this;
    }
}

/**
 * Get an IConstant from a value or a function at T=0;
 * @param v A value, a PFunction, or a Value.
 * @param unit a Unit describing the type of constant.
 */
export function constant<T extends BaseValueRelative, U extends Unit>(v: T | IPFunction<T, U> | Value<T, U>,
                                                                      unit: U)
: Value<T,  U>;
export function constant<T extends BaseValueInFrame, U extends Unit>(v: T | IPFunction<T, U> | Value<T, U>,
                                                                     unit: U)
: Value<T, U>;
export function constant<T extends BaseValue, U extends Unit>(v: BaseValue|IPFunction, unit: U)
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
            case TYPE.SCALAR: return new ScalarConstant(v as number, unit);
            case TYPE.VECTOR: return v;
            case TYPE.ROTATION: return v;
            case TYPE.POINT: return v;
            case TYPE.ORIENTATION: return v;
        }
        throw new Error(`Unknown value type ${valueType(v)}`);
    }
    throw new Error(`Invalid constant`);
}

defineTag(ScalarConstant, 'Scalar');
