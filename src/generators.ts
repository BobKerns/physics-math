/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * An extension to generators, that provides for operations like:
 * * map<T, R>(gen: Generator<T>) => (fn: T => R) => Generator<R>
 * * EnhancedGenerator<T>.map<R>(fn: T => R) => Generator<R>
 * @packageDocumentation
 * @module Generators
 * @preferred
 */

/*
// Exceeds tsc's stack. I can't see how it differs from ArrayGen?
export type FlatGen<Arr, Depth extends number> = {
    "done": Arr,
    "recur": Arr extends Genable<infer InnerArr>
        ? FlatGen<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
        : Arr
}[Depth extends -1 ? "done" : "recur"];
*/

import {isFunction} from "./utils";

/**
 * Sync/Async type selector
 */
export type Sync = 'sync';
/**
 * Sync/Async type selector
 */
export type Async = 'async';
/**
 * Sync/Async type selector
 */
export type SyncType = Sync | Async;

/**
 * @internal
 */
export type FlatGen<A, D> = any;

/**
 * Returns the union of the element types of a tuple of generators.
 * @typeParam Arr a tuple type of Genable's.
 */
export type GenUnion<Arr> =
    Arr extends [] ? Arr : Arr extends Array<infer E> ? E extends Genable<infer E2> ? E2 : never : never;

// noinspection JSUnusedGlobalSymbols
/**
 * Returns the element type of a [[Genable]]
 * @typeParam T the value type produced by the [[Genable]]
 */
export type GenType<G, S extends SyncType> = G extends Genable<infer T, S> ? T : never;

/**
 * Any `Generator`, `Iterator`, or `Iterable`, which can be coerced to a
 * [[EnhancedGenerator]].
 *
 * @typeParam T the value type produced by the [[Genable]]
 */
export type Genable<T, S extends SyncType = Sync> =
    {
        sync: Generator<T> | Iterator<T> | Iterable<T> | Enhancements<T, any, unknown, S>;
        async: AsyncGenerator<T> | AsyncIterator<T> | AsyncIterable<T> | Enhancements<T, any, unknown, S> | Genable<T, Sync>;
    }[S];

/**
 * A `Promise`, unless already promisified.
 */
type GenPromise<T> = globalThis.Promise<T extends PromiseLike<infer X> ? X : T>;

/**
 * A value in the [[Sync]] case, or a promise of a value in the [[Async]] case.
 */
type ReturnValue<T, S extends SyncType> = {
    sync: T;
    async: GenPromise<T>;
}[S];

type PromiseType<T> = T extends PromiseLike<infer R> ? R : T;

/**
 * A value, or in the [[Async]] case, optionally a `Promise<T>` of the value.
 */
type Value<T, S extends SyncType> = ReturnValue<T, S> | PromiseType<T>;

/**
 * Any `Generator`, `Iterator`, or `Iterable`, which can be coerced to a
 * [[EnhancedGenerator]].
 *
 * @typeParam T the value type produced by the [[Genable]]
 */
export type AsyncGenable<T> = Genable<T, Async>;

/**
 * A function which can be supplied to a reduce method.
 *
 * For the case where an init value of type A will be supplied, use:
 * * [[Reducer|Reducer\\<A, T, A>]]
 *
 * For the case where no init value will be supplied, use:
 * * [[Reducer|Reducer\\<A, T, T>]]
 *
 * For cases where an init value may or may not be supplied:
 * * [[Reducer|Reducer\\<A, T>]] (equivalent to [[Reducer|Reducer\<T, A, A|T>]]).
 *
 * For cases where **A** = **T** (for example, reducing a set of numbers to a number):
 * * [[Reducer|Reducer\\<A>]]
 *
 * @typeParam A The accumulated result.
 * @typeParam T The individual element values supplied to be reduced.
 * @typeParam Init the initial value for the reducer. If no init value is supplied, the first call will be **T**; otherwise it will be **A**.
 * @typeParam S either Sync or Async.
 */
export type Reducer<A, T, Init = A | T, S extends SyncType = Sync> = {
    sync: (acc: Init | A, v: T) => A;
    async: (acc: Init | A, v: T) => A | PromiseLike<A>;
}[S];

/**
 * A predicate which can be applied to elements of an iteration.
 * @param v the element
 * @param idx the sequential index
 * @typeParam T the type of the elements.
 * @typeParam R the return type.
 */
type IndexedFn<T, R = void, S extends SyncType = Sync> =
    {
        sync: (v: T, idx: number) => R;
        async: (v: T, idx: number) => PromiseLike<R> | R;
    }[S];

/**
 * A predicate which can be applied to elements of an iteration, possibly returning a `Promise`.
 * @param v the element
 * @param idx the sequential index
 * @typeParam T the type of the elements.
 * @typeParam R the return type.
 */
type AsyncIndexedFn<T, R = void> = IndexedFn<T, R, Async>;

/**
 * A predicate which can be applied to elements of an iteration.
 * @param v the element
 * @param idx the sequential index
 * @typeParam T the type of the elements.
 */
type IndexedPredicate<T, S extends SyncType = Sync> = IndexedFn<T, boolean, S>;

/**
 * Unwrap an array of Genables
 * @typeParam B the type to be unwrapped.
 * @internal
 */
type UnwrapGen<S extends SyncType, B extends Array<Genable<any, S>>> = { [K in (keyof B) & number]: B[K] extends Genable<infer T, S> ? T : never; };

export interface GeneratorOps<S extends SyncType> {
    /**
     * Return a generator that provides the supplied values.
     * @param values
     */
    of<T>(...values: T[]): Enhanced<T, S>;

    asArray<T>(gen: Genable<T, S>): ReturnValue<T[], S>;

    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     * @param gen
     */
    limit<T>(max: number, gen: Genable<T, S>): Enhanced<T, S>;

    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     */
    limit(max: number): GenOp<S>;


    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T, void, S>, thisArg: any, gen: Genable<T, S>): GenVoid<S>;

    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T, void, S>, gen: Genable<T, S>): GenVoid<S>;

    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T, void, S>, thisArg?: any): (gen: Genable<T, S>) => GenVoid<S>;

    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T, void, S>): (gen: Genable<T, S>, thisArg?: any) => GenVoid<S>;

    /**
     * Accepts a function from `T` to `V, and returns a function that adapts a `Generator<T>`
     * (or any [Genable|Genable\\<T>]) to an enhanced `Generator<V>`. Each yielded value V is
     * the result of applying the function `f` to to a value yielded by the `Generator<T>`.
     *
     * In the async case, `f` may also return `Promise<T>`.
     *
     * @param f a function from `V` to `T`
     * @typeParam T the type of value yielded by the supplied generator.
     * @typeParam V the type of value yielded by the resulting generator.
     */
    map<T, V>(f: IndexedFn<T, V, S>): GenOpValue<S, T, [any?], Enhanced<V, S>>;

    /**
     * Accepts a function from `T` to `V, and returns a function that adapts a `Generator<T>`
     * (or any [Genable|Genable\\<T>]) to an enhanced `Generator<V>`. Each yielded value V is
     * the result of applying the function `f` to to a value yielded by the `Generator<T>`.
     *
     * In the async case, `f` may also return `Promise<T>`.
     *
     * @param f
     * @param thisArg supplied as 'this' for each invocation of `f`.
     * @typeParam T the type of value produced by the generator.
     * @typeParam V the type of value yielded by the resulting generator.
     */
    map<T, V>(f: IndexedFn<T, V, S>, thisArg?: any): GenOpValue<S, T, [], Enhanced<V, S>>;

    /**
     * Accepts a function from `T` to `V, and a `Generator<T>`
     * (or any [Genable|Genable\\<T>]) and returns an enhanced `Generator<V>`.
     *
     * Each yielded value V is
     * the result of applying the function `f` to to a value yielded by the `Generator<T>`.
     *
     * In the async case, `f` may also return `Promise<T>`.
     *
     * @param f
     * @param gen the [[Genable]] whose yielded values we are mapping over.
     * @typeParam T the type of value produced by the generator.
     * @typeParam V the type of value yielded by the resulting generator.
     */
    map<T, V>(f: IndexedFn<T, V, S>, gen: Genable<T, S>): Enhanced<V, S>;

    /**
     * Accepts a function from `T` to `V, and a `Generator<T>`
     * (or any [Genable|Genable\\<T>]) and returns an enhanced `Generator<V>`.
     *
     * Each yielded value V is
     * the result of applying the function `f` to to a value yielded by the `Generator<T>`.
     *
     * In the async case, `f` may also return `Promise<T>`.
     *
     * @param f
     * @param thisArg supplied as 'this' for each invocation of `f`.
     * @param gen the [[Genable]] whose yielded values we are mapping over.
     * @typeParam T the type of value produced by the generator.
     * @typeParam V the type of value yielded by the resulting generator.
     */
    map<T, V>(f: IndexedFn<T, V, S>, thisArg: any, gen: Genable<T, S>): Enhanced<V, S>;


    /**
     * Return a functionthat filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, S>): GenOpValue<S, T, [any?], Enhanced<T, S>>;


    /**
     * Return a functionthat filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, S>, thisArg: any): GenOpValue<S, T, [], Enhanced<T, S>>;

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, S>, iter: Genable<T, S>): Enhanced<T, S>;

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, S>, thisArg: any, iter: Genable<T, S>): Enhanced<T, S>;

    filter<T>(f: IndexedPredicate<T, S>, thisArg?: any, iter?: Genable<T, S>): Enhanced<T, S>;


    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     */
    flat<T, D extends number = 1>(depth: D): <X>(gen: Genable<X, S>) => Enhanced<FlatGen<X, D>, S>;

    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     * @param gen
     */
    flat<T, D extends number = 1>(depth: D, gen: Genable<T, S>): Enhanced<FlatGen<T, D>, S>;

    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param gen
     * @param depth default = 1
     */
    flat<T, D extends number = 1>(gen: Genable<T, S>, depth?: D): Enhanced<FlatGen<T, D>, S>;

    flat<T, D extends number = 1>(depth: D | Genable<T, S>, gen?: Genable<T, S> | D):
        Enhanced<FlatGen<T, D>, S>
        | (<X>(gen: Genable<X, S>) => Enhanced<S, FlatGen<X, D>>)
        | (<X>(gen: Genable<X, S>, thisObj: any) => Enhanced<S, FlatGen<X, D>>);


    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, S>, depth: D): (gen: Genable<T, S>) => Enhanced<FlatGen<R, D>, S>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, S>): (gen: Genable<T, S>, depth?: D) => Enhanced<FlatGen<R, D>, S>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, S>, gen: Genable<T, S>): Enhanced<FlatGen<R, D>, S>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, S>, depth: D, gen: Genable<T, S>): Enhanced<FlatGen<R, D>, S>;

    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, S>, depthOrGen?: D | Genable<T, S>, gen?: Genable<T, S>):
        Enhanced<FlatGen<R, D>, S>
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, S>) => Enhanced<Y, S>)
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, S>, depth?: D) => Enhanced<Y, S>);

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    slice<T>(start: number, end: number): <X>(iter: Genable<X, S>) => Enhanced<X, S>;

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     * @param iter
     */
    slice<T>(start: number, end: number, iter: Genable<T, S>): Enhanced<T, S>;

    slice<T>(start: number, end: number, iter?: Genable<T, S>):
        Enhanced<T, S>
        | (<X>(gen: Genable<X, S>) => Enhanced<X, S>);

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [[Genable]] to provide values.
     */
    concat<T extends Genable<any, S>[]>(...gens: T): Enhanced<GenUnion<T>, S>;


    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, T, S>, gen: Genable<T, S>): ReturnValue<A, S>;

    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * **Array.prototype.reduce**. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, T, S>): (gen: Genable<T, S>) => ReturnValue<A, S>;

    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, A, S>): (init: A, gen: Genable<T, S>) => ReturnValue<A, S>;

    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param init
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, A, S>, init: A, gen: Genable<T, S>): ReturnValue<A, S>;

    /**
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * Alternatively, the init value can be supplied along with the generator as a second argument.
     * @param f
     * @param init
     */
    reduce<A, T>(f: Reducer<A, T, A>, init: A): (gen: Genable<T, S>) => ReturnValue<A, S>;

    reduce<A, T>(
        f: Reducer<A, T, A | T, S>,
        initOrGen?: Value<A, S> | Genable<T, S>,
        gen?: Genable<T, S>
    ): Value<A, S>
        | ((gen: Genable<T, S>) => Value<A, S>)
        | ((f: (acc: A, v: T) => Value<A, S>, init: A) => Value<A, S>)
        | ((f: (acc: A | T, v: T) => Value<A, S>) => Value<A, S>);


    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    some<T>(p: IndexedPredicate<T, S>, thisArg?: any): (gen: Genable<T, S>) => ReturnValue<boolean, S>;

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     */
    some<T>(p: IndexedPredicate<T, S>): (gen: Genable<T, S>, thisArg?: any) => ReturnValue<boolean, S>;

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    some<T>(p: IndexedPredicate<T, S>, gen: Genable<T, S>): ReturnValue<boolean, S>;

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    some<T>(p: IndexedPredicate<T, S>, thisArg: any, gen: Genable<T, S>): ReturnValue<boolean, S>;

    some<T>(
        pred: IndexedPredicate<T, S>,
        thisOrGen?: any | Genable<T, S>,
        gen?: Genable<T, S>
    ): ReturnValue<boolean, S> | ((gen: Genable<T, S>) => ReturnValue<boolean, S>);

    /**
     * Returns `false` and terminates the generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    every<T>(p: IndexedPredicate<T, S>, thisArg?: any): (gen: Genable<T, S>) => ReturnValue<boolean, S>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     */
    every<T>(p: IndexedPredicate<T, S>): (gen: Genable<T, S>, thisArg?: any) => ReturnValue<boolean, S>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, S>, gen: Genable<T, S>): ReturnValue<boolean, S>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, S>, thisArg: any, gen: Genable<T, S>): ReturnValue<boolean, S>;

    every<T>(
        pred: IndexedPredicate<T, S>,
        genOrThis?: any | Genable<T, S>,
        gen?: Genable<T, S>
    ): ReturnValue<boolean, S> | ((gen: Genable<T, S>) => ReturnValue<boolean, S>);

    /**
     * Returns a new generator that repeats the last value returned by **gen** (or `undefined` if **gen**
     * did not return any values).
     *
     * @param gen
     * @param max
     */
    repeatLast<T>(gen: Genable<T, S>, max: number): Enhanced<T | undefined, S>;


    /**
     * Returns a new generator that repeats the supplied value.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    repeat<T>(value: T, repetitions: number): Enhanced<T, S>;

    /**
     * Combines generators, returning a generator that produces a tuple with each of their results.
     *
     * Terminates when the first generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */
    zip<G extends (Genable<any, S>)[]>(...gens: G): Enhanced<UnwrapGen<S, G>, S>;

    /**
     * Returns a function that joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param sep (default = ',')
     */
    join(sep: string): <T>(gen: Genable<T, S>) => ReturnValue<string, S>;

    /**
     * Joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param gen
     * @param sep
     */
    join<T>(gen: Genable<T, S>, sep?: string): ReturnValue<string, S>;
    join<T>(genOrSeparator: Genable<T, S>|string, sep?: string): ReturnValue<string, S> | (<X>(gen: Genable<X>) => ReturnValue<string, S>);
//
    enhance<T>(gen: Genable<T, S>): Enhanced<T, S>;
}

/**
 * An enhanced `Generator`
 * @typeParam T The value type yielded by the `Generator`.
 * @typeParam S Selects for Sync or Async operation.
 */
export type Enhanced<T, S extends SyncType, TReturn = any, TNext = unknown> = {
    sync: EnhancedGenerator<T, TReturn, TNext>;
    async: EnhancedAsyncGenerator<T, TReturn, TNext>;
}[S];

/**
 * An operator that takes a [[Genable]], optionals, and returns an [[Enhanced]]
 * with a free type parameter T for the element type of the [[Genable]].
 *
 * This is used for signatures that take some parameters
 * and return a function that is not constrained as to element type.
 * @typeParam S Selects for Sync or Async operation
 * @typeParam Optional An array of types with any additional arguments after the [[Genable]]
 */
type GenOp<S extends SyncType, Optional extends any[] = []> =
    <T>(gen: Genable<T, S>, ...rest: Optional) => Enhanced<T, S>;

/**
 * An operator that takes a [[Genable]], optionals, and returns a relate type,
 * often an [[Enhanced]].
 * @typeParam S Selects for Sync or Async operation
 * @typeParam T the element type of the [[Genable]]
 * @typeParam Optional an array of types with any additional arguments after the [[Genable]]
 * @typeParam R the return type; defaults to [[Enhanced|Enhanced\\<T, S>]].
 */
type GenOpValue<S extends SyncType, T, Optional extends any[] = [], R = Enhanced<T, S>> =
    (gen: Genable<T, S>, ...rest: Optional) => R;

type GenIteratorResult<T, TReturn, S extends SyncType> =
    {
        sync: IteratorResult<T, TReturn>;
        async: Promise<IteratorResult<T, TReturn>>;
    }[S];

type GenVoid<S extends SyncType> = {
    sync: void;
    async: Promise<void>;
}[S];

type UnwrapArray<T> = T extends Array<infer E> ? E : never;

class Sync_ implements GeneratorOps<Sync> {
    /**
     * Return a generator that yields the supplied values.
     * @param values
     */
    of<T extends any[]>(...values: T) : Enhanced<UnwrapArray<T>, Sync> {
        return this.enhance(values);
    }
    /**
     * Return all of the values from this generator as an array. You do not want to call this on an
     * infinite generator (for obvious reasons); consider using [[EnhancedGenerator.slice]] or
     * [[EnhancedGenerator.limit]] to limit the size before calling this.
     */
    asArray<T, G extends Genable<any>>(gen: G): T[] {
        return [...toIterable(gen)];
    };

    limit<T>(max: number, gen: Genable<T>): Enhanced<T, Sync>;
    limit(max: number): GenOp<Sync>;
    limit<T>(max: number, gen?: Genable<T>): Enhanced<T, Sync> | GenOp<Sync> {
        let self: EnhancedGenerator<T>;
        function *limit<X>(gen: Iterator<X>) {
            let nr = undefined;
            let limited: boolean = false;
            try {
                for (let i = 0; i < max; i++) {
                    const r = gen.next(nr);
                    if (r.done) {
                        return r.value;
                    }
                    try {
                        nr = yield r.value;
                    } catch (e) {
                        gen.throw?.(e);
                    }
                }
                limited = true;
                const err = new RangeError(`Generator produced excessive values > ${max}.`);
                gen.throw?.(err);
                throw err;
            } finally {
                if (!limited) {
                    gen.return?.(self.returning);
                    // Even if the supplied generator refuses to terminate, we terminate.
                }
            }
        }
        if (gen) {
            return self = this.enhance(limit(toIterator(gen)));
        }
        return <X>(gen: Genable<X>) => this.enhance(limit(toIterator(gen)));
    }

    forEach<T>(f: IndexedFn<T>, thisArg: any, gen: Genable<T>): void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T>, gen: Genable<T>): void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T>, thisArg?: any): (gen: Genable<T>) => void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: IndexedFn<T>): (gen: Genable<T>, thisArg?: any) => void;
    forEach<T>(f: IndexedFn<T>, thisArgOrGen?: Genable<T>|any, gen?: Genable<T>) {
        const forEach = (f: IndexedFn<T>, thisArg: any, gen: Genable<T>) => {
            const it = toIterator(gen);
            let idx = 0;
            while (true) {
                const r = it.next();
                if (r.done) return r.value;
                f.call(thisArg, r.value, idx++);
            }
        };
        if (gen) return forEach(f, thisArgOrGen, gen);
        if (isGenable<T>(thisArgOrGen)) return forEach(f, undefined, thisArgOrGen);
        return (gen: Genable<T, Sync>, thisArg?: any) => forEach(f, thisArg ?? thisArgOrGen, gen);
    }


    map<T, V>(f: IndexedFn<T, V>): GenOpValue<Sync, T, [any?], Enhanced<V, Sync>>;
    map<T, V>(f: IndexedFn<T, V>, thisArg?: any): GenOpValue<Sync, T, [], Enhanced<V, Sync>>;
    map<T, V>(f: IndexedFn<T, V>, gen: Genable<T>): Enhanced<V, Sync>;
    map<T, V>(f: IndexedFn<T, V>, thisArg: any, gen: Genable<T>): Enhanced<V, Sync>;
    map<T, V>(f: IndexedFn<T, V>, thisArg?: any | Genable<T>, iter?: Genable<T>):
        EnhancedGenerator<V>
        | ((gen: Genable<T>) => EnhancedGenerator<V>)
        | ((gen: Genable<T>, thisArg?: any) => EnhancedGenerator<V>)
    {
        const map = (thisArg: any, iter: Genable<T>) => {
            const gen = toGenerator(iter);
            let self: EnhancedGenerator<V>;
            function* map(): Generator<V> {
                let nr = undefined;
                let idx = 0;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = gen.next(nr);
                                if (r.done) return r.value;
                                const v: V = f.call(thisArg, r.value, idx++);
                                try {
                                    nr = yield v;
                                } catch (e) {
                                    gen.throw(e);
                                }
                            }
                        } finally {
                            const x = gen.return(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (!x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return self = this.enhance(map());
        };
        if (iter) return map(thisArg, iter);
        if (isGenable<T>(thisArg)) return map(undefined, thisArg);
        return (gen: Genable<T>, genThisArg?: any) => map(genThisArg ?? thisArg, gen);
    }


    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Sync>): GenOpValue<Sync, T, [any?], Enhanced<T, Sync>>;

    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Sync>, thisArg: any): GenOpValue<Sync, T, [], Enhanced<T, Sync>>;

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Sync>, iter: Genable<T, Sync>): Enhanced<T, Sync>;
    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Sync>, thisArg: any, iter: Genable<T, Sync>): Enhanced<T, Sync>;

    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter the [[Genable]] to filter.
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Sync>, thisArg?: any | Genable<T, Sync>, iter?: Genable<T, Sync>):
        Enhanced<T, Sync>
        | GenOpValue<Sync, T, [], Enhanced<T, Sync>>
        | GenOpValue<Sync, T, [any?], Enhanced<T, Sync>>
    {
        const filter = (thisArg: any, iter: Genable<T, Sync>) => {
            const gen = toGenerator(iter);
            let self: EnhancedGenerator<T, Sync>;
            function* filter<V>(f: IndexedPredicate<T, Sync>): Generator<T> {
                let nr: any = undefined;
                let idx = 0;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = gen.next(nr);
                                if (r.done) return r.value;
                                if (f.call(thisArg, r.value, idx++)) {
                                    try {
                                        nr = yield r.value;
                                    } catch (e) {
                                        gen.throw(e);
                                    }
                                }
                            }
                        } finally {
                            const x = gen.return?.(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (!x?.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return self = this.enhance(filter(f));
        };

        if (iter) return filter(thisArg, iter);
        if (isGenable<T>(thisArg)) return filter(undefined, thisArg);
        return (gen: Genable<T, Sync>, genThisArg?: any) => filter(genThisArg ?? thisArg, gen);
    }

    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     */
    flat<T, D extends number = 1>(depth: D): <X>(gen: Genable<X>) => Enhanced<Sync, FlatGen<X, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     * @param gen
     */
    flat<T, D extends number = 1>(depth: D, gen: Genable<T>): Enhanced<Sync, FlatGen<T, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param gen
     * @param depth default = 1
     */
    flat<T, D extends number = 1>(gen: Genable<T>, depth?: D): Enhanced<Sync, FlatGen<T, D>>;
    flat<T, D extends number = 1>(depth: D|Genable<T>, gen?: Genable<T> | D):
        Enhanced<Sync, FlatGen<T, D>>
        | (<X>(gen: Genable<X>) => Enhanced<Sync, FlatGen<X, D>>)
    {
        const flat = <X>(depth: D, gen: Genable<X, Sync>) => {
            let self: EnhancedGenerator<FlatGen<X, D>>;
            const gens = new Set<Generator>();
            if (isGenerator(gen)) gens.add(gen);

            function* flat<D extends number>(it: Iterator<unknown>, depth: D): Generator<FlatGen<X, D>> {
                let nr: any = undefined;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = it.next(nr);
                                if (r.done) return r.value;
                                const v = r.value;
                                if (isGenerator(v)) {
                                    gens.add(v);
                                }
                                try {
                                    if (depth > 0 && isIterator(v)) {
                                        yield* flat(v, depth - 1);
                                    } else if (depth > 0 && isIterable(v)) {
                                        yield* flat(toIterator(v), depth - 1)
                                    } else {
                                        nr = yield r.value as FlatGen<T, D>;
                                    }
                                } catch (e) {
                                    it.throw?.(e);
                                }
                            }
                        } finally {
                            const x = it.return?.(self.returning);
                            if (isGenerator(it)) gens.delete(it);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                            for (const g of gens) {
                                g.return(self.returning);
                            }
                        }
                    }
                }
            }

            return self = this.enhance(flat(toIterator(gen), depth));
        }
        if (typeof depth === 'number') {
            if (gen) {
                if (isGenable(gen)) {
                    return flat(depth, gen);
                } else {
                    throw new TypeError(`Invalid Genable: ${gen}`);
                }
            }
            return <X>(gen: Genable<X, Sync>) => flat(depth, gen);
        } else if (isGenable(depth)) {
            return flat((gen ?? 1) as D, depth);
        }
        throw new TypeError(`Illegal arguments to flat()`);
    }

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Sync>, depth: D): (gen: Genable<T, Sync>) => Enhanced<FlatGen<R, D>, Sync>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Sync>): (gen: Genable<T, Sync>, depth?: D) => Enhanced<FlatGen<R, D>, Sync>;
    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Sync>, gen: Genable<T, Sync>): Enhanced<FlatGen<R, D>, Sync>;
    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Sync>, depth: D, gen: Genable<T, Sync>): Enhanced<FlatGen<R, D>, Sync>;
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Sync>, depthOrGen?: D | Genable<T, Sync>, gen?: Genable<T, Sync>):
        Enhanced<FlatGen<R, D>, Sync>
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, Sync>) => Enhanced<Y, Sync>)
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, Sync>, depth?: D) => Enhanced<Y, Sync>)
    {
        const flatMap = <X>(depth: D, gen: Genable<X, Sync>) => {
            let self: Enhanced<FlatGen<X, D>, Sync>;
            let idx = 0;

            function* flatMap<D extends number>(it: Iterator<unknown>, depth: D): Generator<FlatGen<X, D>, undefined, unknown | undefined> {
                let nr: any = undefined;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = it.next(nr as undefined);
                                if (r.done) return r.value;
                                const v = f(r.value as FlatGen<T, D>, idx++);
                                try {
                                    if (isIterator(v)) {
                                        if (depth > 1) {
                                            yield* flatMap(v, depth - 1);
                                        } else if (depth === 1) {
                                            yield* toGenerator(v);
                                        } else {
                                            yield v;
                                        }
                                    } else if (isIterable(v)) {
                                        if (depth > 1) {
                                            yield* flatMap(toIterator(v), depth - 1);
                                        } else if (depth === 1) {
                                            yield* toGenerator(v);
                                        } else {
                                            yield v;
                                        }
                                    } else {
                                        nr = yield v;
                                    }
                                } catch (e) {
                                    it.throw?.(e);
                                }
                            }
                        } finally {
                            const x = it.return?.(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }

            return self = this.enhance(flatMap(toIterator(gen), depth));
        }

        if (isGenable(gen)) {
            return flatMap(depthOrGen as D ?? 1 as D, gen);
        } else if (isGenable( depthOrGen)) {
            return flatMap(1 as D, depthOrGen);
        }
        return <X>(gen: Genable<X, Sync>, depth?: D) => flatMap(depthOrGen ?? depth ?? 1 as D, gen);
    }

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    slice<T>(start: number, end: number): <X>(iter: Genable<X, Sync>) => Enhanced<X, Sync>;
    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     * @param iter
     */
    slice<T>(start: number, end: number, iter: Genable<T, Sync>): Enhanced<T, Sync>;
    slice<T>(start: number, end: number, iter?: Genable<T, Sync>):
        Enhanced<T, Sync>
        | (<X>(gen: Genable<X, Sync>) => Enhanced<X, Sync>)
    {
        const slice = <X>(iter: Genable<X, Sync>) => {
            const it = toIterator(iter);
            function* slice(start: number, end: number) {
                for (let i = 0; i < start; i++) {
                    const r = it.next();
                    if (r.done) return r.value;
                }
                if (end === Number.POSITIVE_INFINITY) {
                    yield* toIterable(it);
                } else {
                    let nv = undefined;
                    while (true) {
                        try {
                            for (let i = start; i < end; i++) {
                                const r = it.next(nv);
                                if (r.done) return r.value;
                                try {
                                    nv = yield r.value;
                                } catch (e) {
                                    const re = it.throw?.(e);
                                    if (re) {
                                        if (re.done) return re.value;
                                        nv = yield re.value;
                                    }
                                }
                            }
                        } finally {
                            const x = it.return?.(null);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return this.enhance(slice(start, end));
        };
        if (!iter) return slice;
        return slice(iter);
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [[Genable]] to provide values.
     */
    concat<T extends Genable<any, Sync>[]>(...gens: T): Enhanced<GenUnion<T>, Sync> {
        let self: Enhanced<GenUnion<T>, Sync>;
        function* concat() {
            let i = 0;
            try {
                for (; i < gens.length; i++) {
                    yield* toIterable(gens[i]);
                }
            } finally {
                // Terminate any remaining generators.
                for (; i < gens.length; i++) {
                    const g = gens[i];
                    if (isGenerator(g)) {
                        g.return(self.returning);
                    }
                }
            }
        }

        return self = Sync.enhance(concat());
    }


    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, T, Sync>, gen: Genable<T, Sync>): A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * **Array.prototype.reduce**. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, T, Sync>): (gen: Genable<T, Sync>) => A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, A, Sync>): (init: A, gen: Genable<T, Sync>) => A;
    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param init
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, A, Sync>, init: A, gen: Genable<T, Sync>): A;
    /**
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * Alternatively, the init value can be supplied along with the generator as a second argument.
     * @param f
     * @param init
     */
    reduce<A, T>(f: Reducer<A, T, A, Sync>, init: A): (gen: Genable<T, Sync>) => A;
    reduce<A, T>(
        f: Reducer<A, T, A | T, Sync>,
        initOrGen?: A | Genable<T, Sync>,
        gen?: Genable<T, Sync>
    ): A
        | ((gen: Genable<T, Sync>) => A)
        | ((f: (acc: A, v: T) => A, init: A) => A)
        | ((f: (acc: A | T, v: T) => A) => A)
    {

        const reduce = (init: A | undefined, it: Iterator<T>): A => {
            let acc: A | T | undefined = init;
            if (acc === undefined) {
                const r = it.next();
                if (r.done) throw new TypeError(`No initial value in reduce`);
                acc = r.value;
            }
            while (true) {
                const r = it.next();
                if (r.done) return acc as A;
                acc = f(acc, r.value);
            }
        };
        if (isGenable(gen)) {
            return reduce(initOrGen as A, toIterator(gen));
        } else if (isGenable(initOrGen)) {
            return reduce(undefined, toIterator(initOrGen));
        }
        return (gen: Genable<T, Sync>, init?: A) => reduce(init ?? initOrGen, toIterator(gen));
    }

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
     some<T>(p: IndexedPredicate<T, Sync>, thisArg?: any): (gen: Genable<T, Sync>) => ReturnValue<boolean, Sync>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     */
     some<T>(p: IndexedPredicate<T, Sync>): (gen: Genable<T, Sync>, thisArg?: any) => ReturnValue<boolean, Sync>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
     some<T>(p: IndexedPredicate<T, Sync>, gen: Genable<T, Sync>): ReturnValue<boolean, Sync>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
     some<T>(p: IndexedPredicate<T, Sync>, thisArg: any, gen: Genable<T, Sync>): ReturnValue<boolean, Sync>;
     some<T>(
        pred: IndexedPredicate<T, Sync>,
        thisOrGen?: any | Genable<T, Sync>,
        gen?: Genable<T>
    ): ReturnValue<boolean, Sync> | ((gen: Genable<T, Sync>) => ReturnValue<boolean, Sync>)
    {
        const some = (thisArg: any, it: Iterator<T>): boolean => {
            let i = 0;
            while (true) {
                const r = it.next();
                if (r.done) return false;
                if (pred.call(thisArg, r.value, i++)) return true;
            }
        };
        if (isGenable(gen)) {
            return some(thisOrGen, toIterator(gen));
        } else if (isGenable(gen)) {
            return (gen: Genable<T, Sync>, thisArg?: any) =>
                some(thisArg ?? thisOrGen, toIterator(gen));
        }
        throw new Error(`Invalid argument to some: ${gen ?? thisOrGen}`);
    }

    /**
     * Returns `false` and terminates the generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    every<T>(p: IndexedPredicate<T, Sync>, thisArg?: any): (gen: Genable<T, Sync>) => ReturnValue<boolean, Sync>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     */
    every<T>(p: IndexedPredicate<T, Sync>): (gen: Genable<T, Sync>, thisArg?: any) => ReturnValue<boolean, Sync>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, Sync>, gen: Genable<T, Sync>): ReturnValue<boolean, Sync>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, Sync>, thisArg: any, gen: Genable<T, Sync>): ReturnValue<boolean, Sync>;
    every<T>(
        pred: IndexedPredicate<T, Sync>,
        genOrThis?: any | Genable<T, Sync>,
        gen?: Genable<T, Sync>
    ): ReturnValue<boolean, Sync> | ((gen: Genable<T, Sync>) => ReturnValue<boolean, Sync>)
    {
        const every = (thisArg: any, it: Iterator<T>): boolean => {
            let i = 0;
            while (true) {
                const r = it.next();
                if (r.done) return true;
                if (!pred.call(thisArg, r.value, i++)) return false;
            }
        };
        if (isGenable(gen)) {
            return every(genOrThis, toIterator(gen));
        } else if (isGenable(gen)) {
            return (gen: Genable<T, Sync>, thisArg?: any) =>
                every(thisArg ?? genOrThis, toIterator(gen));
        }
        throw new Error(`Invalid argument to every: ${gen ?? genOrThis}`);
    }


    /**
     * Returns a new generator that repeats the last value returned by **gen** (or `undefined` if **gen**
     * did not return any values).
     *
     * @param gen
     * @param max
     */
    repeatLast<T>(gen: Genable<T, Sync>, max: number = Number.POSITIVE_INFINITY): Enhanced<T | undefined, Sync> {
        const it = toIterator(gen);
        let nr: any;
        let self: EnhancedGenerator<T | undefined>;

        function* repeatLast() {
            try {
                let last = undefined
                while (true) {
                    const r = it.next(nr)
                    if (r.done) break;
                    try {
                        nr = yield last = r.value;
                    } catch (e) {
                        const re = it.throw?.(e);
                        if (re) {
                            if (re.done) break;
                            yield last = re.value;
                        }
                    }
                }
                for (let i = 0; i < max; i++) {
                    yield last;
                }
            } finally {
                it.return?.(self.returning);
            }
        }

        return self = this.enhance(repeatLast());
    }


    /**
     * Returns a new generator that repeats the supplied value.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    repeat<T>(value: T, repetitions: number = Number.POSITIVE_INFINITY): Enhanced<T, Sync> {
        function* repeat() {
            for (let i = 0; i < repetitions; i++) {
                yield value;
            }
        }

        return this.enhance(repeat());
    }

    /**
     * Combines generators, returning a generator that produces a tuple with each of their results.
     *
     * Terminates when the first generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */

    zip<G extends (Genable<any, Sync>)[]>(...gens: G) {
        if (gens.length === 0) return this.enhance([]);
        const its = gens.map(toIterator);
        let done = false;
        let self: Enhanced<UnwrapGen<Sync, G>, Sync>;

        function* zip2(): Generator<UnwrapGen<Sync, G>> {
            try {
                while (true) {
                    let result: UnwrapGen<Sync, G> = [] as unknown as UnwrapGen<Sync, G>;
                    for (const g of its) {
                        const r = g.next();
                        if (r.done) {
                            done = true;
                            return r.value;
                        }
                        (result as any[]).push(r.value);
                    }
                    try {
                        yield result;
                    } catch (e) {
                        for (const g of gens) {
                            try {
                                // Weird need for a typecast here.
                                (g as any).throw?.(e);
                            } catch {
                                // Ignore
                            }
                        }
                        throw e;
                    }
                }
            } finally {
                if (!done) {
                    for (const g of gens) {
                        try {
                            // Weird need for a typecast here.
                            (g as any).return?.(self.returning);
                        } catch {
                            // Ignore
                        }
                    }
                }
            }
        }

        return self = this.enhance(zip2());
    }


    /**
     * Returns a function that joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param sep (default = ',')
     */
    join(sep: string): <T>(gen: Genable<T, Sync>) => ReturnValue<string, Sync>;

    /**
     * Joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param gen
     * @param sep
     */
    join<T>(gen: Genable<T, Sync>, sep?: string): ReturnValue<string, Sync>;
    join<T>(genOrSeparator: Genable<T, Sync>|string, sep?: string): string | (<X>(gen: Genable<X, Sync>) => string) {
        if (typeof genOrSeparator === 'string') {
            sep = genOrSeparator;
            return <X>(gen: Genable<X, Sync>) => this.join(gen, sep);
        }
        return [...toIterable(genOrSeparator)].join(sep);
    }

    /**
     * Enhance an existing generator (or iterator or iterable) to be a EnhancedGenerator.
     * @param gen
     */
    enhance<T, R = any, N = undefined>(gen: Genable<T, Sync>): EnhancedGenerator<T, R, N> {
        const gen2 = toGenerator(gen) as Partial<EnhancedGenerator<T, R, N>>;
        const old = Object.getPrototypeOf(gen2);
        const proto = Object.create(EnhancedGenerator.prototype);
        proto.return = (v: any) => (gen2.returning = v, old.return.call(gen2, v));
        Object.setPrototypeOf(gen2, EnhancedGenerator.prototype);
        return gen2 as EnhancedGenerator<T, R, N>;
    }
}

class Async_ implements GeneratorOps<Async> {
    /**
     * Return a generator that yields the supplied values.
     * @param values
     */
    of<T extends any[]>(...values: T) : Enhanced<UnwrapArray<T>, Async> {
        return this.enhance(values);
    }

    async asArray<T>(gen: AsyncGenable<T>): Promise<T[]> {
        const it = toAsyncIterator(gen);
        const result = []
        while (true) {
            const r = await it.next();
            if (r.done) {
                return result;
            }
            result.push(r.value);
        }
    }

    limit<T>(max: number, gen: AsyncGenable<T>): Enhanced<T, Async>;
    limit(max: number): GenOp<Async>;
    limit<T>(max: number, gen?: AsyncGenable<T>): Enhanced<T, Async> | GenOp<Async> {
        let self: EnhancedAsyncGenerator<T>;
        async function *limit<X>(gen: AsyncIterator<X>) {
            let nr = undefined;
            let limited: boolean = false;
            try {
                for (let i = 0; i < max; i++) {
                    const r: any = await gen.next(nr);
                    if (r.done) {
                        return r.value;
                    }
                    try {
                        nr = yield r.value;
                    } catch (e) {
                        await gen.throw?.(e);
                    }
                }
                limited = true;
                const err = new RangeError(`Generator produced excessive values > ${max}.`);
                await gen.throw?.(err);
                throw err;
            } finally {
                if (!limited) {
                    await gen.return?.(self.returning);
                    // Even if the supplied generator refuses to terminate, we terminate.
                }
            }
        }
        if (gen) {
            return self = this.enhance(limit(toAsyncIterator(gen)));
        }
        return <X>(gen: AsyncGenable<X>) => this.enhance(limit(toAsyncIterator(gen)));
    }

    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: AsyncIndexedFn<T>, thisArg: any, gen: AsyncGenable<T>): Promise<void>;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: AsyncIndexedFn<T>, gen: AsyncGenable<T>): Promise<void>;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: AsyncIndexedFn<T>, thisArg?: any): (gen: AsyncGenable<T>) => Promise<void>;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @typeParam T the type of value produced by the generator.
     */
    forEach<T>(f: AsyncIndexedFn<T>): (gen: AsyncGenable<T>, thisArg?: any) => void;
    forEach<T>(f: AsyncIndexedFn<T>, thisArgOrGen?: AsyncGenable<T>|any, gen?: AsyncGenable<T>)
        : Promise<void> | ((gen: AsyncGenable<T>) => void | Promise<void>) {
        const forEach = async (f: AsyncIndexedFn<T>, thisArg: any, gen: AsyncGenable<T>) => {
            const it = toAsyncIterator(gen);
            let idx = 0;
            while (true) {
                const r = await it.next();
                if (r.done) return r.value;
                await f.call(thisArg, r.value, idx++);
            }
        };
        if (gen) return forEach(f, thisArgOrGen, gen);
        if (isAsyncGenable<T>(thisArgOrGen)) return forEach(f, undefined, thisArgOrGen);
        return (gen: AsyncGenable<T>, thisArg?: any) => forEach(f, thisArg ?? thisArgOrGen, gen);
    }

    map<T, V>(f: AsyncIndexedFn<T, V>): GenOpValue<Async, T, [any?], Enhanced<V, Async>>;
    map<T, V>(f: AsyncIndexedFn<T, V>, thisArg?: any): GenOpValue<Async, T, [], Enhanced<V, Async>>;
    map<T, V>(f: AsyncIndexedFn<T, V>, gen: AsyncGenable<T>): Enhanced<V, Async>;
    map<T, V>(f: AsyncIndexedFn<T, V>, thisArg: any, gen: AsyncGenable<T>): Enhanced<V, Async>;
    map<T, V>(f: AsyncIndexedFn<T, V>, thisArg?: any | AsyncGenable<T>, iter?: AsyncGenable<T>):
        EnhancedAsyncGenerator<V>
        | ((gen: AsyncGenable<T>) => EnhancedAsyncGenerator<V>)
        | ((gen: AsyncGenable<T>, thisArg?: any) => EnhancedAsyncGenerator<V>)
    {
        const map = (thisArg: any, iter: AsyncGenable<T>) => {
            const gen = toAsyncGenerator(iter);
            let self: EnhancedAsyncGenerator<V>;
            async function* map(): AsyncGenerator<V> {
                let nr: any = undefined;
                let idx = 0;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = await gen.next(nr);
                                if (r.done) return r.value;
                                const v = await f.call(thisArg, r.value, idx++);
                                try {
                                    nr = yield v;
                                } catch (e) {
                                    await gen.throw(e);
                                }
                            }
                        } finally {
                            const x = await gen.return(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (!x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return self = this.enhance(map());
        };
        if (iter) return map(thisArg, iter);
        if (isAsyncGenable<T>(thisArg)) return map(undefined, thisArg);
        return (gen: AsyncGenable<T>, genThisArg?: any) => map(genThisArg ?? thisArg, gen);
    }

    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Async>): GenOpValue<Async, T, [any?], Enhanced<T, Async>>;

    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Async>, thisArg: any): GenOpValue<Async, T, [], Enhanced<T, Async>>;

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Async>, iter: Genable<T, Async>): Enhanced<T, Async>;
    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Async>, thisArg: any, iter: Genable<T, Async>): Enhanced<T, Async>;

    /**
     * Return a function that filters a [[Genable]] and yields a new [[EnhancedGenerator]]
     * that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter the [[Genable]] to filter.
     * @typeParam T the type of value.
     */
    filter<T>(f: IndexedPredicate<T, Async>, thisArg?: any | Genable<T, Async>, iter?: Genable<T, Async>):
        Enhanced<T, Async>
        | GenOpValue<Async, T, [], Enhanced<T, Async>>
        | GenOpValue<Async, T, [any?], Enhanced<T, Async>>
    {
        const filter = (thisArg: any, iter: Genable<T, Async>) => {
            const gen = toAsyncGenerator(iter);
            let self: EnhancedAsyncGenerator<T, Async>;
            async function* filter<V>(f: IndexedPredicate<T, Async>): AsyncGenerator<T> {
                let nr: any = undefined;
                let idx = 0;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = await gen.next(nr);
                                if (r.done) return r.value;
                                if (await f.call(thisArg, r.value, idx++)) {
                                    try {
                                        nr = yield r.value;
                                    } catch (e) {
                                        await gen.throw(e);
                                    }
                                }
                            }
                        } finally {
                            const x = await gen.return?.(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (!x?.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return self = this.enhance(filter(f));
        };

        if (iter) return filter(thisArg, iter);
        if (isAsyncGenable<T>(thisArg)) return filter(undefined, thisArg);
        return (gen: Genable<T, Async>, genThisArg?: any) => filter(genThisArg ?? thisArg, gen);
    }


    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     */
    flat<T, D extends number = 1>(depth: D): <X>(gen: Genable<X>) => Enhanced<Async, FlatGen<X, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     * @param gen
     */
    flat<T, D extends number = 1>(depth: D, gen: Genable<T>): Enhanced<Async, FlatGen<T, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param gen
     * @param depth default = 1
     */
    flat<T, D extends number = 1>(gen: Genable<T>, depth?: D): Enhanced<Async, FlatGen<T, D>>;
    flat<T, D extends number = 1>(depth: D|Genable<T>, gen?: Genable<T> | D):
        Enhanced<Async, FlatGen<T, D>>
        | (<X>(gen: Genable<X>) => Enhanced<Async, FlatGen<X, D>>)
    {
        const flat = <X>(depth: D, gen: Genable<X, Async>) => {
            let self: Enhanced<Async, FlatGen<X, D>>;
            const gens = new Set<AsyncGenerator>();
            if (isAsyncGenerator(gen)) gens.add(gen);

            async function* flat<D extends number>(it: AsyncIterator<unknown>, depth: D): AsyncGenerator<FlatGen<X, D>> {
                let nr: any = undefined;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = await it.next(nr);
                                if (r.done) return r.value;
                                const v: any = r.value;
                                if (isAsyncGenerator(v)) {
                                    gens.add(v);
                                }
                                try {
                                    if (depth > 0 && isAsyncIterator(v)) {
                                        yield* flat(v, depth - 1);
                                    } else if (depth > 0 && (isAsyncIterable(v) || isIterable(v))) {
                                        yield* flat(toAsyncIterator(v), depth - 1)
                                    } else {
                                        nr = yield r.value as FlatGen<T, D>;
                                    }
                                } catch (e) {
                                    await it.throw?.(e);
                                }
                            }
                        } finally {
                            const x = await it.return?.(self.returning);
                            if (isAsyncGenerator(it)) gens.delete(it);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                            for (const g of gens) {
                                await g.return(self.returning);
                            }
                        }
                    }
                }
            }

            return self = this.enhance(flat(toAsyncIterator(gen), depth));
        }
        if (typeof depth === 'number') {
            if (gen) {
                if (isAsyncGenable(gen)) {
                    return flat(depth, gen);
                } else {
                    throw new TypeError(`Invalid Genable: ${gen}`);
                }
            }
            return <X>(gen: Genable<X, Async>) => flat(depth, gen);
        } else if (isAsyncGenable(depth)) {
            return flat((gen ?? 1) as D, depth);
        }
        throw new TypeError(`Illegal arguments to flat()`);
    }

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Async>, depth: D): (gen: Genable<T, Async>) => Enhanced<FlatGen<R, D>, Async>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Async>): (gen: Genable<T, Async>, depth?: D) => Enhanced<FlatGen<R, D>, Async>;
    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Async>, gen: Genable<T, Async>): Enhanced<FlatGen<R, D>, Async>;
    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     * @param gen
     */
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Async>, depth: D, gen: Genable<T, Async>): Enhanced<FlatGen<R, D>, Async>;
    flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R, Async>, depthOrGen?: D | Genable<T, Async>, gen?: Genable<T, Async>):
        Enhanced<FlatGen<R, D>, Async>
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, Async>) => Enhanced<Y, Async>)
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X, Async>, depth?: D) => Enhanced<Y, Async>)
    {
        const flatMap = <X>(depth: D, gen: Genable<X, Async>) => {
            let self: Enhanced<FlatGen<X, D>, Async>;
            let idx = 0;

            async function* flatMap<D extends number>(it: AsyncIterator<unknown>, depth: D): AsyncGenerator<FlatGen<X, D>, undefined, unknown | undefined> {
                let nr: any = undefined;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = await it.next(nr as undefined);
                                if (r.done) return r.value;
                                const v = f(r.value as FlatGen<T, D>, idx++);
                                try {
                                    if (isAsyncIterator(v)) {
                                        if (depth > 1) {
                                            yield* flatMap(v, depth - 1);
                                        } else if (depth === 1) {
                                            yield* toAsyncGenerator(v);
                                        } else {
                                            yield v;
                                        }
                                    } else if (isAsyncIterable(v) || isIterable(v)) {
                                        if (depth > 1) {
                                            yield* flatMap(toAsyncIterator(v), depth - 1);
                                        } else if (depth === 1) {
                                            yield* toAsyncGenerator(v);
                                        } else {
                                            yield v;
                                        }
                                    } else {
                                        nr = yield v;
                                    }
                                } catch (e) {
                                    await it.throw?.(e);
                                }
                            }
                        } finally {
                            const x = await it.return?.(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }

            return self = this.enhance(flatMap(toAsyncIterator(gen), depth));
        }

        if (isAsyncGenable(gen)) {
            return flatMap(depthOrGen as D ?? 1 as D, gen);
        } else if (isAsyncGenable( depthOrGen)) {
            return flatMap(1 as D, depthOrGen);
        }
        return <X>(gen: Genable<X, Async>, depth?: D) => flatMap(depthOrGen ?? depth ?? 1 as D, gen);
    }

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    slice<T>(start: number, end: number): <X>(iter: Genable<X, Async>) => Enhanced<X, Async>;
    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     * @param iter
     */
    slice<T>(start: number, end: number, iter: Genable<T, Async>): Enhanced<T, Async>;
    slice<T>(start: number, end: number, iter?: Genable<T, Async>):
        Enhanced<T, Async>
        | (<X>(gen: Genable<X, Async>) => Enhanced<X, Async>)
    {
        const slice = <X>(iter: Genable<X, Async>) => {
            const it = toAsyncIterator(iter);
            async function* slice(start: number, end: number) {
                for (let i = 0; i < start; i++) {
                    const r = await it.next();
                    if (r.done) return r.value;
                }
                if (end === Number.POSITIVE_INFINITY) {
                    yield* toAsyncIterable(it);
                } else {
                    let nv: any = undefined;
                    while (true) {
                        try {
                            for (let i = start; i < end; i++) {
                                const r = await it.next(nv);
                                if (r.done) return r.value;
                                try {
                                    nv = yield r.value;
                                } catch (e) {
                                    const re = await it.throw?.(e);
                                    if (re) {
                                        if (re.done) return re.value;
                                        nv = yield re.value;
                                    }
                                }
                            }
                        } finally {
                            const x = await it.return?.(null);
                            // If the wrapped generator aborted the return, we will, too.
                            if (x && !x.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }
            return this.enhance(slice(start, end));
        };
        if (!iter) return slice;
        return slice(iter);
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [[Genable]] to provide values.
     */
    concat<T extends Genable<any, Async>[]>(...gens: T): Enhanced<GenUnion<T>, Async> {
        let self: Enhanced<GenUnion<T>, Async>;
        async function* concat() {
            let i = 0;
            try {
                for (; i < gens.length; i++) {
                    yield* toAsyncIterable(gens[i]);
                }
            } finally {
                // Terminate any remaining generators.
                for (; i < gens.length; i++) {
                    const g = gens[i];
                    if (isAsyncGenerator(g)) {
                        await g.return(self.returning);
                    }
                }
            }
        }

        return self = this.enhance(concat());
    }

    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, T>, gen: Genable<T, Async>): A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * **Array.prototype.reduce**. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, T, Async>): (gen: Genable<T, Async>) => A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    reduce<A, T>(f: Reducer<A, T, A, Async>): (init: A, gen: Genable<T, Async>) => A;
    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param init
     * @param gen
     */
    reduce<A, T>(f: Reducer<A, T, A, Async>, init: A, gen: Genable<T, Async>): A;
    /**
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * Alternatively, the init value can be supplied along with the generator as a second argument.
     * @param f
     * @param init
     */
    reduce<A, T>(f: Reducer<A, T, A, Async>, init: A): (gen: Genable<T, Async>) => A;
    reduce<A, T>(
        f: Reducer<A, T, A | T, Async>,
        initOrGen?: A | Genable<T, Async>,
        gen?: Genable<T, Async>
    ): A
        | Promise<A>
        | ((gen: Genable<T, Async>) => A | Promise<A>)
        | ((f: (acc: A, v: T) => A, init: A) => A | Promise<A>)
        | ((f: (acc: A | T, v: T) => A) => A | Promise<A>)
    {

        const reduce = async (init: A | PromiseLike<A> | undefined, it: AsyncIterator<T>): Promise<A> => {
            let acc: A | T | undefined = await init;
            if (acc === undefined) {
                const r = await it.next();
                if (r.done) throw new TypeError(`No initial value in reduce`);
                acc = r.value;
            }
            while (true) {
                const r = await it.next();
                if (r.done) return acc as A;
                acc = await f(acc, r.value);
            }
        };
        if (isAsyncGenable(gen)) {
            return reduce(initOrGen as A, toAsyncIterator(gen));
        } else if (isAsyncGenable(initOrGen)) {
            return reduce(undefined, toAsyncIterator(initOrGen));
        }
        return (gen: Genable<T, Async>, init?: A) => reduce(init ?? initOrGen, toAsyncIterator(gen));
    }

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    some<T>(p: IndexedPredicate<T, Async>, thisArg?: any): (gen: Genable<T, Async>) => ReturnValue<boolean, Async>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     */
    some<T>(p: IndexedPredicate<T, Async>): (gen: Genable<T, Async>, thisArg?: any) => ReturnValue<boolean, Async>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    some<T>(p: IndexedPredicate<T, Async>, gen: Genable<T, Async>): ReturnValue<boolean, Async>;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    some<T>(p: IndexedPredicate<T, Async>, thisArg: any, gen: Genable<T, Async>): ReturnValue<boolean, Async>;
    some<T>(
        pred: IndexedPredicate<T, Async>,
        thisOrGen?: any | Genable<T, Async>,
        gen?: Genable<T, Async>
    ): ReturnValue<boolean, Async> | ((gen: Genable<T, Async>) => ReturnValue<boolean, Async>)
    {
        const some = async (thisArg: any, it: AsyncIterator<T>): Promise<boolean> => {
            let i = 0;
            while (true) {
                const r = await it.next();
                if (r.done) return false;
                if (pred.call(thisArg, r.value, i++)) return true;
            }
        };
        if (isAsyncGenable(gen)) {
            return some(thisOrGen, toAsyncIterator(gen));
        } else if (isAsyncGenable(gen)) {
            return (gen: Genable<T, Async>, thisArg?: any) =>
                some(thisArg ?? thisOrGen, toAsyncIterator(gen));
        }
        throw new Error(`Invalid argument to some: ${gen ?? thisOrGen}`);
    }


    /**
     * Returns `false` and terminates the generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    every<T>(p: IndexedPredicate<T, Async>, thisArg?: any): (gen: Genable<T, Async>) => ReturnValue<boolean, Async>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     */
    every<T>(p: IndexedPredicate<T, Async>): (gen: Genable<T, Async>, thisArg?: any) => ReturnValue<boolean, Async>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, Async>, gen: Genable<T, Async>): ReturnValue<boolean, Async>;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    every<T>(p: IndexedPredicate<T, Async>, thisArg: any, gen: Genable<T, Async>): ReturnValue<boolean, Async>;
    every<T>(
        pred: IndexedPredicate<T, Async>,
        genOrThis?: any | Genable<T, Async>,
        gen?: Genable<T, Async>
    ): ReturnValue<boolean, Async> | ((gen: Genable<T, Async>) => ReturnValue<boolean, Async>)
    {
        const every = async (thisArg: any, it: AsyncIterator<T>): Promise<boolean> => {
            let i = 0;
            while (true) {
                const r = await it.next();
                if (r.done) return true;
                if (!pred.call(thisArg, r.value, i++)) return false;
            }
        };
        if (isAsyncGenable(gen)) {
            return every(genOrThis, toAsyncIterator(gen));
        } else if (isGenable(gen)) {
            return (gen: Genable<T, Async>, thisArg?: any) =>
                every(thisArg ?? genOrThis, toAsyncIterator(gen));
        }
        throw new Error(`Invalid argument to every: ${gen ?? genOrThis}`);
    }

    /**
     * Returns a new generator that repeats the last value returned by **gen** (or `undefined` if **gen**
     * did not return any values).
     *
     * @param gen
     * @param max
     */
    repeatLast<T>(gen: Genable<T, Async>, max: number = Number.POSITIVE_INFINITY): Enhanced<T | undefined, Async> {
        const it = toAsyncIterator(gen);
        let nr: any;
        let self: EnhancedAsyncGenerator<T | undefined>;

        async function* repeatLast() {
            try {
                let last = undefined
                while (true) {
                    const r = await it.next(nr)
                    if (r.done) break;
                    try {
                        nr = yield last = r.value;
                    } catch (e) {
                        const re = await it.throw?.(e);
                        if (re) {
                            if (re.done) break;
                            yield last = re.value;
                        }
                    }
                }
                for (let i = 0; i < max; i++) {
                    // Important to await at the expected point for consistent behavior.
                    yield await last;
                }
            } finally {
                await it.return?.(self.returning);
            }
        }

        return self = this.enhance(repeatLast());
    }


    /**
     * Returns a new generator that repeats the supplied value.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    repeat<T>(value: T, repetitions: number = Number.POSITIVE_INFINITY): Enhanced<T, Async> {
        async function* repeat() {
            for (let i = 0; i < repetitions; i++) {
                // Important to await at the expected point for consistent behavior.
                yield await value;
            }
        }

        return this.enhance(repeat());
    }

    /**
     * Combines generators, returning a generator that produces a tuple with each of their results.
     *
     * Terminates when the first generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */
    zip<G extends (Genable<any, Async>)[]>(...gens: G) {
        if (gens.length === 0) return this.enhance([]);
        const its = gens.map(toAsyncIterator);
        let done = false;
        let self: Enhanced<UnwrapGen<Async, G>, Async>;

        async function* zip2(): AsyncGenerator<UnwrapGen<Async, G>> {
            try {
                while (true) {
                    let result: UnwrapGen<Async, G> = [] as unknown as UnwrapGen<Async, G>;
                    for (const g of its) {
                        const r = await g.next();
                        if (r.done) {
                            done = true;
                            return r.value;
                        }
                        (result as any[]).push(r.value);
                    }
                    try {
                        yield result;
                    } catch (e) {
                        for (const g of gens) {
                            try {
                                // Weird need for a typecast here.
                                await (g as any).throw?.(e);
                            } catch {
                                // Ignore
                            }
                        }
                        throw e;
                    }
                }
            } finally {
                if (!done) {
                    for (const g of gens) {
                        try {
                            // Weird need for a typecast here.
                            await (g as any).return?.(self.returning);
                        } catch {
                            // Ignore
                        }
                    }
                }
            }
        }

        return self = this.enhance(zip2());
    }


    /**
     * Returns a function that joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param sep (default = ',')
     */
    join(sep: string): <T>(gen: Genable<T, Async>) => ReturnValue<string, Async>;

    /**
     * Joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param gen
     * @param sep
     */
    join<T>(gen: Genable<T, Async>, sep?: string): ReturnValue<string, Async>;
    join<T>(genOrSeparator: Genable<T, Async>|string, sep?: string):
        ReturnValue<string, Async> | (<X>(gen: Genable<X, Async>) => ReturnValue<string, Async>)
    {
        if (typeof genOrSeparator === 'string') {
            sep = genOrSeparator;
            return <X>(gen: Genable<X, Async>) => this.join(gen, sep);
        }
        return Promise.resolve(this.enhance(genOrSeparator).asArray()).then (a => a.join(sep));
    }

    /**
     * Enhance an existing generator (or iterator or iterable) to be a EnhancedGenerator.
     * @param gen
     */
    enhance<T, R = any, N = undefined>(gen: AsyncGenable<T>): EnhancedAsyncGenerator<T, R, N> {
        const gen2 = toAsyncGenerator(gen) as Partial<EnhancedAsyncGenerator<T, R, N>>;
        const old = Object.getPrototypeOf(gen2);
        const proto = Object.assign(Object.create(EnhancedAsyncGenerator.prototype), old);
        proto.return = (v: any) => (gen2.returning = v, old.return.call(gen2, v));
        Object.setPrototypeOf(gen2, proto);
        return gen2 as EnhancedAsyncGenerator<T, R, N>;
    }
}

abstract class Enhancements<T = unknown, TReturn = any, TNext = unknown, S extends SyncType = Sync> {

    abstract _impl: GeneratorOps<S>;

    // Set on a call to return().
    returning?: any;

    abstract next(): GenIteratorResult<T, TReturn, S>;

    abstract return(value: any): GenIteratorResult<T, TReturn, S>;

    abstract throw(e: any): GenIteratorResult<T, TReturn, S>;


    /**
     * Return all of the values from this generator as an array. You do not want to call this on an
     * infinite generator (for obvious reasons); consider using [[EnhancedGenerator.slice]] or
     * [[EnhancedGenerator.limit]] to limit the size before calling this.
     */
    asArray(): ReturnValue<T[], S> {
        return this._impl.asArray(this);
    }

    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     */
    limit(max: number): Enhanced<T, S> {
        return this._impl.limit(max, this);
    }

    /**
     * Operate on each value produced by this generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Value to be supplied as context `this` for function _f_.
     */
    forEach(f: IndexedFn<T, void, S>, thisArg?: any): void {
        this._impl.forEach(f, thisArg, this);
    }

    /**
     * Apply the function to each value yielded by this generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     */
    map<V>(f: IndexedFn<T, V, S>, thisArg?: any): Enhanced<V, S> {
        return this._impl.map(f, thisArg, this);
    }


    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     */
    filter(f: IndexedPredicate<T, S>, thisArg?: any): Enhanced<T, S> {
        return this._impl.filter(f, thisArg, this);
    }

    /**
     * Flatten the values yielded by this generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth (default = 1)
     */
    flat<D extends number = 1>(depth: D = 1 as D): Enhanced<S, FlatGen<T, D>> {
        return this._impl.flat<T, D>(depth, this);
    }

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     */
    flatMap<D extends number = 1>(f: IndexedFn<T, FlatGen<T, D>, S>, depth: D = 1 as D): Enhanced<S, FlatGen<T, D>> {
        return this._impl.flatMap<T, D>(f, depth, this);
    }

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    slice(start: number = 0, end: number = Number.POSITIVE_INFINITY): Enhanced<T, S> {
        return this._impl.slice(start, end, this);
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [[Genable]] to provide values.
     */

    concat<X extends Genable<any, S>[]>(...gens: X): Enhanced<GenUnion<X>|T, S> {
        return this._impl.concat(this, ...gens);
    }


    /**
     * Like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     */
    reduce<A>(f: Reducer<A, T, T, S>): ReturnValue<A, S>;
    /**
     * Like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     * @param init
     */
    reduce<A>(f: Reducer<A, T, A, S>, init: A): ReturnValue<A, S>;
    reduce<A>(f: Reducer<A, T, S>, init?: A): ReturnValue<A, S> {
        return this._impl.reduce(f, init as A, this);
    }

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    some<T>(p: IndexedPredicate<T, S>, thisArg?: any): ReturnValue<boolean, S> {
        // Why is type typecast to Genable needed here?
        // Yet the seemingly identical case of 'every' below does not?
        return this._impl.some(p, thisArg, this as Genable<T, S>);
    }

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    every(p: IndexedPredicate<T>, thisArg?: any): ReturnValue<boolean, S> {
        return this._impl.every(p, thisArg, this);
    }


    /**
     * Returns a new generator that repeats the last value returned by this (or `undefined` if this
     * did not return any values).
     *
     * @param max
     */
    repeatLast(max: number = Number.POSITIVE_INFINITY): Enhanced<T | undefined, S> {
        return this._impl.repeatLast(this, max);
    }


    /**
     * Returns a new generator that repeats the supplied value after this generator
     * completes.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    repeat<N>(value: N, repetitions: number = Number.POSITIVE_INFINITY): Enhanced<T | N, S> {
        return this.concat(this._impl.repeat(value, repetitions));
    }

    /**
     * Combines this generator with additional ones, returning a generator that produces a tuple with
     * each of their results, with this generator's result first.
     *
     * Terminates when any generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */
    zip<G extends Genable<any, S>[]>(...gens: G): Enhanced<T | UnwrapGen<S, G>, S> {
        return this._impl.zip(this, ...gens) as Enhanced<T | UnwrapGen<S, G>, S>;
    }

    /**
     * Trivial, but handy, same as **Array.prototype.join**.
     * @param sep (default = ',').
     *
     * See also [[EnhancedGenerator.join]]
     */
    join(sep?: string): ReturnValue<string, S> {
        return this._impl.join(this, sep);
    }
}

export abstract class EnhancedAsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
    extends Enhancements<T, TReturn, TNext, Async>
    implements AsyncGenerator<T, TReturn, TNext>, AsyncIterable<T>, AsyncIterator<T> {

    abstract [Symbol.asyncIterator](): EnhancedAsyncGenerator<T>;
}

/**
 * Utilities to create and use generators which can be manipulated in various ways.
 *
 * Most methods come both as instance (prototype) methods and as static methods. They
 * provide equivalent functionality, but the static methods allow use on `Iterator` and
 * `Iterable` objects without first converting to a generator.
 *
 * The [[EnhancedGenerator.enhance]] method will add additional instance methods to
 * an ordinary generator's prototype (a new prototype, **not** modifying any global prototype!).
 * It can also be used to convert `Iterator` and `Iterable` objects to [[EnhancedGenerator]].
 *
 * For methods which return a EnhancedGenerator, care is take to propagate any `Generator.throw`
 * and `Generator.return` calls to any supplied generators, so they can properly terminate.
 *
 * The exception is [[EnhancedGenerator.flat]] (and by extension, [[EnhancedGenerator.flatMap]]), which cannot know what nested generators
 * they might encounter in the future. Any generators encountered so far will be terminated, however.
 *
 * @typeParam T the type of values returned in the iteration result.
 * @typeParam TReturn the type of values returned in the iteration result when the generator terminates
 * @typeParam TNext the type of value which can be passed to `.next(val)`.
 */
export abstract class EnhancedGenerator<T = unknown, TReturn = any, TNext = unknown>
    extends Enhancements<T, TReturn, TNext, Sync>
    implements Generator<T, TReturn, TNext>, Iterable<T>, Iterator<T> {

    abstract [Symbol.iterator](): EnhancedGenerator<T, TReturn, TNext>;
    [Symbol.toStringTag]: 'EnhancedGenerator';
}


/**
 * Predicate/type guard to determine if an object is [[Genable]]. An object is [[Genable]] if it
 * supports the `Iterator` or `Iterable` protocols. (Generators support both).
 * @param g
 */
export const isGenable = <T>(g: Iterator<T>|Iterable<T>|Generator<T>|any): g is Genable<T> =>
  g && (isIterator(g) || isIterable(g));


export const isAsyncGenable = <T>(g: AsyncIterator<T>|AsyncIterable<T>|AsyncGenerator<T>|any): g is Genable<T, Async> =>
    g && (isAsyncIterator(g) || isAsyncIterable(g) || isIterable(g));

/**
 * Predicate/type guard to determine if an object is (or looks like, structurally) a Generator.
 * @param g
 */
export const isGenerator = <T>(g: Genable<T>|any): g is Generator<T> =>
    g &&
    isFunction(g.next)
    && isFunction(g.return)
    && isFunction(g.throw)
    && isFunction(g[Symbol.iterator]);

/**
 * Predicate/type guard to determine if an object is (or looks like, structurally) a AsyncGenerator.
 * @param g
 */
export const isAsyncGenerator = <T>(g: Genable<T, Async>|any): g is AsyncGenerator<T> =>
    g &&
    isFunction(g.next)
    && isFunction(g.return)
    && isFunction(g.throw)
    && isFunction(g[Symbol.asyncIterator]);

/**
 * Coerce an object to an object that can act as a generator (that is, satisfy both `Iterator`
 * and `Iterable`).
 *
 * If it is an `Iterator` but not `Iterable`, or `Iterable` but not `Iterator`, it is wrapped
 * in a generator.
 * @param i
 */
export function toGenerator<T>(i: Genable<T>): Generator<T> {
    if (isGenerator(i)) return i;
    if (isIterator(i)) {
        const it = i;

        function* wrap() {
            while (true) {
                const r = it.next();
                if (r.done) return r.value;
                yield r.value;
            }
        }

        return wrap();
    } else if (isIterable(i)) {
        return toGenerator(i[Symbol.iterator]());
    } else {
        throw new Error(`Not iterable: ${i}`);
    }
}


/**
 * Coerce an object to an object that can act as a async generator (that is, satisfy both `Iterator`
 * and `Iterable`).
 *
 * If it is an `AsyncIterator` but not `AsyncIterable`, or `AsyncIterable` but not `AsyncIterator`,
 * it is wrapped in an async generator.
 * @param i
 */
export function toAsyncGenerator<T>(i: Genable<T, Async>|Genable<T, Sync>): AsyncGenerator<T> {
    if (isAsyncGenerator(i)) return i;
    if (isAsyncIterator(i)) {
        const it = i;
        async function* wrap() {
            while (true) {
                const r = await it.next();
                if (r.done) return r.value;
                yield r.value;
            }
        }
        return wrap();
    } else if (isAsyncIterable(i)) {
        return toAsyncGenerator(i[Symbol.asyncIterator]());
    } else if (isIterable(i)) {
        return toAsyncGenerator(i[Symbol.iterator]());
    } else {
        throw new Error(`Not iterable: ${i}`);
    }
}

/**
 * Coerce a sync [[Genable]] object to an `Iterator`. If the object is a `Generator` or an `Iterator` it is returned,
 * while if it is an `Iterable`, `[Symbol.iterator]`() is invoked.
 * @param i
 */
export function toIterator<T>(i: Genable<T>): Iterator<T> {
    if (isGenerator(i)) return i;
    if (isIterator(i)) return i;
    if (isIterable(i)) {
        return i[Symbol.iterator]();
    } else {
        throw new Error(`Not iterable: ${i}`);
    }
}


/**
 * Coerce an async [[Genable]] object to an `AsyncIterator`. If the object is a `Generator` or an `Iterator` it is returned,
 * while if it is an `Iterable`, `[Symbol.iterator]`() is invoked.
 * @param i
 */
export function toAsyncIterator<T>(i: Genable<T, Async>): AsyncIterator<T> {
    if (isAsyncGenerator(i)) return i;
    if (isAsyncIterator(i)) return i;
    if (isAsyncIterable(i)) {
        return i[Symbol.asyncIterator]();
    } else if (isIterable(i)) {
        return asyncAdaptor(toIterator(i));
    } else {
        throw new Error(`Not iterable: ${i}`);
    }
}

const asyncAdaptor = <T>(i: Iterator<T>): EnhancedAsyncGenerator<T> => {
    const it = i as unknown as AsyncIterator<T>;
    let self: EnhancedAsyncGenerator<T>;
    async function* asyncAdaptor(): AsyncGenerator<T> {
        let nr: any;
        let done = false;
        try {
            while (true) {
                const r = await Promise.resolve(it.next());
                if (r.done) {
                    done = true;
                    return r.value;
                }
                try {
                    nr = yield r.value;
                } catch (e) {
                    await it.throw?.(e);
                    throw(e);
                }
            }
        } finally {
            if (!done) {
                await i.return?.(self.returning);
            }
        }
    }
    return self = Async.enhance(asyncAdaptor())
};

/**
 * Coerce a [[Genable]] object to `Iterable`. If it is already an `Iterable`, it is returned
 * unchanged. If it is an `Iterator`, it is wrapped in an object with a `[Symbol.iterator]`
 * method that returns the supplied iterator.
 * @param i
 */
export function toIterable<T>(i: Genable<T>): Iterable<T> {
    if (isIterable(i)) return i;
    return {
        [Symbol.iterator]: () => i
    };
}


/**
 * Coerce a [[Genable]] object to `AsyncIterable`. If it is already an `AsyncIterable`, it is returned
 * unchanged. If it is an `AsyncIterator`, it is wrapped in an object with a `[Symbol.asyncIterator]`
 * method that returns the supplied iterator.
 * @param i
 */
export function toAsyncIterable<T>(i: Genable<T, Async>): AsyncIterable<T> {
    if (isAsyncIterable(i)) return i;
    if (isIterable(i)) {
        return toAsyncIterable_adaptor(i);
    }
    return {
        [Symbol.asyncIterator]: () => i as AsyncIterator<T>
    };
}

async function* toAsyncIterable_adaptor<T>(iterable: Iterable<T>): AsyncGenerator<T> {
    const it = iterable[Symbol.iterator]();
    let nr: any = undefined;
    while (true) {
        const r = await it.next(nr);
        if (r.done) return r.value;
        nr = yield r.value;
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Similar to [[toGenerator]], but does not require the presence of `Generator.return` or `Generator.throw` methods.
 * @param i
 */
export function toIterableIterator<T>(i: Genable<T, Sync>): IterableIterator<T> {
    if (isIterable(i) && isIterator(i)) return i;
    if (isIterable(i)) {
        // Invoke [Symbol.iterator]() just once, on first use.
        let _it: Iterator<T>|undefined = undefined;
        const it = () => _it ?? (_it = i[Symbol.iterator]());
        const iit: IterableIterator<T> = {
            [Symbol.iterator]: () => iit,
            next: () => it().next(),
            return: it().return && ((val) => it().return!(val)),
            throw: it().throw && ((val) => it().throw!(val))
        };
        return iit;
    }
    if (isIterator(i)) {
        const iit: IterableIterator<T> = {
            [Symbol.iterator]: () => iit,
            next: (val: any) => i.next(val),
            return: i.return && ((val) => i.return!(val)),
            throw: i.throw && ((val) => i.throw!(val))
        }
        return iit;
    }
    throw new Error(`Not iterator nor iterable: ${i}`);
}


/**
 * Similar to [[toAsyncGenerator]], but does not require the presence of `AsyncGenerator.return` or
 * `AsyncGenerator.throw` methods.
 * @param i
 */
export function toAsyncIterableIterator<T>(i: Genable<T, Async>): AsyncIterableIterator<T> {
    if (isAsyncIterable(i) && isAsyncIterator(i)) return i;
    if (isAsyncIterable(i)) {
        // Invoke [Symbol.iterator]() just once, on first use.
        let _it: AsyncIterator<T>|undefined = undefined;
        const it = () => _it ?? (_it = i[Symbol.asyncIterator]());
        const iit: AsyncIterableIterator<T> = {
            [Symbol.asyncIterator]: () => iit,
            next: () => it().next(),
            return: it().return && ((val) => it().return!(val)),
            throw: it().throw && ((val) => it().throw!(val))
        };
        return iit;
    }
    if (isIterable(i)) {
        return toAsyncIterable_adaptor(i);
    }
    if (isAsyncIterator(i)) {
        const iit: AsyncIterableIterator<T> = {
            [Symbol.asyncIterator]: () => iit,
            next: (val: any) => i.next(val),
            return: i.return && ((val) => i.return!(val)),
            throw: i.throw && ((val) => i.throw!(val))
        }
        return iit;
    }
    throw new Error(`Not iterator nor iterable: ${i}`);
}

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterator` protocol (has a `next()` method).
 *
 * Note: There is no way to statically distinguish between an `Iterator` and an `AsyncIterator`. You will get
 * runtime errors if you don't anticipate the distinction.
 * @param i
 */
export const isIterator = <K>(i: Iterable<K> | any): i is Iterator<K> =>
    i && typeof i.next === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `AsyncIterator` protocol (has a `next()` method).
 *
 * Note: There is no way to statically distinguish between an `Iterator` and an `AsyncIterator`. You will get
 * runtime errors if you don't anticipate the distinction.
 * @param i
 */
export const isAsyncIterator = <K>(i: AsyncIterable<K> | any): i is AsyncIterator<K> =>
    i && typeof i.next === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterable` protocol (has a `[Symbol.iterator]`
 * method).
 * @param i
 */
export const isIterable = <K>(i: Iterable<K> | any): i is Iterable<K> =>
    i && typeof i[Symbol.iterator] === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `AsyncIterable` protocol (has a `[Symbol.asyncIterator]`
 * method).
 * @param i
 */
export const isAsyncIterable = <K>(i: AsyncIterable<K> | any): i is AsyncIterable<K> =>
    i && typeof i[Symbol.asyncIterator] === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterable` protocol (has a `[Symbol.iterator]`
 * method) and the `Iterator` protocol (a next() method).
 * @param i
 */
export const isIterableIterator = <K>(i: Iterable<K>|Iterator<K>|any): i is IterableIterator<K> =>
    isIterator(i) && isIterable(i);

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `AsyncIterable` protocol (has a `[Symbol.asyncIterator]`
 * method) and the `AsyncIterator` protocol (a next() method).
 * @param i
 */
export const isAsyncIterableIterator = <K>(i: Iterable<K>|Iterator<K>|any): i is IterableIterator<K> =>
    isAsyncIterator(i) && isAsyncIterable(i);

/**
 *
 * @param start (default = 0)
 * @param end   (default = `Number.MAX_SAFE_INTEGER`)
 * @param step  (default = 1)
 */
export const range = (start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): EnhancedGenerator<number> => {
    function* range2(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
        let x = start;
        if (step > 0) {
            while (x < end) {
                yield x;
                x += step;
            }
        } else if (step < 0) {
            while (x > end) {
                yield x;
                x += step;
            }
        } else {
            throw new Error("Step must not be zero.");
        }
    }
    return Sync.enhance(range2(start, end, step));
}

export const Sync = new Sync_();
export const Async = new Async_();

const makeProto = (base: any) => {
    const newProto = Object.create(base);
    const inherit = (proto: any) => {
        for (const k of Reflect.ownKeys(proto)) {
            if (k !== 'constructor') {
                newProto[k] = proto[k];
            }
        }
    };
    inherit(Enhancements.prototype);
    return newProto;
}

/**
 * @internal
 * @constructor
 */
function* Foo() {
}

/**
 * @internal
 */
export const GenProto = Object.getPrototypeOf(Foo());

// Make EnhancedGenerator inherit generator methods.
Object.setPrototypeOf(EnhancedGenerator.prototype, makeProto(GenProto));
Object.defineProperty(EnhancedGenerator.prototype, '_impl', {
    value: Sync,
    writable: false,
    enumerable: false,
    configurable: false
});


/**
 * @internal
 * @constructor
 */
async function* AsyncFoo() {
}

/**
 * @internal
 */
export const AsyncGenProto = Object.getPrototypeOf(AsyncFoo());

// Make EnhancedGenerator inherit generator methods.

Object.setPrototypeOf(EnhancedAsyncGenerator.prototype, makeProto(AsyncGenProto));
Object.defineProperty(EnhancedAsyncGenerator.prototype, '_impl', {
    value: Async,
    writable: false,
    enumerable: false,
    configurable: false
});
