/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Tests for the MappableGenerators and other generator utilities.
 */



/**
 * Test functions from the utils pkg
 */

import {isFunction, Throw} from "../utils";
import {isGenable, isGenerator, EnhancedGenerator, range, isIterator, isIterable, Sync, Async, SyncType, Enhanced} from "../generators";

type TestGen<T, S extends SyncType> =  Enhanced<T, S> & {
    did_return?: boolean;
    did_throw?: Error;
};

function gen(max: number): TestGen<number, Sync> {
    let result: TestGen<number, Sync>;
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
    result = gen(max) as TestGen<number, Sync>;
    return Sync.enhance(result);
}

const testThrow = (f: (g: TestGen<number, Sync>) => Generator<any>, value: any = 0) => {
    const tg = gen(3);
    const g = f(tg);
    expect(g.next()).toEqual({done: false, value});
    expect((_: any) => g.throw(new Error(`foo`)))
        .toThrow();
    expect(tg.did_throw).toBeInstanceOf(Error);
    expect(tg.did_return).toBeUndefined();
};

const testReturn = (f: (g: TestGen<number, Sync>) => Generator<any>, value: any = 0) => {
    const tg = gen(3);
    const g = f(tg);
    expect(g.next()).toEqual({done: false, value});
    expect(g.return(8))
        .toEqual({done: true, value: 8});
    expect(tg.did_return).toBeTruthy();
    expect(tg.did_throw).toBeUndefined();
};

function genAsync(max: number): TestGen<number, Async> {
    let result: TestGen<number, Async>;
    async function* gen(max: number) {
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
    result = gen(max) as TestGen<number, Async>;
    return Async.enhance(result);
}

const testThrowAsync = async (f: (g: TestGen<number, Async>) => AsyncGenerator<any>, value: any = 0) => {
    const tg = genAsync(3);
    const g = f(tg);
    expect(await g.next()).toEqual({done: false, value});
    try {
        await g.throw(new Error(`foo`));
    } catch (e) {
        expect((_: any) => Throw(e))
            .toThrow();
    }
    expect(tg.did_throw).toBeInstanceOf(Error);
    expect(tg.did_return).toBeUndefined();
};

const testReturnAsync = async (f: (g: TestGen<number, Async>) => AsyncGenerator<any>, value: any = 0) => {
    const tg = genAsync(3);
    const g = f(tg);
    expect(await g.next()).toEqual({done: false, value});
    expect(await g.return(8))
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
    function *nullGen() {}

    test('isGenerator undefined', () =>
        expect(isGenerator(undefined))
            .toBeFalsy());
    test('isGenerator normal', () =>
        expect(isGenerator(nullGen()))
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

    test('isGenable undefined', () =>
        expect(isGenable(undefined))
            .toBeFalsy());
    test('isGenable Generator', () =>
        expect(isGenable(nullGen()))
            .toBeTruthy());
    test('isGenable Mappable', () =>
        expect(isGenable(range(0, 3)))
            .toBeTruthy());
    test('isGenable Iterable', () =>
        expect(isGenable([0, 1, 2]))
            .toBeTruthy());
    test('isGenable Iterator', () =>
        expect(isGenable([0, 1, 2][Symbol.iterator]()))
            .toBeTruthy());
    test('isGenable Other', () =>
        expect(isGenable(() => 7))
            .toBeFalsy());

    test('isIterator undefined', () =>
        expect(isIterator(undefined))
            .toBeFalsy());
    test('isIterator yes', () =>
        expect(isIterator([][Symbol.iterator]()))
            .toBeTruthy());
    test('isIterator no', () =>
        expect(isIterator([]))
            .toBeFalsy());
    test('isIterator generator', () =>
        expect(isIterator(nullGen()))
            .toBeTruthy());

    test('isIterable undefined', () =>
        expect(isIterable(undefined))
            .toBeFalsy());
    test('isIterable yes', () =>
        expect(isIterable({next() { return {done: true}}} ))
            .toBeFalsy());
    test('isIterable no', () =>
        expect(isIterable([]))
            .toBeTruthy());
    test('isIterable generator', () =>
        expect(isIterable(nullGen()))
            .toBeTruthy());

    test('isFunction undefined', () =>
        expect(isFunction(undefined))
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

describe('Enhanced Generators', () => {
    describe('Sync', () => {
        test('of', () =>
            expect([...Sync.of(3, 7, 'foo')]).toEqual([3, 7, 'foo']));

        test('of union', () => {
            // Verifies that differing types work and infer a suitable union.
            const v: EnhancedGenerator<number | string> = Sync.of(3, 7, 'foo');
            const a: Array<number | string> = v.asArray();
            expect(a).toEqual([3, 7, 'foo']);
        });
        describe('slice', () => {
            test('defaultArgs', () =>
                expect(Sync.enhance([1, 2, 3, 4]).slice().asArray())
                    .toEqual([1, 2, 3, 4]));
            test('skip 2', () =>
                expect(Sync.enhance([1, 2, 3, 4]).slice(2).asArray())
                    .toEqual([3, 4]));
            test('limit 2', () =>
                expect(Sync.enhance([1, 2, 3, 4]).slice(0, 2).asArray())
                    .toEqual([1, 2]));
            test('middle 2', () =>
                expect(Sync.enhance([1, 2, 3, 4]).slice(1, 3).asArray())
                    .toEqual([2, 3]));
            test('out-of-range', () =>
                expect(Sync.enhance([1, 2, 3, 4]).slice(4).asArray())
                    .toEqual([]));

            test('throw', () =>
                testThrow(g => g.slice(0)));

            test('return', () =>
                testReturn(g => g.slice(0)));
        });

        describe('concat', () => {
            test('trivial', () =>
                expect(Sync.enhance([1, 8, 'fred']).concat().asArray())
                    .toEqual([1, 8, 'fred']));

            test('multiple', () =>
                expect(Sync.enhance([1, 8, 'fred']).concat(['ginger'], [], [7]).asArray())
                    .toEqual([1, 8, 'fred', 'ginger', 7]));

            test('static', () =>
                expect(Sync.concat([1, 8, 'fred'], ['ginger'], [], [7]).asArray())
                    .toEqual([1, 8, 'fred', 'ginger', 7]));

            test('throw', () => testThrow(g => Sync.enhance<number>([]).concat(g)))
            test('return', () => testReturn(g => Sync.enhance<number>([]).concat(g)))
        });

        describe('reduce', () => {
            test('w/ init', () =>
                expect(Sync.enhance([1, 2, 3, 4]).reduce((acc, v) => acc + v, 5))
                    .toBe(15));

            test('w/o init', () =>
                expect(Sync.enhance([1, 2, 3, 4]).reduce((acc: number, v) => acc + v))
                    .toBe(10));

            test('empty', () =>
                expect((_: any) => Sync.enhance([]).reduce((acc: number, v) => acc + v))
                    .toThrow(TypeError));
        });

        describe('flat', () => {
            test('empty', () =>
                expect(range(0, 0).flat().asArray())
                    .toEqual([]));

            test('simple', () =>
                expect(Sync.flat([3, 7]).asArray())
                    .toEqual([3, 7]));

            test('nested', () =>
                expect(Sync.flat([3, [8, 9], 7]).asArray())
                    .toEqual([3, 8, 9, 7]));

            test('nested Gen', () =>
                expect(Sync.flat([3, range(4, 7), 7]).asArray())
                    .toEqual([3, 4, 5, 6, 7]));

            test('depth 1', () =>
                expect(Sync.flat([3, [2, [1, [0]]], 7]).asArray())
                    .toEqual([3, 2, [1, [0]], 7]));

            test('depth 2', () =>
                expect(Sync.flat([3, [2, [1, [0]]], 7], 2).asArray())
                    .toEqual([3, 2, 1, [0], 7]));

            test('throw', () =>
                testThrow(g => g.flat()));

            test('return', () =>
                testReturn(g => g.flat()));
        });

        describe('flatMap', () => {
            test('empty', () =>
                expect(range(0, 0).flatMap(_ => 6).asArray())
                    .toEqual([]));

            test('simple', () =>
                expect(Sync.flatMap((n: number) => n + 1)([3, 7]).asArray())
                    .toEqual([4, 8]));

            test('nested', () =>
                expect(Sync.flatMap((n: number) => (n & 1) ?  n : [n, n + 1])(
                    [3, 8, 7]
                ).asArray())
                    .toEqual([3, 8, 9, 7]));

            test('nested Gen', () =>
                expect(Sync.flatMap((n: any) => typeof n === 'number' ? n * 2 : n)(
                    [3, range(4, 7), 7],
                    2
                ).asArray())
                    .toEqual([6, 8, 10, 12, 14]));

            test('depth 1', () =>
                expect(Sync.flatMap((n: any) => typeof n === 'number' ? n * 2 : n)(
                    [3, [2, [1, [0]]], 7]
                ).asArray())
                    .toEqual([6, 2, [1, [0]], 14]));

            test('depth 2', () =>
                expect(Sync.flatMap((n: any) => typeof n === 'number' ? n * 2 : n, 2)(
                    [3, [2, [1, [0]]], 7]
                ).asArray())
                    .toEqual([6, 4, 1, [0], 14]));

            test('throw', () =>
                testThrow(g => g.flatMap(a => a)));

            test('return', () =>
                testReturn(g => g.flatMap(a => a)));
        });

        describe('join', () => {
            test('empty', () =>
                expect(range(0,0).join(', '))
                    .toEqual(""));
            test('single', () =>
                expect(range(0, 1).join(', '))
                    .toEqual('0'));
            test('multi', () =>
                expect(range(0, 3).join(', '))
                    .toEqual('0, 1, 2'));
            test('static', () =>
                expect(Sync.join(['a', 'b']))
                    .toEqual('a,b'));
            test('static sep', () =>
                expect(Sync.join(['a', 'b'], ', '))
                    .toEqual('a, b'));
            test('static nullsep', () =>
                expect(Sync.join(['a', 'b'], ''))
                    .toEqual('ab'));
            test('static sep functional', () =>
                expect(Sync.join(', ')(['a', 'b']))
                    .toEqual('a, b'));
        });

        describe('repeat', () => {
            test('standalone empty', () =>
                expect([...Sync.repeat(55, 0)])
                    .toEqual([]));

            test('standalone', () =>
                expect([...Sync.repeat(9, 5)])
                    .toEqual([9, 9, 9, 9, 9]));

            test('extend empty', () =>
                expect(range(0, 3).repeat('x', 0).asArray())
                    .toEqual([0, 1, 2]));


            test('extend', () =>
                expect(range(0, 3).repeat('x', 4).asArray())
                    .toEqual([0, 1, 2, 'x', 'x', 'x', 'x']));

        });

        describe('repeatLast', () => {
            test('zero', () =>
                expect(range(0, 5).repeatLast(0).asArray())
                    .toEqual([0, 1, 2, 3, 4]));
            test('three', () =>
                expect(range(0, 5).repeatLast(3).asArray())
                    .toEqual([0, 1, 2, 3, 4, 4, 4, 4]));

            test('empty', () =>
                expect(range(0, 0).repeatLast(3).asArray())
                    .toEqual([undefined, undefined, undefined]));

            test('throw', () =>
                testThrow(g => g.repeatLast(1)));

            test('return', () =>
                testReturn(g => g.repeatLast(1)));
        });

        describe('zip', () => {
            test('empty', () =>
                expect(Sync.zip().asArray())
                    .toEqual([]));
            test('all empty', () =>
                expect(Sync.zip(range(0, 0), range(0, 0)).asArray())
                    .toEqual([]));
            test('single', () =>
                expect(Sync.zip(range(0, 5)).asArray())
                    .toEqual([[0], [1], [2], [3], [4]]));
            test('simple', () =>
                expect(Sync.zip(range(0, 5), range(0, 10, 2)).asArray())
                    .toEqual([[0, 0], [1, 2], [2, 4], [3, 6], [4, 8]]));
            test('uneven', () =>
                expect(Sync.zip(range(0, 10), range(0, 10, 2)).asArray())
                    .toEqual([[0, 0], [1, 2], [2, 4], [3, 6], [4, 8]]));

            test('throw', async () =>
                testThrow(g => g.zip(range(0, 5)), [0, 0]));

            test('return', async () =>
                testReturn(g => g.zip(range(0, 5)), [0, 0]));
        });
    });

    describe('Async', () => {
        describe('of', () => {
            test('of not iterable', () =>
                // @ts-expect-error
                expect(() => [...Async.of(3, 7, 'foo')]).toThrowError());
            test('of Promise', () =>
                expect(Async.of(3, 7, 'foo').asArray()).toBeInstanceOf(Promise));
            test('of', async () =>
                expect(await Async.of(3, 7, 'foo').asArray()).toEqual([3, 7, 'foo']));
        });

        describe('slice', () => {
            test('defaultArgs', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).slice().asArray())
                    .toEqual([1, 2, 3, 4]));
            test('skip 2', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).slice(2).asArray())
                    .toEqual([3, 4]));
            test('limit 2', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).slice(0, 2).asArray())
                    .toEqual([1, 2]));
            test('middle 2', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).slice(1, 3).asArray())
                    .toEqual([2, 3]));
            test('out-of-range', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).slice(4).asArray())
                    .toEqual([]));

            test('throw', () =>
                testThrowAsync(g => g.slice(0)));

            test('return', () =>
                testReturnAsync(g => g.slice(0)));
        });

        describe('concat', () => {
            test('trivial', async () =>
                expect(await Async.enhance([1, 8, 'fred']).concat().asArray())
                    .toEqual([1, 8, 'fred']));

            test('multiple', async () =>
                expect(await Async.enhance([1, 8, 'fred']).concat(['ginger'], [], [7]).asArray())
                    .toEqual([1, 8, 'fred', 'ginger', 7]));

            test('static', async () =>
                expect(await Async.concat([1, 8, 'fred'], ['ginger'], [], [7]).asArray())
                    .toEqual([1, 8, 'fred', 'ginger', 7]));

            test('throw', () => testThrowAsync(g => Async.enhance<number>([]).concat(g)))
            test('return', () => testReturnAsync(g => Async.enhance<number>([]).concat(g)))
        });

        describe('reduce', () => {
            test('w/ init', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).reduce((acc, v) => acc + v, 5))
                .toBe(15));

            test('w/o init', async () =>
                expect(await Async.enhance([1, 2, 3, 4]).reduce((acc: number, v) => acc + v))
                    .toBe(10));

            test('empty', async () => {
                try {
                    await Async.enhance([]).reduce((acc: number, v) => acc + v);
                } catch (e) {
                    expect((_: any) => Throw(e))
                            .toThrow(TypeError);
                }
            });
        });


        describe('flat', () => {
            test('empty', async () =>
                expect(await Async.of().flat().asArray())
                    .toEqual([]));

            test('simple', async () =>
                expect(await Async.flat([3, 7]).asArray())
                    .toEqual([3, 7]));

            test('nested', async () =>
                expect(await Async.flat([3, [8, 9], 7]).asArray())
                    .toEqual([3, 8, 9, 7]));

            test('nested Gen', async () =>
                expect(await Async.flat([3, range(4, 7), 7]).asArray())
                    .toEqual([3, 4, 5, 6, 7]));

            test('depth 1', async () =>
                expect(await Async.flat([3, [2, [1, [0]]], 7]).asArray())
                    .toEqual([3, 2, [1, [0]], 7]));

            test('depth 2', async () =>
                expect(await Async.flat([3, [2, [1, [0]]], 7], 2).asArray())
                    .toEqual([3, 2, 1, [0], 7]));


            test('throw', () =>
                testThrowAsync(g => g.flat()));

            test('return', () =>
                testReturnAsync(g => g.flat()));
        });

        describe('flatMap', () => {
            test('empty', async () =>
                expect(await Async.of().flatMap(_ => 6).asArray())
                    .toEqual([]));

            test('simple', async () =>
                expect(await Async.flatMap((n: number) => n + 1)([3, 7]).asArray())
                    .toEqual([4, 8]));

            test('nested', async () =>
                expect(await Async.flatMap((n: number) => (n & 1) ?  n : [n, n + 1])([3, 8, 7]).asArray())
                    .toEqual([3, 8, 9, 7]));

            test('nested Gen', async () =>
                expect(await Async.flatMap((n: any) => typeof n === 'number' ? n * 2 : n)(
                    [3, range(4, 7), 7],
                    2
                ).asArray())
                    .toEqual([6, 8, 10, 12, 14]));

            test('depth 1', async () =>
                expect(await Async.flatMap((n: any) => typeof n === 'number' ? n * 2 : n)(
                    [3, [2, [1, [0]]], 7]
                ).asArray())
                    .toEqual([6, 2, [1, [0]], 14]));

            test('depth 2', async () =>
                expect(await Async.flatMap((n: any) => typeof n === 'number' ? n * 2 : n, 2)(
                    [3, [2, [1, [0]]], 7]
                ).asArray())
                    .toEqual([6, 4, 1, [0], 14]));

            test('throw', () =>
                testThrowAsync(g => g.flatMap(a => a)));

            test('return', () =>
                testReturnAsync(g => g.flatMap(a => a)));
        });

        describe('join', () => {
            test('empty', async () =>
                expect(await Async.of().join(', '))
                    .toEqual(""));
            test('single', async () =>
                expect(await Async.of(0).join(', '))
                    .toEqual('0'));
            test('multi', async () =>
                expect(await Async.of(0, 1, 2).join(', '))
                    .toEqual('0, 1, 2'));
            test('static', async () =>
                expect(await Async.join(['a', 'b']))
                    .toEqual('a,b'));
            test('static sep', async () =>
                expect(await Async.join(['a', 'b'], ', '))
                    .toEqual('a, b'));
            test('static nullsep', async () =>
                expect(await Async.join(['a', 'b'], ''))
                    .toEqual('ab'));
            test('static sep functional', async () =>
                expect(await Async.join(', ')(['a', 'b']))
                    .toEqual('a, b'));
        });

        describe('repeat', () => {
            test('standalone empty', async () =>
                expect(await Async.repeat(55, 0).asArray())
                    .toEqual([]));

            test('standalone', async () =>
                expect(await Async.repeat(9, 5).asArray())
                    .toEqual([9, 9, 9, 9, 9]));

            test('extend empty', async () =>
                expect(await Async.of(0, 1, 2).repeat('x', 0).asArray())
                    .toEqual([0, 1, 2]));

            test('extend', async () =>
                expect(await Async.of(0, 1, 2).repeat('x', 4).asArray())
                    .toEqual([0, 1, 2, 'x', 'x', 'x', 'x']));

        });

        describe('repeatLast', () => {
            test('zero', async () =>
                expect(await Async.of(0, 1, 2, 3, 4)
                    .repeatLast(0).asArray())
                    .toEqual([0, 1, 2, 3, 4]));
            test('three', async () =>
                expect(await Async.of(0, 1, 2, 3, 4)
                    .repeatLast(3).asArray())
                    .toEqual([0, 1, 2, 3, 4, 4, 4, 4]));

            test('empty', async () =>
                expect(await Async.of().repeatLast(3).asArray())
                    .toEqual([undefined, undefined, undefined]));

            test('throw', async () =>
                testThrowAsync(g => g.repeatLast(1)));

            test('return', async () =>
                testReturnAsync(g => g.repeatLast(1)));
        });

        describe('zip', () => {
            test('empty', async () =>
                expect(await Async.zip().asArray())
                    .toEqual([]));
            test('all empty', async () =>
                expect(await Async.zip(range(0, 0), range(0, 0)).asArray())
                    .toEqual([]));
            test('single', async () =>
                expect(await Async.zip(range(0, 5)).asArray())
                    .toEqual([[0], [1], [2], [3], [4]]));
            test('simple', async () =>
                expect(await Async.zip(range(0, 5), range(0, 10, 2)).asArray())
                    .toEqual([[0, 0], [1, 2], [2, 4], [3, 6], [4, 8]]));
            test('uneven', async () =>
                expect(await Async.zip(range(0, 10), range(0, 10, 2)).asArray())
                    .toEqual([[0, 0], [1, 2], [2, 4], [3, 6], [4, 8]]));

            test('throw', async () =>
                testThrowAsync(g => g.zip(range(0, 5)), [0, 0]));

            test('return', async () =>
                testReturnAsync(g => g.zip(range(0, 5)), [0, 0]));
        });
    });
});
