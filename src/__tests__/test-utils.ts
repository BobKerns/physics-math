/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test functions from the utils pkg
 */

import {isFunction, isGenerator, MappableGenerator, range} from "../utils";

type TestGen<T> =  MappableGenerator<T> & {
    did_return?: boolean;
    did_throw?: Error;
};

function gen(max: number): TestGen<number> {
    let result: TestGen<number>;
    function* gen(max: number) {
        try {
            for (let i = 0; i < max; i++) {
                try {
                    yield i;
                } catch (e) {
                    result.did_throw = e;
                    throw e;
                }
            }
        } finally {
            if (!result.did_throw) {
                result.did_return = true;
            }
        }
    }
    result = gen(max) as TestGen<number>;
    return MappableGenerator.extend(result);
}

const testThrow = (f: (g: TestGen<number>) => Generator<number>) => {
    const tg = gen(3);
    const g = f(tg);
    expect(g.next()).toEqual({done: false, value: 0});
    expect((_: any) => g.throw(new Error(`foo`)))
        .toThrow();
    expect(tg.did_throw).toBeInstanceOf(Error);
    expect(tg.did_return).toBeUndefined();
};

const testReturn = (f: (g: TestGen<number>) => Generator<number>) => {
    const tg = gen(3);
    const g = f(tg);
    expect(g.next()).toEqual({done: false, value: 0});
    expect(g.return(8))
        .toEqual({done: true, value: 8});
    expect(tg.did_return).toBeTruthy();
    expect(tg.did_throw).toBeUndefined();
};

describe('TestGen', () => {
    test('throw', () => {
        testThrow(g => g);
    });

    test('return', () => {
        testReturn(g => g);
    });
});

describe('range', () => {
    test('simple',() => expect([...range(0, 5)])
        .toEqual([0, 1, 2, 3, 4]));
    test('asArray',() => expect(range(0, 5).asArray())
        .toEqual([0, 1, 2, 3, 4]));
    test('map',() => expect(range(0, 5).map(n => 2 * n).asArray())
        .toEqual([0, 2, 4, 6, 8]));
    test('filter',() => expect(range(0, 10).filter(n => n % 2 === 1).asArray())
        .toEqual([1, 3, 5, 7, 9]));
    test('some negative',() => expect(range(0, 5).some(n => n == 7))
        .toBeFalsy());
    test('some positive',() => expect(range(0, 5).some(n => n == 3))
        .toBeTruthy());
    test('every negative',() => expect(range(0, 5).every(n => n > 3))
        .toBeFalsy());
    test('every positive',() => expect(range(0, 5).every(n => n < 5))
        .toBeTruthy());
});

describe('Predicates', () => {
    test('isGenerator normal', () =>
        expect(isGenerator((function *foo() {})()))
            .toBeTruthy());
    test('isGenerator Mappable', () =>
        expect(isGenerator(range(0, 3)))
            .toBeTruthy());
    test('isGenerator iterable', () =>
        expect(isGenerator([0, 1, 2]))
            .toBeFalsy());
    test('isGenerator iterator', () =>
        expect(isGenerator([0, 1, 2][Symbol.iterator]()))
            .toBeFalsy());

    test('isFunction yes', () =>
        expect(isFunction(() => 5))
            .toBeTruthy());
    test('isFunction no', () =>
        expect(isFunction(5))
            .toBeFalsy());

    test('isFunction guard', () => {
        let x: number | ((g: number) => boolean) = _ => true;
        let y: number | ((g: any) => number) = _ => 8;
        // This should be happy
        // noinspection JSUnusedLocalSymbols
        const b: (g: number) => boolean = (isFunction(x) ? x : () => true);
        // This should be a type mismatch
        // @ts-expect-error
        // noinspection JSUnusedLocalSymbols
        const c: (g: number) => boolean = (isFunction(y) ? y : () => true);
    });
});

describe('MappableGenerator', () => {
    describe('slice', () => {
        test('defaultArgs', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).slice().asArray())
                .toEqual([1, 2, 3, 4]));
        test('skip 2', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).slice(2).asArray())
                .toEqual([3, 4]));
        test('limit 2', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).slice(0, 2).asArray())
                .toEqual([1, 2]));
        test('middle 2', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).slice(1, 3).asArray())
                .toEqual([2, 3]));
        test('out-of-range', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).slice(4).asArray())
                .toEqual([]));

        test('throw', () =>
            testThrow(g => g.slice(0)));

        test('return', () =>
            testReturn(g => g.slice(0)));
    });

    describe('concat', () => {
        test('trivial', () =>
            expect(MappableGenerator.extend([1, 8, 'fred']).concat().asArray())
                .toEqual([1, 8, 'fred']));

        test('multiple', () =>
            expect(MappableGenerator.extend([1, 8, 'fred']).concat(['ginger'], [], [7]).asArray())
                .toEqual([1, 8, 'fred', 'ginger', 7]));

        test('throw', () => testThrow(g => MappableGenerator.extend<number>([]).concat(g)))
        test('return', () => testReturn(g => MappableGenerator.extend<number>([]).concat(g)))
    });

    describe('reduce', () => {
        test('w/ init', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).reduce((acc, v) => acc + v, 5))
                .toBe(15));

        test('w/o init', () =>
            expect(MappableGenerator.extend([1, 2, 3, 4]).reduce((acc: number, v) => acc + v))
                .toBe(10));

        test('empty', () =>
            expect((_: any) => MappableGenerator.extend([]).reduce((acc: number, v) => acc + v))
                .toThrow(TypeError));

    });

    describe('flat', () => {
        test('empty', () =>
            expect(range(0, 0).flat().asArray())
                .toEqual([]));

        test('simple', () =>
            expect(MappableGenerator.flat([3, 7]).asArray())
                .toEqual([3, 7]));

        test('nested', () =>
            expect(MappableGenerator.flat([3, [8, 9], 7]).asArray())
                .toEqual([3, 8, 9, 7]));

        test('nested Gen', () =>
            expect(MappableGenerator.flat([3, range(4, 7), 7]).asArray())
                .toEqual([3, 4, 5, 6, 7]));

        test('depth 1', () =>
            expect(MappableGenerator.flat([3, [2, [1, [0]]], 7]).asArray())
                .toEqual([3, 2, [1, [0]], 7]));

        test('depth 2', () =>
            expect(MappableGenerator.flat([3, [2, [1, [0]]], 7], 2).asArray())
                .toEqual([3, 2, 1, [0], 7]));

    });


    describe('flatMap', () => {
        test('empty', () =>
            expect(range(0, 0).flatMap(_ => 6).asArray())
                .toEqual([]));

        test('simple', () =>
            expect(MappableGenerator.flatMap((n: number) => n + 1)([3, 7]).asArray())
                .toEqual([4, 8]));

        test('nested', () =>
            expect(MappableGenerator.flatMap((n: number) => n * 2)([3, [8, 9], 7]).asArray())
                .toEqual([6, 16, 18, 14]));

        test('nested Gen', () =>
            expect(MappableGenerator.flatMap((n: any) => 3 * n)([3, range(4, 7), 7]).asArray())
                .toEqual([9, 12, 15, 18, 21]));

        test('depth 1', () =>
            expect(MappableGenerator.flatMap((n: any) => typeof n)([3, [2, [1, [0]]], 7]).asArray())
                .toEqual(["number", "number", "object", "number"]));

        test('depth 2', () =>
            expect(MappableGenerator.flatMap((n: any) => typeof n, 2)([3, [2, [1, [0]]], 7]).asArray())
                .toEqual(["number", "number", "number", "object", "number"]));

    });

    describe('join', () => {
        test('empty', () => expect(range(0,0).join(', '))
            .toEqual(""));
        test('single', () =>
            expect(range(0, 1).join(', '))
                .toEqual('0'));
        test('multi', () =>
            expect(range(0, 3).join(', '))
                .toEqual('0, 1, 2'));

    });
});
