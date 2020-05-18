/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Turn a function of 1-4 arguments into one that auto-curries.
 * Any arguments omitted or supplied as undefined will result in a new function being returned
 * that accepts the missing arguments.
 *
 * If all arguments are supplied, the supplied function is called and the value returned.
 * If no arguments are supplied, the same autocurried function is returned.
 */

export interface Function1<R, A> {
    (a: A): R;
    (a?: undefined): Function1<R, A>
}

export function curry1<R, A>(f: (a: A) => R): Function1<R, A> {
    const curried = (a?: A) => a === undefined ? curried : f(a);
    return curried as Function1<R, A>;
}

export interface Function2<R, A, B> {
    (a: A, b: B): R;
    (a: undefined, b: B): Function1<R,A>;
    (a: A, b?: undefined): Function1<R,B>;
    (a?: undefined, b?: undefined): Function2<R, A, B>;
}

/**
 * Take a function of two arguments, and return one that auto-curries. If any of the arguments is
 * undefined, return a function that accepts that argument.
 *
 * If both arguments are undefined, returns itself.
 * If both arguments are defined, immediately calls f with those arguments
 * if a is undefined, return a => f(a, b)
 * if b is undefined, return b => f(a, b)
 * @param f a function of two arguments.
 */
export function curry2<R, A, B>(f: (a: A, b: B) => R): Function2<R, A, B> {
    const curried = (a?: A, b?: B) =>
        a === undefined
            ? b === undefined
            ? curried
            : curry1((a: A) => f(a, b))
            : b === undefined
            ? curry1((b: B) => f(a, b))
            : f(a, b);
    return curried as Function2<R, A, B>;
}

export interface Function3<R, A, B, C> {
    (a: A, b: B, c: C): R;
    (a: undefined, b: B, c: C): Function1<R,A>;
    (a: A, b: undefined, c: C): Function1<R,B>;
    (a: A, b: B, c?: undefined): Function1<R,C>;
    (a: A, b?: undefined, c?: undefined): Function2<R, B, C>;
    (a: undefined, b: B, c?: undefined): Function2<R, A, C>;
    (a: undefined, b: undefined, c: C): Function2<R, A, B>;
    (a?: undefined, b?: undefined, c?: undefined): Function3<R, A, B, C>;
}

export function curry3<R, A, B, C>(f: (a: A, b: B, c: C) => R): Function3<R, A, B, C> {
    const curried = (a?: A, b?: B, c?: C) =>
        a === undefined
            ? b === undefined
            ? c === undefined
                ? curried
                : curry2((a: A, b: B) => f(a, b, c))
            : c === undefined
                ? curry2((a: A, c: C) => f(a, b, c))
                : curry1((a: A) => f(a, b, c))
            // a defined
            : b === undefined
            ? c === undefined
                ? curry2((b: B, c: C) => f(a, b, c))
                : curry1((b: B) => f(a, b, c))
            : c === undefined
                ? curry1((c: C) => f(a, b, c))
                : f(a, b, c);
    return curried as Function3<R, A, B, C>;
}

export interface Function4<R, A, B, C, D> {
    (a: A, b: B, c: C, d: D): R;
    (a: undefined, b: B, c: C, d: D): Function1<R,A>;
    (a: A, b: undefined, c: C, d: D): Function1<R,B>;
    (a: A, b: B, c: undefined, d: D): Function1<R,C>;
    (a: A, b: B, c: C, d?: undefined): Function1<R,D>;
    (a: A, b: B, c?: undefined, d?: undefined): Function2<R, C, D>;
    (a: A, b: undefined, c: C, d?: undefined): Function2<R, B, D>;
    (a: A, b: undefined, c: undefined, d: D): Function2<R, B, C>;
    (a: undefined, b: undefined, c: C, d: D): Function2<R, A, B>;
    (a: undefined, b: B, c: undefined, d: D): Function2<R, A, C>;
    (a: undefined, b: B, c: C, d?: undefined): Function2<R, A, D>;
    (a: A, b?: undefined, c?: undefined, d?: undefined): Function3<R, B, C, D>;
    (a: undefined, b: B, c?: undefined, d?: undefined): Function3<R, A, C, D>;
    (a: undefined, b: undefined, c: C, d?: undefined): Function3<R, A, B, D>;
    (a: undefined, b: undefined, c: undefined, d: D): Function3<R, A, B, C>;
    (a?: undefined, b?: undefined, c?: undefined, d?: undefined): Function4<R, A, B, C, D>;
}

export function curry4<R, A, B, C, D>(f: (a: A, b: B, c: C, d: D) => R): Function4<R, A, B, C, D> {
    const curried = (a?: A, b?: B, c?: C, d?: D) =>
        a === undefined
            ? b === undefined
            ? c === undefined
                ? d === undefined
                    ? curried
                    : curry3((a: A, b: B, c: C) => f(a, b, c, d))
                : d === undefined
                    ? curry3((a: A, b: B, d: D) => f(a, b, c, d))
                    : curry2((a: A, b: B) => f(a, b, c, d))
            : c === undefined
                ? d === undefined
                    ? curry3((a: A, c: C, d: D) => f(a, b, c, d))
                    : curry2((a: A, c: C) => f(a, b, c, d))
                : d === undefined
                    ? curry2((a: A, d: D) => f(a, b, c, d))
                    : curry1((a: A) => f(a, b, c, d))
            // a defined
            : b === undefined
            ? c === undefined
                ? d === undefined
                    ? curry3((b: B, c: C, d: D) => f(a, b, c, d))
                    : curry2((b: B, c: C) => f(a, b, c, d))
                : d === undefined
                    ? curry2((b: B, d: D) => f(a, b, c, d))
                    : curry1((b: B) => f(a, b, c, d))
            : c === undefined
                ? d === undefined
                    ? curry2((c: C, d: D) => f(a, b, c, d))
                    : curry1((c: C) => f(a, b, c, d))
                : d === undefined
                    ? curry1((d: D) => f(a, b, c, d))
                    : f(a, b, c, d);
    return curried as Function4<R, A, B, C, D>;
}
