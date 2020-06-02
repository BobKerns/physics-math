/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test piecewise functions.
 */

import {Piecewise} from "../piecewise";
import {TYPE} from "../math-types";
import {Units} from "../unit-defs";
import {Poly} from "../poly";
import {constant, ScalarConstant} from "../scalar";

describe("add", () => {
    test('uninitialized', () =>
        expect(() => new Piecewise(Units.length, TYPE.SCALAR).f(0))
            .toThrowError());
    test('initial', () => {
        const f = new Piecewise(Units.length, TYPE.SCALAR).initial(3).f;
        expect(f(0))
            .toBe(3);
        expect(f(-1000))
            .toBe(3);
        expect(f(10007))
            .toBe(3);
    });
    test('add', () => {
        const f = new Piecewise(Units.length, TYPE.SCALAR).add(-100,3).f;
        expect(f(0))
            .toBe(3);
        expect(() => f(-101))
            .toThrowError();
        expect(f(-100))
            .toBe(3);
    });
    test('foward', () => {
        const f = new Piecewise(Units.length, TYPE.SCALAR)
            .add(-100,3)
            .add(0, 4)
            .add(100, 5)
            .f;
        expect(f(0))
            .toBe(4);
        expect(() => f(-101))
            .toThrowError();
        expect(f(-100))
            .toBe(3);
        expect(f(100))
            .toBe(5);
    });
    test('reverse', () => {
        const f = new Piecewise(Units.length, TYPE.SCALAR)
            .add(100,5)
            .add(0, 4)
            .add(-100, 3)
            .f;
        expect(f(0))
            .toBe(4);
        expect(() => f(-101))
            .toThrowError();
        expect(f(-100))
            .toBe(3);
        expect(f(100))
            .toBe(5);
    });
    test('redundant', () => {
        const pw = new Piecewise(Units.length, TYPE.SCALAR)
            .add(100,5)
            .add(100, 5);
        expect((pw as any).start_times.length)
            .toBe(1);
    });
    test('redundant heterogenous', () => {
        const pw = new Piecewise(Units.length, TYPE.SCALAR)
            .add(100,5)
            .add(100, new Poly(Units.length, 5));
        expect((pw as any).start_times.length)
            .toBe(1);
        expect((pw as any).functions[0])
            .toBeInstanceOf(ScalarConstant);
    });
    test('redundant heterogenous reverse', () => {
        const pw = new Piecewise(Units.length, TYPE.SCALAR)
            .add(100, new Poly(Units.length, 5))
            .add(100,5);
        expect((pw as any).start_times.length)
            .toBe(1);
        expect((pw as any).functions[0])
            .toBeInstanceOf(ScalarConstant);
    });
});

describe("calculus", () => {
    const PW_constants = new Piecewise(Units.length, TYPE.SCALAR);
    PW_constants.initial(0);
    PW_constants.at([1, 3], [2, (5 * Math.PI) / 2], [3, 0]);
    describe('derivative', () => {
        const D = PW_constants.derivative();
        test(`Derivative constants => 0`, () =>
            [-0.5, 0.5, 1.5, 2.5, 3.5].forEach(n =>
                expect(D.f(n))
                    .toBe(0)));
    });
});
