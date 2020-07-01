/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Load the full system with a single import.
 * @packageDocumentation
 * @preferred
 * @module Index
 */

// export * from './derivative';
// export * from './integral';
export {
    TexFormatter, setFormatter,
    IPCalculus, IPFunction, IPFunctionCalculus, IPFunctionBase, IPFunctionPtr, AnyIPFunction,
    Transform, Variable, Value, ValueInFrame, IPCompiled, Relative, InFrame,
    IndefiniteIntegral
} from './base';
export {
    isFunction,
    Throw, idGen, callSite, ViewOf, NYI, not
} from './utils';
export {add, sub, mul, equal, near} from './arith';
export * from './curry';
export {
    TYPE, datatype,
    Vector, Point, Rotation, Orientation,
    isScalar, isRelative, isScalarValue, isVector, isPoint, isRotation, isOrientation,
    vector, point, rotation, orientation
} from "./math-types";
export {isPFunction, isPCompiled} from "./pfunction";
export {constant} from './scalar';
export {poly} from './poly';
export {romberg} from "./numerics";
export {Unit, getUnit, isUnit} from './units';
export {Units} from './unit-defs';
export {gFunction} from './general-fns';
export {SI} from "./primitive-units";
export {InertialFrame, Frame, World} from "./frame";
export {Styler, StyleKey, colorStyler, RGB6Color, setStyle, INITIAL_STYLE, NumberFormat} from './latex'
export {Piecewise} from './piecewise';
export {graph, GraphFormat, AxisRange, DEFAULT_FORMAT, Box, MouseMoveData} from './graph';
export {gcd, xgcd, isPrime, isComposite, factor, sieve} from './algebra';
export {range,
    isIterable, isIterator, toIterable, toIterator, toIterableIterator,
    toGenerator, isGenerator, isGenable, isIterableIterator,
    isAsyncIterable, isAsyncIterator, toAsyncIterable, toAsyncIterator, toAsyncIterableIterator,
    toAsyncGenerator, isAsyncGenerator, isAsyncGenable, isAsyncIterableIterator,
    Sync, Async,
    Genable, GenUnion, FlatGen, GenType, Reducer,
    EnhancedGenerator, EnhancedAsyncGenerator, Enhanced
} from './generators'
