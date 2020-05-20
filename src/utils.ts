/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Miscellaneous utilities
 */

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
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
