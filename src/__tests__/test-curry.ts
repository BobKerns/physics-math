/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test the auto-curry functionality.
 */

import {curry1, curry2, curry3, curry4} from "../curry";

/**
 * Using literal number types allows this to test the type declarations, making sure the
 * right argument types are in the right functions. It will fail if they don't align
 * correctly.
 */
describe("Curry1", () => {
    // noinspection PointlessArithmeticExpressionJS
    const f = (a: 1) => a * 1;
    const c = curry1(f);
    test('call 0', () => {
        const t = c();
        expect(t).toBe(c);
    })
    test('call a', () => {
        const t = c(1);
        expect(t).toBe(1);
    })
});

describe("Curry2", () => {
    // noinspection PointlessArithmeticExpressionJS
    const f = (a: 1, b: 2) => a * 10 + b * 1;
    const c = curry2(f);
    test('call 0', () => {
        const t = c();
        expect(t).toBe(c);
    })
    test('call a', () => {
        const t = c(1);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)).toBe(12);
    })
    test('call b', () => {
        const t = c(undefined, 2);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1)).toBe(12);
    })
    test('call ab', () => {
        const t = c(1, 2);
        expect(t).toBe(12);
    })
});

describe("Curry3", () => {
    // noinspection PointlessArithmeticExpressionJS
    const f = (a: 1, b: 2, c: 3) => a * 100 + b * 10 + c * 1;
    const c = curry3(f);
    test('call 0', () => {
        const t = c();
        expect(t).toBe(c);
    })
    test('call a', () => {
        const t = c(1);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2, 3)).toBe(123);
    })
    test('call b', () => {
        const t = c(undefined, 2);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1, 3)).toBe(123);
    })
    test('call c', () => {
        const t = c(undefined, undefined, 3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1, 2)).toBe(123);
        expect(t(1)(2)).toBe(123);
    })
    test('call ab', () => {
        const t = c(1, 2);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(3)).toBe(123);
    })
    test('call ac', () => {
        const t = c(1, undefined, 3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)).toBe(123);
    })
    test('call bc', () => {
        const t = c( undefined, 2,3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1)).toBe(123);
    })
    test('call abc', () => {
        const t = c(1, 2, 3);
        expect(t).toBe(123);
    })
});

describe("Curry4", () => {
    // noinspection PointlessArithmeticExpressionJS
    const f = (a: 1, b: 2, c: 3, d: 4) => a * 1000 + b * 100 + c * 10 + d * 1;
    const c = curry4(f);
    test('call 0', () => {
        const t = c();
        expect(t).toBe(c);
    })
    test('call a', () => {
        const t = c(1);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)(3)(4)).toBe(1234);
        expect(t(2, 3, 4)).toBe(1234);
    })
    test('call b', () => {
        const t = c(undefined, 2);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1)(3)(4)).toBe(1234);
        expect(t(1)(3, 4)).toBe(1234);
        expect(t(1, 3, 4)).toBe(1234);
    })
    test('call c', () => {
        const t = c(undefined, undefined, 3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1, 2)(4)).toBe(1234);
        expect(t(1)(2, 4)).toBe(1234);
        expect(t(1, 2, 4)).toBe(1234);

    })
    test('call ab', () => {
        const t = c(1, 2);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(3)(4)).toBe(1234);
        expect(t(3, 4)).toBe(1234);
    })
    test('call ac', () => {
        const t = c(1, undefined, 3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)(4)).toBe(1234);
        expect(t(2, 4)).toBe(1234);
    })
    test('call ad', () => {
        const t = c(1, undefined, undefined, 4);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)(3)).toBe(1234);
        expect(t(2, 3)).toBe(1234);
    })
    test('call bc', () => {
        const t = c( undefined, 2,3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1)(4)).toBe(1234);
        expect(t(1, 4)).toBe(1234);
    })
    test('call abc', () => {
        const t = c( 1, 2,3);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(4)).toBe(1234);
    })
    test('call abd', () => {
        const t = c( 1, 2, undefined,4);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(3)).toBe(1234);
    })
    test('call acd', () => {
        const t = c( 1, undefined, 3, 4);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(2)).toBe(1234);
    })
    test('call bcd', () => {
        const t = c( undefined, 2, 3, 4);
        expect(t).toBeInstanceOf(Function);
        expect(t()).toBe(t);
        expect(t(1)).toBe(1234);
    })
    test('call abcd', () => {
        const t = c(1, 2, 3, 4);
        expect(t).toBe(1234);
    })
});
