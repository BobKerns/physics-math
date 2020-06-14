/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Miscellaneous utilities
 * @packageDocumentation
 * @module Utils
 */

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}
/*
// Exceeds tsc's stack. I can't see how it differs from ArrayGen?
export type FlatGen<Arr, Depth extends number> = {
    "done": Arr,
    "recur": Arr extends Genable<infer InnerArr>
        ? FlatGen<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
        : Arr
}[Depth extends -1 ? "done" : "recur"];
*/

export type FlatGen<A, D> = any;

function* Foo() {}
const GenProto = Object.getPrototypeOf(Foo());

type Genable<T> = Generator<T> | Iterator<T> | Iterable<T>;

export abstract class MappableGenerator<T = unknown, TReturn = any, TNext = unknown>
    implements Generator<T, TReturn, TNext>, Iterable<T> {

    returning?: any;
    abstract next(): IteratorResult<T>;

    abstract [Symbol.iterator](): Generator<T>;

    abstract return(value: any): IteratorResult<T>;

    abstract throw(e: any): IteratorResult<T>;

    asArray(): T[] {
        return [...this];
    }

    forEach(f: (v: T) => void, thisArg?: any) {
        while (true) {
            const r = this.next();
            if (r.done) return r.value;
            f.call(thisArg, r.value);
        }
    }

    map<V>(f: (v: T) => V, thisArg?: any): MappableGenerator<V> {
        return MappableGenerator.map(f, thisArg)(this);
    }

    static map<V, T>(f: (v: T) => V, thisArg?: any): (iter: Genable<T>) => MappableGenerator<V> {
        return (iter: Genable<T>) => {
            const gen = toGenerator(iter);
            let self: MappableGenerator<V>;

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

            return self = MappableGenerator.extend(map2(f));
        };
    }

    filter(p: (v: T) => boolean, thisArg?: any): MappableGenerator<T, TReturn, TNext> {
        return MappableGenerator.filter(p, thisArg)(this);
    }

    static filter<T>(f: (v: T) => boolean, thisArg?: any): (iter: Genable<T>) => MappableGenerator<T> {
        return (iter: Genable<T>) => {
            const gen = toGenerator(iter);
            let self: MappableGenerator<T>;

            function* filter2<V>(f: (v: T, idx: number) => boolean): Generator<T> {
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

            return self = MappableGenerator.extend(filter2(f));
        };
    }

    flat<D extends number = 1>(depth: D = 1 as D): MappableGenerator<FlatGen<T, D>> {
        return MappableGenerator.flat<T, D>(this, depth);
    }

    static flat<T, D extends number = 1>(gen: Genable<T>, depth: D = 1 as D): MappableGenerator<FlatGen<T, D>> {
        let self: MappableGenerator<FlatGen<T, D>>;
        function *flat<D extends number>(it: Iterator<unknown>, depth: D): Generator<FlatGen<T, D>> {
            let nr: any = undefined;
            while (true) {
                // noinspection LoopStatementThatDoesntLoopJS
                while (true) {
                    try {
                        while (true) {
                            const r = it.next(nr);
                            if (r.done) return r.value;
                            const v = r.value;
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
                        // If the wrapped generator aborted the return, we will, too.
                        if (!x?.done) {
                            // noinspection ContinueOrBreakFromFinallyBlockJS
                            break;
                        }
                    }
                }
            }
        }
        return self = MappableGenerator.extend(flat(toIterator(gen), depth));
    }

    flatMap<D extends number, R = FlatGen<T, D>>(f: (v: T, idx: number) => R, depth: D = 1 as D): MappableGenerator<R> {
        return MappableGenerator.flatMap(f, depth)(this);
    }

    static flatMap<T, D extends number, R = FlatGen<T, D>>(f: (v: T, idx: number) => R, depth: D = 1 as D): (gen: Genable<any>) => MappableGenerator<R> {
        return (gen: Genable<T>) => {
            let self: MappableGenerator<FlatGen<T, D>>;
            let idx = 0;

            function* flatMap<D extends number>(it: Iterator<unknown>, depth: D): Generator<FlatGen<T, D>> {
                let nr: any = undefined;
                while (true) {
                    // noinspection LoopStatementThatDoesntLoopJS
                    while (true) {
                        try {
                            while (true) {
                                const r = it.next(nr);
                                if (r.done) return r.value;
                                const v = r.value;
                                try {
                                    if (depth > 0 && isIterator(v)) {
                                        yield* flatMap(v, depth - 1);
                                    } else if (depth > 0 && isIterable(v)) {
                                        yield* flatMap(toIterator(v), depth - 1)
                                    } else {
                                        nr = yield f(r.value as FlatGen<T, D>, idx++);
                                    }
                                } catch (e) {
                                    it.throw?.(e);
                                }
                            }
                        } finally {
                            const x = it.return?.(self.returning);
                            // If the wrapped generator aborted the return, we will, too.
                            if (!x?.done) {
                                // noinspection ContinueOrBreakFromFinallyBlockJS
                                break;
                            }
                        }
                    }
                }
            }

            return self = MappableGenerator.extend(flatMap(toIterator(gen), depth));
        }
    }

    slice(start: number = 0, end: number = Number.POSITIVE_INFINITY): MappableGenerator<T> {
        return MappableGenerator.slice(this, start, end);
    }

    static slice<T>(iter: Genable<T>, start: number = 0, end: number = Number.POSITIVE_INFINITY): MappableGenerator<T> {
        const gen = toGenerator(iter);
        function* slice2(start: number, end: number) {
            for (let i = 0; i < start; i++) {
                const r = gen.next();
                if (r.done) return r.value;
            }
            if (end === Number.POSITIVE_INFINITY) {
                yield* gen;
            } else {
                let nv = undefined;
                while (true) {
                    try {
                        for (let i = start; i < end; i++) {
                            const r = gen.next(nv);
                            if (r.done) return r.value;
                            try {
                                nv = yield r.value;
                            } catch (e) {
                                const re = gen.throw(e);
                                if (re.done) return re.value;
                                nv = yield re.value;
                            }
                        }
                    } finally {
                        const x = gen.return(null);
                        // If the wrapped generator aborted the return, we will, too.
                        if (!x.done) {
                            // noinspection ContinueOrBreakFromFinallyBlockJS
                            break;
                        }
                    }
                }
            }
        }
        return MappableGenerator.extend(slice2(start, end));
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [Genable] to provide values.
     */
    concat(...gens: Genable<T>[]) {
        return MappableGenerator.concat<T>(this, ...gens);
    }

    /**
     * Concatenates generators (or iterators or iterables).
     *
     * Ensures that any supplied generators are terminated when this is terminated.
     * @param gens zero or more additional [Genable] to provide values.
     */
    static concat<T>(...gens: Genable<T>[]): MappableGenerator<T> {
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
        return MappableGenerator.extend(concat());
    }

    /**
     * Like Array.prototype.reduce, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     */
    reduce<A>(f: (acc: A|T, v: T) => A): A;
    /**
     * Like Array.prototype.reduce, but the 3rd argument to the reducing function ("array") is omitted
     * because there is no array.
     * @param f
     * @param init
     */
    reduce<A>(f: (acc: A, v: T) => A, init: A): A;
    reduce<A>(f: (acc: A|T, v: T) => A, init?: A): A {
        return itReduce(this, f, init as A);
    }

    /**
     * Reduces **gen** like **Array.prototype.reduce**, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param gen
     * @param f
     */
    static reduce<T, A>(gen: Genable<T>, f: (acc: A|T, v: T) => A): A;
    /**
     * Reduces **gen** like **Array.prototype.reduce**, but the 3rd argument to the reducing function ("array")
     * is omitted because there is no array.
     * @param gen
     * @param f
     * @param init
     */
    static reduce<T, A>(gen: Genable<T>, f: (acc: A, v: T) => A, init: A): A;
    static reduce<T, A>(gen: Genable<T>, f: (acc: A|T, v: T) => A, init?: A): A {
        return itReduce(toIterator(gen), f, init);
    }

    some(p: (v: T, idx: number) => boolean, thisArg?: any): boolean {
        return itSome(this, p, thisArg);
    }

    static some<T>(gen: Genable<T>, p: (v: T, idx: number) => boolean, thisArg?: any): boolean {
        return itSome(toIterator(gen), p, thisArg);
    }

    every(p: (v: T, idx: number) => boolean, thisArg?: any): boolean {
        return itEvery(this, p, thisArg);
    }

    static every<T>(gen: Genable<T>, p: (v: T, idx: number) => boolean, thisArg?: any): boolean {
        return itEvery(toIterator(gen), p, thisArg);
    }

    /**
     * Trivial, but handy, same as **Array.prototype.join**.
     * @param sep
     */
    join(sep?: string) {
        return [...this].join(sep);
    }
    static extend<T, R = any, N = undefined>(gen: Genable<T>): MappableGenerator<T, R, N> {
        const gen2 = toGenerator(gen) as Partial<MappableGenerator>;
        const old = Object.getPrototypeOf(gen2);
        const proto = Object.assign(Object.create(MappableGenerator.prototype), old);
        proto.return = (v: any) => (gen2.returning = v, old.return.call(gen2, v));
        Object.setPrototypeOf(gen2, proto);
        return gen2 as MappableGenerator<T, R, N>;
    }
}

const itReduce = <T, A>(it: Iterator<T>, f: (acc: A|T, v: T) => A, init?: A): A => {
    let acc: A | T | undefined = init;
    if (init === undefined) {
        const r = it.next();
        if (r.done) throw new TypeError(`No initial value in reduce`);
        acc = r.value;
    }
    while (true) {
        const r = it.next();
        if (r.done) return acc as A;
        acc = f(acc as A, r.value);
    }
};

const itSome = <T>(it: Iterator<T>, p: (v: T, idx: number) => boolean, thisArg?: any): boolean => {
    let i = 0;
    while (true) {
        const r = it.next();
        if (r.done) return false;
        if (p.call(thisArg, r.value, i++)) return true;
    }
};

const itEvery = <T>(it: Iterator<T>, p: (v: T, idx: number) => boolean, thisArg?: any): boolean => {
    let i = 0;
    while (true) {
        const r = it.next();
        if (r.done) return true;
        if (!p.call(thisArg, r.value, i++)) return false;
    }
};

Object.setPrototypeOf(MappableGenerator.prototype, GenProto);

export function toGenerator<T>(i: Genable<T>): Generator<T> {
    if (isGenerator(i)) return i;
    if (isIterator(i)) {
        const it = i;
        function *wrap() {
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

export function toIterator<T>(i: Genable<T>): Iterator<T> {
    if (isGenerator(i)) return i;
    if (isIterator(i)) return i;
    if (isIterable(i)) {
        return toGenerator(i[Symbol.iterator]());
    } else {
        throw new Error(`Not iterable: ${i}`);
    }
}

export function toIterable<T>(i: Genable<T>): Iterable<T> {
    if (isIterable(i)) return i;
    return {
        [Symbol.iterator]: () => i
    };
}

export const isFunction = <A extends Function>(f: (A | any)): f is A => {
    return typeof f === 'function';
}

export const isGenerator = (g: any): g is Generator =>
    isFunction(g.next)
    && isFunction(g.return)
    && isFunction(g.throw)
    && isFunction(g[Symbol.iterator]);

export const isIterator = <K>(i: Iterable<K>|any): i is Iterator<K> => typeof i.next === 'function';
export const isIterable = <K>(i: Iterable<K>|any): i is Iterable<K> => typeof i[Symbol.iterator] === 'function';

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

export const range = (start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): MappableGenerator<number> => {
    const r: Partial<MappableGenerator<number>> = range2(start, end, step);
    Object.setPrototypeOf(r, MappableGenerator.prototype);
    return r as MappableGenerator<number>;
};

export function idGen(prefix = 'gen', sep = '-'): string {
    const fn: idGen = idGen as unknown as idGen;

    const seqs = fn.seqs || (fn.seqs = {});
    const seq =
        seqs[prefix] || (seqs[prefix] = range(0, Number.MAX_SAFE_INTEGER));
    return `${prefix}${sep}${seq.next().value}`;
}

/**
 * We extend our returned HTML element with Observable's 'viewof' support.
 */
export interface ViewOf<T = any> {
    value: T;
}

/**
 * A functional version of the throw statement.
 * @param msg
 */
export const Throw = (msg: string = 'Error'): never => {
    throw new Error(msg);
}

/**
 * Convenience function for marking places not yet implemented.
 * @param name Optional name for what is not implemented yet.
 * @constructor
 */
export const NYI = (name?: string) => Throw(name ? `Not yet implemented.` : `${name}: Not yet implemented.`);

export interface Constructor<R, A extends [...any[]] = []> {
    new(...args: A): R;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Coerce a string into a form suitable for passing to a string interpolator.
 *
 * @param s
 */
export const callSite = (s: string|string[]) => (a => ((a as any).raw = (a as any).raw || a))(s instanceof Array ? s : [s])

let katex: any = null;

export const tex = (s: TemplateStringsArray, ...substitutions: any[]) => {
    const r = String.raw(s, ...substitutions);
    if (katex === null) {
        try {
            katex = require('katex');
        } catch (e) {
            console.warn('Could not load katex', e);
            // Don't try again. Take advantage of multiple kinds of falsey.
            katex = false;
        }
    }
    if (katex) {
        katex.renderToString(r);
    }
    return r;
};

/**
 * Define a @toStringTag for a given class's prototype so that objects show in inspectors with that
 * tag even if minified. Can accept either a prototype or a class constructor.
 *
 * @param proto
 * @param tag
 */
export const defineTag = (proto: Constructor<any, any>|any, tag: string) => {
    if (typeof proto === 'function') {
        defineTag(proto.prototype, tag);
    }
    Object.defineProperty(proto, Symbol.toStringTag, {
        get: () => tag
    });
};

/**
 * Return the negation of a predicate.
 * @param pred
 */
export const not = <T>(pred: (a: T) => boolean): ((a: T) => boolean) => a => !pred(a);

