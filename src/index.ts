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

export * from './derivative';
export * from './integral';
export * from './base';
export {range} from './utils';
export * from './arith';
export * from './curry';
export * from "./math-types";
export * from "./pfunction";
export * from './scalar';
export * from './poly';
export * from "./numerics";
export * from './units';
export * from './unit-defs';
export * from './general-fns';
export {SI} from "./primitive-units";
export {InertialFrame, Frame, World} from "./frame";
export {Styler, StyleKey, colorStyler, RGB6Color, setStyle, INITIAL_STYLE, NumberFormat} from './latex'
