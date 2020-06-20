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
export type GenType<G> = G extends Genable<infer T> ? T : never;

/**
 * Any `Generator`, `Iterator`, or `Iterable`, which can be coerced to a
 * [[EnhancedGenerator]].
 *
 * @typeParam T the value type produced by the [[Genable]]
 */
export type Genable<T> = Generator<T> | Iterator<T> | Iterable<T>;

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
 */
export type Reducer<A, T, Init = A | T> = (acc: Init | A, v: T) => A;

/**
 * A predicate which can be applied to elements of an iteration.
 * @param v the element
 * @param idx the sequential index
 * @typeParam T the type of the elements.
 * @typeParam R the return type.
 */
type IndexedFn<T, R = void> = (v: T, idx: number) => R;

/**
 * A predicate which can be applied to elements of an iteration.
 * @param v the element
 * @param idx the sequential index
 * @typeParam T the type of the elements.
 */
type IndexedPredicate<T> = IndexedFn<T, boolean>;

/**
 * Unwrap an array of Genables
 * @typeParam B the type to be unwrapped.
 * @internal
 */
type UnwrapGen<B extends Array<Genable<any>>> = { [K in (keyof B) & number]: B[K] extends Genable<infer T> ? T : never; };

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
    implements Generator<T, TReturn, TNext>, Iterable<T> {

    // Set on a call to return().
    returning?: any;

    abstract next(): IteratorResult<T>;

    abstract [Symbol.iterator](): Generator<T>;

    abstract return(value: any): IteratorResult<T>;

    abstract throw(e: any): IteratorResult<T>;

    /**
     * Return all of the values from this generator as an array. You do not want to call this on an
     * infinite generator (for obvious reasons); consider using [[EnhancedGenerator.slice]] or
     * [[EnhancedGenerator.limit]] to limit the size before calling this.
     */
    asArray(): T[] {
        return EnhancedGenerator.asArray(this);
    }

    /**
     * Return all of the values from this generator as an array. You do not want to call this on an
     * infinite generator (for obvious reasons); consider using [[EnhancedGenerator.slice]] or
     * [[EnhancedGenerator.limit]] to limit the size before calling this.
     */
    static asArray<T>(gen: Genable<T>): T[] {
        return [...toIterable(gen)];
    }

    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     */
    limit(max: number) {
        return EnhancedGenerator.limit(max, this);
    }

    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     * @param gen
     */
    static limit<T>(max: number, gen: Genable<T>): Genable<T>;
    /**
     * Limit the number of values that can be generated. A `RangeError` is thrown if this limit is
     * exceeded. See [[EnhancedGenerator.slice]] if you want to truncate.
     * @param max
     */
    static limit(max: number): <T>(gen: Genable<T>) => EnhancedGenerator<T>;
    static limit<T>(max: number, gen?: Genable<T>): Genable<T> | (<X>(gen: Genable<X>) => EnhancedGenerator<X>) {
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
            return self = EnhancedGenerator.enhance(limit(toIterator(gen)));
        }
        return <X>(gen: Genable<X>) => EnhancedGenerator.enhance(limit(toIterator(gen)));
    }

    /**
     * Operate on each value produced by this generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Value to be supplied as context `this` for function _f_.
     */
    forEach(f: IndexedFn<T>, thisArg?: any): void {
        EnhancedGenerator.forEach(f, thisArg, this);
    }

    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    static forEach<T>(f: IndexedFn<T>, thisArg: any, gen: Genable<T>): void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param gen the generator.
     * @typeParam T the type of value produced by the generator.
     */
    static forEach<T>(f: IndexedFn<T>, gen: Genable<T>): void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @typeParam T the type of value produced by the generator.
     */
    static forEach<T>(f: IndexedFn<T>, thisArg?: any): (gen: Genable<T>) => void;
    /**
     * Operate on each value produced by the generator. f is called with two values, the
     * value yielded by this generator and a sequential index.
     * @param f
     * @typeParam T the type of value produced by the generator.
     */
    static forEach<T>(f: IndexedFn<T>): (gen: Genable<T>, thisArg?: any) => void;
    static forEach<T>(f: IndexedFn<T>, thisArgOrGen?: Genable<T>|any, gen?: Genable<T>) {
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
        return (gen: Genable<T>, thisArg?: any) => forEach(f, thisArg ?? thisArgOrGen, gen);
    }

    /**
     * Apply the function to each value yielded by this generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     */
    map<V>(f: IndexedFn<T, V>, thisArg?: any): EnhancedGenerator<V> {
        return EnhancedGenerator.map(f, thisArg)(this);
    }


    /**
     * Apply the function to each value yielded by the generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @typeParam T the type of value produced by the generator.
     */
    static map<T, V>(f: IndexedFn<T, V>): (iter: Genable<T>, thisArg?: any) => EnhancedGenerator<V>;
    /**
     * Apply the function to each value yielded by the generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @typeParam T the type of value produced by the generator.
     */
    static map<T, V>(f: IndexedFn<T, V>, thisArg: any): (iter: Genable<T>) => EnhancedGenerator<V>;
    /**
     * Apply the function to each value yielded by the generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @param iter the generator
     * @typeParam T the type of value produced by the generator.
     */
    static map<T, V>(f: IndexedFn<T, V>, iter: Genable<T>): EnhancedGenerator<V>;
    /**
     * Apply the function to each value yielded by the generator. It is called with two arguments,
     * the value yielded, and a sequential index. The return value is a generator that yields the
     * values produced by the function.
     * @param f
     * @param thisArg Optional value to be supplied as context `this` for function _f_.
     * @param iter the generator
     * @typeParam T the type of value produced by the generator.
     */
    static map<T, V>(f: IndexedFn<T, V>, thisArg: any, iter: Genable<T>):  EnhancedGenerator<V>;
    static map<T, V>(f: IndexedFn<T, V>, thisArg?: any | Genable<T>, iter?: Genable<T>):
        EnhancedGenerator<V>
        | ((gen: Genable<T>) => EnhancedGenerator<V>)
        | ((gen: Genable<T>, thisArg?: any) => EnhancedGenerator<V>)
    {
        const map = (thisArg: any, iter: Genable<T>) => {
            const gen = toGenerator(iter);
            let self: EnhancedGenerator<V>;
            function* map2<V>(f: (v: T, idx: number) => V): Generator<V> {
                let nr = undefined;
                let idx = 0;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = gen.next(nr);
                                if (r.done) return r.value;
                                const v = f.call(thisArg, r.value, idx++);
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
            return self = EnhancedGenerator.enhance(map2(f));
        };
        if (iter) return map(thisArg, iter);
        if (isGenable<T>(thisArg)) return map(undefined, thisArg);
        return (gen: Genable<T>, genThisArg?: any) => map(genThisArg ?? thisArg, gen);
    }

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     */
    filter(f: (v: T) => boolean, thisArg?: any): EnhancedGenerator<T, TReturn, TNext> {
        return EnhancedGenerator.filter(f, thisArg)(this);
    }

    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    static filter<T>(f: IndexedPredicate<T>, iter: Genable<T>): EnhancedGenerator<T>;
    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    static filter<T>(f: IndexedPredicate<T>, thisArg: any, iter: Genable<T>): EnhancedGenerator<T>;
    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @typeParam T the type of value.
     */
    static filter<T>(f: IndexedPredicate<T>, thisArg?: any): (iter: Genable<T>) => EnhancedGenerator<T>;
    /**
     * Return a new [[EnhancedGenerator]] that yields only the values that satisfy the predicate _f_.
     *
     * f receives the value and a sequential index.
     * @param f
     * @param thisArg Optional context to be passed as `this` to the predicate.
     * @param iter a [[Genable|Genable<T>]]
     * @typeParam T the type of value.
     */
    static filter<T>(f: IndexedPredicate<T>, thisArg: any | Genable<T>, iter?: Genable<T>):
        EnhancedGenerator<T>
        | ((gen: Genable<T>) => EnhancedGenerator<T>)
        | ((gen: Genable<T>, thisArg?: any) => EnhancedGenerator<T>)
    {
        const filter = (thisArg: any, iter: Genable<T>) => {
            const gen = toGenerator(iter);
            let self: EnhancedGenerator<T>;
            function* filter2<V>(f: IndexedPredicate<T>): Generator<T> {
                let nr = undefined;
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
            return self = EnhancedGenerator.enhance(filter2(f));
        };

        if (iter) return filter(thisArg, iter);
        if (isGenable<T>(thisArg)) return filter(undefined, thisArg);
        return (gen: Genable<T>, genThisArg?: any) => filter(genThisArg ?? thisArg, gen);
    }

    /**
     * Flatten the values yielded by this generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth (default = 1)
     */
    flat<D extends number = 1>(depth: D = 1 as D): EnhancedGenerator<FlatGen<T, D>> {
        return EnhancedGenerator.flat<T, D>(this, depth);
    }

    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     */
    static flat<T, D extends number = 1>(depth: D): <X>(gen: Genable<X>) => EnhancedGenerator<FlatGen<X, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param depth
     * @param gen
     */
    static flat<T, D extends number = 1>(depth: D, gen: Genable<T>): EnhancedGenerator<FlatGen<T, D>>;
    /**
     * Flatten the values yielded by the generator to level _depth_. Produces a generator that yields
     * the individual values at each level in depth-first order. Any iterable (including Array) or iterator
     * will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param gen
     * @param depth default = 1
     */
    static flat<T, D extends number = 1>(gen: Genable<T>, depth?: D): EnhancedGenerator<FlatGen<T, D>>;
    static flat<T, D extends number = 1>(depth: D|Genable<T>, gen?: Genable<T> | D):
        EnhancedGenerator<FlatGen<T, D>>
        | (<X>(gen: Genable<X>) => EnhancedGenerator<FlatGen<X, D>>)
    {
        const flat = <X>(depth: D, gen: Genable<X>) => {
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

            return self = EnhancedGenerator.enhance(flat(toIterator(gen), depth));
        }
        if (typeof depth === 'number') {
            if (gen) {
                if (isGenable(gen)) {
                    return flat(depth, gen);
                } else {
                    throw new TypeError(`Invalid Genable: ${gen}`);
                }
            }
            return <X>(gen: Genable<X>) => flat(depth, gen);
        } else if (isGenable(depth)) {
            return flat((gen ?? 1) as D, depth);
        }
        throw new TypeError(`Illegal arguments to flat()`);
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
    flatMap<D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>, depth: D = 1 as D): EnhancedGenerator<FlatGen<R, D>> {
        return EnhancedGenerator.flatMap(f, depth, this);
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
    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>, depth: D): (gen: Genable<T>) => EnhancedGenerator<FlatGen<R, D>>;

    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a function that accepts a generator, and returns another generator that yields the individual value
     * at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     */
    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>): (gen: Genable<T>, depth?: D) => EnhancedGenerator<FlatGen<R, D>>;
    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param gen
     */
    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>, gen: Genable<T>): EnhancedGenerator<FlatGen<R, D>>;    /**
     * Flatten the values yielded by applying the function to the values yielded by the generator to level _depth_.
     * Produces a generator that yields the individual values at each level in depth-first order. Any iterable
     * (including Array) or iterator will be traversed and its values yielded.
     *
     * The return type is currently over-broad
     * @param f
     * @param depth
     * @param gen
     */
    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>, depth: D, gen: Genable<T>): EnhancedGenerator<FlatGen<R, D>>;
    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: IndexedFn<T, R>, depthOrGen?: D | Genable<T>, gen?: Genable<T>):
        EnhancedGenerator<FlatGen<R, D>>
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X>) => EnhancedGenerator<Y>)
        | (<X, Y = FlatGen<T, D>>(gen: Genable<X>, depth?: D) => EnhancedGenerator<Y>)
    {
        const flatMap = <X>(depth: D, gen: Genable<X>) => {
            let self: EnhancedGenerator<FlatGen<X, D>>;
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

            return self = EnhancedGenerator.enhance(flatMap(toIterator(gen), depth));
        }

        if (isGenable(gen)) {
            return flatMap(depthOrGen as D ?? 1 as D, gen);
        } else if (isGenable( depthOrGen)) {
            return flatMap(1 as D, depthOrGen);
        }
        return <X>(gen: Genable<X>, depth?: D) => flatMap(depthOrGen ?? depth ?? 1 as D, gen);
    }

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    slice(start: number = 0, end: number = Number.POSITIVE_INFINITY): EnhancedGenerator<T> {
        return EnhancedGenerator.slice<T>(start, end, this);
    }

    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     */
    static slice<T>(start: number, end: number): <X>(iter: Genable<X>) => EnhancedGenerator<X>;
    /**
     * Return a new [[EnhancedGenerator]] that only yields the indicated values, skipping _start_ initial values
     * and continuing until the _end_.
     * @param start
     * @param end
     * @param iter
     */
    static slice<T>(start: number, end: number, iter: Genable<T>): EnhancedGenerator<T>;
    static slice<T>(start: number = 0, end: number = Number.POSITIVE_INFINITY, iter?: Genable<T>):
        EnhancedGenerator<T>
        | (<X>(gen: Genable<X>) => EnhancedGenerator<X>)
    {
        const slice = <X>(iter: Genable<X>) => {
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
            return EnhancedGenerator.enhance(slice(start, end));
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
    concat<N extends Genable<any>[]>(...gens: N) {
        return EnhancedGenerator.concat<Genable<T | GenUnion<N>>[]>(this, ...gens);
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [[Genable]] to provide values.
     */
    static concat<T extends Genable<any>[]>(...gens: T): EnhancedGenerator<GenUnion<T>> {
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
                        g.return(null);
                    }
                }
            }
        }

        return EnhancedGenerator.enhance(concat());
    }

    /**
     * Like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     */
    reduce<A>(f: Reducer<A, T, T>): A;
    /**
     * Like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     * @param init
     */
    reduce<A>(f: Reducer<A, T, A>, init: A): A;
    reduce<A>(f: Reducer<A, T>, init?: A): A {
        return EnhancedGenerator.reduce(f, init as A, this);
    }

    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param gen
     */
    static reduce<A, T>(f: Reducer<A, T, T>, gen: Genable<T>): A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * **Array.prototype.reduce**. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    static reduce<A, T>(f: Reducer<A, T, T>): (gen: Genable<T>) => A;
    /**
     *
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * @param f
     */
    static reduce<A, T>(f: Reducer<A, T, A>): (init: A, gen: Genable<T>) => A;
    /**
     * Reduces **gen** like `Array.prototype.reduce`, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param f
     * @param init
     * @param gen
     */
    static reduce<A, T>(f: Reducer<A, T, A>, init: A, gen: Genable<T>): A;
    /**
     * Returns a reducer function that, when applied to a `Generator` **gen**, reduces **gen** like
     * `Array.prototype.reduce`. The 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     *
     * Alternatively, the init value can be supplied along with the generator as a second argument.
     * @param f
     * @param init
     */
    static reduce<A, T>(f: Reducer<A, T, A>, init: A): (gen: Genable<T>) => A;
    static reduce<A, T>(
        f: Reducer<A, T>,
        initOrGen?: A | Genable<T>,
        gen?: Genable<T>
    ): A
        | ((gen: Genable<T>) => A)
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
        return (gen: Genable<T>, init?: A) => reduce(init ?? initOrGen, toIterator(gen));
    }

    /**
     * Returns `true` and terminates this generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    some(p: IndexedPredicate<T>, thisArg?: any): boolean {
        return EnhancedGenerator.some(p, thisArg, this);
    }

    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    static some<T>(p: IndexedPredicate<T>, thisArg?: any): (gen: Genable<T>) => boolean;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     */
    static some<T>(p: IndexedPredicate<T>): (gen: Genable<T>, thisArg?: any) => boolean;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    static some<T>(p: IndexedPredicate<T>, gen: Genable<T>): boolean;
    /**
     * Returns `true` and terminates the generator if the predicate is true for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having satisfied the predicate, `false` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    static some<T>(p: IndexedPredicate<T>, thisArg: any, gen: Genable<T>): boolean;
    static some<T>(
        pred: IndexedPredicate<T>,
        thisOrGen?: any | Genable<T>,
        gen?: Genable<T>
    ): boolean | ((gen: Genable<T>) => boolean)
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
            return (gen: Genable<T>, thisArg?: any) =>
                some(thisArg ?? thisOrGen, toIterator(gen));
        }
        throw new Error(`Invalid argument to some: ${gen ?? thisOrGen}`);
    }

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    every(p: IndexedPredicate<T>, thisArg?: any): boolean {
        return EnhancedGenerator.every(p, thisArg, this);
    }

    /**
     * Returns `false` and terminates the generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     */
    static every<T>(p: IndexedPredicate<T>, thisArg?: any): (gen: Genable<T>) => boolean;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     */
    static every<T>(p: IndexedPredicate<T>): (gen: Genable<T>, thisArg?: any) => boolean;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param gen the generator
     */
    static every<T>(p: IndexedPredicate<T>, gen: Genable<T>): boolean;

    /**
     * Returns `false` and terminates this generator if the predicate is false for any of the generator's
     * yielded values.
     *
     * If the generator terminates without having failed the predicate, `true` is returned.
     * @param p predicate to apply to each yielded value.
     * @param thisArg Optional value to supply as context (`this`) for the predicate
     * @param gen the generator
     */
    static every<T>(p: IndexedPredicate<T>, thisArg: any, gen: Genable<T>): boolean;
    static every<T>(
        pred: IndexedPredicate<T>,
        genOrThis?: any | Genable<T>,
        gen?: Genable<T>
    ): boolean | ((gen: Genable<T>) => boolean)
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
            return (gen: Genable<T>, thisArg?: any) =>
                every(thisArg ?? genOrThis, toIterator(gen));
        }
        throw new Error(`Invalid argument to every: ${gen ?? genOrThis}`);
    }

    /**
     * Returns a new generator that repeats the last value returned by this (or `undefined` if this
     * did not return any values).
     *
     * @param max
     */
    repeatLast(max: number = Number.POSITIVE_INFINITY): EnhancedGenerator<T | undefined> {
        return EnhancedGenerator.repeatLast(this, max);
    }

    /**
     * Returns a new generator that repeats the last value returned by **gen** (or `undefined` if **gen**
     * did not return any values).
     *
     * @param gen
     * @param max
     */
    static repeatLast<T>(gen: Genable<T>, max: number = Number.POSITIVE_INFINITY): EnhancedGenerator<T | undefined> {
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

        return self = EnhancedGenerator.enhance(repeatLast());
    }

    /**
     * Returns a new generator that repeats the supplied value after this generator
     * completes.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    repeat<N>(value: N, repetitions: number = Number.POSITIVE_INFINITY): EnhancedGenerator<T | N> {
        return this.concat(EnhancedGenerator.repeat(value, repetitions));
    }

    /**
     * Returns a new generator that repeats the supplied value after the supplied generator
     * completes.
     *
     * @param value the value to repeat
     * @param repetitions The number repetitions; the default is infinite.
     */
    static repeat<T>(value: T, repetitions: number = Number.POSITIVE_INFINITY): EnhancedGenerator<T> {
        function* repeat() {
            for (let i = 0; i < repetitions; i++) {
                yield value;
            }
        }

        return EnhancedGenerator.enhance(repeat());
    }

    /**
     * Combines this generator with additional ones, returning a generator that produces a tuple with
     * each of their results.
     *
     * Terminates when the first generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */
    zip<G extends Genable<any>[]>(...gens: G) {
        return EnhancedGenerator.zip(this, ...gens);
    }

    /**
     * Combines generators, returning a generator that produces a tuple with each of their results.
     *
     * Terminates when the first generator terminates. To get other behaviors, use with [[EnhancedGenerator.repeat]] or
     * [[EnhancedGenerator.repeatLast]].
     * @param gens
     */
    static zip<G extends (Genable<any>)[]>(...gens: G) {
        if (gens.length === 0) return EnhancedGenerator.enhance([]);
        const its = gens.map(toIterator);

        function* zip2(): Generator<UnwrapGen<G>> {
            while (true) {
                let result: UnwrapGen<G> = [] as unknown as UnwrapGen<G>;
                for (const g of its) {
                    const r = g.next();
                    if (r.done) return r.value;
                    (result as any[]).push(r.value);
                }
                yield result;
            }
        }

        return EnhancedGenerator.enhance(zip2());
    }

    /**
     * Trivial, but handy, same as **Array.prototype.join**.
     * @param sep (default = ',').
     *
     * See also [[EnhancedGenerator.join]]
     */
    join(sep?: string) {
        return [...this].join(sep);
    }

    /**
     * Returns a function that joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param sep (default = ',')
     */
    static join(sep: string): <T>(gen: Genable<T>) => string;

    /**
     * Joins the elements produced by a [[Genable]], analogous to `Array.prototype.join`.
     * @param gen
     * @param sep
     */
    static join<T>(gen: Genable<T>, sep?: string): string;
    static join<T>(genOrSeparator: Genable<T>|string, sep?: string): string | (<X>(gen: Genable<X>) => string) {
        if (typeof genOrSeparator === 'string') {
            sep = genOrSeparator;
            return <X>(gen: Genable<X>) => EnhancedGenerator.join(gen, sep);
        }
        return [...toIterable(genOrSeparator)].join(sep);
    }

    /**
     * Enhance an existing generator (or iterator or iterable) to be a EnhancedGenerator.
     * @param gen
     */
    static enhance<T, R = any, N = undefined>(gen: Genable<T>): EnhancedGenerator<T, R, N> {
        const gen2 = toGenerator(gen) as Partial<EnhancedGenerator>;
        const old = Object.getPrototypeOf(gen2);
        const proto = Object.assign(Object.create(EnhancedGenerator.prototype), old);
        proto.return = (v: any) => (gen2.returning = v, old.return.call(gen2, v));
        Object.setPrototypeOf(gen2, proto);
        return gen2 as EnhancedGenerator<T, R, N>;
    }
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
Object.setPrototypeOf(EnhancedGenerator.prototype, GenProto);

/**
 * Predicate/type guard to determine if an object is [[Genable]]. An object is [[Genable]] if it
 * supports the `Iterator` or `Iterable` protocols. (Generators support both).
 * @param g
 */
export const isGenable = <T>(g: Iterator<T>|Iterable<T>|Generator<T>|any): g is Genable<T> =>
  g && (isIterator(g) || isIterable(g));

/**
 * Predicate/type guard to determine if an object is (or looks like, structurally) a Generator.
 * @param g
 */
export const isGenerator = (g: any): g is Generator =>
    g &&
    isFunction(g.next)
    && isFunction(g.return)
    && isFunction(g.throw)
    && isFunction(g[Symbol.iterator]);

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
 * Coerce a [[Genable]] object to an `Iterator`. If the object is a `Generator` or an `Iterator` it is returned,
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

// noinspection JSUnusedGlobalSymbols
/**
 * Similar to [[toGenerator]], but does not require the presence of `Generator.return` or `Generator.throw` methods.
 * @param i
 */
export function toIterableIterator<T>(i: Genable<T>): IterableIterator<T> {
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
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterator` protocol (has a `next()` method).
 * @param i
 */
export const isIterator = <K>(i: Iterable<K> | any): i is Iterator<K> => i && typeof i.next === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterable` protocol (has a `[Symbol.iterator]`
 * method).
 * @param i
 */
export const isIterable = <K>(i: Iterable<K> | any): i is Iterable<K> => i && typeof i[Symbol.iterator] === 'function';

/**
 * Predicate/type guard, returns `true` if the argument satisfies the `Iterable` protocol (has a `[Symbol.iterator]`
 * method) and the `Iterator` protocol (a next() method).
 * @param i
 */
export const isIterableIterator = <K>(i: Iterable<K>|Iterator<K>|any): i is IterableIterator<K> => isIterator(i) && isIterable(i);

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

/**
 *
 * @param start (default = 0)
 * @param end   (default = `Number.MAX_SAFE_INTEGER`)
 * @param step  (default = 1)
 */
export const range = (start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): EnhancedGenerator<number> => {
    const r: Partial<EnhancedGenerator<number>> = range2(start, end, step);
    Object.setPrototypeOf(r, EnhancedGenerator.prototype);
    return r as EnhancedGenerator<number>;
};
