/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test numerics functions
 */

import {Memoizer, NumericMemoizer, RangeMemoizer, romberg} from "../numerics";
import {range} from "genutils";
type MemoFun = (t: number) => number;
interface MemoizerConstructor<T extends Memoizer<any>> {
    new(f: MemoFun, a: number, b: number): Memoizer<any>;
}

const setupMemoizer = <T extends Memoizer<any>>(cnst: MemoizerConstructor<T>, f: MemoFun) => {
    const stepsize = 1 / 1024;
    const fn = jest.fn(f);
    const mn = new cnst(fn, 1 / 1024, 8);
    const growUp = jest.spyOn(mn, 'growUp');
    const growDown = jest.spyOn(mn, 'growDown');
    const newBuffer = jest.spyOn(mn, 'newBuffer');
    const memo = mn.memo();
    return {memo, fn, stepsize, growUp, growDown, newBuffer};
}

describe('Range Memoize', () => {
    test('up', () => {
        const {memo, fn, stepsize, growUp, growDown, newBuffer} = setupMemoizer(RangeMemoizer, t => t);
        const t1 = 3 + stepsize;
        const t7 = 3 + 7 * stepsize;
        const t8 = 3 + 8 * stepsize;
        const t9 = 3 + 9 * stepsize;
        expect((memo as any).state).toEqual({
            bufMin: 0, buffer: null,
            max: Number.NEGATIVE_INFINITY, min: Number.POSITIVE_INFINITY
        });
        expect(memo(3)).toBe(3);
        expect(newBuffer).toHaveBeenCalledTimes(1);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t1});
        expect([...(memo as any).state.buffer]).toEqual([3, 0, 0, 0, 0, 0, 0, 0]);
        expect(memo(t7)).toBe(t7);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t8});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 8)].map(i => 3 + i * stepsize));
        // Ensure the cache is being used.
        expect(memo(t8)).toBe(t8);
        expect(memo(t8)).toBe(t8);
        expect(memo(t7)).toBe(t7);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(9);
        expect(newBuffer).toHaveBeenCalledTimes(2);
        expect(growUp).toHaveBeenCalledTimes(1);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t9});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 16)].map(i => i >= 9 ? 0 : 3 + i * stepsize));
    });

    test('down', () => {
        const {memo, fn, stepsize, growUp, growDown, newBuffer} = setupMemoizer(RangeMemoizer, t => t);
        const t7 = 3 + -7 * stepsize;
        const t8 = 3 + -8 * stepsize;
        expect((memo as any).state).toEqual({
            bufMin: 0, buffer: null,
            max: Number.NEGATIVE_INFINITY, min: Number.POSITIVE_INFINITY
        });
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
        expect(newBuffer).toHaveBeenCalledTimes(1);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: 3 + stepsize});
        expect([...(memo as any).state.buffer]).toEqual([3, 0, 0, 0, 0, 0, 0, 0]);
        expect(memo(3)).toBe(3);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(memo(t7)).toBe(t7);
        expect((memo as any).state).toMatchObject({bufMin: 3 - 14 * stepsize, min: t7, max: 3 + stepsize});
        expect([...(memo as any).state.buffer])
            .toEqual([
                ...[...range(-7, 0)].map(() => 0),
                ...[...range(-7, 1)].map(i => 3 + i * stepsize),
                ...[...range(-7, 0)].map(() => 0),]);
        // Ensure the cache is being used.
        expect(memo(t8)).toBe(t8);
        expect(memo(t8)).toBe(t8);
        expect(memo(t7)).toBe(t7);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(9);
        expect(newBuffer).toHaveBeenCalledTimes(2);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(1);
        expect((memo as any).state).toMatchObject({bufMin: 3 - 14 * stepsize, min: t8, max: 3 + stepsize});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 22)].map(i => i < 6 ? 0 : i > 14 ? 0 : 3 - (14 - i) * stepsize));
    });
});

describe('Memoize', () => {
    test('up', () => {
        const {memo, fn, stepsize, growUp, growDown, newBuffer} = setupMemoizer(NumericMemoizer, t => t);
        const t1 = 3 + stepsize;
        const t7 = 3 + 7 * stepsize;
        const t8 = 3 + 8 * stepsize;
        const t9 = 3 + 9 * stepsize;
        expect((memo as any).state).toEqual({
            bufMin: 0, buffer: null,
            max: Number.NEGATIVE_INFINITY, min: Number.POSITIVE_INFINITY
        });
        expect(memo(3)).toBe(3);
        expect(newBuffer).toHaveBeenCalledTimes(1);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t1});
        expect([...(memo as any).state.buffer]).toEqual([3, NaN, NaN, NaN, NaN, NaN, NaN, NaN]);
        expect(memo(t7)).toBe(t7);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t8});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 8)].map(i => i == 0 || i === 7 ? 3 + i * stepsize : NaN));
        // Ensure the cache is being used.
        expect(memo(t8)).toBe(t8);
        expect(memo(t8)).toBe(t8);
        expect(memo(t7)).toBe(t7);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(3);
        expect(newBuffer).toHaveBeenCalledTimes(2);
        expect(growUp).toHaveBeenCalledTimes(1);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: t9});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 16)]
                .map(i => [0, 7, 8].indexOf(i) >= 0
                    ? 3 + i * stepsize
                    : NaN));
        // Ensure the cache is still consistent after being extended downward.
        expect(memo(3 - stepsize)).toBe(3 - stepsize);
        expect(memo(3 - stepsize)).toBe(3 - stepsize);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(4);
        expect(newBuffer).toHaveBeenCalledTimes(3);
        expect(growUp).toHaveBeenCalledTimes(1);
        expect(growDown).toHaveBeenCalledTimes(1);
        expect((memo as any).state).toMatchObject({bufMin: 3 - 16 * stepsize, min: 3 - stepsize, max: t9});
        expect([...(memo as any).state.buffer])
            .toEqual([...range(0, 32)]
                .map(i => [15, 16, 23, 24].indexOf(i) >= 0
                    ? 3 + (i - 16) * stepsize
                    : NaN));
    });

    test('down', () => {
        const {memo, fn, stepsize, growUp, growDown, newBuffer} = setupMemoizer(NumericMemoizer, t => t);
        const t7 = 3 + -7 * stepsize;
        const t8 = 3 + -8 * stepsize;
        expect((memo as any).state).toEqual({
            bufMin: 0, buffer: null,
            max: Number.NEGATIVE_INFINITY, min: Number.POSITIVE_INFINITY
        });
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
        expect(newBuffer).toHaveBeenCalledTimes(1);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(0);
        expect((memo as any).state).toMatchObject({bufMin: 3, min: 3, max: 3 + stepsize});
        expect([...(memo as any).state.buffer]).toEqual([3, NaN, NaN, NaN, NaN, NaN, NaN, NaN]);
        expect(memo(3)).toBe(3);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(memo(t7)).toBe(t7);
        expect((memo as any).state).toMatchObject({bufMin: 3 - 14 * stepsize, min: t7, max: 3 + stepsize});
        expect([...(memo as any).state.buffer])
            .toEqual([
                ...[...range(0, 22)]
                    .map(i => [7, 14].indexOf(i) >= 0
                        ? 3 + (i - 14) * stepsize
                        : NaN)
            ]);
        // Ensure the cache is being used.
        expect(memo(t8)).toBe(t8);
        expect(memo(t8)).toBe(t8);
        expect(memo(t7)).toBe(t7);
        expect(memo(3)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(3);
        expect(newBuffer).toHaveBeenCalledTimes(2);
        expect(growUp).toHaveBeenCalledTimes(0);
        expect(growDown).toHaveBeenCalledTimes(1);
        expect((memo as any).state).toMatchObject({bufMin: 3 - 14 * stepsize, min: t8, max: 3 + stepsize});
        expect([...(memo as any).state.buffer])
            .toEqual([
                ...[...range(0, 22)]
                    .map(i => [6, 7, 14].indexOf(i) >= 0
                        ? 3 + (i - 14) * stepsize
                        : NaN)
            ]);
    });
});

describe("romberg integration", () => {
    test('constant', () => expect(romberg(() => 1, 3, 7, 1, 0.001)).toBe(4));
    test('linear', () => expect(romberg(t => t * 2 + 1, 3, 7, 8, 0.001)).toBe(44));
    test('quad', () => expect(romberg(t => t * t, 0, 1, 2, 0.0000001)).toBe(1/3));
    test('quad2', () => expect(romberg(t => t * t, -1, 1, 2, 0.0000001)).toBe(2/3));
    test('cubic', () => expect(romberg(t => t * t * t, 0, 1, 2, 0.0000001)).toBe(1/4));
    test('cubic2', () => expect(romberg(t => t * t * t, -1, 1, 2, 0.0000001)).toBe(0));
    test('sin', () =>
        expect(romberg(t => Math.sin(t), 0, Math.PI/4, 16, 0.0000000001))
            .toBeCloseTo(1-Math.sqrt(2)/2));
});
